/**
 * Gemini AI Service for NOVA Companion
 * Handles safe API interaction with Google Gemini (1.5-Flash / 2.0-Flash),
 * with built-in proxy support, system prompt injection, and seamless offline fallback.
 */

import { buildNovaSystemPrompt, getOfflineFallbackResponse } from '../data/novaKnowledge';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'nova';
  text: string;
  timestamp: string;
  isQuickChip?: boolean;
}

export function getGeminiApiKey(): string | null {
  const env = (import.meta as any).env || {};
  const key = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  if (typeof key === 'string' && key.trim().length > 10) {
    return key.trim();
  }
  return null;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}

// Throttle timestamp to prevent rapid-fire API quota exhaustion
let lastCallTimestamp = 0;
const MIN_INTERVAL_MS = 1500;

/**
 * Sends a message to Gemini AI with Nova's Mars persona and game context.
 * Falls back to offline knowledge base if network or API key errors occur.
 */
export async function queryNovaAI(
  userPrompt: string,
  history: ChatMessage[] = [],
  location: 'mars' | 'moon' = 'mars'
): Promise<string> {
  const apiKey = getGeminiApiKey();

  // If no API key configured, use intelligent offline knowledge
  if (!apiKey) {
    return getOfflineFallbackResponse(userPrompt, location);
  }

  // Throttle check
  const now = Date.now();
  if (now - lastCallTimestamp < MIN_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_INTERVAL_MS - (now - lastCallTimestamp)));
  }
  lastCallTimestamp = Date.now();

  const systemInstruction = buildNovaSystemPrompt(location);

  // Format previous turns for Gemini REST format
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nExplorer: Initialize transmission.` }],
    },
    {
      role: 'model',
      parts: [{ text: 'UNIT-09 NOVA telemetry linked. Awaiting your coordinates and query, Explorer!' }],
    },
  ];

  // Append recent history (up to last 6 messages)
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  // Append latest user prompt
  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }],
  });

  // Try Serverless proxy endpoint first if available, otherwise direct Google API
  const endpointsToTry = [
    `/api/chat`, // If serverless proxy is deployed
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
  ];

  for (const endpoint of endpointsToTry) {
    try {
      const isProxy = endpoint.startsWith('/api');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isProxy ? { 'x-gemini-key': apiKey } : {}),
        },
        body: JSON.stringify(
          isProxy
            ? { prompt: userPrompt, systemPrompt: systemInstruction, history: recentHistory }
            : {
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 350,
                  topP: 0.95,
                },
              }
        ),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidateText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          data?.response ||
          data?.reply;

        if (candidateText && typeof candidateText === 'string') {
          return candidateText.trim();
        }
      }
    } catch (err) {
      // Continue to next endpoint or fallback
    }
  }

  // Graceful offline fallback with game lore & NASA telemetry
  return getOfflineFallbackResponse(userPrompt, location);
}
