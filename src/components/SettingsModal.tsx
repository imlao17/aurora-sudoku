import React, { useEffect, useRef } from 'react';
import type { GameSettings, ThemeType } from '../types/sudoku';
import { Settings, Volume2, Eye, ShieldAlert, Crosshair, CheckSquare, Sparkles, Zap, Palette, X, Wand2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  // Kept in a ref: callers pass an inline arrow and the app re-renders every
  // second while the clock runs, so depending on `onClose` directly would
  // re-create this listener (and re-steal focus) on every tick.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const themes: { id: ThemeType; name: string; desc: string; previewClass: string; isLight?: boolean }[] = [
    {
      id: 'nordic',
      name: '冰川纯白 (纯白浅色)',
      desc: '纯白底色搭配天蓝点缀，纯净扁平无反光',
      previewClass: 'bg-white border-slate-300 text-slate-900',
      isLight: true,
    },
    {
      id: 'zen',
      name: '极简和纸 (暖光浅色)',
      desc: '温润米质纸张与墨色笔触，柔和护眼',
      previewClass: 'bg-[#faf7f2] border-[#ded5c5] text-stone-900',
      isLight: true,
    },
    {
      id: 'matcha',
      name: '清爽抹茶 (清新浅色)',
      desc: '清新淡雅草木绿，舒适舒缓视觉疲劳',
      previewClass: 'bg-[#f2f7f4] border-[#d1e5d9] text-emerald-950',
      isLight: true,
    },
    {
      id: 'aurora',
      name: '极光幻夜 (默认深色)',
      desc: '深邃曜石黑搭配极光青蓝，经典深色',
      previewClass: 'bg-slate-950 border-slate-700 text-slate-100',
    },
    {
      id: 'cyberpunk',
      name: '赛博霓虹 (荧光深色)',
      desc: '深沉暗影与剧毒荧光绿，硬核未来感',
      previewClass: 'bg-[#020806] border-emerald-900 text-emerald-400',
    },
    {
      id: 'twilight',
      name: '暮光魅紫 (星云深色)',
      desc: '深空星云与流光紫罗兰，奢华静谧',
      previewClass: 'bg-[#090514] border-purple-900 text-purple-300',
    },
  ];

  const items = [
    {
      key: 'fastInputMode' as const,
      label: '数字先行模式 (快速填数)',
      desc: '先点选数字键盘激活数字，再连续轻点空格快速落子',
      icon: <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      checked: settings.fastInputMode,
    },
    {
      key: 'realtimeErrorCheck' as const,
      label: '错误实时标红',
      desc: '填入错误数字时即时以红色警示',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
      checked: settings.realtimeErrorCheck,
    },
    {
      key: 'highlightConflicts' as const,
      label: '冲突格高亮警示',
      desc: '同行、同列或同九宫格存在重复数字时标红提醒',
      icon: <Eye className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      checked: settings.highlightConflicts,
    },
    {
      key: 'highlightCross' as const,
      label: '同行同列同宫高亮',
      desc: '点选格子时光标十字交叉高亮相应行、列、宫',
      icon: <Crosshair className="w-4 h-4 text-blue-600 dark:text-sky-400" />,
      checked: settings.highlightCross,
    },
    {
      key: 'highlightSameNumbers' as const,
      label: '高亮相同数字',
      desc: '点选带数字的格子时，全盘相同数字均加亮提示',
      icon: <Sparkles className="w-4 h-4 text-blue-600 dark:text-sky-400" />,
      checked: settings.highlightSameNumbers,
    },
    {
      key: 'autoClearNotes' as const,
      label: '自动擦除笔记候选数',
      desc: '填入正确数字后，自动移除同行同列同宫相同的候选笔记',
      icon: <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      checked: settings.autoClearNotes,
    },
    {
      key: 'autoFillLastRemaining' as const,
      label: '最后空格自动补全 (唯一余数)',
      desc: '当某一行、某一列或九宫格只剩最后一个空格时，自动计算并填入',
      icon: <Wand2 className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
      checked: settings.autoFillLastRemaining,
    },
    {
      key: 'soundEnabled' as const,
      label: '音效与震动反馈',
      desc: '落子、笔记、撤销与通关时的拟真音效与轻触震动',
      icon: <Volume2 className="w-4 h-4 text-blue-600 dark:text-sky-400" />,
      checked: settings.soundEnabled,
    },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="游戏偏好设置"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-4 sm:p-6 flex flex-col text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                游戏偏好设置
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">视觉主题与交互微调</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭偏好设置"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 divide-y divide-slate-200 dark:divide-slate-800/60 max-h-[60vh] overflow-y-auto pr-1">
          {/* Visual Theme Section */}
          <div className="pb-4">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600 dark:text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">视觉主题风格 (浅色 / 深色)</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">扁平极简</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.theme === t.id
                      ? 'border-2 border-blue-500 bg-blue-50/60 dark:border-sky-400 dark:bg-sky-500/10'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-full h-7 rounded-lg ${t.previewClass} mb-1.5 border flex items-center justify-center`}>
                    <span className="text-[9px] font-bold opacity-80">{t.isLight ? '浅色' : '深色'}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle List */}
          {items.map((item) => (
            <div
              key={item.key}
              className="py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                    {item.desc}
                  </div>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={item.checked}
                aria-label={`切换${item.label}`}
                onClick={() => onUpdateSettings({ [item.key]: !item.checked })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.checked ? 'bg-blue-600 dark:bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    item.checked ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-medium text-xs border border-transparent dark:border-slate-700 active:scale-95 transition-all mt-2 cursor-pointer shadow-xs"
        >
          完成
        </button>
      </div>
    </div>
  );
};
