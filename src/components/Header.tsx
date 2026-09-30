import React from 'react';
import type { Difficulty, GameMode } from '../types/sudoku';
import { DIFFICULTY_PRESETS } from '../constants/sudoku';
import {
  Trophy,
  Settings,
  RefreshCw,
  Calendar,
  Volume2,
  VolumeX,
  HelpCircle,
  Compass,
  GraduationCap,
  Home,
} from 'lucide-react';

interface HeaderProps {
  difficulty: Difficulty;
  gameMode: GameMode;
  dateStr: string;
  isDailyCompleted: boolean;
  soundEnabled: boolean;
  onSelectDifficulty: (diff: Difficulty) => void;
  onSelectMode: (mode: GameMode) => void;
  onNewGame: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenTechniques?: () => void;
  onToggleSound: () => void;
  onStartVisualSolver?: () => void;
  onBackHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  difficulty,
  gameMode,
  dateStr,
  isDailyCompleted,
  soundEnabled,
  onSelectDifficulty,
  onSelectMode,
  onNewGame,
  onOpenStats,
  onOpenSettings,
  onOpenHelp,
  onOpenTechniques,
  onToggleSound,
  onStartVisualSolver,
  onBackHome,
}) => {
  return (
    <header className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-2 sm:pt-4 pb-1 select-none flex flex-col gap-2">
      {/* 顶行：极简报刊标题与工具图标 */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              aria-label="返回首页大厅"
              title="返回首页大厅"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">首页</span>
            </button>
          )}

          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white m-0 truncate">
              极光数独
            </h1>
            <span className="text-[11px] text-slate-400 dark:text-slate-400 font-mono hidden sm:inline">
              {gameMode === 'daily' ? `· 每日 ${dateStr}` : ''}
            </span>
          </div>
        </div>

        {/* 辅助工具图标 */}
        <div className="flex items-center gap-1 shrink-0 text-slate-600 dark:text-slate-400">
          {onStartVisualSolver && (
            <button
              type="button"
              onClick={onStartVisualSolver}
              aria-label="进入逐步演算教学模式"
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
              title="逐步演示推理教学过程"
            >
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-sky-400" />
              <span className="hidden sm:inline">逐步演示</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? '关闭音效' : '开启音效'}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            type="button"
            onClick={onOpenStats}
            aria-label="查看战绩与排行榜"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="查看排行榜与统计"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="打开游戏偏好设置"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="游戏设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenHelp}
            aria-label="查看快捷键与帮助指南"
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="快捷键指南"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {onOpenTechniques && (
            <button
              type="button"
              onClick={onOpenTechniques}
              aria-label="查看数独解题技巧百科"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              title="解题技巧百科"
            >
              <GraduationCap className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onNewGame}
            aria-label="新开一局"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs active:scale-95 transition-all cursor-pointer ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>新对局</span>
          </button>
        </div>
      </div>

      {/* 次行：扁平纯粹的难度与模式分段切换 (NYT Style Segment) */}
      <div className="flex items-center justify-between gap-1 text-xs">
        {/* 模式切换：自由对局 vs 每日一题 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectMode('random')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              gameMode === 'random'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            自由对局
          </button>
          <button
            type="button"
            onClick={() => onSelectMode('daily')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              gameMode === 'daily'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>每日一题</span>
            {isDailyCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
        </div>

        {/* 难度选择 (简单 · 中等 · 困难) 或 每日提示 */}
        {gameMode === 'random' ? (
          <div className="flex items-center gap-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDifficulty(d)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  difficulty === d
                    ? 'border-b-2 border-slate-900 text-slate-900 dark:border-white dark:text-white'
                    : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200'
                }`}
              >
                {DIFFICULTY_PRESETS[d].label}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2 py-1">
            <span>今日挑战题目（全服一致）</span>
          </div>
        )}
      </div>
    </header>
  );
};
