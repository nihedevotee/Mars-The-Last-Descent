import React, { useState, useEffect } from 'react';
import { sound } from '../systems/audio';
import { NovaAvatar } from './NovaAvatar';
import { GameProgress } from '../systems/saveManager';
import { CheckCircle2, Rocket, Award, RotateCcw, Home } from 'lucide-react';

interface LaunchCinematicProps {
  progress: GameProgress;
  onReturnToMenu: () => void;
  onRestartCampaign: () => void;
}

export const LaunchCinematic: React.FC<LaunchCinematicProps> = ({
  progress,
  onReturnToMenu,
  onRestartCampaign
}) => {
  // Phase 0: Pre-flight systems check
  // Phase 1: Hatch seal & Engine ignition rumble
  // Phase 2: Ascent through Martian sky
  // Phase 3: Trans-Earth injection burn & Earth in view
  // Phase 4: Mission Complete victory screen
  const [phase, setPhase] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    sound.startAmbience('space');
  }, []);

  const startIgnition = () => {
    sound.playClick();
    setPhase(1);

    let cnt = 5;
    const interval = setInterval(() => {
      cnt--;
      setCountdown(cnt);
      sound.playHover();
      if (cnt <= 0) {
        clearInterval(interval);
        sound.playLaunchIgnition();
        setPhase(2);

        setTimeout(() => {
          setPhase(3);
        }, 4000);

        setTimeout(() => {
          sound.playSuccess();
          setPhase(4);
        }, 8500);
      }
    }, 1000);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-[#03060d] text-slate-100 flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none">
      
      {/* Dynamic Cinematic Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {phase <= 2 ? (
          // Mars atmosphere launch view
          <div className="w-full h-full bg-gradient-to-t from-[#83341d] via-[#38160d] to-[#04060d]">
            {phase === 2 && (
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-32 h-64 bg-gradient-to-t from-amber-400 via-orange-500 to-transparent blur-md animate-pulse" />
            )}
          </div>
        ) : (
          // Deep space with distant Mars & glowing Earth
          <div className="w-full h-full bg-[#04060e] flex items-center justify-center relative">
            {/* Distant Mars receding */}
            <div className="absolute top-1/4 left-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-900 shadow-xl opacity-60" />
            {/* Earth glowing in front */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-sky-950 via-blue-700 to-cyan-500 shadow-[0_0_80px_rgba(56,189,248,0.4)] animate-in zoom-in-75 duration-1000" />
          </div>
        )}
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>FINAL CHAPTER // THE LAST ASCENT</span>
        </div>
      </div>

      {/* Center Cinematic Stage */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-6 max-w-3xl mx-auto w-full">
        
        {/* Phase 0: Pre-flight Verification Checklist */}
        {phase === 0 && (
          <div className="w-full max-w-xl p-8 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-1">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
                AUTOMATED LAUNCH AUTHORIZATION
              </span>
              <h2 className="text-2xl font-bold font-display text-white">
                RETURN MISSION READY
              </h2>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-200">POWER BUS COUPLING:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% NOMINAL
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-200">HIGH-GAIN COMMS TRANSCEIVER:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> EARTH LOCK CONFIRMED
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-200">INERTIAL GUIDANCE GYRO:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ZERO DRIFT CALIBRATED
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-200">LIFE SUPPORT CABIN INTEGRITY:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 101.3 kPa O2 PRESSURIZED
                </span>
              </div>
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                <span className="text-slate-200">REGIONAL DUST TRAJECTORY:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ASCENT CORRIDOR CLEAR
                </span>
              </div>
            </div>

            {/* NOVA Dialogue */}
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/30 flex items-center gap-4">
              <NovaAvatar mood="happy" size={50} />
              <div className="text-xs text-slate-200 leading-relaxed flex-1">
                "All required checks complete. The return mission is ready for its final sequence. Let's go home, Explorer!"
              </div>
            </div>

            <button
              onClick={startIgnition}
              className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
            >
              <Rocket className="w-4 h-4" />
              <span>INITIATE IGNITION SEQUENCE</span>
            </button>
          </div>
        )}

        {/* Phase 1: Ignition Countdown */}
        {phase === 1 && (
          <div className="text-center space-y-4 p-8 rounded-2xl bg-black/80 backdrop-blur-md border border-cyan-500/40 animate-in zoom-in-95 duration-200">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              PRIMARY ENGINE PRE-IGNITION
            </div>
            <div className="text-7xl font-bold font-mono text-white animate-pulse">
              T-00:0{countdown}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              HATCH SEALED · CO-PILOT NOVA STATION SECURED · FUEL PUMPS TO 100%
            </p>
          </div>
        )}

        {/* Phase 2: Mars Liftoff Ascent */}
        {phase === 2 && (
          <div className="text-center space-y-4 p-8 rounded-2xl bg-black/70 backdrop-blur-md border border-orange-500/40 animate-in fade-in duration-500">
            <div className="text-xs font-mono text-orange-400 uppercase tracking-widest animate-pulse">
              LIFTOFF // POSITIVE CLIMB
            </div>
            <h3 className="text-3xl font-bold font-display text-white">
              ASCENDING THROUGH MARTIAN CLOUDS
            </h3>
            <p className="text-sm text-slate-300 font-mono">
              VELOCITY: 3.8 KM/S · RETRO-GIMBAL STABLE
            </p>
          </div>
        )}

        {/* Phase 3: Trans-Earth Trajectory */}
        {phase === 3 && (
          <div className="text-center space-y-4 p-8 rounded-2xl bg-black/80 backdrop-blur-md border border-sky-500/40 animate-in fade-in duration-500">
            <div className="text-xs font-mono text-sky-400 uppercase tracking-widest animate-pulse">
              TRANS-EARTH INJECTION BURN NOMINAL
            </div>
            <h3 className="text-3xl font-bold font-display text-white">
              HEADING TOWARD EARTH
            </h3>
            <p className="text-sm text-slate-300">
              Mars recedes into the dark. The blue marble awaits our return.
            </p>
          </div>
        )}

        {/* Phase 4: MISSION COMPLETE Victory Screen */}
        {phase === 4 && (
          <div className="w-full max-w-2xl p-8 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-500 text-center">
            
            <div className="flex justify-center">
              <NovaAvatar mood="celebrate" size={100} />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>EXPEDITION ACCOMPLISHED</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-wide">
                MISSION COMPLETE
              </h2>
            </div>

            {/* Campaign Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">DISCOVERIES</div>
                <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                  4 / 4 Complete
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">BADGES</div>
                <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                  4 Earned
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">PUZZLES</div>
                <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                  3 Solved
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[11px] font-mono text-slate-400">TRAJECTORY</div>
                <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                  Earth Orbit
                </div>
              </div>
            </div>

            {/* Core Inspirational Quote */}
            <blockquote className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-sm sm:text-base text-slate-200 font-light italic leading-relaxed">
              "The machines may stop working, but the knowledge they leave behind continues to guide humanity's next steps into the unknown."
            </blockquote>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onReturnToMenu();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Mission Control</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onRestartCampaign();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold font-mono text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (New Journey)</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Footer Subtext */}
      <div className="relative z-10 text-xs font-mono text-slate-500 text-center">
        12 KM: BEYOND THE DEPTH · Earth-Moon-Mars Educational Sci-Fi Adventure
      </div>

    </div>
  );
};
