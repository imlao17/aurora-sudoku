import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import { DIFFICULTY_PRESETS } from '../constants/sudoku';
import { Trophy, Settings, RefreshCw, Calendar, Sparkles, Volume2, VolumeX, HelpCircle, Compass, GraduationCap, Home } from 'lucide-react';

interface HeaderProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  dateStr: string;
  isDailyCompleted: boolean;
  soundEnabled: boolean;
  onSelectDifficulty: (diff: Difficulty) => void;
  onSelectMode: (mode: GameMode) => void;
  onNewGame: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenTechniques?: () => void;
  onToggleSound: () => void;
  onStartVisualSolver?: () => void;
  onBackHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  gameMode,
  dateStr,
  isDailyCompleted,
  soundEnabled,
  onSelectDifficulty,
  onSelectMode,
  onNewGame,
  onOpenStats,
  onOpenSettings,
  onOpenHelp,
  onOpenTechniques,
  onToggleSound,
  onStartVisualSolver,
  onBackHome,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto px-2.5 sm:px-4 pt-1.5 sm:pt-3 pb-1 sm:pb-2 flex flex-col gap-1.5 sm:gap-2.5 select-none">
      {/* Top row: Brand & Action Icons */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {onBackHome && (
            <button
              onClick={onBackHome}
              aria-label="返回首页大厅"
              title="暂停并返回首页大厅"
              className="px-2 py-1 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-700"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-sky-400" />
              <span>首页</span>
            </button>
          )}

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base select-none shadow-sm shrink-0">
            9
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 m-0 truncate">
                极光数独
              </h1>
              <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 sm:py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 shrink-0">
                Pro
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 m-0 truncate">
              {gameMode === 'daily' ? `每日一题 · ${dateStr}` : '自由开局模式'}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? '关闭音效' : '开启音效'}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
          </button>

          <button
            onClick={onOpenStats}
            aria-label="查看战绩与排行榜"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="查看排行榜与统计"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="打开游戏偏好设置"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="游戏设置"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onOpenHelp}
            aria-label="查看快捷键与帮助指南"
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
            title="快捷键指南 (?)"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {onOpenTechniques && (
            <button
              onClick={onOpenTechniques}
              aria-label="查看数独解题技巧百科"
              className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-emerald-400 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
              title="解题技巧百科"
            >
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
            </button>
          )}

          {onStartVisualSolver && (
            <button
              onClick={onStartVisualSolver}
              aria-label="进入逐步演算教学模式"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 dark:bg-sky-500/20 dark:hover:bg-sky-500/30 dark:text-sky-300 dark:hover:text-white dark:border-sky-500/40 font-medium text-xs active:scale-95 transition-all cursor-pointer touch-manipulation"
              title="逐步演示推理教学过程"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">逐步演示</span>
            </button>
          )}

          <button
            onClick={onNewGame}
            aria-label="新开一局"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs active:scale-95 transition-all ml-0.5 sm:ml-1 cursor-pointer touch-manipulation shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-xs">新开局</span>
          </button>
        </div>
      </div>

      {/* Mode & Difficulty Selector Row */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-1 sm:p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Mode Switch: Random vs Daily */}
        <div className="flex items-center bg-slate-50 dark:bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-800/60 shrink-0">
          <button
            onClick={() => onSelectMode('random')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer touch-manipulation ${
              gameMode === 'random'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>自由对局</span>
          </button>
          <button
            onClick={() => onSelectMode('daily')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all relative cursor-pointer touch-manipulation ${
              gameMode === 'daily'
                ? 'bg-white text-amber-600 shadow-xs border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>每日一题</span>
            {isDailyCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" title="今日已完成" />
            )}
          </button>
        </div>

        {/* Difficulty Selector */}
        {gameMode === 'random' ? (
          <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 dark:bg-slate-950/80 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-800/60 shrink-0">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer touch-manipulation ${
                  difficulty === d
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {DIFFICULTY_PRESETS[d].label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-[11px] sm:text-xs font-medium text-amber-700 dark:text-amber-300/90 px-2 sm:px-3 py-1 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>今日挑战题目（全服一致）</span>
          </div>
        )}
      </div>
    </header>
  );
};
