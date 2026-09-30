import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  LogOut,
  RefreshCw,
  Flame,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import type { UserProfile } from '../types/user';
import type { GameStats } from '../types/sudoku';
import {
  AVATAR_PRESETS,
  exportUserBackup,
  importUserBackup,
  syncCloudData,
  getMasteryTitle,
} from '../utils/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  user: UserProfile;
  stats: GameStats;
  masteredTechsCount: number;
  onClose: () => void;
  onLogout: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'switch') => void;
  onDataRestored?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  user,
  stats,
  masteredTechsCount,
  onClose,
  onLogout,
  onOpenAuth,
  onDataRestored,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showImportArea, setShowImportArea] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const totalWins = stats.easy.gamesWon + stats.medium.gamesWon + stats.hard.gamesWon;
  const mastery = getMasteryTitle(totalWins);
  const avatarInfo = AVATAR_PRESETS.find((p) => p.id === user.avatar) || AVATAR_PRESETS[0];

  const handleSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncCloudData(user.id);
      setSyncStatus(res.message);
      setTimeout(() => setSyncStatus(null), 3000);
    } catch {
      setSyncStatus('同步失败，请检查网络');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    const jsonStr = exportUserBackup(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zhishu_sudoku_backup_${user.username}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    if (!importText.trim()) {
      setImportError('请输入或粘贴备份 JSON 文本');
      return;
    }
    const res = importUserBackup(importText.trim());
    if (res.success) {
      setImportSuccess(true);
      setShowImportArea(false);
      setImportText('');
      setTimeout(() => {
        setImportSuccess(false);
        onDataRestored?.();
        onClose();
      }, 1000);
    } else {
      setImportError(res.error || '导入失败');
    }
  };

  const copyUserId = () => {
    navigator.clipboard?.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="个人中心与数据安全"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-md rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col text-slate-900 dark:text-slate-100 max-h-[92dvh] overflow-y-auto safe-pb">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
              个人账号与数据中心
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭个人中心"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/60 dark:to-slate-800/30 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-sm shrink-0">
              {avatarInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">
                  {user.username}
                </h3>
                {user.isGuest ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold">
                    游客
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-sky-950/60 dark:text-sky-300 font-semibold">
                    正式账号
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5 flex items-center gap-1.5">
                <span className="text-slate-400">段位称号:</span>
                <span className={mastery.color}>{mastery.title}</span>
              </p>
              <button
                type="button"
                onClick={copyUserId}
                className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-0.5 flex items-center gap-1 font-mono transition-colors cursor-pointer"
              >
                <span>ID: {user.id.slice(0, 14)}...</span>
                {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
              </button>
            </div>
          </div>

          {user.isGuest ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth('register');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold active:scale-95 transition-all shadow-sm shrink-0 cursor-pointer"
            >
              升级账号
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth('switch');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              切换账号
            </button>
          )}
        </div>

        {/* At-a-glance Stats */}
        <div className="grid grid-cols-4 gap-2 my-4 text-center">
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-slate-400 text-[10px] block font-medium">总通关局数</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
              {totalWins}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-slate-400 text-[10px] block font-medium">每日连胜</span>
            <span className="text-base font-bold tabular-nums text-amber-500 flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              {stats.dailyStreak}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-slate-400 text-[10px] block font-medium">最快解题</span>
            <span className="text-base font-bold tabular-nums text-slate-900 dark:text-white">
              {stats.easy.bestTime ? `${stats.easy.bestTime}s` : '--'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-slate-400 text-[10px] block font-medium">已学技巧</span>
            <span className="text-base font-bold tabular-nums text-blue-600 dark:text-sky-400">
              {masteredTechsCount}
            </span>
          </div>
        </div>

        {/* Cloud Sync & Backup Section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            云端安全同步与离线数据备份
          </h4>

          {syncStatus && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>{syncStatus}</span>
            </div>
          )}

          {importSuccess && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4" />
              <span>数据恢复成功！正在重新载入...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-850 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
            >
              <RefreshCw className={`w-5 h-5 text-blue-600 dark:text-sky-400 mb-1.5 ${syncing ? 'animate-spin' : ''}`} />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {syncing ? '正在同步...' : '立即云端同步'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">多设备数据对齐</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-850 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1.5" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                导出数据备份
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">保存本地 JSON</span>
            </button>
          </div>

          <div className="mt-1">
            {!showImportArea ? (
              <button
                type="button"
                onClick={() => setShowImportArea(true)}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>从备份文件或文本还原数据</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col gap-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>粘贴备份 JSON 内容</span>
                  <button
                    type="button"
                    onClick={() => setShowImportArea(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    取消
                  </button>
                </div>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="在此粘贴导出的备份数据 JSON..."
                  rows={3}
                  className="w-full p-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {importError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400">{importError}</p>
                )}
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm active:scale-98 transition-all cursor-pointer"
                >
                  确认还原
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {user.isGuest ? '当前以游客身份游玩' : '账号状态正常'}
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{user.isGuest ? '重置游客进度' : '退出登录'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
