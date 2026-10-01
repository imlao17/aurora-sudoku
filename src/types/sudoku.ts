export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameMode = 'random' | 'daily';

export interface CellPosition {
  row: number;
  col: number;
}

export interface CellData {
  row: number;
  col: number;
  value: number; // 0 for empty, 1-9 for filled
  solution: number;
  isInitial: boolean;
  notes: number[]; // pencil marks
  isError?: boolean;
}

export interface CellDelta {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: number[];
  newNotes: number[];
}

export interface MoveHistory {
  selectedBefore?: CellPosition | null;
  selectedAfter?: CellPosition | null;
  changes: CellDelta[];
}

export interface AchievementRecord {
  id: string;
  unlockedAt: string | null; // ISO string when unlocked, null if locked
  progress: number;
  maxProgress: number;
}

export interface DifficultyStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number | null; // in seconds
  totalTime: number;
  currentStreak: number;
  maxStreak: number;
}

export interface GameStats {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
  dailyStreak: number;
  maxDailyStreak: number;
  lastDailyDate?: string;
  completedDailies: string[]; // ['2026-09-29', ...]
  dailyWinCounts: Record<string, number>; // { '2026-09-29': 3 }
  achievements: Record<string, AchievementRecord>;
}

export type ThemeType = 'nordic' | 'zen' | 'matcha' | 'aurora' | 'cyberpunk' | 'twilight';

export type BoardSize = 4 | 6 | 9;

export type SymbolTheme = 'numbers' | 'hanzi' | 'animals' | 'fruit';

export interface GameSettings {
  theme: ThemeType;
  fastInputMode: boolean; // Number-first input mode
  highlightSameNumbers: boolean;
  highlightCross: boolean;
  highlightConflicts: boolean;
  realtimeErrorCheck: boolean;
  autoClearNotes: boolean;
  autoFillLastRemaining: boolean; // 最后一个数字自动填充（行列宫仅剩1格或某数字已填满8个时自动补全）
  soundEnabled: boolean;
  symbolTheme?: SymbolTheme;
  juniorMode?: boolean;
}

export interface ActiveGameState {
  difficulty: Difficulty;
  gameMode: GameMode;
  dateStr?: string;
  board: CellData[][];
  elapsedTime: number;
  mistakesCount: number;
  hintsRemaining: number;
  hintsUsed: number;
  isPaused: boolean;
  isCompleted: boolean;
  boardSize?: BoardSize;
  symbolTheme?: SymbolTheme;
}

export interface GameRecord {
  id: string;
  timestamp: number;
  dateFormatted: string;
  dateStr?: string;
  mode: GameMode;
  difficulty: Difficulty;
  timeSeconds: number;
  mistakesCount: number;
  hintsUsed: number;
}

