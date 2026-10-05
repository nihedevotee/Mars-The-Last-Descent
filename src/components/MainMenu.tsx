import React, { useState } from 'react';
import { sound } from '../systems/audio';
import { NovaAvatar } from './NovaAvatar';
import { GameProgress } from '../systems/saveManager';
import { Play, RotateCcw, BookOpen, Compass, Settings as SettingsIcon, Info, Volume2, VolumeX } from 'lucide-react';
import nasaMontageImg from '../assets/images/nasa_mars_missions_1791205882072.jpg';

interface MainMenuProps {
  progress: GameProgress;
  onStartNewMission: () => void;
  onContinueMission: () => void;
  onOpenArchive: () => void;
  onOpenKnowledge: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartNewMission,
  onContinueMission,
  onOpenArchive,
  onOpenKnowledge,
  onOpenSettings,
  onOpenCredits
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const hasSavedProgress = progress.currentChapter > 0 || progress.unlockedMissions.length > 0;

  // Keyboard shortcut: Press Enter or Space to start/continue immediately
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        sound.playClick();
        if (hasSavedProgress) {
          onContinueMission();
        } else {
          onStartNewMission();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasSavedProgress, onContinueMission, onStartNewMission]);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#04060d] text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Cinematic Space Panorama */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={nasaMontageImg}
          alt="Deep Space Planetary Exploration"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060d] via-[#04060d]/60 to-transparent" />
        <div className="absolute inset-0 sci-fi-grid opacity-30" />
      </div>

      {/* Top Bar Contract: 3 zones */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-base sm:text-lg font-bold font-display tracking-wider text-white">
            12 KM: BEYOND THE DEPTH
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
          <button
            onClick={() => { sound.playClick(); onOpenKnowledge(); }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Science Briefs
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenArchive(); }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Mission Archive ({progress.unlockedMissions.length}/4)
          </button>
          <button
            onClick={() => { sound.playClick(); onOpenCredits(); }}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            NASA Data Sources
          </button>
        </nav>

        {/* Zone 3: Audio & Settings Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => { sound.playClick(); onOpenSettings(); }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-between px-6 sm:px-16 py-8 max-w-7xl mx-auto w-full gap-10">
        
        {/* Left Column: Title & Game Menu */}
        <div className="flex-1 max-w-xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider">
              <span>EXPLORATION CAMPAIGN</span>
              <span aria-hidden="true">·</span>
              <span>EARTH → MOON → MARS</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold font-display text-white tracking-wide leading-tight">
              MARS: THE LAST ASCENT
            </h1>
            <p className="text-sm sm:text-base text-slate-300 italic font-light">
              "We went as deep as we could. Now, let's go beyond."
            </p>
          </div>

          {/* Menu Action Options */}
          <div className="space-y-2.5 pt-2 max-w-md">
            
            {/* Start / Continue Buttons */}
            {hasSavedProgress ? (
              <button
                onClick={() => {
                  sound.playClick();
                  onContinueMission();
                }}
                className="w-full p-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-sm tracking-wider flex items-center justify-between shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all cursor-pointer group animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-4 h-4 fill-current" />
                  <span>CONTINUE MISSION</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/20 text-slate-950 font-mono font-bold">
                    PRESS ENTER ↵
                  </span>
                  <span className="text-xs text-slate-900 font-mono">
                    CH. {progress.currentChapter} →
                  </span>
                </div>
              </button>
            ) : null}

            <button
              onClick={() => {
                sound.playClick();
                onStartNewMission();
              }}
              className={`w-full p-4 rounded-xl font-bold font-mono text-sm tracking-wider flex items-center justify-between transition-all cursor-pointer ${
                hasSavedProgress
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60'
                  : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] animate-pulse'
              }`}
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4" />
                <span>START NEW MISSION</span>
              </div>
              <div className="flex items-center gap-2">
                {!hasSavedProgress && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/20 text-slate-950 font-mono font-bold">
                    PRESS ENTER ↵
                  </span>
                )}
                <span className="text-xs opacity-75 font-mono">FROM PROLOGUE →</span>
              </div>
            </button>

            {/* Archive / Knowledge */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenArchive();
                }}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>MISSION ARCHIVE</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenKnowledge();
                }}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>KNOWLEDGE</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenSettings();
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>SETTINGS</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCredits();
                }}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>CREDITS & SOURCES</span>
              </button>
            </div>

          </div>
        </div>

        {/* Right Column: NOVA Interactive Companion Showcase */}
        <div className="relative flex flex-col items-center justify-center">
          <div className="relative p-8 rounded-3xl bg-slate-950/60 backdrop-blur-md border border-cyan-500/20 shadow-2xl flex flex-col items-center text-center max-w-sm">
            
            {/* Holographic Platform Base */}
            <div className="absolute -top-3 px-3 py-1 bg-cyan-950 border border-cyan-500/40 rounded-full text-[10px] font-mono text-cyan-300 tracking-widest uppercase">
              AUTONOMOUS SCIENCE COMPANION
            </div>

            <div className="my-4">
              <NovaAvatar mood="idle" size={130} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">
                NOVA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Ready for pre-flight diagnostics, Explorer! Tap my paws to test audio synthesizer."
              </p>
            </div>

            {/* Quick Interactive Button */}
            <button
              onClick={() => sound.playNovaChirp()}
              className="mt-4 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Meow / Chirp Test</span>
              <span className="text-[10px]">♫</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer Ribbon */}
      <footer className="relative z-10 px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>NASA Space Apps Competition Concept · Authentic Historical Aerospace Science</div>
        <div className="text-[11px] text-slate-500">
          Earth Borehole: 12.26 km · Moon: 384,400 km · Mars: 225M km
        </div>
      </footer>

    </div>
  );
};
