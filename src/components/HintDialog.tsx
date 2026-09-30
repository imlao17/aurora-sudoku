import React from 'react';
import type { SmartHint } from '../utils/hint';
import { Lightbulb, Sparkles, X, Info, BookOpen } from 'lucide-react';

interface HintDialogProps {
  hint: SmartHint | null;
  onApply: () => void;
  onClose: () => void;
  onOpenTechnique?: (techniqueName?: string, type?: string) => void;
}

export const HintDialog: React.FC<HintDialogProps> = ({
  hint,
  onApply,
  onClose,
  onOpenTechnique,
}) => {
  if (!hint) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="智能提示详情"
      className="fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 px-3 sm:px-4 max-w-lg mx-auto animate-pop select-none"
    >
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-amber-500/50 shadow-2xl p-4 backdrop-blur-md text-slate-900 dark:text-slate-100 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Lightbulb className="w-4 h-4 fill-amber-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  {hint.title}
                </span>
                {hint.techniqueName && (
                  <button
                    type="button"
                    onClick={() => onOpenTechnique?.(hint.techniqueName, hint.type)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="点击查看该技法百科与图解"
                  >
                    <span>{hint.techniqueName}</span>
                    <BookOpen className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                位置: 第 {hint.row + 1} 行, 第 {hint.col + 1} 列
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭提示"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explanation text */}
        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-slate-950/70 border border-amber-200/80 dark:border-slate-800 flex flex-col gap-2">
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed m-0 font-medium">
            {hint.explanation}
          </p>

          <div className="flex items-center gap-1.5 text-[10px] text-amber-800/90 dark:text-amber-300/80 pt-1 border-t border-amber-200/60 dark:border-slate-800/80">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>棋盘已同步高亮：🟡 目标候选格 与 🔵 关联排除线索格</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-800/80">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 dark:border-slate-700/80 transition-all cursor-pointer"
          >
            我已知晓 (自己尝试)
          </button>
          <button
            onClick={onApply}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>直接填入数字 【{hint.suggestedValue}】</span>
          </button>
        </div>
      </div>
    </div>
  );
};
