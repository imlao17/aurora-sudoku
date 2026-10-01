import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCurrentUser,
  registerAccount,
  loginAccount,
  logoutToGuest,
  listAccounts,
  exportUserBackup,
  importUserBackup,
  syncCloudData,
  getMasteryTitle,
} from '../src/utils/auth';

describe('User Authentication & Account Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default guest user if no session exists', () => {
    const user = getCurrentUser();
    expect(user.isGuest).toBe(true);
    expect(user.username).toBe('数独小友');
    expect(user.id).toBe('guest_default');
  });

  it('registers a new account and sets as active user', () => {
    const res = registerAccount('老十七玩家', 'pass123', 'bamboo', true);
    expect(res.success).toBe(true);
    expect(res.user?.username).toBe('老十七玩家');
    expect(res.user?.avatar).toBe('bamboo');
    expect(res.user?.isGuest).toBe(false);

    // Active user should now be the new user
    const current = getCurrentUser();
    expect(current.username).toBe('老十七玩家');
    expect(current.isGuest).toBe(false);

    // Accounts list contains this user
    const accounts = listAccounts();
    expect(accounts.length).toBe(1);
    expect(accounts[0].username).toBe('老十七玩家');
  });

  it('rejects duplicate usernames or invalid username lengths', () => {
    const emptyRes = registerAccount('   ');
    expect(emptyRes.success).toBe(false);

    const singleChar = registerAccount('A');
    expect(singleChar.success).toBe(false);

    registerAccount('测试独行侠');
    const dupRes = registerAccount('测试独行侠');
    expect(dupRes.success).toBe(false);
    expect(dupRes.error).toContain('已存在');
  });

  it('authenticates user on login with correct password', () => {
    registerAccount('高手玩家', 'securePass', 'aurora');
    logoutToGuest();

    expect(getCurrentUser().isGuest).toBe(true);

    // Wrong password
    const wrongRes = loginAccount('高手玩家', 'wrongPass');
    expect(wrongRes.success).toBe(false);
    expect(wrongRes.error).toContain('密码错误');

    // Correct password
    const okRes = loginAccount('高手玩家', 'securePass');
    expect(okRes.success).toBe(true);
    expect(getCurrentUser().username).toBe('高手玩家');
  });

  it('logs out to guest mode safely and resets live storage for privacy', () => {
    registerAccount('旅人', undefined, 'wind');
    expect(getCurrentUser().isGuest).toBe(false);

    // Save active game and some stats for this logged in user
    localStorage.setItem('aurora_sudoku_active_game_v1', JSON.stringify({ difficulty: 'easy', timer: 120 }));

    const guest = logoutToGuest();
    expect(guest.isGuest).toBe(true);
    expect(getCurrentUser().isGuest).toBe(true);

    // Verify live storage was cleared to protect privacy
    expect(localStorage.getItem('aurora_sudoku_active_game_v1')).toBeNull();

    // Verify stats in guest mode are reset to defaults
    const guestStats = JSON.parse(localStorage.getItem('aurora_sudoku_stats_v1') || '{}');
    expect(guestStats.easy?.gamesPlayed || 0).toBe(0);
  });

  it('merges guest progress when logging into an existing account', () => {
    // 1. Create registered user with 2 wins on easy
    registerAccount('老将', 'pass123');
    const userStats = {
      easy: { gamesPlayed: 2, gamesWon: 2, totalTime: 200, bestTime: 90, currentStreak: 2, maxStreak: 2 },
      medium: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      hard: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      expert: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      master: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      dailyStreak: 0,
      maxDailyStreak: 0,
      completedDailies: [],
      dailyWinCounts: {},
      achievements: {
        first_win: { id: 'first_win', unlockedAt: '2026-09-28T10:00:00Z', progress: 1, maxProgress: 1 },
      },
    };
    localStorage.setItem('aurora_sudoku_stats_v1', JSON.stringify(userStats));
    logoutToGuest();

    // 2. In guest session, play 3 games on easy with better bestTime, and unlock another achievement
    const guestStats = {
      easy: { gamesPlayed: 3, gamesWon: 3, totalTime: 180, bestTime: 50, currentStreak: 3, maxStreak: 3 },
      medium: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      hard: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      expert: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      master: { gamesPlayed: 0, gamesWon: 0, totalTime: 0, bestTime: null, currentStreak: 0, maxStreak: 0 },
      dailyStreak: 1,
      maxDailyStreak: 1,
      completedDailies: ['2026-10-01'],
      dailyWinCounts: { '2026-10-01': 1 },
      achievements: {
        streak_3: { id: 'streak_3', unlockedAt: '2026-10-01T10:00:00Z', progress: 3, maxProgress: 3 },
      },
    };
    localStorage.setItem('aurora_sudoku_stats_v1', JSON.stringify(guestStats));

    // 3. Log in with mergeGuestData = true
    const loginRes = loginAccount('老将', 'pass123', true);
    expect(loginRes.success).toBe(true);
    expect(loginRes.merged).toBe(true);

    // 4. Verify live stats are merged
    const mergedLiveStats = JSON.parse(localStorage.getItem('aurora_sudoku_stats_v1') || '{}');
    expect(mergedLiveStats.easy.gamesPlayed).toBe(5);
    expect(mergedLiveStats.easy.gamesWon).toBe(5);
    expect(mergedLiveStats.easy.bestTime).toBe(50); // better time preserved
    expect(mergedLiveStats.achievements.first_win.unlockedAt).toBe('2026-09-28T10:00:00Z');
    expect(mergedLiveStats.achievements.streak_3.unlockedAt).toBe('2026-10-01T10:00:00Z');
    expect(mergedLiveStats.completedDailies).toContain('2026-10-01');
  });

  it('exports user data backup and imports it back accurately', () => {
    registerAccount('备份达人', '123456', 'mountain');
    const backupJson = exportUserBackup();

    expect(backupJson).toContain('备份达人');
    expect(backupJson).toContain('mountain');

    // Clear storage and import
    localStorage.clear();
    const importRes = importUserBackup(backupJson);

    expect(importRes.success).toBe(true);
    expect(importRes.user?.username).toBe('备份达人');
    expect(getCurrentUser().username).toBe('备份达人');
  });

  it('syncs cloud data successfully with timestamp', async () => {
    registerAccount('云端探索者');
    const syncRes = await syncCloudData();

    expect(syncRes.success).toBe(true);
    expect(syncRes.syncedAt).toBeGreaterThan(0);
  });

  it('calculates mastery title according to games won count', () => {
    expect(getMasteryTitle(0).title).toBe('初窥门径');
    expect(getMasteryTitle(8).title).toBe('得心应手');
    expect(getMasteryTitle(20).title).toBe('通晓全局');
    expect(getMasteryTitle(45).title).toBe('数理大师');
    expect(getMasteryTitle(80).title).toBe('知数宗师');
  });
});
