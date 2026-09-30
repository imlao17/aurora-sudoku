import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatTime,
  loadSettings,
  saveSettings,
  loadStats,
  recordGameResult,
  saveActiveGame,
  loadActiveGame,
  clearActiveGame,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
} from '../src/utils/storage';

describe('Storage & Time Formatting Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatTime', () => {
    it('formats seconds into MM:SS correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(9)).toBe('00:09');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
      expect(formatTime(3599)).toBe('59:59');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('handles negative or NaN seconds safely', () => {
      expect(formatTime(-10)).toBe('00:00');
      expect(formatTime(NaN as unknown as number)).toBe('00:00');
    });
  });

  describe('Settings Storage', () => {
    it('returns default settings when storage is empty', () => {
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it('persists and loads customized settings', () => {
      saveSettings({
        ...DEFAULT_SETTINGS,
        soundEnabled: false,
        autoClearNotes: false,
      });
      const settings = loadSettings();
      expect(settings.soundEnabled).toBe(false);
      expect(settings.autoClearNotes).toBe(false);
    });

    it('recovers gracefully from corrupted JSON in localStorage', () => {
      localStorage.setItem('aurora_sudoku_settings_v1', 'not valid json {{{');
      const settings = loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });
  });

  describe('Stats Storage', () => {
    it('returns default stats when storage is empty', () => {
      const stats = loadStats();
      expect(stats).toEqual(DEFAULT_STATS);
    });

    it('records game victory and updates best time properly', () => {
      const res1 = recordGameResult('easy', 120, false);
      expect(res1.isNewBest).toBe(true);
      expect(res1.updatedStats.easy.gamesWon).toBe(1);
      expect(res1.updatedStats.easy.bestTime).toBe(120);

      const res2 = recordGameResult('easy', 90, false);
      expect(res2.isNewBest).toBe(true);
      expect(res2.updatedStats.easy.bestTime).toBe(90);

      const res3 = recordGameResult('easy', 150, false);
      expect(res3.isNewBest).toBe(false);
      expect(res3.updatedStats.easy.bestTime).toBe(90);
    });

    it('updates daily challenge streak and prevents duplicate counting for same day', () => {
      const dateStr = '2026-09-29';
      const res1 = recordGameResult('medium', 200, true, dateStr);
      expect(res1.updatedStats.dailyStreak).toBe(1);
      expect(res1.updatedStats.completedDailies).toContain(dateStr);

      // Same day completed again
      const res2 = recordGameResult('medium', 180, true, dateStr);
      expect(res2.updatedStats.dailyStreak).toBe(1); // Not incremented again
    });

    it('correctly increments streak on consecutive days and resets streak when days are skipped', () => {
      // Day 1
      const res1 = recordGameResult('medium', 200, true, '2026-09-28');
      expect(res1.updatedStats.dailyStreak).toBe(1);
      expect(res1.updatedStats.maxDailyStreak).toBe(1);

      // Day 2 (Consecutive)
      const res2 = recordGameResult('medium', 190, true, '2026-09-29');
      expect(res2.updatedStats.dailyStreak).toBe(2);
      expect(res2.updatedStats.maxDailyStreak).toBe(2);

      // Day 5 (Skipped 2 days, e.g. 2026-09-30 and 2026-10-01)
      const res3 = recordGameResult('medium', 210, true, '2026-10-02');
      expect(res3.updatedStats.dailyStreak).toBe(1); // Reset to 1
      expect(res3.updatedStats.maxDailyStreak).toBe(2); // Max streak preserved
    });
  });

  describe('Active Game State', () => {
    it('saves, loads, and clears active game state', () => {
      const mockState = {
        difficulty: 'medium' as const,
        gameMode: 'random' as const,
        board: Array.from({ length: 9 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => ({
            row: r,
            col: c,
            value: 0,
            solution: 0,
            isInitial: false,
            notes: [],
            isError: false,
          }))
        ),
        elapsedTime: 45,
        mistakesCount: 1,
        hintsRemaining: 2,
        hintsUsed: 1,
        isPaused: false,
        isCompleted: false,
      };

      saveActiveGame(mockState as any);
      const loaded = loadActiveGame();
      expect(loaded).not.toBeNull();
      expect(loaded?.elapsedTime).toBe(45);
      expect(loaded?.mistakesCount).toBe(1);

      clearActiveGame();
      expect(loadActiveGame()).toBeNull();
    });

    it('returns null on invalid board data', () => {
      localStorage.setItem('aurora_sudoku_active_game_v1', JSON.stringify({ board: 'invalid' }));
      expect(loadActiveGame()).toBeNull();
    });
  });
});
