import React, { memo } from 'react';
import type { CellData, BoardSize, SymbolTheme } from '../types/sudoku';
import { getSymbolDisplay, getRubyPinyin } from '../utils/multiSizeSudoku';

interface CellProps {
  cell: CellData;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  /** Digit the player has selected, so only that pencil mark is highlighted. */
  highlightDigit?: number | null;
  isConflict: boolean;
  showError: boolean;
  isTarget?: boolean;
  isCause?: boolean;
  isScope?: boolean;
  isHouseCompleted?: boolean;
  customCandidates?: number[];
  customDisplayValue?: number;
  boardSize?: BoardSize;
  symbolTheme?: SymbolTheme;
  showPinyinRuby?: boolean;
  onClick: (row: number, col: number) => void;
}

export const Cell: React.FC<CellProps> = memo(({
  cell,
  isSelected,
  isRelated,
  isSameNumber,
  highlightDigit = null,
  isConflict,
  showError,
  isTarget = false,
  isCause = false,
  isScope = false,
  isHouseCompleted = false,
  customCandidates,
  customDisplayValue,
  boardSize = 9,
  symbolTheme = 'numbers',
  showPinyinRuby = true,
  onClick,
}) => {
  const { row, col, isInitial, notes } = cell;
  const value = customDisplayValue !== undefined ? customDisplayValue : cell.value;
  const displayNotes = customCandidates !== undefined ? customCandidates : notes;

  // Dynamic box boundary styling depending on boardSize
  let isBoxRight = false;
  let isBoxBottom = false;
  const isLastCol = col === boardSize - 1;
  const isLastRow = row === boardSize - 1;

  if (boardSize === 4) {
    isBoxRight = col === 1;
    isBoxBottom = row === 1;
  } else if (boardSize === 6) {
    isBoxRight = col === 2;
    isBoxBottom = row === 1 || row === 3;
  } else {
    isBoxRight = col === 2 || col === 5;
    isBoxBottom = row === 2 || row === 5;
  }

  const borderRight = isBoxRight
    ? 'border-r-2 sm:border-r-[2.5px] border-r-slate-900 dark:border-r-slate-100'
    : isLastCol
    ? ''
    : 'border-r border-r-slate-200 dark:border-r-slate-800';

  const borderBottom = isBoxBottom
    ? 'border-b-2 sm:border-b-[2.5px] border-b-slate-900 dark:border-b-slate-100'
    : isLastRow
    ? ''
    : 'border-b border-b-slate-200 dark:border-b-slate-800';

  // Determine cell background styling based on priority
  let bgClass = 'bg-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30';

  if (isHouseCompleted) {
    bgClass = 'bg-blue-100/90 animate-house-wave z-20 dark:bg-blue-900/50';
  } else if (isTarget) {
    bgClass = 'bg-amber-100/90 ring-2 ring-amber-500 animate-pulse z-20 dark:bg-amber-500/25 dark:ring-amber-400';
  } else if (isCause) {
    bgClass = 'bg-sky-100/80 ring-1 ring-sky-400 z-10 dark:bg-sky-500/20 dark:ring-sky-400';
  } else if (isSelected) {
    bgClass = 'bg-blue-100/90 dark:bg-blue-950/70 z-10';
  } else if (isConflict) {
    bgClass = 'bg-rose-100/90 text-rose-700 animate-shake z-10 dark:bg-rose-950/70 dark:text-rose-300';
  } else if (isSameNumber && value !== 0) {
    bgClass = 'bg-blue-50/90 dark:bg-blue-900/25';
  } else if (isScope) {
    bgClass = 'bg-slate-100/70 dark:bg-slate-800/60';
  } else if (isRelated) {
    bgClass = 'bg-slate-50/80 dark:bg-slate-850/40';
  }

  // Determine text color and styling (flat, crisp)
  let textColorClass = '';
  if (value !== 0) {
    if (isHouseCompleted) {
      textColorClass = 'text-amber-600 font-extrabold scale-105 dark:text-amber-300';
    } else if (isTarget) {
      textColorClass = 'text-amber-600 font-extrabold scale-105 dark:text-amber-400';
    } else if (isCause) {
      textColorClass = 'text-sky-600 font-bold dark:text-sky-300';
    } else if (showError && cell.isError) {
      textColorClass = 'text-rose-600 font-bold dark:text-rose-500';
    } else if (isInitial) {
      textColorClass = 'text-slate-950 font-black dark:text-white';
    } else {
      textColorClass = 'text-blue-700 font-bold dark:text-sky-400';
    }
  }

  const displaySymbol = getSymbolDisplay(value, symbolTheme, boardSize);
  const rubyPinyin =
    (symbolTheme === 'hanzi' || symbolTheme === 'animals') && showPinyinRuby !== false
      ? getRubyPinyin(value, symbolTheme, boardSize)
      : null;

  // Dynamic font sizing based on boardSize and symbolTheme
  let fontSizeClass = 'text-xl sm:text-2xl md:text-3xl';
  if (symbolTheme === 'pinyin') {
    if (boardSize === 4) {
      fontSizeClass = 'text-4xl sm:text-5xl md:text-6xl font-black';
    } else if (boardSize === 6) {
      fontSizeClass = 'text-3xl sm:text-4xl md:text-5xl font-black';
    } else {
      fontSizeClass = 'text-2xl sm:text-3xl md:text-4xl font-bold';
    }
  } else if (boardSize === 4) {
    fontSizeClass = rubyPinyin ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-4xl sm:text-5xl md:text-6xl';
  } else if (boardSize === 6) {
    fontSizeClass = rubyPinyin ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl';
  }

  // Dynamic ruby pinyin sizing based on boardSize
  const rubySizeClass =
    boardSize === 4
      ? 'text-xs sm:text-sm md:text-base font-extrabold text-slate-700 dark:text-slate-200 tracking-wider mb-1'
      : boardSize === 6
      ? 'text-[11px] sm:text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 tracking-wider mb-0.5'
      : 'text-[9px] sm:text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider mb-0.5';

  // Accessible descriptive label
  const accessibleLabel = value !== 0
    ? `第${row + 1}行第${col + 1}列，${isInitial ? '题目已知数' : '已填数'} ${displaySymbol || value}${rubyPinyin ? ` (${rubyPinyin})` : ''}`
    : displayNotes.length > 0
    ? `第${row + 1}行第${col + 1}列，空格，候选笔记 ${displayNotes.map((n) => getSymbolDisplay(n, symbolTheme, boardSize)).join('、')}`
    : `第${row + 1}行第${col + 1}列，空格`;

  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={isSelected}
      aria-readonly={isInitial}
      aria-invalid={isConflict || (showError && !!cell.isError)}
      aria-label={accessibleLabel}
      onClick={() => onClick(row, col)}
      className={`relative w-full aspect-square flex items-center justify-center transition-colors duration-100 text-center select-none cursor-pointer focus:outline-none touch-manipulation ${borderRight} ${borderBottom} ${bgClass}`}
    >
      {value !== 0 ? (
        rubyPinyin ? (
          <div className="flex flex-col items-center justify-center select-none leading-none -my-0.5 sm:-my-1">
            <span className={`${rubySizeClass} font-sans leading-none select-none`}>
              {rubyPinyin}
            </span>
            <span
              className={`${fontSizeClass} font-sans font-bold tracking-tight leading-none transition-transform select-none ${textColorClass} ${
                !isInitial ? 'animate-pop' : ''
              }`}
            >
              {displaySymbol}
            </span>
          </div>
        ) : (
          <span
            className={`${fontSizeClass} font-sans font-bold tabular-nums tracking-tight leading-none transition-transform select-none ${textColorClass} ${
              !isInitial ? 'animate-pop' : ''
            }`}
          >
            {displaySymbol || value}
          </span>
        )
      ) : displayNotes.length > 0 ? (
        // 3x3 pencil marks (candidate numbers) grid
        <div className="w-full h-full p-0.5 grid grid-cols-3 grid-rows-3 pointer-events-none select-none">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const hasNote = displayNotes.includes(num);
            return (
              <div
                key={num}
                className="flex items-center justify-center text-[9px] sm:text-[11px] font-mono leading-none"
              >
                {hasNote && (
                  <span
                    className={`font-semibold ${
                      highlightDigit === num
                        ? 'text-blue-600 font-bold scale-110 dark:text-sky-300'
                        : isTarget
                        ? 'text-amber-600 font-bold dark:text-amber-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {num}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </button>
  );
});

Cell.displayName = 'SudokuCell';
