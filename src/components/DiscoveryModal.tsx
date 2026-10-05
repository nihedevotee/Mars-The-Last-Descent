import React from 'react';
import { MissionDiscovery } from '../data/missions';
import { sound } from '../systems/audio';
import { X, Award, ExternalLink, Cpu, Compass, Sparkles } from 'lucide-react';
import { NovaAvatar } from './NovaAvatar';

interface DiscoveryModalProps {
  discovery: MissionDiscovery;
  onClose: () => void;
  onStartActivity: () => void;
  activityLabel?: string;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  discovery,
  onClose,
  onStartActivity,
  activityLabel = 'Test Your Understanding'
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200">
        
        {/* Header Ribbon */}
        <div className="shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>HISTORICAL NASA EXPLORATION ARCHIVE</span>
                <span aria-hidden="true">·</span>
                <span>{discovery.year}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400 font-semibold">{discovery.status}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-white mt-0.5">
                {discovery.name}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close discovery modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Mission Tagline & Badge Strip */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs font-mono text-cyan-300 uppercase tracking-wider">
                  MISSION RECOGNITION
                </div>
                <div className="text-sm font-medium text-slate-100">
                  {discovery.tagline}
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-700 rounded-lg text-xs font-mono text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{discovery.badge}</span>
            </div>
          </div>

          {/* SECTION 1: THE MACHINE */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
              <Cpu className="w-4 h-4" />
              <span>1. THE MACHINE</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-display">
              {discovery.machine.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {discovery.machine.description}
            </p>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {discovery.machine.specs.map((spec, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">{spec.label}</div>
                  <div className="text-xs font-mono font-semibold text-slate-100 mt-0.5 truncate">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-400 italic pt-1">
              Context: {discovery.machine.historicalContext}
            </div>
          </div>

          {/* SECTION 2: THE SCIENCE */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-emerald-400 uppercase font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>2. THE SCIENCE</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-display">
              {discovery.science.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {discovery.science.description}
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Key Physical Measurements:
              </div>
              <ul className="space-y-1">
                {discovery.science.measurements.map((m, idx) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                    <span className="text-emerald-400 font-mono mt-0.5">▪</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-xs font-mono text-slate-400 pt-1">
              Instrumentation: <span className="text-slate-200">{discovery.science.instruments}</span>
            </div>
          </div>

          {/* SECTION 3: WHY IT MATTERS */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400 uppercase font-semibold">
              <Compass className="w-4 h-4" />
              <span>3. WHY IT MATTERS</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-display">
              {discovery.whyItMatters.title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {discovery.whyItMatters.description}
            </p>
            <div className="p-3 bg-amber-950/20 border-l-2 border-amber-400 rounded-r-lg text-xs text-amber-200 leading-relaxed">
              <strong>Core Insight:</strong> {discovery.whyItMatters.keyTakeaway}
            </div>
          </div>

          {/* Official NASA Source Citation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Source: {discovery.officialSource.title} ({discovery.officialSource.agency})</span>
            </div>
            <a
              href={discovery.officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline font-mono inline-flex items-center gap-1"
            >
              NASA Archive Link
            </a>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NovaAvatar mood="happy" size={38} />
            <div className="text-xs text-slate-300 hidden sm:block">
              "Fascinating data, Explorer! Ready to apply what we learned?"
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Resume Exploration
            </button>
            <button
              onClick={() => {
                sound.playClick();
                onStartActivity();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-2"
            >
              <span>{activityLabel}</span>
              <span className="font-mono">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
