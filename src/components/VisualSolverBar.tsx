import React, { useEffect } from 'react';
import type { VisualSolveStep } from '../utils/visualSolver';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface VisualSolverBarProps {
  steps: VisualSolveStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number; // 0.5, 1, 2
  onStepChange: (index: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onExit: () => void;
  onOpenTechnique?: (techniqueId: string) => void;
}

export const VisualSolverBar: React.FC<VisualSolverBarProps> = ({
  steps,
  currentStepIndex,
  isPlaying,
  speed,
  onStepChange,
  onTogglePlay,
  onSpeedChange,
  onExit,
  onOpenTechnique,
}) => {
  const totalSteps = steps?.length ?? 0;
  const currentStep = steps?.[currentStepIndex] || steps?.[0];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;
    const intervalMs = Math.round(1400 / speed);
    const timer = setInterval(() => {
      onStepChange(currentStepIndex < totalSteps - 1 ? currentStepIndex + 1 : 0);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed, currentStepIndex, totalSteps, onStepChange]);

  if (!steps || steps.length === 0 || !currentStep) {
    return null;
  }

  // Color mapping based on technique
  const getBadgeStyle = (tech: string) => {
    switch (tech) {
      case 'naked-single':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/30';
      case 'hidden-single-box':
      case 'hidden-single-line':
        return 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/30';
      case 'pointing-pair':
      case 'box-line-reduction':
        return 'text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/30';
      case 'naked-pair':
      case 'hidden-pair':
        return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/30';
      case 'x-wing':
        return 'text-violet-700 bg-violet-50 border-violet-200 dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-500/30';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-sky-400 dark:bg-sky-500/10 dark:border-sky-500/30';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-2.5 sm:px-4 mt-2 sm:mt-3 select-none animate-fadeIn pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-2">
      <div className="rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl p-3 sm:p-4 backdrop-blur-md flex flex-col gap-2.5 sm:gap-3 text-slate-900 dark:text-slate-100">
        {/* Top Header: Title, Step Counter, Exit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide">
                  逐步演算教学模式
                </span>
                <button
                  type="button"
                  onClick={() => onOpenTechnique?.(currentStep.technique)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1 hover:opacity-85 active:scale-95 transition-all cursor-pointer ${getBadgeStyle(
                    currentStep.technique
                  )}`}
                  title="点击查看该解题技巧的图解教学"
                >
                  <span>{currentStep.techniqueName}</span>
                  <BookOpen className="w-2.5 h-2.5 opacity-70" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 m-0">
                步骤 {currentStepIndex} / {totalSteps - 1}
              </p>
            </div>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/80 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>退出演示</span>
          </button>
        </div>

        {/* Step Reasoning Card */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentStep.title}</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed m-0">
            {currentStep.description}
          </p>

          {/* Visual Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-2 mt-1 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/30" />
              <span>目标格 (填入/排除)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
              <span>线索条件格</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300 dark:bg-slate-700 dark:border-slate-500" />
              <span>推理作用域</span>
            </span>
          </div>
        </div>

        {/* Slider scrub bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-sky-500"
            aria-label="演算进度进度条"
          />
        </div>

        {/* Bottom Playback Controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[10px]">
            {[0.5, 1, 2].map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onStepChange(0)}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent"
              title="跳转到起点"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
              disabled={currentStepIndex === 0}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent"
              title="上一步"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={onTogglePlay}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>暂停</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>播放</span>
                </>
              )}
            </button>

            <button
              onClick={() => onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1))}
              disabled={currentStepIndex === totalSteps - 1}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent"
              title="下一步"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStepChange(totalSteps - 1)}
              disabled={currentStepIndex === totalSteps - 1}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent"
              title="跳转到终点"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
