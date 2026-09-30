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

  it('logs out to guest mode safely', () => {
    registerAccount('旅人', undefined, 'wind');
    expect(getCurrentUser().isGuest).toBe(false);

    const guest = logoutToGuest();
    expect(guest.isGuest).toBe(true);
    expect(getCurrentUser().isGuest).toBe(true);
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
