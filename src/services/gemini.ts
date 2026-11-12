/**
 * Gemini AI Service for NOVA Companion
 * Routing order:
 *   1. Server-side Proxy (/api/chat or VITE_CHAT_PROXY_URL) — keeps GEMINI_API_KEY secret
 *   2. Direct browser Gemini API call (VITE_GEMINI_API_KEY or user-saved localStorage key)
 *   3. State-aware offline knowledge base fallback
 */

import { buildNovaSystemPrompt, getOfflineFallbackResponse } from '../data/novaKnowledge';
import type { NovaGameContext } from '../data/novaContext';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  isQuickChip?: boolean;
}

export type AIConnectionMode = 'proxy' | 'direct' | 'offline';

export interface NovaAIResult {
  text: string;
  mode: AIConnectionMode;
  model?: string;
}

const STORAGE_KEY_API = 'nova_gemini_api_key';
const STORAGE_KEY_PROXY = 'nova_chat_proxy_url';

const DEFAULT_PRIMARY_MODEL = 'gemini-3.6-flash';
const DEFAULT_FALLBACK_MODEL = 'gemini-3.5-flash';
const REQUEST_TIMEOUT_MS = 9000;
const MIN_INTERVAL_MS = 1500;
const MAX_REPLY_CHARS = 1200;

function readEnv(): Record<string, string | undefined> {
  if (typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env) {
    return (import.meta as { env: Record<string, string | undefined> }).env;
  }
  return {};
}

function getModelCandidates(): string[] {
  const configured = (readEnv().VITE_GEMINI_MODEL || '').trim();
  const primary = configured || DEFAULT_PRIMARY_MODEL;
  return primary === DEFAULT_FALLBACK_MODEL ? [primary] : [primary, DEFAULT_FALLBACK_MODEL];
}

function readStorage(key: string): string {
  try {
    return (typeof window !== 'undefined' ? window.localStorage.getItem(key) : '') || '';
  } catch {
    return '';
  }
}

function writeStorage(key: string, value: string): void {
  try {
    if (typeof window === 'undefined') return;
    const trimmed = value.trim();
    if (trimmed) {
      window.localStorage.setItem(key, trimmed);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors in restricted frames
  }
}

export function getChatProxyUrl(): string {
  const custom = readStorage(STORAGE_KEY_PROXY).trim();
  if (custom) return custom;

  const configured = (readEnv().VITE_CHAT_PROXY_URL || '').trim();
  return configured || '/api/chat';
}

export function setClientProxyUrl(url: string): void {
  writeStorage(STORAGE_KEY_PROXY, url);
}

export function getGeminiApiKey(): string | null {
  const envKey = (readEnv().VITE_GEMINI_API_KEY || '').trim();
  if (envKey.length > 10) return envKey;

  const localKey = readStorage(STORAGE_KEY_API).trim();
  if (localKey.length > 10) return localKey;

  return null;
}

export function setClientGeminiKey(key: string): void {
  writeStorage(STORAGE_KEY_API, key);
}

export function clearClientGeminiKey(): void {
  writeStorage(STORAGE_KEY_API, '');
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null || getChatProxyUrl() !== '/api/chat';
}

let lastCallTimestamp = 0;

interface GeminiCandidate {
  finishReason?: string;
  content?: { parts?: Array<{ text?: string; thought?: boolean }> };
}

function extractVisibleText(data: unknown): string | null {
  const candidate = (data as { candidates?: GeminiCandidate[] })?.candidates?.[0];
  if (!candidate) return null;
  if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
    return null;
  }

  const parts = candidate.content?.parts;
  if (!Array.isArray(parts)) return null;

  const visible = parts
    .filter((part) => !part.thought && typeof part.text === 'string' && part.text.trim().length > 0)
    .map((part) => part.text as string)
    .join('\n')
    .trim();

  return visible || null;
}

/**
 * Strips any accidental prompt-block tags or unresolved template lines, trims, and caps reply length.
 */
