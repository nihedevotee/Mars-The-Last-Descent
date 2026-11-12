import type { IncomingMessage, ServerResponse } from 'node:http';

export const ACTIVE_GEMINI_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
] as const;

export interface GeminiContentPart {
  text?: string;
  thought?: boolean;
}

export interface GeminiContentMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiProxyPayload {
  systemInstruction?: string;
  contents?: GeminiContentMessage[];
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

/**
 * Extracts the visible response text from a Gemini generateContent payload,
 * skipping internal thinking parts emitted by Gemini 3.x reasoning models.
 */
export function extractGeminiReplyText(data: unknown): string | null {
  const candidates = (data as { candidates?: Array<{ content?: { parts?: GeminiContentPart[] } }> })?.candidates;
  const parts = candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;

  const visibleText = parts
    .filter((part) => !part.thought && typeof part.text === 'string' && part.text.trim().length > 0)
    .map((part) => part.text as string)
    .join('\n')
    .trim();

  if (visibleText) return visibleText;

  const fallbackText = parts.find((part) => typeof part.text === 'string' && part.text.trim().length > 0)?.text?.trim();
  return fallbackText || null;
}

/**
 * Forwards a normalized chat payload to Gemini's generateContent REST API,
 * falling back across active Flash models on transient errors or timeouts.
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

  const requestBody: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  if (payload.systemInstruction && payload.systemInstruction.trim().length > 0) {
    requestBody.systemInstruction = {
      parts: [{ text: payload.systemInstruction.trim() }],
    };
  }

  let lastStatus = 502;
  let lastError = 'All Gemini models failed to respond.';

  for (const model of ACTIVE_GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(7500),
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
      lastError = `Model ${model} returned an empty candidate.`;
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
