import type {
  GameStats,
  DifficultyStats,
  GameRecord,
  ActiveGameState,
  GameSettings,
  AchievementRecord,
} from '../types/sudoku';
import type { UserAccountData } from '../types/user';

export interface GuestDataSummary {
  hasData: boolean;
  totalGames: number;
  totalWins: number;
  totalAchievements: number;
  totalMasteredTechs: number;
  totalHistoryRecords: number;
}

/**
 * Evaluates whether local guest session contains meaningful gameplay progress to merge
 */
export function summarizeGuestData(
  stats: GameStats,
  history: GameRecord[],
  masteredTechs: string[]
): GuestDataSummary {
  const totalGames = (stats.easy?.gamesPlayed || 0) + (stats.medium?.gamesPlayed || 0) + (stats.hard?.gamesPlayed || 0);
  const totalWins = (stats.easy?.gamesWon || 0) + (stats.medium?.gamesWon || 0) + (stats.hard?.gamesWon || 0);
  const totalAchievements = Object.values(stats.achievements || {}).filter((a) => a.unlockedAt !== null).length;
  const totalMasteredTechs = (masteredTechs || []).length;
  const totalHistoryRecords = (history || []).length;

  const hasData =
    totalGames > 0 ||
    totalAchievements > 0 ||
    totalMasteredTechs > 0 ||
    totalHistoryRecords > 0 ||
    (stats.completedDailies && stats.completedDailies.length > 0);

  return {
    hasData,
    totalGames,
    totalWins,
    totalAchievements,
    totalMasteredTechs,
    totalHistoryRecords,
  };
}

/**
 * Merges two difficulty stats objects cleanly
 */
export function mergeDifficultyStats(
  base: DifficultyStats,
  incoming: DifficultyStats
): DifficultyStats {
  const gamesPlayed = (base.gamesPlayed || 0) + (incoming.gamesPlayed || 0);
  const gamesWon = (base.gamesWon || 0) + (incoming.gamesWon || 0);
  const totalTime = (base.totalTime || 0) + (incoming.totalTime || 0);

  // Best time: take minimum valid non-zero best time
  let bestTime: number | null = null;
  if (base.bestTime !== null && incoming.bestTime !== null) {
    bestTime = Math.min(base.bestTime, incoming.bestTime);
  } else if (base.bestTime !== null) {
    bestTime = base.bestTime;
  } else if (incoming.bestTime !== null) {
    bestTime = incoming.bestTime;
  }

  const currentStreak = Math.max(base.currentStreak || 0, incoming.currentStreak || 0);
  const maxStreak = Math.max(
    base.maxStreak || 0,
    incoming.maxStreak || 0,
    currentStreak
  );

  return {
    gamesPlayed,
    gamesWon,
    bestTime,
    totalTime,
    currentStreak,
    maxStreak,
  };
}

/**
 * Merges game stats from guest session into account stats
 */
export function mergeGameStats(
  accountStats: GameStats,
  guestStats: GameStats
): GameStats {
  const mergedEasy = mergeDifficultyStats(accountStats.easy, guestStats.easy);
  const mergedMedium = mergeDifficultyStats(accountStats.medium, guestStats.medium);
  const mergedHard = mergeDifficultyStats(accountStats.hard, guestStats.hard);

  // Daily streak: pick the highest current streak and max streak
  const dailyStreak = Math.max(accountStats.dailyStreak || 0, guestStats.dailyStreak || 0);
  const maxDailyStreak = Math.max(
    accountStats.maxDailyStreak || 0,
    guestStats.maxDailyStreak || 0,
    dailyStreak
  );

  // Pick the latest daily date
  let lastDailyDate: string | undefined = accountStats.lastDailyDate;
  if (guestStats.lastDailyDate) {
    if (!lastDailyDate || guestStats.lastDailyDate > lastDailyDate) {
      lastDailyDate = guestStats.lastDailyDate;
    }
  }

  // Deduplicate completed daily challenge dates
  const completedDailiesSet = new Set<string>([
    ...(accountStats.completedDailies || []),
    ...(guestStats.completedDailies || []),
  ]);
  const completedDailies = Array.from(completedDailiesSet).sort();

  // Merge daily win counts
  const dailyWinCounts: Record<string, number> = { ...(accountStats.dailyWinCounts || {}) };
  if (guestStats.dailyWinCounts) {
    for (const [date, count] of Object.entries(guestStats.dailyWinCounts)) {
      dailyWinCounts[date] = (dailyWinCounts[date] || 0) + count;
    }
  }

  // Merge unlocked achievements: retain earlier unlock timestamp & higher progress
  const achievements: Record<string, AchievementRecord> = { ...(accountStats.achievements || {}) };
  if (guestStats.achievements) {
    for (const [achId, guestAch] of Object.entries(guestStats.achievements)) {
      if (!guestAch) continue;
      const baseAch = achievements[achId];
      if (!baseAch) {
        achievements[achId] = { ...guestAch };
      } else {
        let unlockedAt = baseAch.unlockedAt;
        if (guestAch.unlockedAt) {
          if (!unlockedAt || guestAch.unlockedAt < unlockedAt) {
            unlockedAt = guestAch.unlockedAt;
          }
        }
        const progress = Math.max(baseAch.progress || 0, guestAch.progress || 0);
        const maxProgress = Math.max(baseAch.maxProgress || 0, guestAch.maxProgress || 0);
        achievements[achId] = {
          id: achId,
          unlockedAt,
          progress,
          maxProgress,
        };
      }
    }
  }

  return {
    easy: mergedEasy,
    medium: mergedMedium,
    hard: mergedHard,
    dailyStreak,
    maxDailyStreak,
    lastDailyDate,
    completedDailies,
    dailyWinCounts,
    achievements,
  };
}

/**
 * Merges game records without duplicates, keeping latest 50
 */
export function mergeGameRecords(
  accountHistory: GameRecord[],
  guestHistory: GameRecord[],
  maxLimit: number = 50
): GameRecord[] {
  const map = new Map<string, GameRecord>();

  // Add account history
  for (const rec of accountHistory) {
    map.set(rec.id, rec);
  }

  // Merge guest history
  for (const rec of guestHistory) {
    if (!map.has(rec.id)) {
      map.set(rec.id, rec);
    }
  }

  // Sort descending by timestamp
  return Array.from(map.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, maxLimit);
}

/**
 * Merges mastered techniques set union
 */
export function mergeMasteredTechniques(
  accountTechs: string[],
  guestTechs: string[]
): string[] {
  const set = new Set<string>([...accountTechs, ...guestTechs]);
  return Array.from(set);
}

/**
 * Merges an account package with local guest data
 */
export function mergeAccountPackageWithGuest(
  accountPkg: UserAccountData,
  guestData: {
    stats: GameStats;
    history: GameRecord[];
    masteredTechs: string[];
    settings?: GameSettings;
    activeGame?: ActiveGameState | null;
  }
): UserAccountData {
  const mergedStats = mergeGameStats(accountPkg.stats, guestData.stats);
  const mergedHistory = mergeGameRecords(accountPkg.history || [], guestData.history || []);
  const mergedTechs = mergeMasteredTechniques(
    accountPkg.masteredTechs || [],
    guestData.masteredTechs || []
  );

  // Preserve active game: if account has none but guest has an active game, keep guest game
  const activeGame = accountPkg.activeGame || guestData.activeGame || null;

  return {
    ...accountPkg,
    stats: mergedStats,
    history: mergedHistory,
    masteredTechs: mergedTechs,
    activeGame,
  };
}
