import type { GameStats, GameSettings, Difficulty, DifficultyStats, ActiveGameState, GameRecord } from '../types/sudoku';

const STATS_KEY = 'aurora_sudoku_stats_v1';
const SETTINGS_KEY = 'aurora_sudoku_settings_v1';
const ACTIVE_GAME_KEY = 'aurora_sudoku_active_game_v1';
const GAME_HISTORY_KEY = 'aurora_sudoku_game_history_v1';
const MASTERED_TECHS_KEY = 'aurora_sudoku_mastered_techs_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  theme: 'nordic',
  fastInputMode: false,
  highlightSameNumbers: true,
  highlightCross: true,
  highlightConflicts: true,
  realtimeErrorCheck: true,
  autoClearNotes: true,
  autoFillLastRemaining: true,
  soundEnabled: true,
  symbolTheme: 'numbers',
  juniorMode: false,
};

const createInitialDiffStats = (): DifficultyStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
  totalTime: 0,
  currentStreak: 0,
  maxStreak: 0,
});

export const getDefaultStats = (): GameStats => ({
  easy: createInitialDiffStats(),
  medium: createInitialDiffStats(),
  hard: createInitialDiffStats(),
  dailyStreak: 0,
  maxDailyStreak: 0,
  completedDailies: [],
  dailyWinCounts: {},
  achievements: {},
});

export const DEFAULT_STATS: GameStats = Object.freeze(getDefaultStats());

export function loadSettings(): GameSettings {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(data);
    if (typeof parsed !== 'object' || parsed === null) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
}

export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return getDefaultStats();
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') return getDefaultStats();

    const parseDiff = (d: any): DifficultyStats => ({
      ...createInitialDiffStats(),
      ...(d || {}),
      currentStreak: typeof d?.currentStreak === 'number' ? d.currentStreak : 0,
      maxStreak: typeof d?.maxStreak === 'number' ? d.maxStreak : 0,
    });

    return {
      easy: parseDiff(parsed.easy),
      medium: parseDiff(parsed.medium),
      hard: parseDiff(parsed.hard),
      dailyStreak: typeof parsed.dailyStreak === 'number' ? parsed.dailyStreak : 0,
      maxDailyStreak:
        typeof parsed.maxDailyStreak === 'number'
          ? parsed.maxDailyStreak
          : typeof parsed.dailyStreak === 'number'
          ? parsed.dailyStreak
          : 0,
      lastDailyDate: typeof parsed.lastDailyDate === 'string' ? parsed.lastDailyDate : undefined,
      completedDailies: Array.isArray(parsed.completedDailies) ? parsed.completedDailies : [],
      dailyWinCounts:
        parsed.dailyWinCounts && typeof parsed.dailyWinCounts === 'object'
          ? parsed.dailyWinCounts
          : {},
      achievements:
        parsed.achievements && typeof parsed.achievements === 'object'
          ? parsed.achievements
          : {},
    };
  } catch {
    // Must be a fresh, mutable copy: callers mutate the returned object
    // (e.g. `stats.dailyStreak = 1`), which throws on a frozen constant.
    return getDefaultStats();
  }
}

export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats to localStorage:', e);
  }
}

