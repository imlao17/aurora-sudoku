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
    <div className="w-full max-w-xl mx-auto px-1.5 sm:px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:pb-4 select-none">
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
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
              aria-disabled={isComplete}
              className={`relative flex flex-col items-center justify-center py-2 sm:py-3 min-h-[48px] sm:min-h-[56px] rounded-xl border transition-all active:scale-95 touch-manipulation cursor-pointer ${
                isComplete
                  ? 'border-slate-100 dark:border-slate-900 bg-slate-50/40 text-slate-300 dark:bg-slate-900/20 dark:text-slate-700 opacity-25 cursor-default'
                  : isMatched
                  ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950 font-black'
                  : isNoteMode
                  ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-white'
              }`}
              aria-label={`填入数字 ${num}，剩余 ${remaining} 个`}
              title={`填入数字 ${num} (剩余 ${remaining} 个)`}
            >
              {/* Digit */}
              <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight leading-none mb-0.5">
                {num}
              </span>

              {/* Remaining count badge / Completed badge */}
              <span className="text-[10px] font-semibold leading-none">
                {isComplete ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                ) : (
                  <span className={isMatched ? 'text-white/70 dark:text-black/70' : 'text-slate-400'}>
                    {remaining}
                  </span>
                )}
              </span>

              {/* Tiny note indicator dot if in note mode */}
              {isNoteMode && !isComplete && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
