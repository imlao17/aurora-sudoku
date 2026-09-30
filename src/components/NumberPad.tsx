import React, { memo } from 'react';
import { Check } from 'lucide-react';
import { DIGITS } from '../constants/sudoku';

interface NumberPadProps {
  numberCounts: Record<number, number>; // How many of each valid number (1-9) is on the board
  selectedNumber: number; // The number in current selected cell (for highlighting pad)
  isNoteMode: boolean;
  onNumberClick: (num: number) => void;
}

export const NumberPad: React.FC<NumberPadProps> = memo(({
  numberCounts,
  selectedNumber,
  isNoteMode,
  onNumberClick,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-1.5 sm:px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:pb-4">
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {DIGITS.map((num) => {
          const count = numberCounts[num] || 0;
          const isComplete = count >= 9;
          const remaining = Math.max(0, 9 - count);
          const isMatched = selectedNumber === num;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onNumberClick(num)}
              className={`relative flex flex-col items-center justify-center py-1.5 sm:py-3 min-h-[46px] sm:min-h-[52px] rounded-xl border transition-all active:scale-95 select-none touch-manipulation cursor-pointer ${
                isComplete
                  ? 'bg-slate-100/60 border-slate-200 text-slate-400 opacity-40 cursor-default dark:bg-slate-950/40 dark:border-slate-900 dark:text-slate-500'
                  : isMatched
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-600 font-bold dark:bg-sky-500/20 dark:border-sky-400 dark:text-sky-300'
                  : isNoteMode
                  ? 'bg-amber-50/60 border-amber-200 text-amber-700 hover:bg-amber-50 dark:bg-slate-900 dark:border-slate-800 dark:text-amber-300 dark:hover:bg-slate-850'
                  : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-850 shadow-xs'
              }`}
              aria-label={`填入数字 ${num}，剩余 ${remaining} 个`}
              title={`填入数字 ${num} (剩余 ${remaining} 个)`}
            >
              {/* Digit */}
              <span className="text-base sm:text-2xl font-sans font-bold tracking-tight leading-none mb-0.5 sm:mb-1">
                {num}
              </span>

              {/* Remaining count badge / Completed badge */}
              <span className="text-[9px] sm:text-[11px] font-medium leading-none">
                {isComplete ? (
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                ) : (
                  <span className={remaining <= 2 ? 'text-blue-600 dark:text-sky-400 font-bold bg-blue-50 dark:bg-sky-500/10 px-1 py-0.2 rounded-full' : 'text-slate-500 dark:text-slate-400'}>
                    {remaining}
                  </span>
                )}
              </span>

              {/* Tiny note indicator dot if in note mode */}
              {isNoteMode && !isComplete && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
