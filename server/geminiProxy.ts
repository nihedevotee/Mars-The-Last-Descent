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
