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
    <div className="w-full max-w-xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between text-xs select-none text-slate-600 dark:text-slate-400">
      {/* 左侧：当前难度/模式标识与失误统计 */}
      <div className="flex items-center gap-3">
        <span className="font-bold text-slate-900 dark:text-white">
          {gameMode === 'daily' ? '每日挑战' : currentDiff.label}
        </span>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* 失误统计 */}
        <div
          className={`flex items-center gap-1 font-medium ${
            mistakesCount > 0 ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
          }`}
          title="失误次数"
          aria-label={`当前失误 ${mistakesCount} 次`}
        >
          <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>失误: <strong>{mistakesCount}</strong></span>
        </div>
      </div>

      {/* 右侧：剩余提示与计时器 */}
      <div className="flex items-center gap-3">
        {/* 提示剩余 */}
        <div
          className="flex items-center gap-1 font-medium"
          title={`剩余提示: ${hintsRemaining}次`}
          aria-label={`剩余提示 ${hintsRemaining} 次`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[1.5]" />
          <span>提示: {hintsRemaining}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* 计时器与暂停 */}
        <button
          type="button"
          onClick={onTogglePause}
          aria-label={isPaused ? '游戏已暂停，点击恢复' : `当前用时 ${formatTime(elapsedTime)}，点击暂停`}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white active:scale-95 transition-all font-mono font-bold cursor-pointer touch-manipulation tabular-nums"
          title={isPaused ? '继续游戏' : '暂停计时'}
        >
          {isPaused ? (
            <Play className="w-3.5 h-3.5 text-slate-900 dark:text-white stroke-[1.5]" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 stroke-[1.5]" />
          )}
          <span role="timer" aria-live="off">{formatTime(elapsedTime)}</span>
        </button>
      </div>
    </div>
  );
};
