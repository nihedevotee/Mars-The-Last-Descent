import React, { useState } from 'react';
import { sound } from '../systems/audio';
import { NovaAvatar } from './NovaAvatar';
import { Wrench, CheckCircle2, ChevronRight, Cpu, Zap, Radio, Sliders, ShieldCheck } from 'lucide-react';

interface SpacecraftRepairSceneProps {
  onRepairComplete: () => void;
}

export const SpacecraftRepairScene: React.FC<SpacecraftRepairSceneProps> = ({ onRepairComplete }) => {
  // 3 Engineering Subsystem Repairs:
  // 1. Thruster Gimbal Joint Alignment (from Sojourner's Rocker-Bogie kinematic knowledge)
  // 2. Solar Bus Battery Thermal Cycling (from Opportunity's energy management)
  // 3. Inertial Gyro Calibration (from InSight's seismic sensor calibration)
  const [repairs, setRepairs] = useState({
    gimbal: false,
    powerBus: false,
    gyro: false
  });

  const [activeTab, setActiveTab] = useState<'gimbal' | 'powerBus' | 'gyro'>('gimbal');

  // Mini-puzzle states
  const [gimbalAngle, setGimbalAngle] = useState(12); // target is 0°
  const [powerFrequency, setPowerFrequency] = useState(30); // target is 60Hz
  const [gyroTrim, setGyroTrim] = useState(-15); // target is 0

  const handleFixGimbal = () => {
    sound.playHover();
    if (Math.abs(gimbalAngle) <= 2) {
      sound.playSuccess();
      setRepairs((prev) => ({ ...prev, gimbal: true }));
    }
  };

  const handleFixPower = () => {
    sound.playHover();
    if (powerFrequency >= 58 && powerFrequency <= 62) {
      sound.playSuccess();
      setRepairs((prev) => ({ ...prev, powerBus: true }));
    }
  };

  const handleFixGyro = () => {
    sound.playHover();
    if (Math.abs(gyroTrim) <= 1) {
      sound.playSuccess();
      setRepairs((prev) => ({ ...prev, gyro: true }));
    }
  };

  const allRepairsDone = repairs.gimbal && repairs.powerBus && repairs.gyro;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-[0_16px_60px_rgba(0,0,0,0.8)] overflow-hidden text-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                CHAPTER 5 // SPACECRAFT ENGINEERING PROTOCOL
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white font-display">
                Applying NASA Principles to Restore Exploration Vessel
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Readiness:</span>
            <span className={`font-bold ${allRepairsDone ? 'text-emerald-400' : 'text-amber-400'}`}>
              {[repairs.gimbal, repairs.powerBus, repairs.gyro].filter(Boolean).length}/3 Subsystems
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong>Engineering Principle:</strong> We do not strip real museum rovers for spare parts. Instead, we use the <em>scientific principles</em> discovered by NASA missions—robotic kinematics, solar battery thermal management, and seismological gyro tuning—to recalibrate our spacecraft systems!
          </div>

          {/* Subsystem Navigation Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => { sound.playHover(); setActiveTab('gimbal'); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'gimbal'
                  ? 'border-cyan-400 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-mono font-semibold truncate">1. Gimbal Joint</span>
              </div>
              {repairs.gimbal && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>

            <button
              onClick={() => { sound.playHover(); setActiveTab('powerBus'); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'powerBus'
                  ? 'border-cyan-400 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono font-semibold truncate">2. Power Bus</span>
              </div>
              {repairs.powerBus && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>

            <button
              onClick={() => { sound.playHover(); setActiveTab('gyro'); }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                activeTab === 'gyro'
                  ? 'border-cyan-400 bg-cyan-950/40 text-white'
                  : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Radio className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-mono font-semibold truncate">3. Gyroscope</span>
              </div>
              {repairs.gyro && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            </button>
          </div>

          {/* Active Repair Workspace */}
          <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
            
            {/* 1. GIMBAL REPAIR */}
            {activeTab === 'gimbal' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 uppercase">
                      INSPIRED BY SOJOURNER’S 6-WHEEL ROCKER-BOGIE KINEMATICS
                    </span>
                    <h4 className="text-base font-semibold text-white font-display">
                      Thruster Gimbal Vector Alignment
                    </h4>
                  </div>
                  {repairs.gimbal ? (
                    <div className="px-3 py-1 bg-emerald-950 border border-emerald-500 rounded text-xs font-mono text-emerald-300">
                      ALIGNED (0.0° THRUST VECTOR)
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  The impact shoved the main ascent rocket bell off-axis. Using Sojourner’s articulated joint principles, dial the servo gimbal actuator back to <strong>0° center</strong> so the rocket thrust aligns with our center of mass.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Actuator Gimbal Angle:
                    </span>
                    <span className={Math.abs(gimbalAngle) <= 2 ? 'text-emerald-400 font-bold' : 'text-cyan-400'}>
                      {gimbalAngle > 0 ? `+${gimbalAngle}°` : `${gimbalAngle}°`} {Math.abs(gimbalAngle) <= 2 ? '(NOMINAL CENTER)' : ''}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-25"
                    max="25"
                    value={gimbalAngle}
                    disabled={repairs.gimbal}
                    onChange={(e) => {
                      setGimbalAngle(Number(e.target.value));
                      if (Math.abs(Number(e.target.value)) <= 2) handleFixGimbal();
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-25° PITCH</span>
                    <span>0° TRUE CENTER</span>
                    <span>+25° PITCH</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. POWER BUS REPAIR */}
            {activeTab === 'powerBus' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-amber-400 uppercase">
                      INSPIRED BY OPPORTUNITY’S SOLAR THERMAL MANAGEMENT
                    </span>
                    <h4 className="text-base font-semibold text-white font-display">
                      Auxiliary Power Inverter Synchronizer
                    </h4>
                  </div>
                  {repairs.powerBus ? (
                    <div className="px-3 py-1 bg-emerald-950 border border-emerald-500 rounded text-xs font-mono text-emerald-300">
                      LOCKED (60.0 HZ BUS)
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Opportunity survived 14 harsh Martian winters by carefully scheduling deep-sleep cycles and routing current to internal survival heaters. Match our main bus alternating frequency to <strong>60 Hz</strong> to prevent thermal overload on the ascent batteries.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Inverter Bus Frequency:
                    </span>
                    <span className={powerFrequency >= 58 && powerFrequency <= 62 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {powerFrequency} Hz {powerFrequency >= 58 && powerFrequency <= 62 ? '(BUS SYNCHRONIZED)' : ''}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={powerFrequency}
                    disabled={repairs.powerBus}
                    onChange={(e) => {
                      setPowerFrequency(Number(e.target.value));
                      if (Number(e.target.value) >= 58 && Number(e.target.value) <= 62) handleFixPower();
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>20 Hz (Underdriven)</span>
                    <span>60 Hz (Standard Bus)</span>
                    <span>100 Hz (Overheated)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. GYRO REPAIR */}
            {activeTab === 'gyro' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 uppercase">
                      INSPIRED BY INSIGHT’S SEISMIC VIBRATION ISOLATION
                    </span>
                    <h4 className="text-base font-semibold text-white font-display">
                      Inertial Navigation Drift Trim
                    </h4>
                  </div>
                  {repairs.gyro ? (
                    <div className="px-3 py-1 bg-emerald-950 border border-emerald-500 rounded text-xs font-mono text-emerald-300">
                      CALIBRATED (ZERO DRIFT)
                    </div>
                  ) : null}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  InSight’s ultra-sensitive pendulum sensors measured vibrations as small as a single picometer by filtering thermal expansion. Trim out the high-frequency drift until our navigation gyro reads <strong>0.00 μrad/s</strong>.
                </p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                      Inertial Drift Trim:
                    </span>
                    <span className={Math.abs(gyroTrim) <= 1 ? 'text-emerald-400 font-bold' : 'text-emerald-400'}>
                      {gyroTrim > 0 ? `+${gyroTrim}` : `${gyroTrim}`} μrad/s {Math.abs(gyroTrim) <= 1 ? '(DRIFT NULLIFIED)' : ''}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={gyroTrim}
                    disabled={repairs.gyro}
                    onChange={(e) => {
                      setGyroTrim(Number(e.target.value));
                      if (Math.abs(Number(e.target.value)) <= 1) handleFixGyro();
                    }}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-30 Drift</span>
                    <span>0.0 Null Trim</span>
                    <span>+30 Drift</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Pre-Flight Checklist */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Pre-Ascent Launch Checklist:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${repairs.gimbal ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Rocket Gimbal Centered</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${repairs.powerBus ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Power Bus Synchronized</span>
              </div>
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${repairs.gyro ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-200' : 'border-slate-800 text-slate-500'}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Navigation Gyro Calibrated</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <NovaAvatar mood={allRepairsDone ? 'celebrate' : 'happy'} size={40} />
            <div className="text-xs text-slate-400 hidden sm:block">
              {allRepairsDone
                ? '"All systems pass! The return mission is ready for its final sequence."'
                : '"Adjust each slider until the feedback signals turn green."'}
            </div>
          </div>

          <button
            disabled={!allRepairsDone}
            onClick={() => {
              sound.playClick();
              onRepairComplete();
            }}
            className="px-6 py-2.5 rounded-xl font-bold font-mono text-xs tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <span>COMMENCE RETURN ASCENT</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
