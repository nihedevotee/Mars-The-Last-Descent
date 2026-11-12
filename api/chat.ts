import type { IncomingMessage, ServerResponse } from 'node:http';
import { forwardChatToGemini, type GeminiProxyPayload } from '../server/geminiProxy';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: unknown) => void;
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
