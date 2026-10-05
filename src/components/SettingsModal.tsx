import React, { useState } from 'react';
import { sound } from '../systems/audio';
import { resetProgress } from '../systems/saveManager';
import { X, Volume2, VolumeX, RotateCcw, Monitor, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onResetSave: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onResetSave }) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const handleReset = () => {
    sound.playClick();
    resetProgress();
    onResetSave();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <h3 className="text-base font-semibold font-display text-white">
            Mission Control Settings
          </h3>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Audio Config */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Audio Synthesizer</div>
              <div className="text-slate-400 mt-0.5">
                Cosmic drones, scanner pulses, engine rumbles, and NOVA chirps
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-cyan-950 border-cyan-500/50 text-cyan-300'
              }`}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Keyboard Controls Guide */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-mono text-cyan-400 font-semibold uppercase">
              <Keyboard className="w-4 h-4" />
              <span>Exploration Keybindings</span>
            </div>
            <div className="space-y-1.5 text-slate-300 font-mono">
              <div className="flex justify-between">
                <span>Move Left / Right:</span>
                <span className="text-white">A / D or Arrow Keys</span>
              </div>
              <div className="flex justify-between">
                <span>Low-G Thruster Jump:</span>
                <span className="text-white">Spacebar or W / Up</span>
              </div>
              <div className="flex justify-between">
                <span>NOVA Scanner / Interact:</span>
                <span className="text-cyan-300 font-semibold">[E] or Enter</span>
              </div>
            </div>
          </div>

          {/* Save Management */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Local Expedition Data</div>
                <div className="text-slate-400 mt-0.5">
                  Clear unlocked missions, badges, and progress from localStorage
                </div>
              </div>

              {!confirmReset ? (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 font-mono transition-colors cursor-pointer"
                >
                  Reset Progress
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold transition-colors cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
