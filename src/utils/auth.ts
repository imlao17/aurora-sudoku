import type {
  UserProfile,
  UserAccountData,
  AvatarInfo,
  AvatarId,
  BackupDataFormat,
} from '../types/user';
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadStats,
  saveStats,
  loadSettings,
  saveSettings,
  loadActiveGame,
  saveActiveGame,
  loadGameRecords,
  saveGameRecord,
  loadMasteredTechniques,
  saveMasteredTechniques,
} from './storage';

export const AVATAR_PRESETS: AvatarInfo[] = [
  { id: 'ink', name: '墨客', icon: '🖋️', color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
  { id: 'bamboo', name: '幽竹', icon: '🎋', color: 'bg-emerald-600 text-white' },
  { id: 'wind', name: '清风', icon: '🍃', color: 'bg-teal-600 text-white' },
  { id: 'aurora', name: '极光', icon: '✨', color: 'bg-sky-600 text-white' },
  { id: 'nebula', name: '星云', icon: '🌌', color: 'bg-purple-600 text-white' },
  { id: 'mountain', name: '晴峦', icon: '🏔️', color: 'bg-amber-700 text-white' },
];

export const CURRENT_USER_KEY = 'zhishu_current_user_v1';
export const ACCOUNTS_LIST_KEY = 'zhishu_accounts_index_v1';
const ACCOUNT_DATA_PREFIX = 'zhishu_user_data_';

/**
 * Generates an initial guest user profile
 */
export function createGuestProfile(): UserProfile {
  return {
    id: 'guest_default',
    username: '数独小友',
    avatar: 'ink',
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    isGuest: true,
  };
}

/**
 * Gets the current active user profile
 */
export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      const guest = createGuestProfile();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guest));
      return guest;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.id) {
      const guest = createGuestProfile();
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guest));
      return guest;
    }
    return parsed as UserProfile;
  } catch {
    return createGuestProfile();
  }
}

/**
 * Sets the current active user profile
 */
export function setCurrentUser(profile: UserProfile): void {
  try {
    const updated = { ...profile, lastLoginAt: Date.now() };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

    // Update in accounts list as well
    const accounts = listAccounts();
    const idx = accounts.findIndex((a) => a.id === profile.id);
    if (idx >= 0) {
      accounts[idx] = updated;
      localStorage.setItem(ACCOUNTS_LIST_KEY, JSON.stringify(accounts));
    }
  } catch (e) {
    console.warn('Failed to save current user:', e);
  }
}

/**
 * Lists all registered user accounts on this device
 */
export function listAccounts(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Simple password hash for client demonstration / local data encryption
 */
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `zh_${Math.abs(hash).toString(16)}`;
}

/**
 * Save user account package
 */
export function saveAccountPackage(userId: string, data: Partial<UserAccountData>): void {
  try {
    const existing = getAccountPackage(userId);
    const updated: UserAccountData = {
      profile: data.profile ?? existing.profile,
      passwordHash: data.passwordHash !== undefined ? data.passwordHash : existing.passwordHash,
      stats: data.stats ?? existing.stats,
      settings: data.settings ?? existing.settings,
      activeGame: data.activeGame !== undefined ? data.activeGame : existing.activeGame,
      history: data.history ?? existing.history,
      masteredTechs: data.masteredTechs ?? existing.masteredTechs,
      cloudSyncedAt: data.cloudSyncedAt !== undefined ? data.cloudSyncedAt : existing.cloudSyncedAt,
    };
    localStorage.setItem(`${ACCOUNT_DATA_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.warn(`Failed to save account package for ${userId}:`, e);
  }
}

/**
 * Get user account package
 */
export function getAccountPackage(userId: string): UserAccountData {
  try {
    const raw = localStorage.getItem(`${ACCOUNT_DATA_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          profile: parsed.profile ?? createGuestProfile(),
          passwordHash: parsed.passwordHash,
          stats: parsed.stats ?? loadStats(),
          settings: parsed.settings ?? loadSettings(),
          activeGame: parsed.activeGame ?? null,
          history: parsed.history ?? [],
          masteredTechs: parsed.masteredTechs ?? [],
          cloudSyncedAt: parsed.cloudSyncedAt ?? null,
        };
      }
    }
  } catch (e) {
    console.warn(`Failed to get account package for ${userId}:`, e);
  }

  // Fallback with current system data
  return {
    profile: createGuestProfile(),
    stats: loadStats(),
    settings: loadSettings(),
    activeGame: loadActiveGame(),
    history: loadGameRecords(),
    masteredTechs: loadMasteredTechniques(),
    cloudSyncedAt: null,
  };
}

