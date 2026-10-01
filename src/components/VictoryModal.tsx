import React, { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { Difficulty, GameMode } from '../types/sudoku';
import { formatTime } from '../utils/storage';
import { DIFFICULTY_PRESETS } from '../constants/sudoku';
import { Trophy, Clock, AlertCircle, Lightbulb, Share2, RefreshCw, X, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  timeTaken: number;
  difficulty: Difficulty;
  gameMode: GameMode;
  dateStr?: string;
  mistakesCount: number;
  hintsUsed: number;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  timeTaken,
  difficulty,
  gameMode,
  dateStr,
  mistakesCount,
  hintsUsed,
  isNewBest,
  onPlayAgain,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Refs, so the keydown listener is not rebuilt on every parent render (the
  // parent re-renders each second while the clock runs).
  const onCloseRef = useRef(onClose);
  const onPlayAgainRef = useRef(onPlayAgain);
  useEffect(() => {
    onCloseRef.current = onClose;
    onPlayAgainRef.current = onPlayAgain;
  }, [onClose, onPlayAgain]);

  // Keyboard navigation & Focus management
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      // Enter is deliberately *not* bound globally: it activated "play again"
      // even when focus was on Close or Share, and the buttons already handle
      // Enter natively.
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
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Fire festive confetti
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6'];
    let animId: number | null = null;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        animId = requestAnimationFrame(frame);
      }
    };

    animId = requestAnimationFrame(frame);

    return () => {
      if (animId !== null) {
        cancelAnimationFrame(animId);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const diffLabel = DIFFICULTY_PRESETS[difficulty].label;

  const handleShare = async () => {
    const text = `🎉 我在【知数】中成功通关！\n` +
      `📅 模式: ${gameMode === 'daily' ? `每日一题 (${dateStr})` : diffLabel + '难度'}\n` +
      `⏱️ 耗时: ${formatTime(timeTaken)}${isNewBest ? ' (新纪录🏆)' : ''}\n` +
      `❌ 失误: ${mistakesCount}次 | 💡 提示: ${hintsUsed}次\n` +
      `🔥 快来打破我的纪录！`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Clipboard API is unavailable over plain http (e.g. LAN testing) and
        // in some embedded webviews, so fall back to the legacy path.
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('execCommand copy rejected');
      }
      setCopied(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
        copyTimerRef.current = null;
      }, 2000);
    } catch (e) {
      console.warn('Failed to copy share text:', e);
      setCopyFailed(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopyFailed(false);
        copyTimerRef.current = null;
      }, 2000);
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="通关结算"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center text-slate-900 dark:text-slate-100 safe-pb">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-2 shrink-0 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="关闭结算弹窗"
        >
          <X className="w-5 h-5 stroke-[1.5]" />
        </button>

        {/* Seal Stamp Insignia */}
        <div className="relative my-2.5">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shadow-sm">
            <Trophy className="w-7 h-7 stroke-[1.5]" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1 mb-1">
          恭喜通关！
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          知数 · {gameMode === 'daily' ? `每日一题 (${dateStr})` : `${diffLabel}模式`}
        </p>

        {/* New Best Record Banner */}
        {isNewBest && (
          <div className="w-full mb-3.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
            <span>刷新历史最快通关纪录！</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 mb-5">
          <div className="bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>通关耗时</span>
            </div>
            <span className="font-mono text-xl font-bold text-slate-950 dark:text-white tabular-nums tracking-wide">
              {formatTime(timeTaken)}
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>失误次数</span>
            </div>
            <span className="font-mono text-xl font-bold text-slate-950 dark:text-white tabular-nums">
              {mistakesCount} 次
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Lightbulb className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>提示使用</span>
            </div>
            <span className="font-mono text-xl font-bold text-slate-950 dark:text-white tabular-nums">
              {hintsUsed} 次
            </span>
          </div>

          <div className="bg-slate-50/70 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mb-1">
              <Trophy className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>挑战难度</span>
            </div>
            <span className="text-base font-bold text-slate-950 dark:text-white">
              {diffLabel}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onPlayAgain}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>再来一局</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500 stroke-[1.5]" />
            <span>
              {copied ? '已复制战报到剪贴板！' : copyFailed ? '复制失败，请手动截图' : '分享战绩'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
