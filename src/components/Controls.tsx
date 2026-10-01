import React, { memo } from 'react';
import { Undo2, Redo2, Eraser, Edit3, Lightbulb } from 'lucide-react';

interface ControlsProps {
  isNoteMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hintsRemaining: number;
  onToggleNoteMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onErase: () => void;
  onHint: () => void;
}

export const Controls: React.FC<ControlsProps> = memo(({
  isNoteMode,
  canUndo,
  canRedo,
  hintsRemaining,
  onToggleNoteMode,
  onUndo,
  onRedo,
  onErase,
  onHint,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-2 select-none">
      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="撤销上一步 (快捷键 Z 或 Ctrl+Z)"
        aria-keyshortcuts="Control+z"
        className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 min-h-[46px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          canUndo
            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 active:scale-95'
            : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 text-slate-300 dark:bg-slate-900/30 dark:text-slate-600 cursor-not-allowed'
        }`}
        title="撤销上一步 (快捷键: Z / Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 stroke-[1.5]" />
        <span className="text-[10px] sm:text-[11px] font-semibold">撤销</span>
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="重做下一步 (快捷键 Y 或 Ctrl+Y)"
        aria-keyshortcuts="Control+y"
        className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 min-h-[46px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          canRedo
            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 active:scale-95'
            : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 text-slate-300 dark:bg-slate-900/30 dark:text-slate-600 cursor-not-allowed'
        }`}
        title="重做下一步 (快捷键: Y / Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 stroke-[1.5]" />
        <span className="text-[10px] sm:text-[11px] font-semibold">重做</span>
      </button>

      {/* Erase */}
      <button
        type="button"
        onClick={onErase}
        aria-label="擦除选中格 (快捷键 Backspace 或 Delete)"
        aria-keyshortcuts="Backspace Delete"
        className="flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 min-h-[46px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 active:scale-95 transition-all touch-manipulation cursor-pointer"
        title="擦除选中格 (快捷键: Backspace / Delete)"
      >
        <Eraser className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 text-slate-600 dark:text-slate-400 stroke-[1.5]" />
        <span className="text-[10px] sm:text-[11px] font-semibold">擦除</span>
      </button>

      {/* Pencil / Notes Mode */}
      <button
        type="button"
        onClick={onToggleNoteMode}
        role="switch"
        aria-checked={isNoteMode}
        aria-label="候选数笔记模式开关 (快捷键 N 或 空格键)"
        aria-keyshortcuts="n Space"
        className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 min-h-[46px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          isNoteMode
            ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950 font-bold'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200'
        } active:scale-95`}
        title="切换候选数笔记模式 (快捷键: N 或 空格键)"
      >
        <div className="relative">
          <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 stroke-[1.5]" />
          <span
            className={`absolute -top-1 -right-3.5 px-1 py-0.2 rounded text-[8px] font-bold ${
              isNoteMode
                ? 'bg-white text-slate-950 dark:bg-slate-900 dark:text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isNoteMode ? '开' : '关'}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold">笔记</span>
      </button>

      {/* Hint */}
      <button
        type="button"
        onClick={onHint}
        disabled={hintsRemaining <= 0}
        aria-label={`提示功能 (剩余${hintsRemaining}次，快捷键 H)`}
        aria-keyshortcuts="h"
        className={`flex-1 flex flex-col items-center justify-center py-2 sm:py-2.5 min-h-[46px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          hintsRemaining > 0
            ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 active:scale-95'
            : 'border-slate-100 dark:border-slate-900 bg-slate-50/50 text-slate-300 dark:bg-slate-900/30 dark:text-slate-600 cursor-not-allowed'
        }`}
        title={`提示功能 (剩余${hintsRemaining}次，快捷键: H)`}
      >
        <div className="relative">
          <Lightbulb className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 stroke-[1.5] ${hintsRemaining > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`} />
          {hintsRemaining > 0 && (
            <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-[8px] flex items-center justify-center">
              {hintsRemaining}
            </span>
          )}
        </div>
        <span className="text-[10px] sm:text-[11px] font-semibold">提示</span>
      </button>
    </div>
  );
});
