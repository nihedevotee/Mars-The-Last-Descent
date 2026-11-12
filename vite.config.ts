import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { forwardChatToGemini, type GeminiProxyPayload } from './server/geminiProxy.ts';

type NextFn = (err?: unknown) => void;
type MiddlewareRegistrar = {
  middlewares: {
    use: (handler: (req: IncomingMessage, res: ServerResponse, next: NextFn) => void) => void;
  };
};

function attachChatMiddleware(target: MiddlewareRegistrar, getApiKey: () => string) {
  target.middlewares.use(async (req, res, next) => {
    const pathname = (req.url || '').split('?')[0];
    if (pathname !== '/api/chat') {
      next();
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
      return;
    }

    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      const rawBody = Buffer.concat(chunks).toString('utf-8').trim();
      const payload = rawBody ? (JSON.parse(rawBody) as GeminiProxyPayload) : {};
      const result = await forwardChatToGemini(getApiKey(), payload);

      res.statusCode = result.status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(result.body));
    } catch (err) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Invalid JSON payload.' }));
    }
  });
}

function novaChatProxyPlugin(mode: string): Plugin {
  const resolveServerKey = () => {
    const env = loadEnv(mode, process.cwd(), '');
    return (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  };

  return {
    name: 'nova-chat-proxy',
    configureServer(server) {
      attachChatMiddleware(server, resolveServerKey);
    },
    configurePreviewServer(server) {
      attachChatMiddleware(server, resolveServerKey);
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), novaChatProxyPlugin(mode)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
  };
});
