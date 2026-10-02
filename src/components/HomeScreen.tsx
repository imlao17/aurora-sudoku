import React, { useState } from 'react';
import type { Difficulty, GameMode, BoardSize, SymbolTheme } from '../types/sudoku';
import type { UserProfile } from '../types/user';
import { FlatAvatar } from './FlatAvatar';
import {
  Play,
  RotateCcw,
  Calendar,
  BookOpen,
  Trophy,
  Settings,
  HelpCircle,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface ActiveGameSummary {
  difficulty: Difficulty;
  gameMode: GameMode;
  elapsedTime: number;
  filledCount: number;
  boardSize?: BoardSize;
  symbolTheme?: SymbolTheme;
}

interface HomeScreenProps {
  onStartGame: (
    difficulty: Difficulty,
    mode: GameMode,
    forceReset?: boolean,
    boardSize?: BoardSize,
    symbolTheme?: SymbolTheme
  ) => void;
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
  user?: UserProfile;
  defaultSymbolTheme?: SymbolTheme;
  onOpenProfile?: () => void;
  onToggleSound: () => void;
  onCycleTheme: () => void;
  onOpenSettings: () => void;
  onOpenStats: (tab?: 'stats' | 'history' | 'achievements') => void;
  onOpenTechniques: () => void;
  onOpenHelp: () => void;
}

const DIFFICULTY_MAP: Record<Difficulty, { label: string }> = {
  easy: { label: '简单' },
  medium: { label: '中等' },
  hard: { label: '困难' },
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onResumeGame,
  hasActiveGame,
  activeGameSummary,
  dailyStreak,
  isDailyCompletedToday,
  todayDateStr,
  soundEnabled,
  theme,
  user,
  defaultSymbolTheme = 'animals',
  onOpenProfile,
  onToggleSound,
  onCycleTheme,
  onOpenSettings,
  onOpenStats,
  onOpenTechniques,
  onOpenHelp,
}) => {
  const [activeCategory, setActiveCategory] = useState<'classic' | 'junior'>('classic');
  const [juniorTheme, setJuniorTheme] = useState<SymbolTheme>(defaultSymbolTheme);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = ['aurora', 'cyberpunk', 'twilight'].includes(theme);

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-4 sm:py-12 flex flex-col justify-between min-h-[90dvh] select-none text-slate-900 dark:text-slate-100 animate-fadeIn">
      {/* 顶部账号状态与快速控制栏 */}
      <div className="w-full flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-850 backdrop-blur-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          title="个人中心与账号"
          aria-label="打开个人中心"
        >
          <FlatAvatar id={user?.avatar} size="sm" className="text-slate-800 dark:text-slate-200" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
            {user ? user.username : '我的账号'}
          </span>
          {user?.isGuest ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium">
              游客
            </span>
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white animate-pulse" />
          )}
        </button>

        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={onCycleTheme}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title="切换视觉主题"
          >
            {isDark ? <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" strokeWidth={1.5} /> : <Sun className="w-4 h-4 text-slate-700 dark:text-slate-300" strokeWidth={1.5} />}
          </button>
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title={soundEnabled ? '音效开启' : '音效静音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={1.5} /> : <VolumeX className="w-4 h-4 text-slate-400" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* 1. 经典报刊纸墨风格顶头 (Newspaper / Editorial Header) */}
      <div className="flex flex-col items-center text-center pt-1 sm:pt-2">
        {/* 极简 3x3 纯墨线条 Logo */}
        <div className="w-12 h-12 rounded-xl border-2 border-slate-900 dark:border-slate-100 grid grid-cols-3 grid-rows-3 p-1 gap-0.5 mb-3">
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="border border-slate-300 dark:border-slate-700 rounded-sm" />
          <div className="bg-slate-900 dark:bg-slate-100 rounded-sm" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white font-sans">
          知数
        </h1>
        <p className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-400 font-semibold mt-1">
          ZHISHU SUDOKU · {todayDateStr}
        </p>
      </div>

      {/* 2. 扁平纯粹对局选区 (Flat Direct Play Hub) */}
      <div className="w-full flex flex-col gap-3.5 my-auto">
        {/* 进行中对局快捷继续 */}
        {hasActiveGame && activeGameSummary && (
          <div className="w-full p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex flex-col gap-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs opacity-80 px-0.5">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>检测到进行中对局</span>
                <span>· {activeGameSummary.boardSize ? `${activeGameSummary.boardSize}×${activeGameSummary.boardSize} ` : ''}{DIFFICULTY_MAP[activeGameSummary.difficulty].label}</span>
              </span>
              <span className="font-mono text-[11px]">
                {formatTime(activeGameSummary.elapsedTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onResumeGame}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white text-slate-950 dark:bg-slate-900 dark:text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current stroke-[1.5]" />
                <span>继续对局</span>
              </button>

              <button
                type="button"
                onClick={() => onStartGame(activeGameSummary.difficulty, activeGameSummary.gameMode, true, activeGameSummary.boardSize, activeGameSummary.symbolTheme)}
                className="py-2.5 px-3 rounded-xl bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="重开此局"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>重开</span>
              </button>
            </div>
          </div>
        )}

        {/* 模式选择 Tab: 经典 9x9 vs 小知数·启蒙 */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveCategory('classic')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              activeCategory === 'classic'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            经典研习 (9×9)
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('junior')}
            className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeCategory === 'junior'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>小知数·启蒙</span>
            <span className="text-[10px] px-1 py-0.2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
              4×4 / 6×6
            </span>
          </button>
        </div>

        {/* Category 1: 经典研习 */}
        {activeCategory === 'classic' && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            {/* 经典自由对局 (直觉单行扁平按钮) */}
            <div className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-400 tracking-wider flex items-center justify-between">
                <span>经典自由对局</span>
                <span className="text-[10px] text-slate-400 font-mono">9×9 标准</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => onStartGame(d, 'random', true, 9, 'numbers')}
                    className="py-3 px-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 font-bold text-sm text-slate-900 dark:text-slate-100 text-center transition-all cursor-pointer active:scale-95"
                  >
                    {DIFFICULTY_MAP[d].label}
                  </button>
                ))}
              </div>
            </div>

            {/* 每日一题 (纯平单行) */}
            <button
              type="button"
              onClick={() => {
                if (hasActiveGame && activeGameSummary?.gameMode === 'daily' && onResumeGame) {
                  onResumeGame();
                } else {
                  onStartGame('medium', 'daily', isDailyCompletedToday, 9, 'numbers');
                }
              }}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[1.5]" />
                <span>每日一题挑战</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                <span>{isDailyCompletedToday ? '已通关' : dailyStreak > 0 ? `连胜 ${dailyStreak} 天` : '今日挑战'}</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </div>
            </button>
          </div>
        )}

        {/* Category 2: 小知数·少儿与亲子启蒙专区 */}
        {activeCategory === 'junior' && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            {/* 符号皮肤切换 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 dark:text-slate-400">
                <span>启蒙符号皮肤</span>
                <span className="text-amber-600 dark:text-amber-400 font-normal">图形化空间排他</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: 'numbers', label: '数字', ariaLabel: '经典数字' },
                  { id: 'pinyin', label: '拼音', ariaLabel: '拼音启蒙' },
                  { id: 'hanzi', label: '汉字', ariaLabel: '东方汉字' },
                  { id: 'animals', label: '萌宠', ariaLabel: '生肖萌宠' },
                  { id: 'fruit', label: '几何', ariaLabel: '极简几何' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.ariaLabel}
                    onClick={() => setJuniorTheme(item.id as SymbolTheme)}
                    className={`py-1.5 px-0.5 sm:px-1 rounded-xl border text-[11px] sm:text-xs font-bold transition-all cursor-pointer text-center ${
                      juniorTheme === item.id
                        ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-950 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4x4 幼儿启蒙卡片 */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                    4
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      4×4 幼儿启蒙
                    </div>
                    <div className="text-[10px] text-slate-400">
                      2×2 小宫 · 16格 · 适合 4~7 岁逻辑初探
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  aria-label="开始 4×4 入门对局"
                  onClick={() => onStartGame('easy', 'random', true, 4, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  入门 (轻量)
                </button>
                <button
                  type="button"
                  aria-label="开始 4×4 标准对局"
                  onClick={() => onStartGame('medium', 'random', true, 4, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  标准
                </button>
                <button
                  type="button"
                  aria-label="开始 4×4 挑战对局"
                  onClick={() => onStartGame('hard', 'random', true, 4, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  挑战
                </button>
              </div>
            </div>

            {/* 6x6 亲子进阶卡片 */}
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-black text-xs flex items-center justify-center">
                    6
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      6×6 亲子进阶
                    </div>
                    <div className="text-[10px] text-slate-400">
                      2×3 小六宫 · 36格 · 学习基础交叉排查
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  type="button"
                  aria-label="开始 6×6 入门对局"
                  onClick={() => onStartGame('easy', 'random', true, 6, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  入门
                </button>
                <button
                  type="button"
                  aria-label="开始 6×6 标准对局"
                  onClick={() => onStartGame('medium', 'random', true, 6, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  标准
                </button>
                <button
                  type="button"
                  aria-label="开始 6×6 挑战对局"
                  onClick={() => onStartGame('hard', 'random', true, 6, juniorTheme)}
                  className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-800 dark:text-slate-200 transition-all cursor-pointer active:scale-95"
                >
                  挑战
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. 底部极轻文字链接栏 (Quiet Footnote) */}
      <div className="flex items-center justify-center gap-3 pt-6 text-slate-500 dark:text-slate-400 text-xs">
        <button
          type="button"
          onClick={onOpenTechniques}
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="查阅解题技巧百科"
        >
          <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>解题技巧百科</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          type="button"
          onClick={() => onOpenStats('stats')}
          aria-label="查看战绩与排行榜"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          title="战绩与荣誉"
        >
          <Trophy className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>战绩</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">·</span>

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="打开游戏偏好设置"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="设置"
        >
          <Settings className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        <button
          type="button"
          onClick={onOpenHelp}
          aria-label="游戏规则与快捷键帮助"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="帮助"
        >
          <HelpCircle className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label="切换音效"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title={soundEnabled ? '音效开启' : '音效静音'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 stroke-[1.5] text-slate-800 dark:text-slate-200" /> : <VolumeX className="w-3.5 h-3.5 stroke-[1.5] text-slate-400" />}
        </button>

        <button
          type="button"
          onClick={onCycleTheme}
          aria-label="快速切换主题"
          className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer p-1"
          title="快速切换浅色/深色主题"
        >
          {isDark ? <Moon className="w-3.5 h-3.5 stroke-[1.5] text-slate-300" /> : <Sun className="w-3.5 h-3.5 stroke-[1.5] text-slate-700" />}
        </button>
      </div>
    </div>
  );
};
