import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import {
  Play,
  RotateCcw,
  Calendar,
  BookOpen,
  Trophy,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface ActiveGameSummary {
  difficulty: Difficulty;
  gameMode: GameMode;
  elapsedTime: number;
  filledCount: number;
}

interface HomeScreenProps {
  onStartGame: (difficulty: Difficulty, mode: GameMode, forceReset?: boolean) => void;
  onResumeGame?: () => void;
  hasActiveGame: boolean;
  activeGameSummary?: ActiveGameSummary | null;
  dailyStreak: number;
  isDailyCompletedToday: boolean;
  todayDateStr: string;
  masteredTechniquesCount: number;
  totalTechniquesCount: number;
  soundEnabled: boolean;
  theme: string;
  onToggleSound: () => void;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
  onOpenStats: (tab?: 'stats' | 'history' | 'achievements') => void;
  onOpenTechniques: () => void;
  onOpenHelp: () => void;
}

const DIFFICULTY_MAP: Record<Difficulty, { label: string }> = {
  easy: { label: '简单' },
  medium: { label: '中等' },
  hard: { label: '困难' },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onResumeGame,
  hasActiveGame,
  activeGameSummary,
  dailyStreak,
  isDailyCompletedToday,
  todayDateStr,
  soundEnabled,
  theme,
  onToggleSound,
  onCycleTheme,
  onOpenSettings,
  onOpenStats,
  onOpenTechniques,
  onOpenHelp,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = ['aurora', 'cyberpunk', 'twilight'].includes(theme);

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-8 sm:py-16 flex flex-col justify-between min-h-[90dvh] select-none text-slate-900 dark:text-slate-100 animate-fadeIn">
      {/* 1. 经典报刊纸墨风格顶头 (Newspaper / Editorial Header) */}
      <div className="flex flex-col items-center text-center pt-2 sm:pt-4">
        {/* 极简 3x3 纯墨线条 Logo */}
        <div className="w-12 h-12 rounded-xl border-2 border-slate-900 dark:border-slate-100 grid grid-cols-3 grid-rows-3 p-1 gap-0.5 mb-3">
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white font-sans">
          知数
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-400 font-semibold mt-1">
          ZHISHU SUDOKU · {todayDateStr}
        </p>
      </div>

      {/* 2. 扁平纯粹对局选区 (Flat Direct Play Hub) */}
      <div className="w-full flex flex-col gap-4 my-auto">
        {/* 进行中对局快捷继续 */}
        {hasActiveGame && activeGameSummary && (
          <div className="w-full p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs opacity-80 px-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>检测到进行中对局</span>
                <span>· {DIFFICULTY_MAP[activeGameSummary.difficulty].label}</span>
              </span>
              <span className="font-mono text-[11px]">
                {formatTime(activeGameSummary.elapsedTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResumeGame}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white text-slate-950 dark:bg-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>继续对局</span>
              </button>

              <button
                type="button"
                onClick={() => onStartGame(activeGameSummary.difficulty, activeGameSummary.gameMode, true)}
                className="py-2.5 px-3 rounded-xl bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="重开此局"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重开</span>
              </button>
            </div>
          </div>
        )}

        {/* 经典自由对局 (直觉单行扁平按钮) */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider">
            经典自由对局
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onStartGame(d, 'random', true)}
                className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 font-bold text-sm text-slate-900 dark:text-slate-100 text-center transition-all cursor-pointer active:scale-95"
              >
                {DIFFICULTY_MAP[d].label}
              </button>
            ))}
          </div>
        </div>

        {/* 每日一题 (纯平单行) */}
        <button
          type="button"
          onClick={() => {
            if (hasActiveGame && activeGameSummary?.gameMode === 'daily' && onResumeGame) {
              onResumeGame();
            } else {
              onStartGame('medium', 'daily', isDailyCompletedToday);
            }
          }}
          className="w-full py-3 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>每日一题挑战</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">
            <span>{isDailyCompletedToday ? '已通关' : dailyStreak > 0 ? `连胜 ${dailyStreak} 天` : '今日挑战'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 3. 底部极轻文字链接栏 (Quiet Footnote) */}
      <div className="flex items-center justify-center gap-3 pt-6 text-slate-500 dark:text-slate-400 text-xs">
        <button
          type="button"
          onClick={onOpenTechniques}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="查阅解题技巧百科"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>解题技巧百科</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          type="button"
          onClick={() => onOpenStats('stats')}
          aria-label="查看战绩与排行榜"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="战绩与荣誉"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>战绩</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="打开游戏偏好设置"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="设置"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          aria-label="游戏规则与快捷键帮助"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="帮助"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label="切换音效"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title={soundEnabled ? '音效开启' : '音效静音'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onCycleTheme}
          aria-label="快速切换主题"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="快速切换浅色/深色主题"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>
      </div>
    </div>
  );
};
