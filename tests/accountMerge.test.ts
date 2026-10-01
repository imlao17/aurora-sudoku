import { describe, it, expect } from 'vitest';
import {
  summarizeGuestData,
  mergeDifficultyStats,
  mergeGameStats,
  mergeGameRecords,
  mergeMasteredTechniques,
  mergeAccountPackageWithGuest,
} from '../src/utils/accountMerge';
import { getDefaultStats, DEFAULT_SETTINGS } from '../src/utils/storage';
import type { GameRecord, DifficultyStats } from '../src/types/sudoku';
import type { UserAccountData, UserProfile } from '../src/types/user';

describe('Account Data Merging System (accountMerge.ts)', () => {
  it('detects when guest session has no meaningful data', () => {
    const defaultStats = getDefaultStats();
    const summary = summarizeGuestData(defaultStats, [], []);
    expect(summary.hasData).toBe(false);
    expect(summary.totalGames).toBe(0);
    expect(summary.totalWins).toBe(0);
    expect(summary.totalAchievements).toBe(0);
  });

  it('detects when guest session has played games or achievements', () => {
    const stats = getDefaultStats();
    stats.easy.gamesPlayed = 3;
    stats.easy.gamesWon = 2;
    stats.achievements['first_win'] = { id: 'first_win', unlockedAt: '2026-09-28T10:00:00Z', progress: 1, maxProgress: 1 };

    const summary = summarizeGuestData(stats, [], ['hidden-single-box']);
    expect(summary.hasData).toBe(true);
    expect(summary.totalGames).toBe(3);
    expect(summary.totalWins).toBe(2);
    expect(summary.totalAchievements).toBe(1);
    expect(summary.totalMasteredTechs).toBe(1);
  });

  it('merges difficulty stats correctly including best time, win counts, and streaks', () => {
    const base: DifficultyStats = {
      gamesPlayed: 10,
      gamesWon: 8,
      bestTime: 180,
      totalTime: 1800,
      currentStreak: 2,
      maxStreak: 5,
    };

    const incoming: DifficultyStats = {
      gamesPlayed: 5,
      gamesWon: 4,
      bestTime: 120, // Better time!
      totalTime: 600,
      currentStreak: 4, // Higher streak!
      maxStreak: 4,
    };

    const merged = mergeDifficultyStats(base, incoming);
    expect(merged.gamesPlayed).toBe(15);
    expect(merged.gamesWon).toBe(12);
    expect(merged.totalTime).toBe(2400);
    expect(merged.bestTime).toBe(120);
    expect(merged.currentStreak).toBe(4);
    expect(merged.maxStreak).toBe(5);
  });

  it('handles null best times properly when merging difficulty stats', () => {
    const base: DifficultyStats = {
      gamesPlayed: 2,
      gamesWon: 0,
      bestTime: null,
      totalTime: 300,
      currentStreak: 0,
      maxStreak: 0,
    };

    const incoming: DifficultyStats = {
      gamesPlayed: 3,
      gamesWon: 1,
      bestTime: 250,
      totalTime: 400,
      currentStreak: 1,
      maxStreak: 1,
    };

    const merged = mergeDifficultyStats(base, incoming);
    expect(merged.bestTime).toBe(250);
  });

  it('merges daily streaks, completed dailies, daily win counts and achievements', () => {
    const accountStats = getDefaultStats();
    accountStats.dailyStreak = 3;
    accountStats.maxDailyStreak = 5;
    accountStats.lastDailyDate = '2026-09-28';
    accountStats.completedDailies = ['2026-09-27', '2026-09-28'];
    accountStats.dailyWinCounts = { '2026-09-28': 1 };
    accountStats.achievements = {
      streak_3: { id: 'streak_3', unlockedAt: '2026-09-28T10:00:00Z', progress: 3, maxProgress: 3 },
      first_win: { id: 'first_win', unlockedAt: '2026-09-27T10:00:00Z', progress: 1, maxProgress: 1 },
    };

    const guestStats = getDefaultStats();
    guestStats.dailyStreak = 2;
    guestStats.maxDailyStreak = 2;
    guestStats.lastDailyDate = '2026-09-30'; // Newer date!
    guestStats.completedDailies = ['2026-09-28', '2026-09-30']; // 2026-09-28 overlaps
    guestStats.dailyWinCounts = { '2026-09-28': 1, '2026-09-30': 2 };
    guestStats.achievements = {
      speed_demon: { id: 'speed_demon', unlockedAt: '2026-09-29T10:00:00Z', progress: 1, maxProgress: 1 },
      first_win: { id: 'first_win', unlockedAt: '2026-09-26T10:00:00Z', progress: 1, maxProgress: 1 },
    };

    const merged = mergeGameStats(accountStats, guestStats);
    expect(merged.dailyStreak).toBe(3);
    expect(merged.maxDailyStreak).toBe(5);
    expect(merged.lastDailyDate).toBe('2026-09-30');
    expect(merged.completedDailies).toEqual(['2026-09-27', '2026-09-28', '2026-09-30']);
    expect(merged.dailyWinCounts['2026-09-28']).toBe(2);
    expect(merged.dailyWinCounts['2026-09-30']).toBe(2);
    expect(merged.achievements['first_win'].unlockedAt).toBe('2026-09-26T10:00:00Z'); // earlier timestamp
    expect(merged.achievements['speed_demon'].unlockedAt).toBe('2026-09-29T10:00:00Z');
    expect(merged.achievements['streak_3'].unlockedAt).toBe('2026-09-28T10:00:00Z');
  });

  it('merges and deduplicates game records preserving latest timestamps', () => {
    const rec1: GameRecord = {
      id: 'rec_1',
      dateStr: '2026-09-28',
      difficulty: 'easy',
      gameMode: 'random',
      elapsedTime: 120,
      mistakesCount: 0,
      hintsUsed: 0,
      isVictory: true,
      timestamp: 1000,
    };
    const rec2: GameRecord = {
      id: 'rec_2',
      dateStr: '2026-09-29',
      difficulty: 'medium',
      gameMode: 'daily',
      elapsedTime: 240,
      mistakesCount: 1,
      hintsUsed: 0,
      isVictory: true,
      timestamp: 2000,
    };
    const rec3: GameRecord = {
      id: 'rec_3',
      dateStr: '2026-09-30',
      difficulty: 'hard',
      gameMode: 'random',
      elapsedTime: 360,
      mistakesCount: 2,
      hintsUsed: 1,
      isVictory: true,
      timestamp: 3000,
    };

    const accountHistory = [rec2, rec1];
    const guestHistory = [rec3, rec2]; // rec2 duplicate

    const merged = mergeGameRecords(accountHistory, guestHistory);
    expect(merged.length).toBe(3);
    expect(merged[0].id).toBe('rec_3'); // newest
    expect(merged[1].id).toBe('rec_2');
    expect(merged[2].id).toBe('rec_1');
  });

  it('merges mastered techniques union without duplicates', () => {
    const accountTechs = ['hidden-single-box', 'pointing-pair'];
    const guestTechs = ['pointing-pair', 'x-wing', 'skyscraper'];

    const merged = mergeMasteredTechniques(accountTechs, guestTechs);
    expect(merged).toContain('hidden-single-box');
    expect(merged).toContain('pointing-pair');
    expect(merged).toContain('x-wing');
    expect(merged).toContain('skyscraper');
    expect(merged.length).toBe(4);
  });

  it('merges entire account package with guest session', () => {
    const profile: UserProfile = {
      id: 'user_123',
      username: '棋坛老将',
      avatar: 'ink',
      createdAt: 1000,
      lastLoginAt: 1000,
      isGuest: false,
    };

    const accountPkg: UserAccountData = {
      profile,
      stats: getDefaultStats(),
      settings: DEFAULT_SETTINGS,
      activeGame: null,
      history: [],
      masteredTechs: ['hidden-single-box'],
      cloudSyncedAt: 1000,
    };
    accountPkg.stats.easy.gamesPlayed = 5;
    accountPkg.stats.easy.gamesWon = 5;

    const guestStats = getDefaultStats();
    guestStats.hard.gamesPlayed = 2;
    guestStats.hard.gamesWon = 2;

    const mergedPkg = mergeAccountPackageWithGuest(accountPkg, {
      stats: guestStats,
      history: [],
      masteredTechs: ['naked-pair'],
      activeGame: null,
    });

    expect(mergedPkg.stats.easy.gamesWon).toBe(5);
    expect(mergedPkg.stats.hard.gamesWon).toBe(2);
    expect(mergedPkg.masteredTechs).toEqual(['hidden-single-box', 'naked-pair']);
  });
});
