import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../systems/audio';
import { NovaAvatar } from '../NovaAvatar';
import { Activity, CheckCircle2, Sliders, Volume2, Shield } from 'lucide-react';

interface InSightSeismicPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const InSightSeismicPuzzle: React.FC<InSightSeismicPuzzleProps> = ({
  onSuccess,
  onClose
}) => {
  const [filterFrequency, setFilterFrequency] = useState<number>(50); // 0 to 100
  const [shieldDomeActive, setShieldDomeActive] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState('Tune the seismic bandpass filter to isolate the true Marsquake P and S-waves from atmospheric wind noise.');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Target frequency sweet spot is around 65-80 (0.2 - 0.8 Hz)
  const isOptimal = filterFrequency >= 60 && filterFrequency <= 80 && shieldDomeActive;

  useEffect(() => {
    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.1)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw Center Baseline
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Seismic Trace Waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = isOptimal ? '#10b981' : '#06b6d4';
      ctx.beginPath();

      const noiseFactor = shieldDomeActive ? 0.3 : 1.2;
      const filterClarity = 1 - Math.abs(filterFrequency - 70) / 70; // 0 to 1

      for (let x = 0; x < w; x++) {
        const normX = x / w;
        let y = h / 2;

        // Wind noise component (chaotic high frequency)
        const windNoise = (Math.sin(normX * 90 + time * 3) * 15 + Math.cos(normX * 180 - time * 5) * 10) * noiseFactor * (1 - filterClarity * 0.8);

        // Marsquake event wave (occurring around x = 20% to 75%)
        let quakeSignal = 0;
        if (normX > 0.2 && normX < 0.45) {
          // P-wave (compressional wave)
          const pEnvelope = Math.sin((normX - 0.2) / 0.25 * Math.PI);
          quakeSignal += Math.sin((normX - 0.2) * 55 + time) * 35 * pEnvelope;
        } else if (normX >= 0.45 && normX < 0.85) {
          // S-wave (shear wave - larger amplitude)
          const sEnvelope = Math.sin((normX - 0.45) / 0.4 * Math.PI);
          quakeSignal += Math.sin((normX - 0.45) * 32 + time * 0.8) * 65 * sEnvelope;
        }

        y += windNoise + quakeSignal * (0.3 + filterClarity * 0.7);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // If optimal, label P and S wave arrivals
      if (isOptimal) {
        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px monospace';
        ctx.fillText('▼ P-WAVE ARRIVAL', w * 0.22, h * 0.2);
        ctx.fillStyle = '#34d399';
        ctx.fillText('▼ S-WAVE ARRIVAL (CORE REFLECTION)', w * 0.52, h * 0.15);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [filterFrequency, shieldDomeActive, isOptimal]);

  const handleTune = (val: number) => {
    setFilterFrequency(val);
    sound.playHover();
    if (val >= 60 && val <= 80 && shieldDomeActive) {
      setStatusMsg('EXCELLENT: Signal-to-noise ratio nominal! P-waves and S-waves are clearly distinguished.');
    } else if (!shieldDomeActive) {
      setStatusMsg('WARNING: Without the Wind and Thermal Shield (WTS), atmospheric gusts drown out the deep seismic signals!');
    } else {
      setStatusMsg('Adjust frequency slider toward 0.5 Hz (approx 70%) to filter out high-frequency surface thermal hum.');
    }
  };

  const handleLockIn = () => {
    if (!isOptimal) {
      sound.playMistake();
      setStatusMsg('Signal is still degraded. Adjust slider until P and S waves are clearly defined.');
      return;
    }
    sound.playSuccess();
    setIsLocked(true);
    setStatusMsg('MARS INTERIOR MAPPED: Liquid core radius calculated at ~1,830 km with 40 km layered crust!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                SEISMOLOGY LAB · ELYSIUM PLANITIA
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white font-display">
                InSight: SEIS Marsquake Seismic Filter
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1"
          >
            ✕ Exit
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
            <strong>Geophysical Principle:</strong> Seismic waves travel through planetary interiors like an ultrasound. Compressional <strong>P-waves</strong> arrive first, followed by shear <strong>S-waves</strong> which cannot travel through liquid. This is how scientists discovered Mars has a liquid core!
          </div>

          {/* Interactive Seismogram Screen */}
          <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-3 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isOptimal ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
                SEIS VERY BROAD BAND (VBB) SENSOR · CHANNEL BHE
              </span>
              <span>MAGNITUDE 4.7 QUAKE DETECTED</span>
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={180}
              className="w-full h-[180px] bg-[#03060c] rounded-lg block border border-slate-800"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>0.00 SEC</span>
              <span>EPICENTER TRAVEL TIME: +18.4 MINUTES</span>
              <span>T = 300.00 SEC</span>
            </div>
          </div>

          {/* Controls Matrix */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Frequency Bandpass Slider */}
              <div className="flex-1 w-full space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Seismic Bandpass Filter Frequency
                  </span>
                  <span className={`font-semibold ${isOptimal ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {(filterFrequency / 100 * 2.5).toFixed(2)} Hz {isOptimal ? '(Optimal 0.50 Hz)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={filterFrequency}
                  onChange={(e) => handleTune(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Wind & Thermal Shield Toggle */}
              <button
                onClick={() => {
                  sound.playClick();
                  setShieldDomeActive(!shieldDomeActive);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-mono transition-colors border flex items-center gap-2 cursor-pointer shrink-0 ${
                  shieldDomeActive
                    ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                    : 'border-rose-500/50 bg-rose-950/40 text-rose-300'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>WTS Dome: {shieldDomeActive ? 'DEPLOYED' : 'EXPOSED'}</span>
              </button>

            </div>

            {/* Scientific Explanation Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-mono text-slate-400 text-[10px]">CRUST THICKNESS</div>
                <div className="font-mono font-semibold text-slate-100 mt-0.5">38 – 42 km Layer</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-mono text-slate-400 text-[10px]">MANTLE DEPTH</div>
                <div className="font-mono font-semibold text-slate-100 mt-0.5">1,560 km Rocky Shell</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="font-mono text-slate-400 text-[10px]">CORE RADIUS</div>
                <div className="font-mono font-semibold text-slate-100 mt-0.5">1,830 km Liquid Core</div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className={`font-mono ${isLocked ? 'text-emerald-400 font-semibold' : 'text-slate-300'}`}>
              {statusMsg}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <NovaAvatar mood={isLocked ? 'celebrate' : (isOptimal ? 'happy' : 'scanning')} size={40} />
            <div className="text-xs text-slate-400 hidden sm:block">
              {isLocked ? '"We just heard the heartbeat of Mars!"' : '"Dial the filter down to strip away surface wind vibrations."'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isLocked ? (
              <button
                disabled={!isOptimal}
                onClick={handleLockIn}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                Isolate Waveform & Calculate Core
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onSuccess();
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Log Discovery to Archive</span>
                <span className="font-mono">→</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
