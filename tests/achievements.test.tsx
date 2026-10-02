import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import confetti from 'canvas-confetti';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import {
  evaluateAchievements,
  ACHIEVEMENTS_LIST,
  AchievementDef,
} from '../src/utils/achievements';
import { DEFAULT_STATS, recordGameResult, loadStats } from '../src/utils/storage';
import { StatsModal } from '../src/components/StatsModal';
import { AchievementToast } from '../src/components/AchievementToast';
import type { GameStats } from '../src/types/sudoku';

describe('Phase 3: Achievements & Statistics Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('evaluateAchievements Engine', () => {
    it('contains exactly 10 distinct achievement definitions with valid attributes', () => {
      expect(ACHIEVEMENTS_LIST.length).toBe(10);
      const ids = new Set(ACHIEVEMENTS_LIST.map((a) => a.id));
      expect(ids.size).toBe(10);

      ACHIEVEMENTS_LIST.forEach((ach) => {
        expect(ach.id).toBeTruthy();
        expect(ach.name).toBeTruthy();
        expect(ach.description).toBeTruthy();
        expect(ach.icon).toBeTruthy();
        expect(ach.maxProgress).toBeGreaterThan(0);
      });
    });

    it('unlocks "first_win" upon first game victory', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.easy.gamesWon = 1;

      const { newlyUnlocked, updatedStats } = evaluateAchievements(stats, {
        difficulty: 'easy',
        gameMode: 'random',
        timeTaken: 250,
        mistakesCount: 1,
        hintsUsed: 1,
        todayStr: '2026-09-29',
        actionType: 'win',
      });

      expect(newlyUnlocked.some((a) => a.id === 'first_win')).toBe(true);
      expect(updatedStats.achievements.first_win.unlockedAt).toBeTruthy();
      expect(updatedStats.achievements.first_win.progress).toBe(1);
    });

    it('evaluates "speed_demon" correctly based on 180s threshold', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.medium.gamesWon = 1;

      // > 180s -> should NOT unlock
      const resSlow = evaluateAchievements(stats, {
        difficulty: 'medium',
        timeTaken: 181,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resSlow.newlyUnlocked.some((a) => a.id === 'speed_demon')).toBe(false);

      // <= 180s -> should unlock
      const resFast = evaluateAchievements(stats, {
        difficulty: 'medium',
        timeTaken: 179,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resFast.newlyUnlocked.some((a) => a.id === 'speed_demon')).toBe(true);
      expect(resFast.updatedStats.achievements.speed_demon.unlockedAt).toBeTruthy();
    });

    it('evaluates "no_hint_hard" requiring hard difficulty and 0 hints', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.hard.gamesWon = 1;

      // Hard with 1 hint -> should NOT unlock
      const resWithHint = evaluateAchievements(stats, {
        difficulty: 'hard',
        hintsUsed: 1,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resWithHint.newlyUnlocked.some((a) => a.id === 'no_hint_hard')).toBe(false);

      // Easy with 0 hints -> should NOT unlock
      const resEasy = evaluateAchievements(stats, {
        difficulty: 'easy',
        hintsUsed: 0,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resEasy.newlyUnlocked.some((a) => a.id === 'no_hint_hard')).toBe(false);

      // Hard with 0 hints -> should unlock
      const resNoHint = evaluateAchievements(stats, {
        difficulty: 'hard',
        hintsUsed: 0,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resNoHint.newlyUnlocked.some((a) => a.id === 'no_hint_hard')).toBe(true);
    });

    it('evaluates "flawless" requiring 0 mistakes', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.easy.gamesWon = 1;

      const resWithMistake = evaluateAchievements(stats, {
        difficulty: 'easy',
        mistakesCount: 1,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resWithMistake.newlyUnlocked.some((a) => a.id === 'flawless')).toBe(false);

      const resFlawless = evaluateAchievements(stats, {
        difficulty: 'easy',
        mistakesCount: 0,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resFlawless.newlyUnlocked.some((a) => a.id === 'flawless')).toBe(true);
    });

    it('evaluates "daily_trio" based on calendar day win counts', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.dailyWinCounts['2026-09-29'] = 2;

      const res2Wins = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res2Wins.newlyUnlocked.some((a) => a.id === 'daily_trio')).toBe(false);
      expect(res2Wins.updatedStats.achievements.daily_trio?.progress).toBe(2);

      stats.dailyWinCounts['2026-09-29'] = 3;
      const res3Wins = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res3Wins.newlyUnlocked.some((a) => a.id === 'daily_trio')).toBe(true);
    });

    it('evaluates "weekly_streak" based on daily challenge streak >= 7', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.dailyStreak = 6;

      const res6Days = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res6Days.newlyUnlocked.some((a) => a.id === 'weekly_streak')).toBe(false);
      expect(res6Days.updatedStats.achievements.weekly_streak?.progress).toBe(6);

      stats.dailyStreak = 7;
      const res7Days = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res7Days.newlyUnlocked.some((a) => a.id === 'weekly_streak')).toBe(true);
    });

    it('unlocks "visual_learner" when exploring tutorial mode', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));

      const { newlyUnlocked, updatedStats } = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'explore_tutorial',
      });

      expect(newlyUnlocked.some((a) => a.id === 'visual_learner')).toBe(true);
      expect(updatedStats.achievements.visual_learner.unlockedAt).toBeTruthy();
    });

    it('evaluates "hard_master" on hard victory <= 480s', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.hard.gamesWon = 1;

      // Hard > 480s -> should NOT unlock
      const resSlow = evaluateAchievements(stats, {
        difficulty: 'hard',
        timeTaken: 485,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resSlow.newlyUnlocked.some((a) => a.id === 'hard_master')).toBe(false);

      // Hard <= 480s -> should unlock
      const resFast = evaluateAchievements(stats, {
        difficulty: 'hard',
        timeTaken: 479,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(resFast.newlyUnlocked.some((a) => a.id === 'hard_master')).toBe(true);
    });

    it('evaluates "all_rounder" requiring wins across easy, medium, and hard', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.easy.gamesWon = 2;
      stats.medium.gamesWon = 1;
      stats.hard.gamesWon = 0;

      const res2Tiers = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res2Tiers.newlyUnlocked.some((a) => a.id === 'all_rounder')).toBe(false);
      expect(res2Tiers.updatedStats.achievements.all_rounder?.progress).toBe(2);

      stats.hard.gamesWon = 1;
      const res3Tiers = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res3Tiers.newlyUnlocked.some((a) => a.id === 'all_rounder')).toBe(true);
    });

    it('evaluates "sudoku_fan" requiring 10 total wins', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.easy.gamesWon = 5;
      stats.medium.gamesWon = 4;
      stats.hard.gamesWon = 0; // total 9

      const res9Wins = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res9Wins.newlyUnlocked.some((a) => a.id === 'sudoku_fan')).toBe(false);
      expect(res9Wins.updatedStats.achievements.sudoku_fan?.progress).toBe(9);

      stats.hard.gamesWon = 1; // total 10
      const res10Wins = evaluateAchievements(stats, {
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res10Wins.newlyUnlocked.some((a) => a.id === 'sudoku_fan')).toBe(true);
    });

    it('supports unlocking multiple achievements at once and ensures idempotency', () => {
      const stats: GameStats = JSON.parse(JSON.stringify(DEFAULT_STATS));
      stats.hard.gamesWon = 1;

      // God-tier first game: Hard, 150 seconds, 0 mistakes, 0 hints
      const res1 = evaluateAchievements(stats, {
        difficulty: 'hard',
        timeTaken: 150,
        mistakesCount: 0,
        hintsUsed: 0,
        todayStr: '2026-09-29',
        actionType: 'win',
      });

      const unlockedIds = res1.newlyUnlocked.map((a) => a.id);
      expect(unlockedIds).toContain('first_win');
      expect(unlockedIds).toContain('speed_demon');
      expect(unlockedIds).toContain('no_hint_hard');
      expect(unlockedIds).toContain('flawless');
      expect(unlockedIds).toContain('hard_master');
      expect(res1.newlyUnlocked.length).toBe(5);

      // Subsequent identical evaluation should NOT re-trigger any of the 5 unlocked achievements
      const res2 = evaluateAchievements(res1.updatedStats, {
        difficulty: 'hard',
        timeTaken: 150,
        mistakesCount: 0,
        hintsUsed: 0,
        todayStr: '2026-09-29',
        actionType: 'win',
      });
      expect(res2.newlyUnlocked.length).toBe(0);
    });
  });

  describe('Storage Streaks & Daily Win Count Integration', () => {
    it('tracks per-difficulty currentStreak and maxStreak correctly', () => {
      const res1 = recordGameResult('hard', 300, false);
      expect(res1.updatedStats.hard.currentStreak).toBe(1);
      expect(res1.updatedStats.hard.maxStreak).toBe(1);

      const res2 = recordGameResult('hard', 280, false);
      expect(res2.updatedStats.hard.currentStreak).toBe(2);
      expect(res2.updatedStats.hard.maxStreak).toBe(2);

      const res3 = recordGameResult('hard', 260, false);
      expect(res3.updatedStats.hard.currentStreak).toBe(3);
      expect(res3.updatedStats.hard.maxStreak).toBe(3);

      const loaded = loadStats();
      expect(loaded.hard.currentStreak).toBe(3);
      expect(loaded.hard.maxStreak).toBe(3);
    });

    it('tracks dailyWinCounts per calendar date', () => {
      recordGameResult('easy', 100, false, '2026-09-29');
      recordGameResult('medium', 120, false, '2026-09-29');
      const res = recordGameResult('hard', 180, true, '2026-09-29');

      expect(res.updatedStats.dailyWinCounts['2026-09-29']).toBe(3);
      const loaded = loadStats();
      expect(loaded.dailyWinCounts['2026-09-29']).toBe(3);
    });
  });

  describe('<StatsModal /> Dual-Tab Component', () => {
    it('renders stats tab by default and switches difficulties', () => {
      const mockStats: GameStats = {
        ...DEFAULT_STATS,
        dailyStreak: 3,
        maxDailyStreak: 5,
        medium: {
          gamesPlayed: 10,
          gamesWon: 8,
          bestTime: 145,
          totalTime: 1600,
          currentStreak: 4,
          maxStreak: 6,
        },
      };

      const onClose = vi.fn();
      render(<StatsModal isOpen={true} stats={mockStats} onClose={onClose} />);

      expect(screen.getByText('数据与荣誉墙')).toBeDefined();
      expect(screen.getByText('数据看板')).toBeDefined();
      expect(screen.getByText('勋章荣誉')).toBeDefined();

      // Check medium stats
      expect(screen.getByText('02:25')).toBeDefined(); // bestTime: 145s = 02:25
      expect(screen.getByText('8 / 10')).toBeDefined();
      expect(screen.getByText('80%')).toBeDefined(); // win rate 80%
      expect(screen.getByText('4 连胜')).toBeDefined();

      // Switch to hard tab
      const hardTab = screen.getByText('困难');
      fireEvent.click(hardTab);
      expect(screen.getByText('0%')).toBeDefined();
      expect(screen.getByText('0 / 0')).toBeDefined();
    });

    it('switches to achievements tab and renders badge cards with progress', () => {
      const mockStats: GameStats = {
        ...DEFAULT_STATS,
        achievements: {
          first_win: {
            id: 'first_win',
            unlockedAt: '2026-09-29T10:00:00Z',
            progress: 1,
            maxProgress: 1,
          },
          sudoku_fan: {
            id: 'sudoku_fan',
            unlockedAt: null,
            progress: 4,
            maxProgress: 10,
          },
        },
      };

      const onClose = vi.fn();
      render(<StatsModal isOpen={true} stats={mockStats} onClose={onClose} />);

      // Switch to achievements tab
      const achTabBtn = screen.getByText('勋章荣誉');
      fireEvent.click(achTabBtn);

      expect(screen.getByText('达成荣誉徽章自动解锁')).toBeDefined();
      expect(screen.getByText('初出茅庐')).toBeDefined();
      expect(screen.getByText('已达成')).toBeDefined();
      expect(screen.getByText('数独狂热者')).toBeDefined();
      expect(screen.getByText('4/10')).toBeDefined(); // Progress indicator
    });

    it('honors initialTab="achievements" prop and responds to close actions', () => {
      const onClose = vi.fn();
      render(
        <StatsModal
          isOpen={true}
          stats={DEFAULT_STATS}
          initialTab="achievements"
          onClose={onClose}
        />
      );

      expect(screen.getByText('达成荣誉徽章自动解锁')).toBeDefined();

      // Close via close button
      fireEvent.click(screen.getByText('关闭'));
      expect(onClose).toHaveBeenCalledTimes(1);

      // Close via Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('returns null when isOpen is false', () => {
      const { container } = render(
        <StatsModal isOpen={false} stats={DEFAULT_STATS} onClose={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('<AchievementToast /> Notification Component', () => {
    const mockBadge: AchievementDef = {
      id: 'first_win',
      name: '初出茅庐',
      description: '完成任意一局数独对局（开启数独之旅）',
      icon: 'Award',
      category: 'beginner',
      maxProgress: 1,
    };

    it('returns null when achievements queue is empty', () => {
      const { container } = render(
        <AchievementToast achievements={[]} onClose={vi.fn()} onViewAll={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders toast with celebratory confetti and badge details', () => {
      const onClose = vi.fn();
      const onViewAll = vi.fn();

      render(
        <AchievementToast
          achievements={[mockBadge]}
          onClose={onClose}
          onViewAll={onViewAll}
        />
      );

      expect(confetti).toHaveBeenCalled();
      expect(screen.getByText('初出茅庐')).toBeDefined();
      expect(screen.getByText('完成任意一局数独对局（开启数独之旅）')).toBeDefined();
      expect(screen.getByText('成就解锁')).toBeDefined();

      // Click "太棒了！"
      fireEvent.click(screen.getByText('太棒了！'));
      expect(onClose).toHaveBeenCalledTimes(1);

      // Click "查看成就墙"
      fireEvent.click(screen.getByText('查看成就墙'));
      expect(onViewAll).toHaveBeenCalledTimes(1);
    });

    it('displays "+N 更多" badge when multiple achievements unlock at once', () => {
      const mockBadge2: AchievementDef = {
        id: 'speed_demon',
        name: '极速如风',
        description: '在 180 秒内飞速通关',
        icon: 'Zap',
        category: 'speed',
        maxProgress: 180,
      };

      render(
        <AchievementToast
          achievements={[mockBadge, mockBadge2]}
          onClose={vi.fn()}
          onViewAll={vi.fn()}
        />
      );

      expect(screen.getByText('+1 更多')).toBeDefined();
    });
  });
});
