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
              aria-disabled={isComplete}
              className={`relative flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[48px] sm:min-h-[54px] rounded-2xl transition-all active:scale-95 select-none touch-manipulation ${
                isComplete
                  ? 'bg-slate-100/40 text-slate-300 dark:bg-slate-900/20 dark:text-slate-600 opacity-30 cursor-default shadow-none'
                  : isMatched
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-extrabold'
                  : isNoteMode
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/20'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-900 dark:text-white shadow-xs ring-1 ring-black/[0.04] dark:ring-white/[0.06] cursor-pointer'
              }`}
              aria-label={`填入数字 ${num}，剩余 ${remaining} 个`}
              title={`填入数字 ${num} (剩余 ${remaining} 个)`}
            >
              {/* Digit */}
              <span className={`text-lg sm:text-2xl font-sans font-extrabold tabular-nums tracking-tight leading-none mb-0.5 sm:mb-1 ${
                isMatched ? 'text-white' : ''
              }`}>
                {num}
              </span>

              {/* Remaining count badge / Completed badge */}
              <span className="text-[9px] sm:text-[10px] font-semibold leading-none">
                {isComplete ? (
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                ) : (
                  <span className={isMatched ? 'text-white/80' : remaining <= 2 ? 'text-blue-600 dark:text-sky-400 font-bold' : 'text-slate-400 dark:text-slate-400'}>
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