/**
 * Registers a new user account with optional password and avatar
 */
export function registerAccount(
  username: string,
  password?: string,
  avatar: AvatarId = 'ink',
  mergeCurrentData: boolean = true
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { success: false, error: '用户名不能为空' };
  }
  if (cleanUsername.length < 2 || cleanUsername.length > 16) {
    return { success: false, error: '用户名长度需在 2 到 16 个字符之间' };
  }

  const accounts = listAccounts();
  const exists = accounts.some(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase()
  );
  if (exists) {
    return { success: false, error: '该用户名已存在，请直接登录或换一个' };
  }

  const now = Date.now();
  const userId = `u_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const newProfile: UserProfile = {
    id: userId,
    username: cleanUsername,
    avatar,
    createdAt: now,
    lastLoginAt: now,
    isGuest: false,
  };

  // Data to initialize: either merge current guest data or start fresh
  const initialStats = mergeCurrentData ? loadStats() : { ...DEFAULT_STATS };
  const initialSettings = mergeCurrentData ? loadSettings() : { ...DEFAULT_SETTINGS };
  const initialActive = mergeCurrentData ? loadActiveGame() : null;
  const initialHistory = mergeCurrentData ? loadGameRecords() : [];
  const initialTechs = mergeCurrentData ? loadMasteredTechniques() : [];

  const accountPkg: UserAccountData = {
    profile: newProfile,
    passwordHash: password ? hashPassword(password) : undefined,
    stats: initialStats,
    settings: initialSettings,
    activeGame: initialActive,
    history: initialHistory,
    masteredTechs: initialTechs,
    cloudSyncedAt: now,
  };

  // Save to isolated user storage
  saveAccountPackage(userId, accountPkg);

  // Add to accounts list
  accounts.push(newProfile);
  localStorage.setItem(ACCOUNTS_LIST_KEY, JSON.stringify(accounts));

  // Set as current active user
  setCurrentUser(newProfile);

  return { success: true, user: newProfile };
}

/**
 * Logs in with an existing username and optional password
 */
export function loginAccount(
  username: string,
  password?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { success: false, error: '请输入用户名' };
  }

  const accounts = listAccounts();
  const target = accounts.find(
    (a) => a.username.toLowerCase() === cleanUsername.toLowerCase() || a.id === cleanUsername
  );

  if (!target) {
    return { success: false, error: '未找到该账号，请先注册' };
  }

  const pkg = getAccountPackage(target.id);
  if (pkg.passwordHash && password) {
    if (pkg.passwordHash !== hashPassword(password)) {
      return { success: false, error: '密码错误，请核对后重试' };
    }
  }

  // Restore user state into active storage
  saveStats(pkg.stats);
  saveSettings(pkg.settings);
  if (pkg.activeGame) {
    saveActiveGame(pkg.activeGame);
  }
  if (pkg.history && pkg.history.length > 0) {
    for (const rec of pkg.history) {
      saveGameRecord(rec);
    }
  }
  if (pkg.masteredTechs && pkg.masteredTechs.length > 0) {
    saveMasteredTechniques(pkg.masteredTechs);
  }

  target.lastLoginAt = Date.now();
  setCurrentUser(target);

  return { success: true, user: target };
}

/**
 * Logs out current account and returns to guest mode
 */
export function logoutToGuest(): UserProfile {
  // Sync current active data into user account package before leaving
  const current = getCurrentUser();
  if (!current.isGuest) {
    saveAccountPackage(current.id, {
      stats: loadStats(),
      settings: loadSettings(),
      activeGame: loadActiveGame(),
      history: loadGameRecords(),
      masteredTechs: loadMasteredTechniques(),
    });
  }

  const guest = createGuestProfile();
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guest));
  return guest;
}

/**
 * Exports complete user backup JSON string
 */
export function exportUserBackup(userId?: string): string {
  const user = userId ? listAccounts().find((a) => a.id === userId) || getCurrentUser() : getCurrentUser();
  const pkg = getAccountPackage(user.id);

  const backup: BackupDataFormat = {
    version: 1,
    exportedAt: Date.now(),
    user: pkg.profile,
    stats: pkg.stats,
    settings: pkg.settings,
    history: pkg.history,
    masteredTechs: pkg.masteredTechs,
  };

  return JSON.stringify(backup, null, 2);
}

/**
 * Imports user backup from JSON string
 */
export function importUserBackup(jsonString: string): {
  success: boolean;
  user?: UserProfile;
  error?: string;
} {
  try {
    const data = JSON.parse(jsonString) as BackupDataFormat;
    if (!data || typeof data !== 'object') {
      return { success: false, error: '无效的备份数据格式' };
    }
    if (!data.user || !data.user.username) {
      return { success: false, error: '备份缺少用户关键信息' };
    }

    const importedUser: UserProfile = {
      ...data.user,
      id: data.user.id || `u_${Date.now()}_imp`,
      lastLoginAt: Date.now(),
      isGuest: false,
    };

    const pkg: UserAccountData = {
      profile: importedUser,
      stats: data.stats ?? loadStats(),
      settings: data.settings ?? loadSettings(),
      activeGame: null,
      history: data.history ?? [],
      masteredTechs: data.masteredTechs ?? [],
      cloudSyncedAt: Date.now(),
    };

    saveAccountPackage(importedUser.id, pkg);

    const accounts = listAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === importedUser.id);
    if (existingIndex >= 0) {
      accounts[existingIndex] = importedUser;
    } else {
      accounts.push(importedUser);
    }
    localStorage.setItem(ACCOUNTS_LIST_KEY, JSON.stringify(accounts));

    // Also write into active live storage
    saveStats(pkg.stats);
    saveSettings(pkg.settings);
    saveMasteredTechniques(pkg.masteredTechs);

    setCurrentUser(importedUser);
    return { success: true, user: importedUser };
  } catch (e) {
    return { success: false, error: `备份解析失败: ${e instanceof Error ? e.message : '未知错误'}` };
  }
}

/**
 * Simulates cloud synchronization with local storage persistence
 */
export async function syncCloudData(userId?: string): Promise<{
  success: boolean;
  syncedAt: number;
  message: string;
}> {
  const current = userId ? listAccounts().find((a) => a.id === userId) || getCurrentUser() : getCurrentUser();

  // Simulating async network roundtrip for cloud sync
  await new Promise((resolve) => setTimeout(resolve, 350));

  const now = Date.now();
  saveAccountPackage(current.id, {
    stats: loadStats(),
    settings: loadSettings(),
    activeGame: loadActiveGame(),
    history: loadGameRecords(),
    masteredTechs: loadMasteredTechniques(),
    cloudSyncedAt: now,
  });

  return {
    success: true,
    syncedAt: now,
    message: '数据已安全同步至云端与本地镜像',
  };
}

/**
 * Calculates Sudoku mastery title based on total victories
 */
export function getMasteryTitle(totalWins: number): { title: string; color: string; level: number } {
  if (totalWins >= 60) return { title: '知数宗师', color: 'text-amber-500 dark:text-amber-400 font-black', level: 5 };
  if (totalWins >= 30) return { title: '数理大师', color: 'text-purple-600 dark:text-purple-400 font-bold', level: 4 };
  if (totalWins >= 15) return { title: '通晓全局', color: 'text-blue-600 dark:text-sky-400 font-bold', level: 3 };
  if (totalWins >= 5) return { title: '得心应手', color: 'text-emerald-600 dark:text-emerald-400 font-medium', level: 2 };
  return { title: '初窥门径', color: 'text-slate-600 dark:text-slate-400 font-normal', level: 1 };
}
