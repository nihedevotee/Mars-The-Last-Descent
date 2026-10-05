import React, { useState, useEffect } from 'react';
import { sound } from './systems/audio';
import { getSavedProgress, saveProgress, GameProgress } from './systems/saveManager';
import { MISSIONS_DATA, MissionDiscovery } from './data/missions';
import { MainMenu } from './components/MainMenu';
import { PrologueScene } from './components/PrologueScene';
import { GameCanvas, InteractiveEntity } from './components/GameCanvas';
import { NovaDialogue } from './components/NovaDialogue';
import { DiscoveryModal } from './components/DiscoveryModal';
import { QuizModal } from './components/QuizModal';
import { MarsCrashScene } from './components/MarsCrashScene';
import { SojournerRoverPuzzle } from './components/MiniGames/SojournerRoverPuzzle';
import { OpportunityWaterPuzzle } from './components/MiniGames/OpportunityWaterPuzzle';
import { InSightSeismicPuzzle } from './components/MiniGames/InSightSeismicPuzzle';
import { MarsWeatherChallenge } from './components/MarsWeatherChallenge';
import { SpacecraftRepairScene } from './components/SpacecraftRepairScene';
import { LaunchCinematic } from './components/LaunchCinematic';
import { MissionArchiveModal } from './components/MissionArchiveModal';
import { SettingsModal } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { Compass, Volume2, VolumeX, Menu, Award, ArrowRight } from 'lucide-react';

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(getSavedProgress());
  
  // Active modals
  const [activeDiscovery, setActiveDiscovery] = useState<MissionDiscovery | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<MissionDiscovery | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // In-game dialogue overlay state
  const [novaDialogue, setNovaDialogue] = useState<{
    text: string;
    mood?: 'idle' | 'happy' | 'curious' | 'warning' | 'scanning' | 'celebrate';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  // Sync progress changes to localStorage
  const updateProgress = (updater: (prev: GameProgress) => GameProgress) => {
    setProgress((prev) => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  };

  // Sound toggle
  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  // Switch chapter
  const goToChapter = (chapter: number) => {
    updateProgress((prev) => ({ ...prev, currentChapter: chapter }));
    setNovaDialogue(null);
  };

  // Moon setup
  useEffect(() => {
    if (progress.currentChapter === 2) {
      sound.startAmbience('moon');
      // Introductory dialogue
      const timer = setTimeout(() => {
        setNovaDialogue({
          text: "Welcome to the Moon, Explorer! Gravity here is only 1/6th of Earth's (1.62 m/s²). Try moving and jumping. When you find historical instruments, press [E] or tap SCAN to deploy my sensor array!",
          mood: 'happy',
          actionLabel: 'Explore Lunar Surface'
        });
      }, 600);
      return () => clearTimeout(timer);
    } else if (progress.currentChapter === 4) {
      sound.startAmbience('mars');
      // Mars exploration dialogue
      const timer = setTimeout(() => {
        setNovaDialogue({
          text: "We are walking on the red soil of Mars, Explorer. Somewhere across these dunes lie the forgotten robotic explorers that taught humanity how to survive here. Let's find them!",
          mood: 'curious',
          actionLabel: 'Scan Horizon'
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress.currentChapter]);

  // Handle interaction on canvas
  const handleCanvasInteraction = (entityId: string) => {
    if (MISSIONS_DATA[entityId]) {
      setActiveDiscovery(MISSIONS_DATA[entityId]);
    } else if (entityId === 'crashed_ship') {
      // Return to diagnostics or repair
      if (progress.unlockedMissions.filter(m => !['apollo_lrrr', 'apollo_lrv', 'surveyor_3'].includes(m)).length >= 3) {
        goToChapter(6); // Spacecraft repair
      } else {
        setNovaDialogue({
          text: "The spacecraft ascent thrusters are still inoperable. We need engineering principles from the 3 historic Mars missions before we can recalibrate the systems!",
          mood: 'warning'
        });
      }
    }
  };

  // Handle completing a discovery
  const handleDiscoveryDone = (missionId: string) => {
    const discovery = MISSIONS_DATA[missionId];
    if (!discovery) return;

    updateProgress((prev) => ({
      ...prev,
      unlockedMissions: Array.from(new Set([...prev.unlockedMissions, missionId])),
      badges: Array.from(new Set([...prev.badges, discovery.badge]))
    }));

    setActiveDiscovery(null);

    // If moon discovery, launch quiz
    if (['apollo_lrrr', 'apollo_lrv', 'surveyor_3'].includes(missionId)) {
      setActiveQuiz(discovery);
    } else if (missionId === 'sojourner') {
      setActiveMiniGame('sojourner');
    } else if (missionId === 'opportunity') {
      setActiveMiniGame('opportunity');
    } else if (missionId === 'insight') {
      setActiveMiniGame('insight');
    }
  };

  // Handle quiz success
  const handleQuizSuccess = (missionId: string) => {
    const nextQuizzes = Array.from(new Set([...progress.quizzesCompleted, missionId]));
    updateProgress((prev) => ({
      ...prev,
      quizzesCompleted: nextQuizzes
    }));
    setActiveQuiz(null);

    const moonMissions = ['apollo_lrrr', 'apollo_lrv', 'surveyor_3'];
    const allMoonDone = moonMissions.every((id) => nextQuizzes.includes(id));

    if (allMoonDone) {
      setNovaDialogue({
        text: "Outstanding work, Explorer! All 3 Lunar Instruments are analyzed and verified. Our spacecraft systems are configured for the interplanetary transfer burn to Mars!",
        mood: 'celebrate',
        actionLabel: 'Initiate Mars Descent Burn →',
        onAction: () => goToChapter(3) // Go to Mars Crash
      });
    } else {
      setNovaDialogue({
        text: `Lunar survey progress updated (${nextQuizzes.length}/3)! Keep exploring the Moon's surface to find remaining historical NASA instruments.`,
        mood: 'happy'
      });
    }
  };

  // Handle mini-game victory
  const handleMiniGameSuccess = (gameId: string) => {
    updateProgress((prev) => {
      const nextGames = Array.from(new Set([...prev.solvedMiniGames, gameId]));
      return { ...prev, solvedMiniGames: nextGames };
    });
    setActiveMiniGame(null);

    // Check if all 3 Mars missions are discovered and solved!
    const marsMissions = ['sojourner', 'opportunity', 'insight'];
    const marsSolved = marsMissions.every((m) =>
      progress.solvedMiniGames.includes(m) || m === gameId
    );

    if (marsSolved) {
      setNovaDialogue({
        text: "ALERT! A massive thermal convection dust storm is sweeping across the Martian horizon! We must make an urgent tactical routing decision!",
        mood: 'warning',
        actionLabel: 'Assess Weather Crisis →',
        onAction: () => goToChapter(5) // Weather challenge
      });
    } else {
      setNovaDialogue({
        text: "Scientific data logged and analyzed! Check your Mission Archive or continue scanning the dunes for remaining historical machines.",
        mood: 'happy'
      });
    }
  };

  // Chapter 1: Moon entities
  const moonEntities: InteractiveEntity[] = [
    {
      id: 'apollo_lrrr',
      name: 'Laser Retroreflector (Apollo 11)',
      x: 650,
      y: 420,
      width: 60,
      height: 40,
      type: 'station',
      discovered: progress.unlockedMissions.includes('apollo_lrrr'),
      label: 'Apollo 11 ALSEP'
    },
    {
      id: 'apollo_lrv',
      name: 'Lunar Roving Vehicle (Apollo 17)',
      x: 1350,
      y: 410,
      width: 90,
      height: 45,
      type: 'rover',
      discovered: progress.unlockedMissions.includes('apollo_lrv'),
      label: 'Apollo 17 LRV'
    },
    {
      id: 'surveyor_3',
      name: 'Surveyor 3 Lander (1967)',
      x: 2050,
      y: 410,
      width: 100,
      height: 45,
      type: 'lander',
      discovered: progress.unlockedMissions.includes('surveyor_3'),
      label: 'Surveyor 3 Site'
    }
  ];

  // Chapter 3: Mars exploration entities
  const marsEntities: InteractiveEntity[] = [
    {
      id: 'crashed_ship',
      name: 'Crashed Exploration Lander',
      x: 200,
      y: 390,
      width: 120,
      height: 50,
      type: 'ship',
      discovered: true,
      label: 'Lander Wreckage'
    },
    {
      id: 'sojourner',
      name: 'Sojourner Microrover (1997)',
      x: 950,
      y: 420,
      width: 90,
      height: 40,
      type: 'rover',
      discovered: progress.unlockedMissions.includes('sojourner'),
      label: 'Pathfinder Site'
    },
    {
      id: 'opportunity',
      name: 'Opportunity Rover (2004)',
      x: 1850,
      y: 410,
      width: 90,
      height: 45,
      type: 'rover',
      discovered: progress.unlockedMissions.includes('opportunity'),
      label: 'Meridiani Outcrop'
    },
    {
      id: 'insight',
      name: 'InSight Lander & SEIS Dome (2018)',
      x: 2750,
      y: 410,
      width: 110,
      height: 45,
      type: 'lander',
      discovered: progress.unlockedMissions.includes('insight'),
      label: 'Elysium Planitia SEIS'
    }
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#03060d] text-slate-100 flex flex-col font-sans select-none">
      
      {/* CHAPTER 0: MAIN MENU */}
      {progress.currentChapter === 0 && (
        <MainMenu
          progress={progress}
          onStartNewMission={() => goToChapter(1)}
          onContinueMission={() => {
            const ch = progress.currentChapter === 0 ? 1 : progress.currentChapter;
            goToChapter(ch);
          }}
          onOpenArchive={() => setShowArchive(true)}
          onOpenKnowledge={() => setShowArchive(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCredits={() => setShowCredits(true)}
        />
      )}

      {/* CHAPTER 1: PROLOGUE — THE DEPTH OF EARTH */}
      {progress.currentChapter === 1 && (
        <PrologueScene onComplete={() => goToChapter(2)} />
      )}

      {/* CHAPTER 2: ECHOES OF THE MOON (SURFACE EXPLORATION) */}
      {progress.currentChapter === 2 && (
        <div className="relative w-full h-full flex flex-col">
          {/* Top HUD */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 pointer-events-auto">
              <button
                onClick={() => goToChapter(0)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Main Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="text-xs font-mono">
                <span className="text-cyan-400 font-semibold">CHAPTER 1: THE MOON</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-slate-300">Gravity: 1.62 m/s²</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-slate-400">
                  Discoveries: {progress.unlockedMissions.filter(m => ['apollo_lrrr', 'apollo_lrv', 'surveyor_3'].includes(m)).length} / 3
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => setShowArchive(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* Interactive Game Canvas */}
          <div className="flex-1 w-full h-full">
            <GameCanvas
              environment="moon"
              entities={moonEntities}
              onInteract={handleCanvasInteraction}
            />
          </div>

          {/* NOVA In-Game Dialogue Floating Box */}
          {novaDialogue && (
            <div className="absolute bottom-20 left-4 right-4 max-w-xl mx-auto z-30">
              <NovaDialogue
                text={novaDialogue.text}
                mood={novaDialogue.mood || 'idle'}
                actionLabel={novaDialogue.actionLabel}
                onAction={novaDialogue.onAction}
                onDismiss={() => setNovaDialogue(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* CHAPTER 3: THE CRASH & MALFUNCTION */}
      {progress.currentChapter === 3 && (
        <MarsCrashScene onDiagnosticComplete={() => goToChapter(4)} />
      )}

      {/* CHAPTER 4: THE FORGOTTEN MACHINES (MARS EXPLORATION) */}
      {progress.currentChapter === 4 && (
        <div className="relative w-full h-full flex flex-col">
          {/* Top HUD */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 pointer-events-auto">
              <button
                onClick={() => goToChapter(0)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Main Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="text-xs font-mono">
                <span className="text-orange-400 font-semibold">CHAPTER 3: MARS EXPLORATION</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-slate-300">Gravity: 3.72 m/s²</span>
                <span className="text-slate-500 mx-2">·</span>
                <span className="text-slate-400">
                  Missions: {progress.unlockedMissions.filter(m => m !== 'apollo_lrrr').length} / 3
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              {progress.solvedMiniGames.length >= 3 && (
                <button
                  onClick={() => goToChapter(5)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-lg animate-pulse"
                >
                  <span>Weather Warning</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setShowArchive(true)}
                className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Archive</span>
              </button>
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* Interactive Game Canvas */}
          <div className="flex-1 w-full h-full">
            <GameCanvas
              environment="mars"
              entities={marsEntities}
              onInteract={handleCanvasInteraction}
              stormIntensity={0.15}
            />
          </div>

          {/* NOVA In-Game Dialogue Floating Box */}
          {novaDialogue && (
            <div className="absolute bottom-20 left-4 right-4 max-w-xl mx-auto z-30">
              <NovaDialogue
                text={novaDialogue.text}
                mood={novaDialogue.mood || 'idle'}
                actionLabel={novaDialogue.actionLabel}
                onAction={novaDialogue.onAction}
                onDismiss={() => setNovaDialogue(null)}
              />
            </div>
          )}
        </div>
      )}

      {/* CHAPTER 5: THE WRATH OF MARS (WEATHER CHALLENGE) */}
      {progress.currentChapter === 5 && (
        <MarsWeatherChallenge
          onChallengeResolved={(decision) => {
            updateProgress((prev) => ({ ...prev, stormDecisionMade: decision }));
            goToChapter(6); // Spacecraft repair
          }}
        />
      )}

      {/* CHAPTER 6: SPACECRAFT REPAIR */}
      {progress.currentChapter === 6 && (
        <SpacecraftRepairScene onRepairComplete={() => goToChapter(7)} />
      )}

      {/* CHAPTER 7: LAUNCH CINEMATIC & MISSION COMPLETE */}
      {progress.currentChapter === 7 && (
        <LaunchCinematic
          progress={progress}
          onReturnToMenu={() => goToChapter(0)}
          onRestartCampaign={() => {
            updateProgress(() => ({
              currentChapter: 1,
              unlockedMissions: [],
              solvedMiniGames: [],
              quizzesCompleted: [],
              badges: [],
              diagnosticsCompleted: [],
              repairedSubsystems: [],
              stormDecisionMade: null
            }));
          }}
        />
      )}

      {/* DISCOVERY MODAL (3 Sections: MACHINE, SCIENCE, WHY IT MATTERS) */}
      {activeDiscovery && (
        <DiscoveryModal
          discovery={activeDiscovery}
          onClose={() => handleDiscoveryDone(activeDiscovery.id)}
          onStartActivity={() => handleDiscoveryDone(activeDiscovery.id)}
          activityLabel={
            activeDiscovery.id === 'apollo_lrrr'
              ? 'Begin Knowledge Quiz'
              : 'Launch Engineering Simulator'
          }
        />
      )}

      {/* INTERACTIVE QUIZ MODAL (Moon Discovery) */}
      {activeQuiz && (
        <QuizModal
          discovery={activeQuiz}
          onSuccess={() => handleQuizSuccess(activeQuiz.id)}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* MINI-GAME 1: SOJOURNER ROVER ROUTING */}
      {activeMiniGame === 'sojourner' && (
        <SojournerRoverPuzzle
          onSuccess={() => handleMiniGameSuccess('sojourner')}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* MINI-GAME 2: OPPORTUNITY PALEOWATER EVIDENCE */}
      {activeMiniGame === 'opportunity' && (
        <OpportunityWaterPuzzle
          onSuccess={() => handleMiniGameSuccess('opportunity')}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* MINI-GAME 3: INSIGHT SEISMOGRAM FILTER */}
      {activeMiniGame === 'insight' && (
        <InSightSeismicPuzzle
          onSuccess={() => handleMiniGameSuccess('insight')}
          onClose={() => setActiveMiniGame(null)}
        />
      )}

      {/* MISSION ARCHIVE & KNOWLEDGE BASE */}
      {showArchive && (
        <MissionArchiveModal
          unlockedMissionIds={progress.unlockedMissions}
          onClose={() => setShowArchive(false)}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onResetSave={() => {
            setProgress(getSavedProgress());
            goToChapter(0);
          }}
        />
      )}

      {/* CREDITS & NASA SOURCES MODAL */}
      {showCredits && (
        <CreditsModal onClose={() => setShowCredits(false)} />
      )}

    </div>
  );
}
