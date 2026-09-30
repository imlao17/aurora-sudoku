export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
export const TOTAL_CELLS = 81;
export const MAX_HINTS = 3;

export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const DIFFICULTY_PRESETS = {
  easy: {
    label: '简单',
    targetClues: 38,
    maxAttempts: 45,
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
  },
  medium: {
    label: '中等',
    targetClues: 31,
    maxAttempts: 52,
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/20',
  },
  hard: {
    label: '困难',
    targetClues: 25,
    maxAttempts: 60,
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
  },
} as const;

