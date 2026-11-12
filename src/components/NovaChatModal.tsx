/**
 * NOVA Interactive AI Companion Chatbot Modal
 * Supports both MARS and MOON exploration environments.
 * Features:
 * - Real-time NASA Telemetry status ticker (Mars or Moon)
 * - Facebook Messenger-style preset Quick Reply chips (Instant FAQ responses)
 * - Gemini AI freeform chat with event isolation (prevents game key collisions)
 * - Animated Nova avatar with dynamic mood reactions
 */

import React, { useState, useEffect, useRef } from 'react';
import { NovaAvatar, NovaMood } from './NovaAvatar';
import { sound } from '../systems/audio';
import {
  PRESET_QUICK_CHIPS,
  MOON_PRESET_QUICK_CHIPS,
  QUICK_CHIP_ANSWERS,
  getTelemetryAnswer,
  QuickChip,
} from '../data/novaKnowledge';
import { getMarsTelemetrySync, MarsTelemetry, getMoonTelemetry, MoonTelemetry } from '../services/nasaService';
import {
  queryNovaAIWithMeta,
  ChatMessage,
  AIConnectionMode,
  getGeminiApiKey,
  setClientGeminiKey,
  clearClientGeminiKey,
  getChatProxyUrl,
  setClientProxyUrl,
} from '../services/gemini';
import { X, Send, Sparkles, Radio, Activity, Compass, ChevronRight, Moon as MoonIcon, KeyRound, Check } from 'lucide-react';

interface NovaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  location?: 'mars' | 'moon';
}