export function getCalendarDaysDiff(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00Z').getTime();
  const d2 = new Date(dateStr2 + 'T00:00:00Z').getTime();
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

export function loadGameRecords(): GameRecord[] {
  try {
    const data = localStorage.getItem(GAME_HISTORY_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGameRecord(record: GameRecord): void {
  try {
    const existing = loadGameRecords();
    const updated = [record, ...existing.filter((r) => r.id !== record.id)].slice(0, 50);
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save game record:', e);
  }
}

export function saveAllGameRecords(records: GameRecord[]): void {
  try {
    localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(records.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save game records:', e);
  }
}

export function loadMasteredTechniques(): string[] {
  try {
    const data = localStorage.getItem(MASTERED_TECHS_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMasteredTechniques(techIds: string[]): void {
  try {
    localStorage.setItem(MASTERED_TECHS_KEY, JSON.stringify(techIds));
  } catch (e) {
    console.warn('Failed to save mastered techniques:', e);
  }
}

export function toggleMasteredTechnique(techId: string): { isMastered: boolean; allMastered: string[] } {
  const current = loadMasteredTechniques();
  const exists = current.includes(techId);
  const updated = exists ? current.filter((id) => id !== techId) : [...current, techId];
  saveMasteredTechniques(updated);
  return { isMastered: !exists, allMastered: updated };
}

export function recordGameStarted(difficulty: Difficulty): void {
  const stats = loadStats();
  if (!stats[difficulty]) {
    stats[difficulty] = createInitialDiffStats();
  }
  stats[difficulty].gamesPlayed += 1;
  // A fresh game ends any previous win streak for that difficulty.
  stats[difficulty].currentStreak = 0;
  saveStats(stats);
}

export function recordGameResult(
  difficulty: Difficulty,
  timeTakenSeconds: number,
  isDaily: boolean,
  dailyDateStr?: string,
  mistakesCount: number = 0,
  hintsUsed: number = 0
): { isNewBest: boolean; updatedStats: GameStats; newRecord: GameRecord } {
  const stats = loadStats();
  if (!stats[difficulty]) {
    stats[difficulty] = createInitialDiffStats();
  }
  const diffStats = stats[difficulty];

  // gamesPlayed is counted when a game starts (see recordGameStarted), so that
  // the win rate is wins / games actually attempted rather than always 100%.
  diffStats.gamesWon += 1;
  diffStats.totalTime += timeTakenSeconds;

  // Streak tracking per difficulty
  diffStats.currentStreak = (diffStats.currentStreak || 0) + 1;
  if (diffStats.currentStreak > (diffStats.maxStreak || 0)) {
    diffStats.maxStreak = diffStats.currentStreak;
  }

  let isNewBest = false;
  if (diffStats.bestTime === null || timeTakenSeconds < diffStats.bestTime) {
    diffStats.bestTime = timeTakenSeconds;
    isNewBest = true;
  }

  // Daily challenge and daily win counts tracking
  if (dailyDateStr) {
    stats.dailyWinCounts[dailyDateStr] = (stats.dailyWinCounts[dailyDateStr] || 0) + 1;
  }

  if (isDaily && dailyDateStr) {
    if (!stats.completedDailies.includes(dailyDateStr)) {
      stats.completedDailies.push(dailyDateStr);

      if (!stats.lastDailyDate) {
        stats.dailyStreak = 1;
      } else {
        const diff = getCalendarDaysDiff(dailyDateStr, stats.lastDailyDate);
        if (diff === 1) {
          stats.dailyStreak += 1;
        } else if (diff > 1) {
          stats.dailyStreak = 1;
        }
      }

      if (stats.dailyStreak > (stats.maxDailyStreak || 0)) {
        stats.maxDailyStreak = stats.dailyStreak;
      }

      if (!stats.lastDailyDate || dailyDateStr > stats.lastDailyDate) {
        stats.lastDailyDate = dailyDateStr;
      }
    }
  }

  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newRecord: GameRecord = {
    id: `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dateFormatted,
    dateStr: dailyDateStr,
    mode: isDaily ? 'daily' : 'random',
    difficulty,
    timeSeconds: timeTakenSeconds,
    mistakesCount,
    hintsUsed,
  };

  saveGameRecord(newRecord);
  saveStats(stats);
  return { isNewBest, updatedStats: stats, newRecord };
}

export function saveActiveGame(state: ActiveGameState): void {
  try {
    localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save active game:', e);
  }
}

export function loadActiveGame(): ActiveGameState | null {
  try {
    const data = localStorage.getItem(ACTIVE_GAME_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') return null;
    // Validate the shape enough that a corrupt save is discarded rather than
    // crashing the render (e.g. a row that is not an array of 9 cells).
    if (!Array.isArray(parsed.board) || parsed.board.length !== 9) return null;
    const boardOk = parsed.board.every(
      (row: unknown) =>
        Array.isArray(row) &&
        row.length === 9 &&
        row.every((cell: unknown) => cell && typeof cell === 'object')
    );
    if (!boardOk) return null;
    if (parsed.difficulty !== 'easy' && parsed.difficulty !== 'medium' && parsed.difficulty !== 'hard') {
      return null;
    }
    if (parsed.gameMode !== 'random' && parsed.gameMode !== 'daily') return null;
    return parsed as ActiveGameState;
  } catch {
    return null;
  }
}

export function clearActiveGame(): void {
  try {
    localStorage.removeItem(ACTIVE_GAME_KEY);
  } catch (e) {
    console.warn('Failed to clear active game:', e);
  }
}

export function clearGameRecords(): void {
  try {
    localStorage.removeItem(GAME_HISTORY_KEY);
  } catch (e) {
    console.warn('Failed to clear game records:', e);
  }
}

export function resetLiveStorageToDefault(): void {
  saveStats(getDefaultStats());
  clearGameRecords();
  saveMasteredTechniques([]);
  clearActiveGame();
}

export function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
