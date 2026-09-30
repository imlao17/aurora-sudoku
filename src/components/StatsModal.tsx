import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { GameStats, Difficulty } from '../types/sudoku';
import { formatTime, loadGameRecords, loadMasteredTechniques } from '../utils/storage';
import { DIFFICULTY_PRESETS } from '../constants/sudoku';
import { ACHIEVEMENTS_LIST } from '../utils/achievements';
import { TECHNIQUES_DATA } from '../constants/techniques';
import {
  Trophy,
  Clock,
  Flame,
  CheckCircle2,
  X,
  Award,
  Zap,
  ShieldCheck,
  Sparkles,
  Calendar,
  Compass,
  Crown,
  Star,
  Lock,
  BookOpen,
} from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  stats: GameStats;
  initialTab?: 'stats' | 'history' | 'achievements';
  onClose: () => void;
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

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  initialTab = 'stats',
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // Held in a ref so the listener below is created once per open rather than
  // on every parent render (the parent re-renders each second while playing).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const [activeMainTab, setActiveMainTab] = useState<'stats' | 'history' | 'achievements'>(initialTab);
  const [activeDiffTab, setActiveDiffTab] = useState<Difficulty>('medium');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'daily' | 'random' | 'techniques'>('all');
  const [prevOpenState, setPrevOpenState] = useState({ isOpen, initialTab });

  // Sync tab state when modal opens or initialTab changes
  if (isOpen !== prevOpenState.isOpen || initialTab !== prevOpenState.initialTab) {
    setPrevOpenState({ isOpen, initialTab });
    if (isOpen) {
      setActiveMainTab(initialTab);
    }
  }

  // Load records when open
  const gameRecords = useMemo(() => (isOpen ? loadGameRecords() : []), [isOpen]);
  const masteredTechs = useMemo(() => (isOpen ? loadMasteredTechniques() : []), [isOpen]);

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
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDiffStats = stats[activeDiffTab] || {
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null,
    totalTime: 0,
    currentStreak: 0,
    maxStreak: 0,
  };

  const winRate =
    currentDiffStats.gamesPlayed > 0
      ? Math.round((currentDiffStats.gamesWon / currentDiffStats.gamesPlayed) * 100)
      : 0;

  const avgTime =
    currentDiffStats.gamesWon > 0
      ? Math.round(currentDiffStats.totalTime / currentDiffStats.gamesWon)
      : 0;

  // Count unlocked achievements
  const unlockedCount = ACHIEVEMENTS_LIST.filter(
    (a) => stats.achievements?.[a.id]?.unlockedAt
  ).length;

  const totalGamesWon =
    (stats.easy?.gamesWon || 0) + (stats.medium?.gamesWon || 0) + (stats.hard?.gamesWon || 0);

  // Filter game records
  const filteredRecords = gameRecords.filter((rec) => {
    if (historyFilter === 'daily') return rec.mode === 'daily';
    if (historyFilter === 'random') return rec.mode === 'random';
    return true;
  });

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="战绩与成就"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-lg max-h-[92dvh] rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-4 sm:p-6 flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 safe-pb">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 shrink-0 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                数据与荣誉墙
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                本地通关战绩、对局明细与成就勋章
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭统计弹窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Main Tab Switcher: 3 Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4 shrink-0">
          <button
            onClick={() => setActiveMainTab('stats')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeMainTab === 'stats'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200 dark:bg-slate-900 dark:text-sky-400 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>📊 战绩数据看板</span>
          </button>

          <button
            onClick={() => setActiveMainTab('history')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeMainTab === 'history'
                ? 'bg-white text-blue-600 shadow-xs border border-slate-200 dark:bg-slate-900 dark:text-sky-400 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>📜 对局记录</span>
          </button>

          <button
            onClick={() => setActiveMainTab('achievements')}
            className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeMainTab === 'achievements'
                ? 'bg-white text-amber-700 shadow-xs border border-amber-200 dark:bg-slate-900 dark:text-amber-400 dark:border-slate-800'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span>🏆 成就徽章</span>
          </button>
        </div>

        {/* Tab 1: Stats Overview */}
        {activeMainTab === 'stats' && (
          <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-3.5">
            {/* Daily Streak Highlight Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 dark:bg-gradient-to-r dark:from-amber-500/15 dark:via-rose-500/10 dark:to-sky-500/15 dark:border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                  <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500" />
                </div>
                <div>
                  <div className="text-xs text-amber-800 dark:text-amber-200/80 font-medium">每日一题连胜</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats.dailyStreak}{' '}
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">天</span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300/80 ml-2 font-normal">
                      (历史最高: {stats.maxDailyStreak || stats.dailyStreak}天)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">已累计打卡</div>
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{stats.completedDailies.length} 期</span>
                </div>
              </div>
            </div>

            {/* Difficulty Segment Control */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDiffTab(d)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeDiffTab === d
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {DIFFICULTY_PRESETS[d].label}
                </button>
              ))}
            </div>

            {/* Difficulty Streak Banner */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs dark:bg-slate-950/60 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>当前难度连胜</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="text-slate-900 dark:text-white font-bold">
                  {currentDiffStats.currentStreak || 0} 连胜
                </span>
                <span className="text-slate-300 dark:text-slate-500">|</span>
                <span className="text-slate-500 dark:text-slate-400">
                  最高纪录: <strong className="text-amber-600 dark:text-amber-300">{currentDiffStats.maxStreak || 0}</strong>
                </span>
              </div>
            </div>

            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Best Time */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>最佳记录</span>
                </span>
                <span className="font-mono text-xl font-bold text-amber-600 dark:text-amber-300">
                  {currentDiffStats.bestTime !== null
                    ? formatTime(currentDiffStats.bestTime)
                    : '--:--'}
                </span>
              </div>

              {/* Average Time */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
                  <span>平均耗时</span>
                </span>
                <span className="font-mono text-xl font-bold text-blue-600 dark:text-sky-300">
                  {avgTime > 0 ? formatTime(avgTime) : '--:--'}
                </span>
              </div>

              {/* Games Won */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">通关局数</span>
                <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {`${currentDiffStats.gamesWon} / ${currentDiffStats.gamesPlayed}`}
                </span>
              </div>

              {/* Win Rate */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">胜率</span>
                <span className="font-mono text-xl font-bold text-blue-700 dark:text-sky-400">
                  {`${winRate}%`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Game History & Completed Records */}
        {activeMainTab === 'history' && (
          <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-3">
            {/* Summary Bar */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 dark:bg-slate-950/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 dark:bg-sky-500/20 dark:border-sky-500/40 flex items-center justify-center text-blue-600 dark:text-sky-400 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-blue-900 dark:text-sky-200 font-medium">完赛记录总览</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    已胜 {totalGamesWon} 局
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-2">
                      (打卡 {stats.completedDailies.length} 期 · 已掌握技法 {masteredTechs.length}/11)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: `全部对局 (${gameRecords.length})` },
                { id: 'daily', label: `每日一题 (${gameRecords.filter((r) => r.mode === 'daily').length})` },
                { id: 'random', label: `常规练习 (${gameRecords.filter((r) => r.mode === 'random').length})` },
                { id: 'techniques', label: `已学技法 (${masteredTechs.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setHistoryFilter(tab.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    historyFilter === tab.id
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 dark:bg-slate-950 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content: Mastered Techniques List or Game Records List */}
            {historyFilter === 'techniques' ? (
              <div className="space-y-2">
                {TECHNIQUES_DATA.map((tech) => {
                  const isM = masteredTechs.includes(tech.id);
                  return (
                    <div
                      key={tech.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isM
                          ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
                          : 'bg-slate-50/70 border-slate-200 dark:bg-slate-950/50 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isM
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                          }`}
                        >
                          {isM ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {tech.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {tech.tagline}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isM
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                        }`}
                      >
                        {isM ? '✓ 核对通过' : '待学习'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                暂无对局记录，快去完成一局或开启每日一题吧！
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            rec.mode === 'daily'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                              : rec.difficulty === 'easy'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                              : rec.difficulty === 'medium'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-sky-300'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300'
                          }`}
                        >
                          {rec.mode === 'daily'
                            ? `每日一题 (${rec.dateStr || ''})`
                            : DIFFICULTY_PRESETS[rec.difficulty]?.label || '普通对局'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
                          {rec.dateFormatted}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{formatTime(rec.timeSeconds)}</span>
                        </span>
                        <span>失误: {rec.mistakesCount}次</span>
                        <span>提示: {rec.hintsUsed}次</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-[10px] shrink-0">
                      ✓ 通关成功
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Achievements Wall */}
        {activeMainTab === 'achievements' && (
          <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-2.5">
            <div className="flex items-center justify-between px-2 text-xs text-slate-500 dark:text-slate-400">
              <span>达成荣誉徽章自动解锁</span>
              <span className="font-bold text-amber-600 dark:text-amber-300">
                完成度 {Math.round((unlockedCount / ACHIEVEMENTS_LIST.length) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACHIEVEMENTS_LIST.map((ach) => {
                const rec = stats.achievements?.[ach.id];
                const isUnlocked = !!rec?.unlockedAt;
                const IconComp = ICON_MAP[ach.icon] || Trophy;

                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                      isUnlocked
                        ? 'bg-amber-50/60 border-amber-200 text-slate-900 dark:bg-gradient-to-br dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-950 dark:border-amber-500/40 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 text-slate-500 dark:bg-slate-950/50 dark:border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isUnlocked
                          ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/50 dark:text-amber-300 shadow-xs'
                          : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-600'
                      }`}
                    >
                      {isUnlocked ? (
                        <IconComp className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs font-bold truncate ${
                            isUnlocked ? 'text-amber-800 dark:text-amber-200' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {ach.name}
                        </h4>
                        {isUnlocked ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold shrink-0">
                            已达成
                          </span>
                        ) : (
                          (ach.maxProgress > 1 || (rec && rec.maxProgress > 1)) && (
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {rec?.progress ?? 0}/{rec?.maxProgress ?? ach.maxProgress}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                        {ach.description}
                      </p>
                      {!isUnlocked && (ach.maxProgress > 1 || (rec && rec.maxProgress > 1)) && (
                        <div className="mt-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-1 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                100,
                                ((rec?.progress ?? 0) / (rec?.maxProgress ?? ach.maxProgress)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 mt-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