export function sanitizeNovaReply(text: string): string {
  const stripped = text
    .replace(/<\/?(?:GAME_STATE|TELEMETRY|GAME_FACTS|RECENT_EVENTS|NEXT_STEP|identity|voice|truth_rules|hint_policy|safety_and_scope|context_use)>/gi, '')
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('{{'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (stripped.length <= MAX_REPLY_CHARS) {
    return stripped;
  }
  return `${stripped.slice(0, MAX_REPLY_CHARS - 3).trimEnd()}...`;
}

/**
 * Builds valid alternating user/model turns from the last 8 relevant messages,
 * dropping welcome/chip/error messages, merging consecutive same-role turns,
 * and ensuring the first turn has role 'user'.
 */
export function buildConversationContents(
  userPrompt: string,
  history: ChatMessage[]
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const filtered = history
    .filter(
      (msg) =>
        !msg.isQuickChip &&
        !msg.id.startsWith('welcome_') &&
        !msg.id.startsWith('nova_err_') &&
        msg.text.trim().length > 0
    )
    .slice(-8);

  const turns: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const msg of filtered) {
    const role: 'user' | 'model' = msg.sender === 'user' ? 'user' : 'model';
    const prev = turns[turns.length - 1];
    if (prev && prev.role === role) {
      prev.text = `${prev.text}\n\n${msg.text.trim()}`;
    } else {
      turns.push({ role, text: msg.text.trim() });
    }
  }

  while (turns.length > 0 && turns[0].role !== 'user') {
    turns.shift();
  }

  const trimmedPrompt = userPrompt.trim();
  if (trimmedPrompt.length > 0) {
    const last = turns[turns.length - 1];
    if (last && last.role === 'user') {
      last.text = `${last.text}\n\n${trimmedPrompt}`;
    } else {
      turns.push({ role: 'user', text: trimmedPrompt });
    }
  }

  return turns.map((t) => ({
    role: t.role,
    parts: [{ text: t.text }],
  }));
}

/**
 * Queries NOVA's AI backend (server proxy first, then direct client key, then state-aware offline cache)
 * and returns both the reply text and the connection mode used.
 */
export async function queryNovaAIWithMeta(
  userPrompt: string,
  history: ChatMessage[] = [],
  location: 'mars' | 'moon' = 'mars',
  ctx?: NovaGameContext
): Promise<NovaAIResult> {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < MIN_INTERVAL_MS && lastCallTimestamp > 0) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastCallTimestamp = Date.now();

  const systemPrompt = buildNovaSystemPrompt(location, ctx);
  const contents = buildConversationContents(userPrompt, history);
  if (contents.length === 0) {
    return {
      text: getOfflineFallbackResponse(userPrompt, location, ctx),
      mode: 'offline',
    };
  }

  // 1. Try server-side proxy (/api/chat in Vite dev/preview or Vercel, or VITE_CHAT_PROXY_URL)
  const proxyUrl = getChatProxyUrl();
  try {
    const proxyRes = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, contents, gameContext: ctx }),
      signal:
        typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
          ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
          : undefined,
    });

    const contentType = proxyRes.headers.get('content-type') || '';
    if (proxyRes.ok && contentType.includes('application/json')) {
      const data = (await proxyRes.json()) as { reply?: string; model?: string };
      if (data.reply && data.reply.trim().length > 0) {
        const clean = sanitizeNovaReply(data.reply);
        if (clean.length > 0) {
          return { text: clean, mode: 'proxy', model: data.model };
        }
      }
    }
  } catch {
    // Proxy unavailable on static hosts without VITE_CHAT_PROXY_URL; fall through cleanly
  }

  // 2. Fallback to direct Gemini call if client key or localStorage key is configured
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    for (const model of getModelCandidates()) {
      try {
        const generationConfig: Record<string, unknown> = {
          temperature: 0.6,
          topP: 0.95,
          maxOutputTokens: 600,
        };
        if (/^gemini-2\.5-/i.test(model)) {
          generationConfig.thinkingConfig = { thinkingBudget: 0 };
        }

        const body = {
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig,
        };

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify(body),
          signal:
            typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
              ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
              : undefined,
        });

        if (!response.ok) continue;

        const data = await response.json();
        const rawText = extractVisibleText(data);
        if (rawText) {
          const clean = sanitizeNovaReply(rawText);
          if (clean.length > 0) {
            return { text: clean, mode: 'direct', model };
          }
        }
      } catch {
        // Try next active Gemini model
      }
    }
  }

  // 3. State-aware offline knowledge base fallback
  return {
    text: sanitizeNovaReply(getOfflineFallbackResponse(userPrompt, location, ctx)),
    mode: 'offline',
  };
}

/**
 * Sends a message to Gemini AI (or state-aware offline knowledge) with Nova's Mars/Moon persona and context.
 */
export async function queryNovaAI(
  userPrompt: string,
  history: ChatMessage[] = [],
  location: 'mars' | 'moon' = 'mars',
  ctx?: NovaGameContext
): Promise<string> {
  const result = await queryNovaAIWithMeta(userPrompt, history, location, ctx);
  return result.text;
}