export const NovaChatModal: React.FC<NovaChatModalProps> = ({
  isOpen,
  onClose,
  location = 'mars',
}) => {
  const isMoon = location === 'moon';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome_1',
      sender: 'nova',
      text: isMoon
        ? `Greetings Explorer! I am NOVA Unit-09. We have touched down on the Moon. Gravity is 1.62 m/s² (~1/6th G). All Lunar ALSEP and NASA LRO telemetry systems are nominal. How can I assist our lunar survey today?`
        : `Greetings Explorer! I am NOVA Unit-09. My neural core is synchronized with NASA telemetry. How can I assist your mission today? Select a diagnostic query below or ask freely!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState<NovaMood>('idle');
  const [aiMode, setAiMode] = useState<AIConnectionMode | 'standby'>(() =>
    getGeminiApiKey() ? 'direct' : 'standby'
  );
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [draftApiKey, setDraftApiKey] = useState(() => getGeminiApiKey() || '');
  const [draftProxyUrl, setDraftProxyUrl] = useState(() => {
    const url = getChatProxyUrl();
    return url === '/api/chat' ? '' : url;
  });
  const [marsTelemetry, setMarsTelemetry] = useState<MarsTelemetry>(() => getMarsTelemetrySync());
  const [moonTelemetry] = useState<MoonTelemetry>(() => getMoonTelemetry());
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      sound.playNovaChirp();
      if (!isMoon) {
        setMarsTelemetry(getMarsTelemetrySync());
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMoon]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const activeChips = isMoon ? MOON_PRESET_QUICK_CHIPS : PRESET_QUICK_CHIPS;

  // Handle Quick Chip click (Instant response without token waste)
  const handleQuickChipSelect = (chip: QuickChip) => {
    sound.playClick();
    sound.playNovaChirp();

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: chip.prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuickChip: true,
    };

    let reply = QUICK_CHIP_ANSWERS[chip.id];
    if (chip.id === 'mars_telemetry') {
      reply = getTelemetryAnswer('mars');
    } else if (chip.id === 'moon_telemetry') {
      reply = getTelemetryAnswer('moon');
    }

    setMood(chip.id.includes('pet_nova') ? 'happy' : 'curious');

    const novaMsg: ChatMessage = {
      id: `nova_${Date.now() + 1}`,
      sender: 'nova',
      text: reply || 'Telemetry nominal. All systems functioning within margins.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg, novaMsg]);
    setTimeout(() => setMood('idle'), 3000);
  };

  // Handle Freeform AI Query (Gemini with offline fallback)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputText.trim();
    if (!query || isLoading) return;

    sound.playClick();
    setInputText('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setMood('scanning');

    try {
      const result = await queryNovaAIWithMeta(query, messages, location);
      setAiMode(result.mode);
      setActiveModel(result.model || null);
      sound.playNovaChirp();
      const novaMsg: ChatMessage = {
        id: `nova_${Date.now() + 1}`,
        sender: 'nova',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, novaMsg]);
      setMood(result.mode === 'offline' ? 'curious' : 'happy');
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `nova_err_${Date.now()}`,
        sender: 'nova',
        text: `[COMM LINK BLOCKED]: Cosmic radiation burst caused packet loss. Falling back to internal planetary cache.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setMood('warning');
    } finally {
      setIsLoading(false);
      setTimeout(() => setMood('idle'), 3500);
    }
  };

  // Parse simple markdown tags into JSX
  const formatMessageText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-cyan-300 font-bold font-mono text-sm mt-1.5 mb-1 tracking-wide">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 text-xs my-0.5 leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-slate-100 my-0.5 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      data-testid="nova-chat-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        // Close if backdrop clicked
        if (e.target === e.currentTarget) {
          sound.playClick();
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-2xl h-[90vh] max-h-[680px] flex flex-col rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================= */}
        {/* HEADER: NOVA Avatar + Status + NASA Telemetry Strip       */}
        {/* ========================================================= */}
        <div className="shrink-0 p-4 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => sound.playNovaChirp()}>
              <NovaAvatar
                mood={mood}
                size={54}
                showScannerBeam={mood === 'scanning'}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-bold text-sm text-cyan-300 tracking-wider">
                  NOVA // UNIT-09
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/40 text-[9px] font-mono text-cyan-400 font-semibold uppercase">
                  {isMoon ? 'LUNAR TELEMETRY AI' : 'NASA AI COMPANION'}
                </span>
                <span
                  data-testid="nova-ai-mode-badge"
                  title={activeModel ? `Model: ${activeModel}` : 'AI Transport Status'}
                  className={`px-1.5 py-0.2 rounded border text-[9px] font-mono font-semibold uppercase ${
                    aiMode === 'proxy' || aiMode === 'direct'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : aiMode === 'offline'
                        ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800/80 border-slate-600/50 text-slate-300'
                  }`}
                >
                  {aiMode === 'proxy'
                    ? 'PROXY LIVE'
                    : aiMode === 'direct'
                      ? 'DIRECT LIVE'
                      : aiMode === 'offline'
                        ? 'LOCAL CACHE'
                        : 'AI READY'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>
                  LINKED: {isMoon ? moonTelemetry.location : marsTelemetry.stationName.split('(')[0].trim()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sound.playClick();
                setShowKeyConfig((v) => !v);
              }}
              data-testid="nova-key-config-btn"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showKeyConfig
                  ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border-slate-700/60'
              }`}
              title="Configure AI Proxy / Browser API Key"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              data-testid="nova-chat-close-btn"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
              title="Close [ESC] or [N]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Client Proxy / API Key Config Drawer (for static deployments) */}
        {showKeyConfig && (
          <div className="shrink-0 px-4 py-2.5 bg-slate-900/95 border-b border-cyan-500/30 space-y-2 text-[11px] font-mono">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={draftApiKey}
                onChange={(e) => setDraftApiKey(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Optional Gemini API Key (stored only in this browser)"
                className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none"
              />
              <input
                type="text"
                value={draftProxyUrl}
                onChange={(e) => setDraftProxyUrl(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="Optional Proxy URL (e.g. https://your-app.vercel.app/api/chat)"
                className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  if (draftApiKey.trim()) {
                    setClientGeminiKey(draftApiKey.trim());
                  } else {
                    clearClientGeminiKey();
                  }
                  setClientProxyUrl(draftProxyUrl.trim());
                  setAiMode(draftApiKey.trim() || draftProxyUrl.trim() ? 'direct' : 'standby');
                  setShowKeyConfig(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Local Vite &amp; Vercel use server proxy automatically. On static GitHub Pages without a proxy URL, paste a key here to enable live AI in this browser.
            </p>
          </div>
        )}

        {/* Live NASA Telemetry Micro-Bar */}
        <div className="shrink-0 px-4 py-1.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 overflow-x-auto whitespace-nowrap gap-4">
          {isMoon ? (
            <>
              <div className="flex items-center gap-1 text-cyan-300">
                <MoonIcon className="w-3 h-3 text-cyan-400" />
                <span>THE MOON</span>
              </div>
              <div className="text-slate-300">
                GRAVITY: <span className="text-cyan-400 font-bold">{moonTelemetry.gravity} m/s² (~1/6th G)</span>
              </div>
              <div className="text-slate-300">
                PRESSURE: <span className="text-emerald-400 font-bold">{moonTelemetry.pressure}</span>
              </div>
              <div className="text-slate-300">
                SURFACE TEMP: <span className="text-amber-400 font-bold">{moonTelemetry.temperatureC}°C</span>
              </div>
              <div className="text-slate-400">
                COSMIC FLUX: <span className="text-orange-400 font-bold">{moonTelemetry.radiationMsvYear} mSv/yr</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1 text-cyan-300">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>SOL {marsTelemetry.sol}</span>
              </div>
              <div className="text-slate-300">
                TEMP: <span className="text-amber-400 font-bold">{marsTelemetry.temperatureC.current}°C</span>
              </div>
              <div className="text-slate-300">
                PRESSURE: <span className="text-emerald-400 font-bold">{marsTelemetry.pressurePa} Pa</span>
              </div>
              <div className="text-slate-300">
                DUST (τ): <span className="text-orange-400 font-bold">{marsTelemetry.dustOpticalDepthTau}</span>
              </div>
              <div className="text-slate-400">
                WIND: <span className="text-cyan-400">{marsTelemetry.windSpeedMs} m/s</span>
              </div>
            </>
          )}
        </div>

        {/* ========================================================= */}
        {/* MESSAGE STREAM: Chat Conversation History                 */}
        {/* ========================================================= */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-900/40"
          data-testid="nova-chat-messages"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'nova' && (
                <div className="w-7 h-7 shrink-0 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 font-mono font-bold shadow-sm mt-0.5">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-cyan-900/50 text-cyan-100 border border-cyan-500/40 rounded-tr-none'
                    : 'bg-slate-900/90 text-slate-100 border border-slate-700/80 rounded-tl-none backdrop-blur-sm'
                }`}
              >
                {msg.sender === 'nova' && (
                  <div className="text-[10px] font-mono text-cyan-400/80 font-bold mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                    <span>NOVA // UNIT-09</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 text-[9px]">{msg.timestamp}</span>
                  </div>
                )}

                <div className="space-y-1">
                  {formatMessageText(msg.text)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2.5 justify-start">
              <div className="w-7 h-7 shrink-0 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-xs text-cyan-400 font-mono font-bold shadow-sm animate-spin">
                ⚙️
              </div>
              <div className="bg-slate-900/90 text-cyan-300 border border-cyan-500/30 rounded-2xl rounded-tl-none px-4 py-2 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                <span>NOVA is analyzing {isMoon ? 'Lunar' : 'Martian'} telemetry & computing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ========================================================= */}
        {/* PRESET QUICK REPLY CHIPS (Facebook Messenger Style)      */}
        {/* ========================================================= */}
        <div className="shrink-0 px-3 py-2 bg-slate-900/80 border-t border-slate-800/90">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{isMoon ? 'Lunar Survey & Diagnostics (Instant)' : 'Telemetry & Mission Diagnostic Chips (Instant)'}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeChips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleQuickChipSelect(chip)}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-200 hover:text-cyan-200 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* INPUT BAR: Freeform Custom Question Query                 */}
        {/* ========================================================= */}
        <form
          onSubmit={handleSendMessage}
          className="shrink-0 p-3 bg-slate-950 border-t border-cyan-500/30 flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            // CRUCIAL: Event isolation to stop game keys (WASD, Space, P, N) from moving character!
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
            placeholder={
              isMoon
                ? 'Ask NOVA anything about the Moon, Apollo relics, 1/6th gravity, LRV...'
                : 'Ask NOVA anything about Mars exploration, salvage, science...'
            }
            className="flex-1 bg-slate-900/90 text-sm font-sans text-slate-100 placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
          >
            <span>Transmit</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
