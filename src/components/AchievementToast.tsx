import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { AchievementDef } from '../utils/achievements';
import {
  Trophy,
  Award,
  Zap,
  ShieldCheck,
  Sparkles,
  Flame,
  Calendar,
  Compass,
  Crown,
  Star,
  X,
} from 'lucide-react';

interface AchievementToastProps {
  achievements: AchievementDef[];
  onClose: () => void;
  onViewAll: () => void;
}

const ICON_MAP = {
  Award,
  Zap,
  ShieldCheck,
  Sparkles,
  Flame,
  Calendar,
  Compass,
  Crown,
  Trophy,
  Star,
};

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievements,
  onClose,
  onViewAll,
}) => {
  const current = achievements[0];
  const currentId = current?.id;
  // Ref, not a dependency: the parent re-renders every second while the clock
  // runs, which would otherwise re-fire the confetti and restart the 5s timer
  // on every tick, so the toast would never auto-dismiss.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!currentId) return;
    // Fire celebratory confetti on unlock
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#818cf8', '#34d399'],
    });

    const timer = setTimeout(() => {
      onCloseRef.current();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentId]);

  if (!current) return null;
  const IconComponent = ICON_MAP[current.icon] || Trophy;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 inset-x-4 z-50 max-w-sm mx-auto animate-pop select-none"
    >
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-4 backdrop-blur-md flex flex-col gap-2.5 text-slate-900 dark:text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
              <IconComponent className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 stroke-[1.5]" />
                  <span>成就解锁</span>
                </span>
                {achievements.length > 1 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    +{achievements.length - 1} 更多
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-950 dark:text-white mt-1 leading-snug">
                {current.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭成就提醒"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0 pl-1">
          {current.description}
        </p>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onViewAll}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            查看成就墙
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  );
};
