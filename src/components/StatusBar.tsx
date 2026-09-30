import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import { formatTime } from '../utils/storage';
import { DIFFICULTY_PRESETS } from '../constants/sudoku';
import { Play, Pause, AlertCircle, Lightbulb } from 'lucide-react';

interface StatusBarProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  elapsedTime: number;
  isPaused: boolean;
  mistakesCount: number;
  hintsRemaining: number;
  onTogglePause: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  difficulty,
  gameMode,
  elapsedTime,
  isPaused,
  mistakesCount,
  hintsRemaining,
  onTogglePause,
}) => {
  const currentDiff = DIFFICULTY_PRESETS[difficulty];

  return (
    <div className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between text-xs select-none">
      {/* Left: Mode / Difficulty badge & Mistakes */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className={`px-2.5 py-1 rounded-xl font-bold tracking-tight text-[11px] sm:text-xs flex items-center gap-1 ${
            gameMode === 'daily'
              ? 'text-amber-800 bg-amber-500/15 dark:text-amber-400 dark:bg-amber-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
          }`}
        >
          {gameMode === 'daily' ? '每日挑战' : currentDiff.label}
        </span>

        {/* Mistakes counter */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors text-[11px] sm:text-xs ${
            mistakesCount > 0
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 font-medium'
          }`}
          title="失误次数"
          aria-label={`当前失误 ${mistakesCount} 次`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>失误: <strong className="font-semibold">{mistakesCount}</strong></span>
        </div>
      </div>

      {/* Right: Timer & Hints badge */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold text-[11px] sm:text-xs"
          title={`剩余提示: ${hintsRemaining}次`}
          aria-label={`剩余提示 ${hintsRemaining} 次`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>提示: {hintsRemaining}</span>
        </div>

        {/* Timer with Pause button */}
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={isPaused ? '游戏已暂停，点击恢复' : `当前用时 ${formatTime(elapsedTime)}，点击暂停`}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-95 transition-all font-mono text-xs sm:text-sm tracking-wider cursor-pointer touch-manipulation font-bold"
          title={isPaused ? '继续游戏' : '暂停计时'}
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          )}
          <span role="timer" aria-live="off">{formatTime(elapsedTime)}</span>
        </button>
      </div>
    </div>
  );
};
