import React, { useMemo } from 'react';
import type { CellData, CellPosition, GameSettings, BoardSize, SymbolTheme } from '../types/sudoku';
import { getMultiSizeBoxIndex } from '../utils/multiSizeSudoku';
import { Cell } from './Cell';
import { Play } from 'lucide-react';

interface BoardProps {
  board: CellData[][];
  selectedCell: CellPosition | null;
  conflicts: boolean[][];
  settings: GameSettings;
  isPaused: boolean;
  boardSize?: BoardSize;
  symbolTheme?: SymbolTheme;
  targetHighlightCells?: { row: number; col: number }[];
  causeHighlightCells?: { row: number; col: number }[];
  scopeHighlight?: { type: 'row' | 'col' | 'box'; index: number };
  completedHouseCells?: Record<string, boolean>;
  customCandidatesMap?: number[][][];
  customValuesGrid?: number[][];
  onSelectCell: (row: number, col: number) => void;
  onResume: () => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  selectedCell,
  conflicts,
  settings,
  isPaused,
  boardSize,
  symbolTheme,
  targetHighlightCells,
  causeHighlightCells,
  scopeHighlight,
  completedHouseCells,
  customCandidatesMap,
  customValuesGrid,
  onSelectCell,
  onResume,
}) => {
  const size: BoardSize = boardSize || ((board.length === 4 || board.length === 6) ? (board.length as BoardSize) : 9);
  const currentSymbolTheme = symbolTheme || settings.symbolTheme || 'numbers';
  const gridColsClass = size === 4 ? 'grid-cols-4' : size === 6 ? 'grid-cols-6' : 'grid-cols-9';
  const selectedValue = selectedCell && board[selectedCell.row] ? board[selectedCell.row][selectedCell.col]?.value : 0;

  const targetHighlightSet = useMemo(() => {
    if (!targetHighlightCells || targetHighlightCells.length === 0) return null;
    return new Set(targetHighlightCells.map((p) => `${p.row}-${p.col}`));
  }, [targetHighlightCells]);

  const causeHighlightSet = useMemo(() => {
    if (!causeHighlightCells || causeHighlightCells.length === 0) return null;
    return new Set(causeHighlightCells.map((p) => `${p.row}-${p.col}`));
  }, [causeHighlightCells]);

  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !selectedCell || e.changedTouches.length === 0) {
      touchStartRef.current = null;
      return;
    }

    const touchEnd = e.changedTouches[0];
    const dx = touchEnd.clientX - touchStartRef.current.x;
    const dy = touchEnd.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 28;
    if (Math.hypot(dx, dy) < threshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && selectedCell.col < size - 1) {
        onSelectCell(selectedCell.row, selectedCell.col + 1);
      } else if (dx < 0 && selectedCell.col > 0) {
        onSelectCell(selectedCell.row, selectedCell.col - 1);
      }
    } else {
      if (dy > 0 && selectedCell.row < size - 1) {
        onSelectCell(selectedCell.row + 1, selectedCell.col);
      } else if (dy < 0 && selectedCell.row > 0) {
        onSelectCell(selectedCell.row - 1, selectedCell.col);
      }
    }
  };

  const maxBoardWidthClass =
    size === 4
      ? 'max-w-[min(520px,calc(100dvh-230px))]'
      : size === 6
      ? 'max-w-[min(500px,calc(100dvh-260px))]'
      : 'max-w-[min(480px,calc(100dvh-290px))]';

  return (
    <div className={`w-full ${maxBoardWidthClass} aspect-square mx-auto px-1.5 sm:px-0 select-none touch-manipulation`}>
      {/* Dynamic Multi-Size Board Frame */}
      <div
        role="grid"
        aria-label={`数独棋盘 ${size}乘${size}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-white dark:bg-slate-900 rounded-lg overflow-hidden border-2 sm:border-[2.5px] border-slate-900 dark:border-slate-100 flex flex-col transition-colors duration-200 touch-manipulation"
      >
        {board.map((rowCells, r) => (
          <div key={`row-${r}`} role="row" className={`flex-1 grid ${gridColsClass} w-full`}>
            {rowCells.map((cell, c) => {
              const isSelected = selectedCell?.row === r && selectedCell?.col === c;

              // Related crosshair (same row, col, or box)
              let isRelated = false;
              if (settings.highlightCross && selectedCell) {
                const sameRow = selectedCell.row === r;
                const sameCol = selectedCell.col === c;
                const sameBox =
                  getMultiSizeBoxIndex(selectedCell.row, selectedCell.col, size) ===
                  getMultiSizeBoxIndex(r, c, size);
                isRelated = (sameRow || sameCol || sameBox) && !isSelected;
              }

              // Same number highlight
              const isSameNumber =
                settings.highlightSameNumbers &&
                selectedValue !== 0 &&
                (cell.value === selectedValue || cell.notes.includes(selectedValue)) &&
                !isSelected;

              // Duplicate conflicts in same row/col/box
              const isConflict = settings.highlightConflicts && (conflicts[r]?.[c] ?? false);

              // Educational tutorial & hint highlights
              const key = `${r}-${c}`;
              const isTarget = targetHighlightSet?.has(key) ?? false;
              const isCause = causeHighlightSet?.has(key) ?? false;

              let isScope = false;
              if (scopeHighlight) {
                if (scopeHighlight.type === 'row' && scopeHighlight.index === r) isScope = true;
                if (scopeHighlight.type === 'col' && scopeHighlight.index === c) isScope = true;
                if (
                  scopeHighlight.type === 'box' &&
                  getMultiSizeBoxIndex(r, c, size) === scopeHighlight.index
                ) {
                  isScope = true;
                }
              }

              const customCandidates = customCandidatesMap?.[r]?.[c];
              const customDisplayValue = customValuesGrid?.[r]?.[c];

              return (
                <Cell
                  key={`${r}-${c}`}
                  cell={cell}
                  isSelected={isSelected}
                  isRelated={isRelated}
                  isSameNumber={isSameNumber}
                  highlightDigit={selectedValue}
                  isConflict={isConflict}
                  showError={settings.realtimeErrorCheck}
                  isTarget={isTarget}
                  isCause={isCause}
                  isScope={isScope}
                  isHouseCompleted={!!completedHouseCells?.[`${r}-${c}`]}
                  customCandidates={customCandidates}
                  customDisplayValue={customDisplayValue}
                  boardSize={size}
                  symbolTheme={currentSymbolTheme}
                  showPinyinRuby={settings.showPinyinRuby}
                  onClick={onSelectCell}
                />
              );
            })}
          </div>
        ))}

        {/* Anti-cheat Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-white/95 dark:bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center mb-3 text-slate-900 dark:text-white shadow-xs">
              <Play className="w-6 h-6 stroke-[1.5] ml-0.5" />
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1.5">游戏已暂停</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 max-w-xs leading-relaxed">
              计时器已静止，盘面防窥保护中。随时点击下方按钮继续挑战。
            </p>
            <button
              onClick={onResume}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              继续游戏
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
