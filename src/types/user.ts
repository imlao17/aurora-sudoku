import type { GameStats, GameSettings, ActiveGameState, GameRecord } from './sudoku';

export type AvatarId = 'ink' | 'bamboo' | 'wind' | 'aurora' | 'nebula' | 'mountain';

export interface AvatarInfo {
  id: AvatarId;
  name: string;
  icon: string; // Emoji or representation
  color: string;
}

export interface UserProfile {
  id: string;
  username: string;
  avatar: AvatarId;
  email?: string;
  createdAt: number;
  lastLoginAt: number;
  isGuest: boolean;
}

export interface UserAccountData {
  profile: UserProfile;
  passwordHash?: string;
  stats: GameStats;
  settings: GameSettings;
  activeGame: ActiveGameState | null;
  history: GameRecord[];
  masteredTechs: string[];
  cloudSyncedAt: number | null;
}

export interface BackupDataFormat {
  version: number;
  exportedAt: number;
  user: UserProfile;
  stats: GameStats;
  settings: GameSettings;
  history: GameRecord[];
  masteredTechs: string[];
}
