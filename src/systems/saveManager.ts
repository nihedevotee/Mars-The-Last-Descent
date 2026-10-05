export interface GameProgress {
  currentChapter: number; // 0: Main Menu, 1: Prologue, 2: Moon, 3: Mars Crash, 4: Mars Explore, 5: Storm Challenge, 6: Spacecraft Repair, 7: Final Launch, 8: Mission Complete
  unlockedMissions: string[];
  solvedMiniGames: string[];
  quizzesCompleted: string[];
  badges: string[];
  diagnosticsCompleted: string[];
  repairedSubsystems: string[];
  stormDecisionMade: string | null;
}

const STORAGE_KEY = 'beyond_depth_save_v1';

const defaultProgress: GameProgress = {
  currentChapter: 0,
  unlockedMissions: [],
  solvedMiniGames: [],
  quizzesCompleted: [],
  badges: [],
  diagnosticsCompleted: [],
  repairedSubsystems: [],
  stormDecisionMade: null,
};

export const getSavedProgress = (): GameProgress => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultProgress };
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProgress };
  }
};

export const saveProgress = (progress: GameProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
};

export const resetProgress = (): GameProgress => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return { ...defaultProgress };
};
