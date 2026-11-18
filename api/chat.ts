import type { IncomingMessage, ServerResponse } from 'node:http';

const DEFAULT_PRIMARY_MODEL = 'gemini-3.6-flash';
const DEFAULT_FALLBACK_MODEL = 'gemini-3.5-flash';

export function getActiveGeminiModels(overrideModel?: string): string[] {
  const configured = (overrideModel || process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || '').trim();
  const primary = configured || DEFAULT_PRIMARY_MODEL;
  return primary === DEFAULT_FALLBACK_MODEL ? [primary] : [primary, DEFAULT_FALLBACK_MODEL];
}

export const ACTIVE_GEMINI_MODELS = [DEFAULT_PRIMARY_MODEL, DEFAULT_FALLBACK_MODEL] as const;

export interface GeminiContentPart {
  text?: string;
  thought?: boolean;
}

export interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiProxyPayload {
  systemPrompt?: string;
  systemInstruction?: string;
  contents?: GeminiContentMessage[];
  gameContext?: unknown;
}

export interface GeminiProxyResult {
  status: number;
  body: {
    reply?: string;
    model?: string;
    error?: string;
  };
}

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: unknown) => void;
}

interface GeminiCandidate {
  finishReason?: string;
  content?: { parts?: GeminiContentPart[] };
}

/**
 * Extracts the visible response text from a Gemini generateContent payload,
 * treating SAFETY/RECITATION blocks or empty parts as failures.
 */
export function extractGeminiReplyText(data: unknown): string | null {
  const candidate = (data as { candidates?: GeminiCandidate[] })?.candidates?.[0];
  if (!candidate) return null;
  if (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
    return null;
  }

  const parts = candidate.content?.parts;
  if (!Array.isArray(parts)) return null;

  const visibleText = parts
    .filter((part) => !part.thought && typeof part.text === 'string' && part.text.trim().length > 0)
    .map((part) => part.text as string)
    .join('\n')
    .trim();

  return visibleText || null;
}

/**
 * Forwards a normalized chat payload to Gemini's generateContent REST API,
 * sending the API key in x-goog-api-key and falling back across active Flash models.
 */
export async function forwardChatToGemini(
  apiKey: string,
  payload: GeminiProxyPayload,
): Promise<GeminiProxyResult> {
  if (!apiKey) {
    return { status: 500, body: { error: 'GEMINI_API_KEY is not configured on the server.' } };
  }

  const contents = Array.isArray(payload.contents) ? payload.contents : [];
  if (contents.length === 0) {
    return { status: 400, body: { error: 'Missing chat contents array.' } };
  }

  const systemText = (payload.systemPrompt || payload.systemInstruction || '').trim();
  const models = getActiveGeminiModels();

  let lastStatus = 502;
  let lastError = 'All Gemini models failed to respond.';

  for (const model of models) {
    try {
      const generationConfig: Record<string, unknown> = {
        temperature: 0.6,
        topP: 0.95,
        maxOutputTokens: 600,
      };
      if (/^gemini-2\.5-/i.test(model)) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const requestBody: Record<string, unknown> = {
        contents,
        generationConfig,
      };
      if (systemText.length > 0) {
        requestBody.system_instruction = {
          parts: [{ text: systemText }],
        };
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(9000),
      });

      if (!upstream.ok) {
        lastStatus = upstream.status;
        const errText = await upstream.text().catch(() => upstream.statusText);
        lastError = `Model ${model} returned ${upstream.status}: ${errText.slice(0, 240)}`;
        continue;
      }

      const data = await upstream.json();
      const reply = extractGeminiReplyText(data);
      if (reply) {
        return { status: 200, body: { reply, model } };
      }

      lastStatus = 502;
      lastError = `Model ${model} returned an empty or blocked candidate.`;
    } catch (err) {
      lastStatus = 502;
      lastError = err instanceof Error ? err.message : 'Network error calling Gemini API.';
    }
  }

  return { status: lastStatus, body: { error: lastError } };
}

function sendJson(res: VercelResponse, statusCode: number, data: unknown): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

async function readJsonBody(req: VercelRequest): Promise<GeminiProxyPayload> {
  if (req.body && typeof req.body === 'object') {
    return req.body as GeminiProxyPayload;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as GeminiProxyPayload;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  return raw ? (JSON.parse(raw) as GeminiProxyPayload) : {};
}

/**
 * Serverless proxy endpoint for NOVA chat so GEMINI_API_KEY remains secret on the server.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
    return;
  }

  try {
    const payload = await readJsonBody(req);
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const result = await forwardChatToGemini(apiKey, payload);
    sendJson(res, result.status, result.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request payload.';
    sendJson(res, 400, { error: message });
  }
}
