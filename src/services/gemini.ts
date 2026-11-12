/**
 * Gemini AI Service for NOVA Companion
 * Routing order:
 *   1. Server-side Proxy (/api/chat or VITE_CHAT_PROXY_URL) — keeps GEMINI_API_KEY secret
 *   2. Direct browser Gemini API call (VITE_GEMINI_API_KEY or user-saved localStorage key)
 *   3. Local planetary knowledge base fallback
 */

import { buildNovaSystemPrompt, getOfflineFallbackResponse } from '../data/novaKnowledge';

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

const ACTIVE_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
] as const;

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

  const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
  const configured = (env.VITE_CHAT_PROXY_URL || '').trim();
  return configured || '/api/chat';
}

export function setClientProxyUrl(url: string): void {
  writeStorage(STORAGE_KEY_PROXY, url);
}

export function getGeminiApiKey(): string | null {
  const env = (import.meta as { env?: Record<string, string | undefined> }).env || {};
  const envKey = (env.VITE_GEMINI_API_KEY || '').trim();
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
const MIN_INTERVAL_MS = 800;

function extractVisibleText(data: unknown): string | null {
  const candidates = (
    data as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    }
  )?.candidates;
  const parts = candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const visible = parts
    .filter((part) => !part.thought && typeof part.text === 'string' && part.text.trim().length > 0)
    .map((part) => part.text as string)
    .join('\n')
    .trim();

  if (visible) return visible;
  return parts.find((p) => typeof p.text === 'string' && p.text.trim().length > 0)?.text?.trim() || null;
}

function buildConversationContents(userPrompt: string, history: ChatMessage[]) {
  const recentHistory = history
    .filter((msg) => msg.id !== 'welcome_1' && !msg.id.startsWith('nova_err_'))
    .slice(-8)
    .map((msg) => ({
      role: (msg.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: msg.text }],
    }));

  return [
    ...recentHistory,
    {
      role: 'user' as const,
      parts: [{ text: userPrompt }],
    },
  ];
}

/**
 * Queries NOVA's AI backend (server proxy first, then direct client key, then offline cache)
 * and returns both the reply text and the connection mode used.
 */
export async function queryNovaAIWithMeta(
  userPrompt: string,
  history: ChatMessage[] = [],
  location: 'mars' | 'moon' = 'mars',
): Promise<NovaAIResult> {
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - elapsed));
  }
  lastCallTimestamp = Date.now();

  const systemInstruction = buildNovaSystemPrompt(location);
  const contents = buildConversationContents(userPrompt, history);

  // 1. Try server-side proxy (/api/chat in Vite dev/preview or Vercel, or VITE_CHAT_PROXY_URL)
  const proxyUrl = getChatProxyUrl();
  try {
    const proxyRes = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction, contents }),
      signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(16000) : undefined,
    });

    const contentType = proxyRes.headers.get('content-type') || '';
    if (proxyRes.ok && contentType.includes('application/json')) {
      const data = (await proxyRes.json()) as { reply?: string; model?: string };
      if (data.reply && data.reply.trim().length > 0) {
        return { text: data.reply.trim(), mode: 'proxy', model: data.model };
      }
    }
  } catch {
    // Proxy unavailable on static hosts without VITE_CHAT_PROXY_URL; fall through cleanly
  }

  // 2. Fallback to direct Gemini call if client key or localStorage key is configured
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    const body = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    for (const model of ACTIVE_GEMINI_MODELS) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(7500) : undefined,
        });

        if (!response.ok) continue;

        const data = await response.json();
        const text = extractVisibleText(data);
        if (text) {
          return { text, mode: 'direct', model };
        }
      } catch {
        // Try next active Gemini model
      }
    }
  }

  // 3. Offline planetary knowledge base fallback
  return {
    text: getOfflineFallbackResponse(userPrompt, location),
    mode: 'offline',
  };
}

/**
 * Sends a message to Gemini AI with Nova's Mars/Moon persona and game context.
 */
export async function queryNovaAI(
  userPrompt: string,
  history: ChatMessage[] = [],
  location: 'mars' | 'moon' = 'mars',
): Promise<string> {
  const result = await queryNovaAIWithMeta(userPrompt, history, location);
  return result.text;
}
