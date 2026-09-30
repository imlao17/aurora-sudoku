import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import {
  Play,
  Flame,
  BookOpen,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  ChevronRight,
  Sun,
  Moon,
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

const DIFFICULTY_MAP: Record<Difficulty, { label: string; color: string }> = {
  easy: {
    label: '简单',
    color: 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-700',
  },
  medium: {
    label: '中等',
    color: 'text-blue-600 dark:text-sky-400 hover:bg-blue-500/10 hover:text-blue-700',
  },
  hard: {
    label: '困难',
    color: 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 hover:text-rose-700',
  },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onResumeGame,
  hasActiveGame,
  activeGameSummary,
  dailyStreak,
  isDailyCompletedToday,
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
    <div className="w-full max-w-md mx-auto px-4 py-8 sm:py-14 flex flex-col justify-between min-h-[92dvh] select-none text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* 视觉主体一：纯净品牌 Hero (居中呼吸感) */}
      <div className="flex flex-col items-center text-center pt-2 sm:pt-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-lg shadow-blue-500/20 ring-1 ring-white/20 select-none">
          9
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-4">
          极光数独
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium mt-1.5 tracking-wide">
          纯粹 · 专注 · 逻辑推演
        </p>
      </div>

      {/* 视觉主体二：统一对局操作舱 (Action Center) */}
      <div className="w-full bg-white dark:bg-slate-900 shadow-card ring-1 ring-black/[0.04] dark:ring-white/[0.06] rounded-3xl p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 my-auto">
        {/* 进行中对局快捷继续 (若有) */}
        {hasActiveGame && activeGameSummary && (
          <div className="flex flex-col gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-sky-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>检测到进行中对局</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 font-semibold">
                  {DIFFICULTY_MAP[activeGameSummary.difficulty].label}
                </span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                {formatTime(activeGameSummary.elapsedTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onResumeGame}
                className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>继续对局</span>
              </button>

              <button
                onClick={() => onStartGame(activeGameSummary.difficulty, activeGameSummary.gameMode, true)}
                className="py-3 px-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="重开此局"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重开</span>
              </button>
            </div>
          </div>
        )}

        {/* 经典自由对局难度选择 */}
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            经典自由对局
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const meta = DIFFICULTY_MAP[d];
              return (
                <button
                  key={d}
                  onClick={() => onStartGame(d, 'random', true)}
                  className={`py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 font-extrabold text-xs sm:text-sm text-center transition-all cursor-pointer active:scale-95 shadow-xs ${meta.color}`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 每日一题入口 */}
        <button
          onClick={() => {
            if (hasActiveGame && activeGameSummary?.gameMode === 'daily' && onResumeGame) {
              onResumeGame();
            } else {
              onStartGame('medium', 'daily', isDailyCompletedToday);
            }
          }}
          className="w-full py-3 px-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-between font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>每日一题挑战</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-600/80 dark:text-amber-400/80 font-medium">
            <span>{isDailyCompletedToday ? '已通关' : dailyStreak > 0 ? `连胜 ${dailyStreak} 天` : '今日挑战'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 底部轻量功能栏：静默、低调、不抢视觉焦点 */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-xs">
        <button
          onClick={onOpenTechniques}
          className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="查阅解题技巧百科"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>解题技巧百科</span>
        </button>

        <button
          onClick={() => onOpenStats('stats')}
          aria-label="查看战绩与排行榜"
          className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="战绩与荣誉"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>战绩</span>
        </button>

        <button
          onClick={onOpenSettings}
          aria-label="打开游戏偏好设置"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenHelp}
          aria-label="游戏规则与快捷键帮助"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="帮助"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSound}
          aria-label="切换音效"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title={soundEnabled ? '音效开启' : '音效静音'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>

        <button
          onClick={onCycleTheme}
          aria-label="快速切换主题"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="快速切换浅色/深色主题"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </div>
  );
};
