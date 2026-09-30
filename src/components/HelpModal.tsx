import React, { useEffect, useRef } from 'react';
import { Keyboard, X, Sparkles, Smartphone } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Shift focus into modal
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: '↑ ↓ ← → / WASD', label: '移动光标选中格子' },
    { key: '1 ~ 9', label: '填入数字 / 标记候选笔记' },
    { key: 'Backspace / Delete / 0', label: '擦除当前选中格' },
    { key: 'N / 空格键', label: '切换【笔记候选数】模式' },
    { key: 'H', label: '触发教学式智能提示' },
    { key: 'P', label: '暂停 / 继续游戏计时' },
    { key: 'Z / Ctrl+Z', label: '撤销上一步操作' },
    { key: 'Y / Ctrl+Y', label: '重做下一步操作' },
    { key: 'M', label: '打开数独解题方法百科' },
    { key: '?', label: '打开本快捷键指南' },
    { key: 'Esc', label: '关闭当前打开的弹窗' },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="操作指南"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-4 sm:p-6 flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 dark:bg-sky-500/20 dark:border-sky-500/40 flex items-center justify-center text-blue-600 dark:text-sky-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                快捷键操作指南
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">全端沉浸式极速解题手册</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭快捷键指南"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="my-3 sm:my-4 space-y-3 overflow-y-auto pr-1">
          {/* Mobile touch guide */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>📱 移动触屏操作秘籍</span>
            </div>
            <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 m-0 pl-4 list-disc leading-relaxed">
              <li><strong>点选落子</strong>：轻点棋盘空格，再按底部数字填入或标记笔记。</li>
              <li><strong>数字先行（快速连点）</strong>：在设置中开启「数字先行」后，先轻按底部数字，再连续轻点棋盘空格极速落子。</li>
              <li><strong>全盘同数点亮</strong>：轻按任意已有数字的格子，全盘相同数字高亮定位。</li>
              <li><strong>触觉振动反馈</strong>：落子、擦除与通关均配备真实清脆震动反馈。</li>
            </ul>
          </div>

          {/* Desktop keyboard guide title */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 pt-1">
            <Keyboard className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
            <span>⌨️ 桌面端键盘快捷键</span>
          </div>

          {/* Shortcuts list */}
          <div className="space-y-1.5">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/70 dark:border-slate-800/80"
              >
                <span className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 font-medium">{s.label}</span>
                <kbd className="px-2 py-0.5 sm:py-1 rounded-md bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 font-mono text-[10px] sm:text-[11px] text-blue-600 dark:text-sky-300 font-bold shadow-xs">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 dark:bg-sky-500/10 dark:border-sky-500/20 dark:text-sky-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400 shrink-0" />
            <span>提示：手机浏览器可选择「添加到主屏幕」即可像原生 App 一样全屏离线玩！</span>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium text-xs border border-transparent dark:border-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
        >
          我已知晓
        </button>
      </div>
    </div>
  );
};
