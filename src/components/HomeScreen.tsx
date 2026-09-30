import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import {
  Play,
  Flame,
  BookOpen,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';

interface ActiveGameSummary {
  difficulty: Difficulty;
  gameMode: GameMode;
  elapsedTime: number;
  filledCount: number;
}

interface HomeScreenProps {
  onStartGame: (difficulty: Difficulty, mode: GameMode, forceReset?: boolean) => void;
  onResumeGame?: () => void;
  hasActiveGame: boolean;
  activeGameSummary?: ActiveGameSummary | null;
  dailyStreak: number;
  isDailyCompletedToday: boolean;
  todayDateStr: string;
  masteredTechniquesCount: number;
  totalTechniquesCount: number;
  soundEnabled: boolean;
  theme: string;
  onToggleSound: () => void;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
  onOpenStats: (tab?: 'stats' | 'history' | 'achievements') => void;
  onOpenTechniques: () => void;
  onOpenHelp: () => void;
}

const DIFFICULTY_MAP: Record<Difficulty, { label: string; desc: string; clues: string; color: string; ring: string }> = {
  easy: {
    label: '简单',
    desc: '轻松破局',
    clues: '~38 提示数',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    ring: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  },
  medium: {
    label: '中等',
    desc: '绝妙均衡',
    clues: '~31 提示数',
    color: 'bg-blue-500/10 text-blue-600 dark:text-sky-400 border-blue-500/20 hover:bg-blue-500/20',
    ring: 'border-blue-500/40 text-blue-600 dark:text-sky-400',
  },
  hard: {
    label: '困难',
    desc: '深度推演',
    clues: '~25 提示数',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
    ring: 'border-rose-500/40 text-rose-600 dark:text-rose-400',
  },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onResumeGame,
  hasActiveGame,
  activeGameSummary,
  dailyStreak,
  isDailyCompletedToday,
  todayDateStr,
  masteredTechniquesCount,
  totalTechniquesCount,
  soundEnabled,
  theme,
  onToggleSound,
  onCycleTheme,
  onOpenSettings,
  onOpenStats,
  onOpenTechniques,
  onOpenHelp,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = ['aurora', 'cyberpunk', 'twilight'].includes(theme);

  return (
    <div className="w-full max-w-xl mx-auto px-3.5 sm:px-5 py-3 sm:py-6 flex flex-col gap-4 sm:gap-5 min-h-[92dvh] select-none justify-between animate-fadeIn text-slate-800 dark:text-slate-100">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-blue-500/20">
            9
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                极光数独
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              纯粹 · 优雅 · 极致手感
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={soundEnabled ? '音效开启' : '音效静音'}
            aria-label="切换音效"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={onCycleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="快速切换浅色/深色主题"
            aria-label="快速切换主题"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => onOpenStats('stats')}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="战绩与成就看板"
            aria-label="查看战绩与排行榜"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="游戏偏好设置"
            aria-label="打开游戏偏好设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title="快捷键与规则说明"
            aria-label="游戏规则与快捷键帮助"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col gap-3.5 sm:gap-4 my-auto justify-center">
        {/* Banner: In-Progress Game (if any) */}
        {hasActiveGame && activeGameSummary && (
          <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-sky-500/10 border-2 border-blue-500/30 dark:border-sky-500/40 shadow-sm flex flex-col gap-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-700 dark:text-sky-300">
                  检测到进行中对局
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/80 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {DIFFICULTY_MAP[activeGameSummary.difficulty].label}难度
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                已用时 {formatTime(activeGameSummary.elapsedTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onResumeGame}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>继续对局</span>
              </button>

              <button
                onClick={() => onStartGame(activeGameSummary.difficulty, activeGameSummary.gameMode, true)}
                className="py-2.5 px-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="放弃当前盘面重新开局"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重开</span>
              </button>
            </div>
          </div>
        )}

        {/* Card 1: 经典模式 (Classic Mode) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-sky-500/10 border border-blue-200 dark:border-sky-500/20 flex items-center justify-center text-blue-600 dark:text-sky-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                  经典自由对局
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  位掩码算法极速生成 · 100% 严格唯一解保证
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
              const meta = DIFFICULTY_MAP[d];
              const isRecommended = d === 'medium';
              return (
                <button
                  key={d}
                  onClick={() => onStartGame(d, 'random', true)}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer relative active:scale-95 group ${meta.color}`}
                >
                  {isRecommended && (
                    <span className="absolute -top-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                      推荐
                    </span>
                  )}
                  <span className="text-xs sm:text-sm font-bold tracking-tight">
                    {meta.label}
                  </span>
                  <span className="text-[10px] opacity-80 mt-0.5">
                    {meta.desc}
                  </span>
                  <span className="text-[9px] opacity-60 font-mono mt-0.5">
                    {meta.clues}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card 2 & 3: 每日一题 + 解题方法 (2-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 每日一题 */}
          <div
            onClick={() => onStartGame('medium', 'daily')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-amber-400/60 dark:hover:border-amber-500/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    每日一题挑战
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {todayDateStr}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                全网同种随机种子，每日打卡记录连胜纪录。
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>连胜 {dailyStreak} 天</span>
              </div>
              <div className="text-blue-600 dark:text-sky-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                <span>{isDailyCompletedToday ? '已通关 (重刷)' : '去挑战'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 解题方法百科 */}
          <div
            onClick={onOpenTechniques}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3 hover:border-indigo-400/60 dark:hover:border-indigo-500/40 transition-all cursor-pointer group active:scale-[0.99]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    解题技巧百科
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10">
                  {masteredTechniquesCount}/{totalTechniquesCount} 掌握
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                11 种经典与大师技巧，3×3 真实图解与随堂检验。
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-[10px] text-slate-400">
                支持直通专项实战
              </span>
              <div className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                <span>查阅百科</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: 战绩看板与对局记录 */}
        <div
          onClick={() => onOpenStats('history')}
          className="p-3.5 sm:p-4 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  战绩流水与成就勋章
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  (📜 对局记录已就绪)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                记录每一局用时、失误与提示，成就徽章实时点亮
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
      </div>

      {/* 3. Bottom Footer */}
      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <span>极光数独 · PWA 离线支持</span>
        <span>对局中可随时点「🏠 首页」返回大厅</span>
      </div>
    </div>
  );
};
