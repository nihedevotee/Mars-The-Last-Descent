import React, { useState, useEffect } from 'react';
import { sound } from '../systems/audio';
import { NovaAvatar } from './NovaAvatar';
import { AlertOctagon, BatteryCharging, Radio, Compass, HeartPulse, CheckCircle2, ChevronRight } from 'lucide-react';
import crashBackdropImg from '../assets/images/mars_spacecraft_crash_1791205842480.jpg';

interface MarsCrashSceneProps {
  onDiagnosticComplete: () => void;
}

export const MarsCrashScene: React.FC<MarsCrashSceneProps> = ({ onDiagnosticComplete }) => {
  // Phase 0: Orbital descent & alarms
  // Phase 1: Crash impact & screen shake
  // Phase 2: NOVA reboot & damage assessment
  // Phase 3: Interactive Diagnostic interface
  const [phase, setPhase] = useState<number>(0);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [novaRebooted, setNovaRebooted] = useState<boolean>(false);

  // Inspected systems state
  const [inspectedSystems, setInspectedSystems] = useState<Record<string, boolean>>({
    power: false,
    communication: false,
    navigation: false,
    lifeSupport: false
  });
  const [activeSystemModal, setActiveSystemModal] = useState<string | null>(null);

  useEffect(() => {
    sound.startAmbience('mars');

    // Descent countdown
    const t1 = setTimeout(() => {
      setScreenShake(true);
      sound.playRumble();
      setPhase(1);
    }, 4500);

    const t2 = setTimeout(() => {
      setScreenShake(false);
      setPhase(2);
      setTimeout(() => {
        setNovaRebooted(true);
        sound.playNovaChirp();
      }, 1800);
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleInspect = (sysKey: string) => {
    sound.playClick();
    setActiveSystemModal(sysKey);
    setInspectedSystems((prev) => ({ ...prev, [sysKey]: true }));
  };

  const allInspected = Object.values(inspectedSystems).every(Boolean);

  return (
    <div className={`relative w-full h-full min-h-screen bg-[#110503] text-slate-100 flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none ${screenShake ? 'animate-shake' : ''}`}>
      
      {/* Background Crash Visual */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <img
          src={crashBackdropImg}
          alt="Mars crash landing site"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-50 filter contrast-125 brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#110503] via-[#110503]/70 to-transparent" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>CHAPTER 2 // THE DESCENT & CRASH</span>
        </div>

        {phase < 2 && (
          <button
            onClick={() => {
              setScreenShake(false);
              setPhase(2);
              setNovaRebooted(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50 text-xs font-mono transition-colors cursor-pointer"
          >
            Skip Descent →
          </button>
        )}
      </div>

      {/* Cinematic Stages */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 max-w-4xl mx-auto w-full">
        
        {/* Phase 0: Orbital Entry Malfunction */}
        {phase === 0 && (
          <div className="text-center space-y-4 max-w-lg p-6 rounded-2xl bg-black/70 backdrop-blur-md border border-rose-500/40 animate-in fade-in duration-500">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest animate-pulse">
              <AlertOctagon className="w-4 h-4" />
              <span>ALTITUDE: 18,000 METERS · RETRO-BURNING</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              DESCENT MALFUNCTION
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Turbulent Martian atmosphere shear detected. Retro-thruster gimbal failure in sector 4! Deceleration trajectory destabilizing...
            </p>
          </div>
        )}

        {/* Phase 1: Crash Impact */}
        {phase === 1 && (
          <div className="text-center space-y-4 max-w-lg p-6 rounded-2xl bg-rose-950/80 backdrop-blur-md border border-rose-500 animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-rose-300 animate-pulse">
              IMPACT // BRACE FOR HARD LANDING
            </h2>
            <p className="text-sm text-slate-200">
              Aeroshell breached. Ingestion of Martian surface regolith. Primary power bus severed!
            </p>
          </div>
        )}

        {/* Phase 2: NOVA Reboot sequence */}
        {phase === 2 && !novaRebooted && (
          <div className="flex flex-col items-center text-center space-y-4 p-8 rounded-2xl bg-slate-950/80 border border-slate-800 animate-in fade-in duration-500">
            <NovaAvatar mood="warning" size={90} />
            <div className="space-y-1">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest animate-pulse">
                INITIALIZING REBOOT SEQUENCE...
              </div>
              <div className="text-sm font-mono text-slate-400">
                KERNEL: RESTORING COGNITIVE HEURISTICS [42%]
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Post-Crash Diagnostic Interface */}
        {(phase === 2 && novaRebooted) && (
          <div className="w-full space-y-6 animate-in fade-in duration-500">
            
            {/* NOVA Dialogue Bar */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-md flex items-center gap-4">
              <NovaAvatar mood="warning" size={56} />
              <div className="flex-1">
                <div className="text-xs font-mono text-cyan-400 uppercase font-semibold">
                  NOVA // POST-CRASH TELEMETRY
                </div>
                <div className="text-sm text-slate-200 leading-snug mt-0.5">
                  "System reboot complete. Explorer, we have a problem. The descent thrusters failed on impact. We need to inspect our primary spacecraft subsystems."
                </div>
              </div>
            </div>

            {/* Diagnostic Subsystems Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* 1. POWER */}
              <button
                onClick={() => handleInspect('power')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  inspectedSystems.power
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
                    <BatteryCharging className="w-4 h-4" />
                  </div>
                  {inspectedSystems.power && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">SUBSYSTEM 01</div>
                  <div className="text-sm font-bold font-display text-white mt-0.5">POWER BUS</div>
                  <div className="text-xs font-mono text-amber-400 mt-1">
                    {inspectedSystems.power ? 'PARTIAL FAILURE (42%)' : 'Click to Diagnose'}
                  </div>
                </div>
              </button>

              {/* 2. COMMUNICATION */}
              <button
                onClick={() => handleInspect('communication')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  inspectedSystems.communication
                    ? 'bg-rose-950/40 border-rose-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  {inspectedSystems.communication && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">SUBSYSTEM 02</div>
                  <div className="text-sm font-bold font-display text-white mt-0.5">HIGH-GAIN COMMS</div>
                  <div className="text-xs font-mono text-rose-400 mt-1">
                    {inspectedSystems.communication ? 'OFFLINE // ANTENNA ALIGNED' : 'Click to Diagnose'}
                  </div>
                </div>
              </button>

              {/* 3. NAVIGATION */}
              <button
                onClick={() => handleInspect('navigation')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  inspectedSystems.navigation
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  {inspectedSystems.navigation && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">SUBSYSTEM 03</div>
                  <div className="text-sm font-bold font-display text-white mt-0.5">INERTIAL GYRO</div>
                  <div className="text-xs font-mono text-amber-400 mt-1">
                    {inspectedSystems.navigation ? 'DAMAGED // DRIFTING' : 'Click to Diagnose'}
                  </div>
                </div>
              </button>

              {/* 4. LIFE SUPPORT */}
              <button
                onClick={() => handleInspect('lifeSupport')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  inspectedSystems.lifeSupport
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  {inspectedSystems.lifeSupport && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-xs font-mono text-slate-400">SUBSYSTEM 04</div>
                  <div className="text-sm font-bold font-display text-white mt-0.5">LIFE SUPPORT (O2)</div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    {inspectedSystems.lifeSupport ? 'STABLE (O2 NOMINAL)' : 'Click to Diagnose'}
                  </div>
                </div>
              </button>

            </div>

            {/* Diagnostic Modal Inspector Info */}
            {activeSystemModal && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                <span>
                  {activeSystemModal === 'power' && 'Power arrays cracked on impact. Aux batteries holding at 42%. We will need to apply solar management principles.'}
                  {activeSystemModal === 'communication' && 'Deep space parabolic dish misaligned. High-frequency RF transceiver silent.'}
                  {activeSystemModal === 'navigation' && 'Inertial measurement unit suffered high G-shock. Gyro calibration required before return ascent.'}
                  {activeSystemModal === 'lifeSupport' && 'Internal pressure cabin held! Nitrogen/Oxygen scrubbers are running safely.'}
                </span>
                <button
                  onClick={() => setActiveSystemModal(null)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-mono text-xs"
                >
                  OK
                </button>
              </div>
            )}

            {/* Continue to Exploration Button */}
            {allInspected && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onDiagnosticComplete();
                  }}
                  className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer animate-pulse"
                >
                  <span>COMMENCE MARS SURFACE EXPLORATION</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Footer Status */}
      <div className="relative z-10 text-xs font-mono text-slate-500 text-center">
        Ares Vallis Vicinity · Surface Atmospheric Pressure: 610 Pa · Temp: -63°C
      </div>

    </div>
  );
};
