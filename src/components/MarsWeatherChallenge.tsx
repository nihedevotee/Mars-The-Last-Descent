import React, { useState } from 'react';
import { sound } from '../systems/audio';
import { NovaAvatar } from './NovaAvatar';
import { Wind, Sun, Battery, ShieldAlert, CheckCircle2, ChevronRight, Thermometer } from 'lucide-react';

interface MarsWeatherChallengeProps {
  onChallengeResolved: (decision: 'short_route' | 'wait_conditions') => void;
}

export const MarsWeatherChallenge: React.FC<MarsWeatherChallengeProps> = ({ onChallengeResolved }) => {
  const [selectedRoute, setSelectedRoute] = useState<'short_route' | 'wait_conditions' | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const handleSelect = (choice: 'short_route' | 'wait_conditions') => {
    sound.playClick();
    setSelectedRoute(choice);
  };

  const handleConfirm = () => {
    if (!selectedRoute) return;
    sound.playSuccess();
    setIsResolved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-orange-500/50 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-orange-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-950 border border-orange-500/50 text-orange-400">
              <Wind className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-orange-400 uppercase tracking-wider">
                CHAPTER 4 // ENVIRONMENTAL CRISIS
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white font-display">
                The Wrath of Mars: Regional Dust Storm Inbound
              </h3>
            </div>
          </div>
          <div className="px-3 py-1 bg-rose-950 border border-rose-500/40 rounded-lg text-rose-300 font-mono text-xs">
            TAU OPACITY: 3.4
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Weather Alert Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <span>MARS ATMOSPHERIC TELEMETRY BRIEFING</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Thermal convection over Arabia Terra has unleashed a regional dust storm. Atmospheric optical depth (Tau) has spiked from 0.6 to 3.4. Fine ferric-oxide dust particles will obscure 85% of solar radiation within 6 hours, while nighttime temperatures plunge to -88°C.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                Temp: -88°C (Extreme Cold)
              </span>
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Solar Flux: -75% Reduction
              </span>
              <span className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-rose-400" />
                Survival Reserve: 38%
              </span>
            </div>
          </div>

          {/* NOVA Dialogue Advice */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3.5">
            <NovaAvatar mood="warning" size={46} />
            <div className="text-xs text-slate-200 leading-relaxed flex-1">
              "Explorer, Opportunity and InSight taught us how dangerous Martian dust is for solar arrays. We have to decide our tactical approach to reach the lander repair depot."
            </div>
          </div>

          {/* Decision Choices */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Select Your Tactical Response:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Fast & Risky */}
              <button
                onClick={() => handleSelect('short_route')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRoute === 'short_route'
                    ? 'border-orange-500 bg-orange-950/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-orange-400 font-semibold">STRATEGY A</span>
                    {selectedRoute === 'short_route' && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                  </div>
                  <h4 className="text-sm font-semibold text-white font-display">
                    Traverse Exposed Ridge (Fast Route)
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Race directly across the windy basalt ridge before the storm reaches peak opacity. Consumes less life-support reserves, but high winds risk abrasive dust fouling the rover seals.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-amber-300 mt-3">
                  Time: 1.5 hrs · Risk: High Dust Ingestion
                </div>
              </button>

              {/* Option 2: Safe & Patient */}
              <button
                onClick={() => handleSelect('wait_conditions')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedRoute === 'wait_conditions'
                    ? 'border-emerald-500 bg-emerald-950/30 shadow-md'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-emerald-400 font-semibold">STRATEGY B</span>
                    {selectedRoute === 'wait_conditions' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h4 className="text-sm font-semibold text-white font-display">
                    Shelter in Canyon & Conserve Power
                  </h4>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Hunker down in the leeward shadow of the crater cliff. Deploy thermal blankets over electronics and wait for wind speeds to drop below 15 m/s. Safer for sensitive optics.
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-300 mt-3">
                  Time: 6.0 hrs · Risk: Battery Depletion
                </div>
              </button>

            </div>
          </div>

          {/* Outcome Result when Confirmed */}
          {isResolved && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300 uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>ENVIRONMENTAL PROTOCOL EXECUTED</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedRoute === 'wait_conditions'
                  ? 'By seeking shelter and managing thermal cycles like Opportunity did in 2007, you protected the critical guidance gyro from abrasive sandblasting. The storm has crested!'
                  : 'You pushed through the gale with steady navigation! A thin layer of rust dust coated the solar cells, but your fast transit preserved precious life support oxygen reserves.'}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            {selectedRoute ? 'Ready to execute protocol' : 'Select an operational route'}
          </div>

          {!isResolved ? (
            <button
              disabled={!selectedRoute}
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold font-mono text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              EXECUTE PROTOCOL →
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onChallengeResolved(selectedRoute!);
              }}
              className="px-5 py-2 text-xs font-bold font-mono text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>PROCEED TO SPACECRAFT REPAIR</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
