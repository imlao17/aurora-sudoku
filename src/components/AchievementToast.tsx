import React, { useEffect } from 'react';
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
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentId, onClose]);

  if (!current) return null;
  const IconComponent = ICON_MAP[current.icon] || Trophy;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-6 inset-x-4 z-50 max-w-sm mx-auto animate-pop select-none"
    >
      <div className="rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/80 shadow-2xl p-4 backdrop-blur-md flex flex-col gap-2.5 text-slate-900 dark:text-slate-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
              <IconComponent className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40">
                  🎉 成就解锁
                </span>
                {achievements.length > 1 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    +{achievements.length - 1} 更多
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                {current.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭成就提醒"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed m-0 pl-1">
          {current.description}
        </p>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onViewAll}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-300 dark:hover:text-amber-200 dark:hover:bg-amber-500/10 transition-all cursor-pointer"
          >
            查看成就墙
          </button>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            太棒了！
          </button>
        </div>
      </div>
    </div>
  );
};
