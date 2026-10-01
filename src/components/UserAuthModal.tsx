import React, { useState } from 'react';
import { X, User, Lock, ArrowRight, UserPlus, LogIn, Users, Sparkles } from 'lucide-react';
import type { UserProfile, AvatarId } from '../types/user';
import { AVATAR_PRESETS, registerAccount, loginAccount, listAccounts, getLocalGuestSummary } from '../utils/auth';
import { FlatAvatar } from './FlatAvatar';

interface UserAuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'switch';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'switch'>(initialMode);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<AvatarId>('ink');
  const [mergeData, setMergeData] = useState(true);
  const [guestSummary, setGuestSummary] = useState(() => getLocalGuestSummary());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setUsername('');
      setPassword('');
      setAccounts(listAccounts());
      setGuestSummary(getLocalGuestSummary());
      setMergeData(true);
    }
  }

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = registerAccount(username, password, avatar, mergeData);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || '注册失败，请重试');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = loginAccount(username, password, mergeData);
    setLoading(false);

    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || '登录失败，请核对信息');
    }
  };

  const handleSwitchAccount = (targetUser: UserProfile) => {
    setErrorMsg(null);
    const res = loginAccount(targetUser.username, undefined, mergeData);
    if (res.success && res.user) {
      onSuccess(res.user);
      onClose();
    } else {
      setErrorMsg(res.error || '切换失败');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="账号登录与注册"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      {/* Container: Bottom-sheet on mobile, centered modal on tablet/desktop */}
      <div className="relative w-full max-w-md rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col text-slate-900 dark:text-slate-100 max-h-[92dvh] overflow-y-auto safe-pb">
        {/* Mobile Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200">
              {mode === 'register' ? <UserPlus className="w-4 h-4 stroke-[1.5]" /> : mode === 'switch' ? <Users className="w-4 h-4 stroke-[1.5]" /> : <LogIn className="w-4 h-4 stroke-[1.5]" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
                {mode === 'register' ? '注册个人账号' : mode === 'switch' ? '切换登录账号' : '登录知数账号'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'register' ? '创建专属账号，永久保存战绩与云端备份' : '登录后同步个人历史成绩与成就'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭账号弹窗"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl my-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => { setMode('switch'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              mode === 'switch'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            本设备账号 ({accounts.length})
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* 1. Register Mode */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            {/* Avatar selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                选择专属印章头像
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => {
                  const isSelected = avatar === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setAvatar(p.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-white/10 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                      title={p.name}
                    >
                      <FlatAvatar id={p.id} size="sm" className="mb-1" />
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                用户昵称
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 stroke-[1.5]" />
                <input
                  type="text"
                  required
                  placeholder="如：数独游侠"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={16}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                设置登录密码 (可选)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 stroke-[1.5]" />
                <input
                  type="password"
                  placeholder="为空时支持免密快速登录"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                />
              </div>
            </div>

            {/* Merge Guest Data if exists */}
            {guestSummary.hasData && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    发现本地游客游玩进度
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    已玩 {guestSummary.totalGames} 局 · 胜 {guestSummary.totalWins} 局
                  </span>
                </div>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeData}
                    onChange={(e) => setMergeData(e.target.checked)}
                    className="w-4 h-4 text-slate-900 dark:text-white rounded border-slate-300 focus:ring-slate-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    合并当前游客战绩、连胜和成就至新账号
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? '正在创建账号...' : '立即注册并登录'}</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        )}

        {/* 2. Login Mode */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                账号昵称 / 账号 ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 stroke-[1.5]" />
                <input
                  type="text"
                  required
                  placeholder="输入已注册的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                登录密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 stroke-[1.5]" />
                <input
                  type="password"
                  placeholder="若未设密码可留空"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/40"
                />
              </div>
            </div>

            {/* Merge Guest Data if exists */}
            {guestSummary.hasData && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    合并当前游客游玩记录
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    已玩 {guestSummary.totalGames} 局 · 胜 {guestSummary.totalWins} 局
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  包含 {guestSummary.totalAchievements} 项已解锁成就，登录时将智能合并最高分与成就。
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeData}
                    onChange={(e) => setMergeData(e.target.checked)}
                    className="w-4 h-4 text-slate-900 dark:text-white rounded border-slate-300 focus:ring-slate-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    登录时自动合并游客数据至该账号
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-bold text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? '正在验证登录...' : '确认登录'}</span>
              <ArrowRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </form>
        )}

        {/* 3. Switch Account Mode */}
        {mode === 'switch' && (
          <div className="flex flex-col gap-2">
            {guestSummary.hasData && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">
                  当前游客进度 ({guestSummary.totalGames} 局)
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mergeData}
                    onChange={(e) => setMergeData(e.target.checked)}
                    className="w-3.5 h-3.5 text-slate-900 dark:text-white rounded border-slate-300 focus:ring-slate-500"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-200">切换时合并</span>
                </label>
              </div>
            )}
            {accounts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                本设备尚未保存已注册账号，可先点击上方「注册」创建一个专属账号。
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSwitchAccount(acc)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FlatAvatar id={acc.avatar} size="md" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {acc.username}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            注册于 {new Date(acc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-900 dark:text-white font-semibold flex items-center gap-1">
                        切换 <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
