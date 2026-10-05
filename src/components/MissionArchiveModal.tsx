import React, { useState } from 'react';
import { MISSIONS_DATA, MissionDiscovery } from '../data/missions';
import { sound } from '../systems/audio';
import { X, Award, ExternalLink, Cpu, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { NovaAvatar } from './NovaAvatar';

interface MissionArchiveModalProps {
  unlockedMissionIds: string[];
  onClose: () => void;
  onSelectDiscovery?: (discovery: MissionDiscovery) => void;
}

export const MissionArchiveModal: React.FC<MissionArchiveModalProps> = ({
  unlockedMissionIds,
  onClose,
  onSelectDiscovery
}) => {
  const allMissions = Object.values(MISSIONS_DATA);
  const [selectedId, setSelectedId] = useState<string>(
    unlockedMissionIds[0] || allMissions[0].id
  );

  const activeMission = MISSIONS_DATA[selectedId] || allMissions[0];
  const isUnlocked = unlockedMissionIds.includes(activeMission.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                HISTORICAL NASA EXPLORATION ARCHIVE
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white font-display">
                Field Discoveries & Machine Lore
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              Unlocked: {unlockedMissionIds.length} / {allMissions.length}
            </span>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Layout: Left Sidebar + Right Inspector */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Mission List */}
          <div className="w-full md:w-72 border-r border-slate-800/80 p-3 space-y-2 overflow-y-auto bg-slate-950/50 shrink-0">
            {allMissions.map((m) => {
              const unlocked = unlockedMissionIds.includes(m.id);
              const isSelected = selectedId === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedId(m.id);
                  }}
                  className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 text-white'
                      : 'border-slate-800/80 bg-slate-900/20 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={unlocked ? 'text-cyan-400' : 'text-slate-600'}>
                      {m.year}
                    </span>
                    {unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-600">LOCKED</span>
                    )}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-100">
                    {unlocked ? m.name : 'Unknown Signal'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {unlocked ? m.location : 'Explore surface to log'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Inspector */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {isUnlocked ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                      <span>{activeMission.missionName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeMission.location}</span>
                    </div>
                    <h3 className="text-xl font-bold font-display text-white mt-1">
                      {activeMission.name}
                    </h3>
                    <p className="text-xs text-slate-300 italic mt-0.5">
                      "{activeMission.tagline}"
                    </p>
                  </div>

                  <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2 shrink-0">
                    <Award className="w-4 h-4" />
                    <span>{activeMission.badge}</span>
                  </div>
                </div>

                {/* THE MACHINE */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>1. THE MACHINE</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {activeMission.machine.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMission.machine.description}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                    {activeMission.machine.specs.map((s, i) => (
                      <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800">
                        <div className="text-slate-500 text-[10px]">{s.label}</div>
                        <div className="text-slate-200 font-semibold truncate">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* THE SCIENCE */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>2. THE SCIENCE</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {activeMission.science.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMission.science.description}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300 pt-1">
                    {activeMission.science.measurements.map((m, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-mono">▪</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WHY IT MATTERS */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>3. WHY IT MATTERS</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {activeMission.whyItMatters.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeMission.whyItMatters.description}
                  </p>
                  <div className="p-2.5 rounded bg-amber-950/20 border-l-2 border-amber-400 text-xs text-amber-200">
                    {activeMission.whyItMatters.keyTakeaway}
                  </div>
                </div>

                {/* Verified Citation */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                  <span>Source: {activeMission.officialSource.title}</span>
                  <a
                    href={activeMission.officialSource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                  >
                    <span>View NASA Catalog</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <NovaAvatar mood="curious" size={80} />
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-base font-semibold text-slate-200 font-display">
                    Uncharted Exploration Sector
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This historical NASA mission has not been scanned yet. Traverse the Moon or Mars surfaces to locate and analyze this machine!
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-slate-400">
            Real NASA Mission Archive · Strictly Verified Historical Facts
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
};
