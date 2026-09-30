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
    <div className="w-full max-w-xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-2.5 flex items-center justify-between gap-1 sm:gap-2.5 select-none">
      {/* Undo */}
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="撤销上一步 (快捷键 Z 或 Ctrl+Z)"
        aria-keyshortcuts="Control+z"
        className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[44px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          canUndo
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900/85 dark:border-slate-800 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-850 active:scale-95 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-900 dark:text-slate-500 cursor-not-allowed opacity-50'
        }`}
        title="撤销上一步 (快捷键: Z / Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">撤销</span>
      </button>

      {/* Redo */}
      <button
        type="button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="重做下一步 (快捷键 Y 或 Ctrl+Y)"
        aria-keyshortcuts="Control+y"
        className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[44px] rounded-xl border transition-all touch-manipulation cursor-pointer ${
          canRedo
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-900/85 dark:border-slate-800 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-850 active:scale-95 shadow-xs'
            : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-900 dark:text-slate-500 cursor-not-allowed opacity-50'
        }`}
        title="重做下一步 (快捷键: Y / Ctrl+Y)"
      >
        <Redo2 className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
        <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">重做</span>
      </button>

      {/* Erase */}
      <button
        type="button"
        onClick={onErase}
        aria-label="擦除选中格 (快捷键 Backspace 或 Delete)"
        aria-keyshortcuts="Backspace Delete"
        className="flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[44px] rounded-xl border bg-white border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 dark:bg-slate-900/85 dark:border-slate-800 dark:text-slate-200 dark:hover:text-rose-200 dark:hover:border-rose-500/40 active:scale-95 transition-all touch-manipulation cursor-pointer shadow-xs group"
        title="擦除选中格 (快捷键: Backspace / Delete)"
      >
        <Eraser className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5 text-rose-500 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">擦除</span>
      </button>

      {/* Pencil / Notes Mode */}
      <button
        type="button"
        onClick={onToggleNoteMode}
        role="switch"
        aria-checked={isNoteMode}
        aria-label="候选数笔记模式开关 (快捷键 N 或 空格键)"
        aria-keyshortcuts="n Space"
        className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[44px] rounded-xl border relative transition-all touch-manipulation cursor-pointer ${
          isNoteMode
            ? 'bg-amber-50 border-2 border-amber-500 text-amber-800 font-semibold dark:bg-amber-500/20 dark:border-amber-500 dark:text-amber-300'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-850 shadow-xs'
        } active:scale-95`}
        title="切换候选数笔记模式 (快捷键: N 或 空格键)"
      >
        <div className="relative">
          <Edit3 className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${isNoteMode ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
          <span
            className={`absolute -top-1 -right-3.5 sm:-right-4 px-1 py-0.2 rounded-full text-[8px] sm:text-[9px] font-bold uppercase ${
              isNoteMode ? 'bg-amber-500 text-white font-bold' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isNoteMode ? '开' : '关'}
          </span>
        </div>
        <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">笔记</span>
      </button>

      {/* Hint */}
      <button
        type="button"
        onClick={onHint}
        disabled={hintsRemaining <= 0}
        aria-label={`提示功能 (剩余${hintsRemaining}次，快捷键 H)`}
        aria-keyshortcuts="h"
        className={`flex-1 flex flex-col items-center justify-center py-1.5 sm:py-2.5 min-h-[44px] rounded-xl border transition-all relative touch-manipulation cursor-pointer ${
          hintsRemaining > 0
            ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:bg-sky-500/15 dark:border-sky-500/40 dark:text-sky-300 dark:hover:bg-sky-500/25 dark:hover:text-white active:scale-95 shadow-xs'
            : 'bg-slate-50 border border-slate-200 text-slate-400 dark:bg-slate-950/40 dark:border-slate-900 dark:text-slate-500 cursor-not-allowed opacity-50'
        }`}
        title={`提示功能 (剩余${hintsRemaining}次，快捷键: H)`}
      >
        <div className="relative">
          <Lightbulb className={`w-4 h-4 sm:w-5 sm:h-5 mb-0.5 ${hintsRemaining > 0 ? 'text-blue-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-600'}`} />
          {hintsRemaining > 0 && (
            <span className="absolute -top-1 -right-2 sm:-right-2.5 w-3.5 h-3.5 rounded-full bg-blue-600 dark:bg-sky-500 text-white font-bold text-[8px] sm:text-[9px] flex items-center justify-center">
              {hintsRemaining}
            </span>
          )}
        </div>
        <span className="text-[10px] sm:text-[11px] font-medium tracking-tight">提示</span>
      </button>
    </div>
  );
});
