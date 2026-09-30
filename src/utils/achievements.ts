import type { GameStats, Difficulty, GameMode } from '../types/sudoku';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: 'Award' | 'Zap' | 'ShieldCheck' | 'Sparkles' | 'Flame' | 'Calendar' | 'Compass' | 'Crown' | 'Trophy' | 'Star';
  category: 'beginner' | 'speed' | 'mastery' | 'daily';
  maxProgress: number;
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'first_win',
    name: '初出茅庐',
    description: '完成任意一局数独对局（开启数独之旅）',
    icon: 'Award',
    category: 'beginner',
    maxProgress: 1,
  },
  {
    id: 'speed_demon',
    name: '极速如风',
    description: '在 180 秒（3 分钟）内飞速通关任意难度',
    icon: 'Zap',
    category: 'speed',
    maxProgress: 180,
  },
  {
    id: 'no_hint_hard',
    name: '纯粹心流',
    description: '在完全不使用提示的情况下征服【困难】难度',
    icon: 'ShieldCheck',
    category: 'mastery',
    maxProgress: 1,
  },
  {
    id: 'flawless',
    name: '完美盘面',
    description: '通关一局数独且全盘失误次数为 0',
    icon: 'Sparkles',
    category: 'mastery',
    maxProgress: 1,
  },
  {
    id: 'daily_trio',
    name: '单日三连通',
    description: '在同一自然日内累计通关 3 盘数独',
    icon: 'Flame',
    category: 'daily',
    maxProgress: 3,
  },
  {
    id: 'weekly_streak',
    name: '持之以恒',
    description: '每日一题连续打卡签到达成 7 天全勤',
    icon: 'Calendar',
    category: 'daily',
    maxProgress: 7,
  },
  {
    id: 'visual_learner',
    name: '逻辑学者',
    description: '体验探索【逐步演示教学模式】，领会高级逻辑之美',
    icon: 'Compass',
    category: 'beginner',
    maxProgress: 1,
  },
  {
    id: 'hard_master',
    name: '硬核宗师',
    description: '在 480 秒（8 分钟）内完成【困难】难度挑战',
    icon: 'Crown',
    category: 'speed',
    maxProgress: 1,
  },
  {
    id: 'all_rounder',
    name: '全能选手',
    description: '在简单、中等、困难三个难度均至少成功通关 1 局',
    icon: 'Trophy',
    category: 'mastery',
    maxProgress: 3,
  },
  {
    id: 'sudoku_fan',
    name: '数独狂热者',
    description: '累计通关总局数达到 10 局',
    icon: 'Star',
    category: 'mastery',
    maxProgress: 10,
  },
];

export interface AchievementContext {
  difficulty?: Difficulty;
  gameMode?: GameMode;
  timeTaken?: number;
  mistakesCount?: number;
  hintsUsed?: number;
  todayStr: string;
  actionType: 'win' | 'explore_tutorial';
}

/**
 * Evaluates all achievements against current stats and gameplay context.
 * Returns newly unlocked achievements and updated stats.
 */
export function evaluateAchievements(
  currentStats: GameStats,
  ctx: AchievementContext
): { newlyUnlocked: AchievementDef[]; updatedStats: GameStats } {
  // Deep clone stats
  const stats: GameStats = JSON.parse(JSON.stringify(currentStats));
  if (!stats.achievements) stats.achievements = {};

  const totalWins =
    (stats.easy?.gamesWon || 0) + (stats.medium?.gamesWon || 0) + (stats.hard?.gamesWon || 0);

  const newlyUnlocked: AchievementDef[] = [];

  function tryUnlock(id: string, progress: number, maxProgress: number, isUnlocked: boolean) {
    const existing = stats.achievements[id] || {
      id,
      unlockedAt: null,
      progress: 0,
      maxProgress,
    };

    existing.progress = Math.min(maxProgress, Math.max(existing.progress, progress));

    if (!existing.unlockedAt && isUnlocked) {
      existing.unlockedAt = new Date().toISOString();
      existing.progress = maxProgress;
      const def = ACHIEVEMENTS_LIST.find((a) => a.id === id);
      if (def) newlyUnlocked.push(def);
    }

    stats.achievements[id] = existing;
  }

  // 1. first_win
  tryUnlock('first_win', totalWins, 1, totalWins >= 1);

  // 2. speed_demon
  if (ctx.actionType === 'win' && ctx.timeTaken !== undefined) {
    const isFast = ctx.timeTaken <= 180;
    tryUnlock('speed_demon', isFast ? 180 : 0, 180, isFast);
  }

  // 3. no_hint_hard
  if (ctx.actionType === 'win') {
    const noHintHard = ctx.difficulty === 'hard' && (ctx.hintsUsed || 0) === 0;
    tryUnlock('no_hint_hard', noHintHard ? 1 : 0, 1, noHintHard);
  }

  // 4. flawless
  if (ctx.actionType === 'win') {
    const zeroMistakes = (ctx.mistakesCount || 0) === 0;
    tryUnlock('flawless', zeroMistakes ? 1 : 0, 1, zeroMistakes);
  }

  // 5. daily_trio
  const todayWins = stats.dailyWinCounts?.[ctx.todayStr] || 0;
  tryUnlock('daily_trio', todayWins, 3, todayWins >= 3);

  // 6. weekly_streak
  const currentStreak = stats.dailyStreak || 0;
  tryUnlock('weekly_streak', currentStreak, 7, currentStreak >= 7);

  // 7. visual_learner
  if (ctx.actionType === 'explore_tutorial') {
    tryUnlock('visual_learner', 1, 1, true);
  } else {
    tryUnlock('visual_learner', 0, 1, false);
  }

  // 8. hard_master
  if (ctx.actionType === 'win' && ctx.difficulty === 'hard' && ctx.timeTaken !== undefined) {
    const hardSpeed = ctx.timeTaken <= 480;
    tryUnlock('hard_master', hardSpeed ? 1 : 0, 1, hardSpeed);
  }

  // 9. all_rounder
  const tiersCompleted =
    ((stats.easy?.gamesWon || 0) > 0 ? 1 : 0) +
    ((stats.medium?.gamesWon || 0) > 0 ? 1 : 0) +
    ((stats.hard?.gamesWon || 0) > 0 ? 1 : 0);
  tryUnlock('all_rounder', tiersCompleted, 3, tiersCompleted >= 3);

  // 10. sudoku_fan
  tryUnlock('sudoku_fan', totalWins, 10, totalWins >= 10);

  return { newlyUnlocked, updatedStats: stats };
}
