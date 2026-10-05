import React, { useState } from 'react';
import { sound } from '../../systems/audio';
import { NovaAvatar } from '../NovaAvatar';
import { Microscope, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

interface OpportunityWaterPuzzleProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface RockSample {
  id: string;
  name: string;
  microscopicTexture: string;
  mineralogy: string;
  waterRelated: boolean;
  scientificDeduction: string;
}

const SAMPLES: RockSample[] = [
  {
    id: 'sample_a',
    name: 'Sample #01: Dense Dark Basalt',
    microscopicTexture: 'Crystalline interlocking pyroxene and plagioclase grains with zero rounding.',
    mineralogy: 'High in unweathered olivine and pyroxene. Low sulfur.',
    waterRelated: false,
    scientificDeduction: 'Formed through rapid cooling of dry volcanic lava flows. Highly vulnerable to water weathering; its pristine state proves dry volcanic conditions.'
  },
  {
    id: 'sample_b',
    name: 'Sample #02: Hematite "Blueberry" Concretions',
    microscopicTexture: 'Perfect uniform spherules (1–3 mm) embedded evenly across sedimentary sulfate layers.',
    mineralogy: 'Pure crystalline grey hematite (Fe2O3) formed by mineral precipitation.',
    waterRelated: true,
    scientificDeduction: 'Concretions grow only inside water-saturated rocks where acidic groundwater dissolves iron and deposits spherical beads.'
  },
  {
    id: 'sample_c',
    name: 'Sample #03: Cross-Bedded Ripple Sulfate Bedrock',
    microscopicTexture: 'Curved, festoon cross-laminations with distinct sedimentary wave ripples.',
    mineralogy: 'Hydrated magnesium sulfates and jarosite (a potassium-iron sulfate mineral requiring water to form).',
    waterRelated: true,
    scientificDeduction: 'Festoon ripple geometry is created by flowing water currents in a shallow salty playa lake, not dry wind alone.'
  },
  {
    id: 'sample_d',
    name: 'Sample #04: Shocked Impact Breccia',
    microscopicTexture: 'Angular shattered rock fragments fused together in a melted glassy matrix.',
    mineralogy: 'Melted silicates showing planar deformation features from extreme hypervelocity impact shock.',
    waterRelated: false,
    scientificDeduction: 'Produced mechanically by a violent meteorite impact hitting the surface, completely unrelated to aqueous water activity.'
  }
];

export const OpportunityWaterPuzzle: React.FC<OpportunityWaterPuzzleProps> = ({
  onSuccess,
  onClose
}) => {
  const [activeSampleId, setActiveSampleId] = useState<string>(SAMPLES[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [evaluated, setEvaluated] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Inspect the 4 rock samples with Opportunity’s instruments. Identify the TWO samples proving past liquid water.');

  const activeSample = SAMPLES.find((s) => s.id === activeSampleId)!;

  const toggleSelect = (id: string) => {
    if (isSuccess) return;
    sound.playClick();
    setEvaluated(false);
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // replace first
        setSelectedIds([selectedIds[1], id]);
      }
    }
  };

  const handleEvaluate = () => {
    if (selectedIds.length !== 2) {
      sound.playMistake();
      setStatusMsg('Please select exactly TWO samples that demonstrate past liquid water.');
      return;
    }

    setEvaluated(true);
    const waterIds = SAMPLES.filter((s) => s.waterRelated).map((s) => s.id);
    const correct = selectedIds.length === 2 && selectedIds.every((id) => waterIds.includes(id));

    if (correct) {
      sound.playSuccess();
      setIsSuccess(true);
      setStatusMsg('EVIDENCE CONFIRMED: Hematite Blueberries and Cross-Bedded Jarosite Sulfates prove ancient standing and subsurface water on Mars!');
    } else {
      sound.playMistake();
      setIsSuccess(false);
      setStatusMsg('Inconclusive: Look closely at the mineral chemistry. Volcanic and impact rocks form without water!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Microscope className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                FIELD GEOLOGY LAB · MERIDIANI PLANUM
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white font-display">
                Opportunity: Paleowater Evidence Analyzer
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
          
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <span>
              <strong>Scientific Investigation:</strong> Examine microscopic imager frames and Mössbauer mineral spectrometer data. Select the <strong>two samples</strong> that could only form in an aqueous (water-rich) environment.
            </span>
            <span className="font-mono text-cyan-400 shrink-0 ml-3">Selected: {selectedIds.length}/2</span>
          </div>

          {/* Sample Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SAMPLES.map((sample) => {
              const isSelected = selectedIds.includes(sample.id);
              const isActive = activeSampleId === sample.id;

              return (
                <button
                  key={sample.id}
                  onClick={() => {
                    sound.playHover();
                    setActiveSampleId(sample.id);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-sm'
                      : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[11px] font-mono text-cyan-400">
                      {sample.id.replace('sample_', 'SPECIMEN ')}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {sample.name.split(':')[1]?.trim() || sample.name}
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400">
                    Click to inspect →
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Specimen Deep Inspection Panel */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase">Microscopic Field View</span>
                <h4 className="text-base font-semibold text-white font-display mt-0.5">
                  {activeSample.name}
                </h4>
              </div>

              {/* Tag / Selection Checkbox Button */}
              <button
                onClick={() => toggleSelect(activeSample.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  selectedIds.includes(activeSample.id)
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                {selectedIds.includes(activeSample.id) ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected as Water Evidence</span>
                  </>
                ) : (
                  <span>Select as Water Evidence</span>
                )}
              </button>
            </div>

            {/* Specimen Visual Representation / Simulation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center items-center relative overflow-hidden aspect-video md:aspect-auto">
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-500">
                  500 μm SCALE · MICROSCOPIC IMAGER
                </div>

                {activeSample.id === 'sample_b' ? (
                  <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center p-2 bg-slate-900/60">
                    {/* Blueberries visualization */}
                    <div className="w-6 h-6 rounded-full bg-slate-400 border border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)] m-1 animate-pulse" />
                    <div className="w-5 h-5 rounded-full bg-slate-500 border border-slate-300 m-1" />
                    <div className="w-7 h-7 rounded-full bg-slate-400 border border-cyan-200 shadow-sm m-1" />
                  </div>
                ) : activeSample.id === 'sample_c' ? (
                  <div className="w-full h-24 flex flex-col justify-center gap-1.5 px-4">
                    {/* Sedimentary Ripple Lines */}
                    <div className="h-2 w-full bg-amber-900/40 rounded-full border-t border-amber-500/50" />
                    <div className="h-2 w-4/5 bg-amber-900/60 rounded-full border-t border-amber-400/60" />
                    <div className="h-2 w-full bg-amber-900/50 rounded-full border-t border-amber-500/50" />
                    <div className="h-2 w-3/4 bg-amber-900/70 rounded-full border-t border-amber-400/70" />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-500 font-mono text-xs text-center p-2">
                    {activeSample.id === 'sample_a' ? 'Basaltic Lava Matrix' : 'Meteorite Impact Glass'}
                  </div>
                )}

                <div className="text-[11px] font-mono text-cyan-300 mt-2 text-center">
                  {activeSample.id === 'sample_b'
                    ? 'Spherical Hematite Concretions ("Blueberries")'
                    : activeSample.id === 'sample_c'
                    ? 'Aqueous Festoon Cross-Bedding Layers'
                    : 'Non-Aqueous Geologic Matrix'}
                </div>
              </div>

              {/* Instrument Reading Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="font-mono text-slate-400 uppercase text-[10px] block">
                    Microscopic Texture Analysis
                  </span>
                  <p className="text-slate-200 mt-0.5">{activeSample.microscopicTexture}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="font-mono text-slate-400 uppercase text-[10px] block">
                    Mössbauer & APXS Mineralogy
                  </span>
                  <p className="text-slate-200 mt-0.5">{activeSample.mineralogy}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="font-mono text-slate-400 uppercase text-[10px] block">
                    Geological Deduction
                  </span>
                  <p className="text-slate-300 mt-0.5">{activeSample.scientificDeduction}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className={`font-mono ${isSuccess ? 'text-emerald-400 font-semibold' : evaluated ? 'text-rose-400' : 'text-slate-300'}`}>
              {statusMsg}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <NovaAvatar mood={isSuccess ? 'celebrate' : (evaluated ? 'warning' : 'curious')} size={40} />
            <div className="text-xs text-slate-400 hidden sm:block">
              {isSuccess ? '"The evidence of Martian groundwater is indisputable!"' : '"Look for minerals that only crystallize from liquid solutions."'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSuccess ? (
              <button
                disabled={selectedIds.length !== 2}
                onClick={handleEvaluate}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              >
                Submit Evidence Analysis
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onSuccess();
                }}
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Complete Mission Discovery</span>
                <span className="font-mono">→</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
