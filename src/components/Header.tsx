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
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {onBackHome && (
            <button
              onClick={onBackHome}
              aria-label="返回首页大厅"
              title="暂停并返回首页大厅"
              className="px-2.5 py-1.5 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-sky-400" />
              <span>首页</span>
            </button>
          )}

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm sm:text-base select-none shadow-xs shrink-0">
            9
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 m-0 truncate">
                极光数独
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-400 shrink-0">
                PRO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-400 m-0 truncate">
              {gameMode === 'daily' ? `每日一题 · ${dateStr}` : '自由开局模式'}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? '关闭音效' : '开启音效'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer touch-manipulation"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />}
          </button>

          <button
            onClick={onOpenStats}
            aria-label="查看战绩与排行榜"
            className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer touch-manipulation"
            title="查看排行榜与统计"
          >
            <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="打开游戏偏好设置"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer touch-manipulation"
            title="游戏设置"
          >
            <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          <button
            onClick={onOpenHelp}
            aria-label="查看快捷键与帮助指南"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-sky-400 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer touch-manipulation"
            title="快捷键指南 (?)"
          >
            <HelpCircle className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {onOpenTechniques && (
            <button
              onClick={onOpenTechniques}
              aria-label="查看数独解题技巧百科"
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-800 active:scale-90 transition-all cursor-pointer touch-manipulation"
              title="解题技巧百科"
            >
              <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600 dark:text-indigo-400" />
            </button>
          )}

          {onStartVisualSolver && (
            <button
              onClick={onStartVisualSolver}
              aria-label="进入逐步演算教学模式"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-sky-500/15 dark:hover:bg-sky-500/25 dark:text-sky-300 font-semibold text-xs active:scale-95 transition-all cursor-pointer touch-manipulation"
              title="逐步演示推理教学过程"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">逐步演示</span>
            </button>
          )}

          <button
            onClick={onNewGame}
            aria-label="新开一局"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs active:scale-95 transition-all ml-0.5 cursor-pointer touch-manipulation shadow-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>新对局</span>
          </button>
        </div>
      </div>

      {/* Mode & Difficulty Selector Row: Apple Segmented Pill Track */}
      <div className="flex items-center justify-between gap-1 sm:gap-2 bg-slate-100/80 dark:bg-slate-850 p-1 rounded-2xl">
        {/* Mode Switch: Random vs Daily */}
        <div className="flex items-center p-0.5 shrink-0">
          <button
            onClick={() => onSelectMode('random')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
              gameMode === 'random'
                ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>自由对局</span>
          </button>
          <button
            onClick={() => onSelectMode('daily')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all relative cursor-pointer touch-manipulation ${
              gameMode === 'daily'
                ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-700 dark:text-amber-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
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
          <div className="flex items-center gap-1 p-0.5 shrink-0">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                  difficulty === d
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {DIFFICULTY_PRESETS[d].label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400 px-3 py-1 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>今日挑战题目（全服一致）</span>
          </div>
        )}
      </div>
    </header>
  );
};
