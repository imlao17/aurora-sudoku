import React, { memo } from 'react';
import { Check } from 'lucide-react';
import type { BoardSize, SymbolTheme } from '../types/sudoku';
import { getSymbolDisplay, getRubyPinyin } from '../utils/multiSizeSudoku';

interface NumberPadProps {
  numberCounts: Record<number, number>; // How many of each valid number (1-N) is on the board
  selectedNumber: number; // The number in current selected cell (for highlighting pad)
  isNoteMode: boolean;
  boardSize?: BoardSize;
  symbolTheme?: SymbolTheme;
  showPinyinRuby?: boolean;
  onNumberClick: (num: number) => void;
}

export const NumberPad: React.FC<NumberPadProps> = memo(({
  numberCounts,
  selectedNumber,
  isNoteMode,
  boardSize = 9,
  symbolTheme = 'numbers',
  showPinyinRuby = true,
  onNumberClick,
}) => {
  const size = boardSize;
  const digits = Array.from({ length: size }, (_, i) => i + 1);

  const gridColsClass =
    size === 4
      ? 'grid-cols-4 max-w-sm'
      : size === 6
      ? 'grid-cols-6 max-w-md'
      : 'grid-cols-9 max-w-xl';

  const btnHeightClass =
    size === 4
      ? 'py-3.5 sm:py-5 min-h-[72px] sm:min-h-[86px]'
      : size === 6
      ? 'py-3 sm:py-4 min-h-[60px] sm:min-h-[72px]'
      : 'py-2 sm:py-3 min-h-[48px] sm:min-h-[56px]';

  const fontClass =
    size === 4
      ? 'text-3xl sm:text-4xl'
      : size === 6
      ? 'text-2xl sm:text-3xl'
      : 'text-xl sm:text-2xl';

  const padRubySizeClass =
    size === 4
      ? 'text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300 leading-none mb-1'
      : size === 6
      ? 'text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 leading-none mb-0.5'
      : 'text-[8px] sm:text-[9px] font-medium text-slate-400 dark:text-slate-500 leading-none mb-0.5';

  const countBadgeSize =
    size === 4
      ? 'text-xs font-bold'
      : size === 6
      ? 'text-[11px] font-semibold'
      : 'text-[10px] font-semibold';

  const gridColsInner =
    size === 4
      ? 'grid-cols-4'
      : size === 6
      ? 'grid-cols-6'
      : 'grid-cols-9';

  return (
    <div className={`w-full ${gridColsClass} mx-auto px-1.5 sm:px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] sm:pb-4 select-none`}>
      <div className={`grid ${gridColsInner} gap-1.5 sm:gap-2`}>
        {digits.map((num) => {
          const count = numberCounts[num] || 0;
          const isComplete = count >= size;
          const remaining = Math.max(0, size - count);
          const isMatched = selectedNumber === num;
          const symbol = getSymbolDisplay(num, symbolTheme, size);
          const rubyPinyin =
            symbolTheme === 'hanzi' && showPinyinRuby !== false
              ? getRubyPinyin(num, 'hanzi', size)
              : null;

          return (
            <button
              key={num}
              type="button"
              onClick={() => onNumberClick(num)}
              aria-disabled={isComplete}
              className={`relative flex flex-col items-center justify-center ${btnHeightClass} rounded-2xl border transition-all active:scale-95 touch-manipulation cursor-pointer ${
                isComplete
                  ? 'border-slate-100 dark:border-slate-900 bg-slate-50/40 text-slate-300 dark:bg-slate-900/20 dark:text-slate-700 opacity-25 cursor-default'
                  : isMatched
                  ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950 font-black shadow-xs'
                  : isNoteMode
                  ? 'border-slate-400 dark:border-slate-600 bg-slate-100/70 dark:bg-slate-800/60 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-white shadow-2xs'
              }`}
              aria-label={
                symbolTheme === 'numbers'
                  ? `填入数字 ${symbol}，剩余 ${remaining} 个`
                  : symbolTheme === 'pinyin'
                  ? `填入拼音 ${symbol}，剩余 ${remaining} 个`
                  : `填入 ${symbol}${rubyPinyin ? ` (${rubyPinyin})` : ''}，剩余 ${remaining} 个`
              }
              title={
                symbolTheme === 'numbers'
                  ? `填入数字 ${symbol} (剩余 ${remaining} 个)`
                  : symbolTheme === 'pinyin'
                  ? `填入拼音 ${symbol} (剩余 ${remaining} 个)`
                  : `填入 ${symbol}${rubyPinyin ? ` (${rubyPinyin})` : ''} (剩余 ${remaining} 个)`
              }
            >
              {/* Symbol / Digit */}
              {rubyPinyin ? (
                <div className="flex flex-col items-center justify-center leading-none mb-0.5">
                  <span className={`${padRubySizeClass} font-sans select-none`}>
                    {rubyPinyin}
                  </span>
                  <span className={`${fontClass} font-bold tracking-tight leading-none`}>
                    {symbol}
                  </span>
                </div>
              ) : (
                <span className={`${fontClass} font-bold tabular-nums tracking-tight leading-none mb-0.5`}>
                  {symbol}
                </span>
              )}

              {/* Remaining count badge / Completed badge */}
              <span className={`${countBadgeSize} leading-none`}>
                {isComplete ? (
                  <Check className="w-3 h-3 text-slate-500 dark:text-slate-400 stroke-[2.5]" />
                ) : (
                  <span className={isMatched ? 'text-white/70 dark:text-black/70' : 'text-slate-400'}>
                    {remaining}
                  </span>
                )}
              </span>

              {/* Tiny note indicator dot if in note mode */}
              {isNoteMode && !isComplete && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
