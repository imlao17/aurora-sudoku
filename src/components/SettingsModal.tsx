import React, { useRef, useEffect } from 'react';
import {
  X,
  Zap,
  ShieldAlert,
  Eye,
  Crosshair,
  Sparkles,
  CheckSquare,
  Wand2,
  Volume2,
  Palette,
  SlidersHorizontal,
  BookOpen,
} from 'lucide-react';
import type { GameSettings, ThemeType, SymbolTheme } from '../types/sudoku';

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
      name: '纯白纸墨',
      desc: '经典书报纯白底色，墨色线条，清爽通透',
      previewClass: 'bg-white border-slate-300 text-slate-900',
      isLight: true,
    },
    {
      id: 'zen',
      name: '极简和纸',
      desc: '温润米质柔光纸张，低反光柔和护眼',
      previewClass: 'bg-[#faf7f2] border-[#ded5c5] text-stone-900',
      isLight: true,
    },
    {
      id: 'aurora',
      name: '极光幻夜',
      desc: '纯黑墨韵暗色底，柔白字迹，夜读专注',
      previewClass: 'bg-slate-950 border-slate-700 text-slate-100',
      isLight: false,
    },
    {
      id: 'cyberpunk',
      name: '赛博霓虹',
      desc: '沉稳深夜暗底搭配对比度，清晰利落',
      previewClass: 'bg-zinc-950 border-zinc-800 text-zinc-100',
      isLight: false,
    },
  ];

  const items = [
    {
      key: 'fastInputMode' as const,
      label: '数字先行模式 (快速填数)',
      desc: '先点选数字激活画笔，再轻点空格快速连续落子',
      icon: <Zap className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.fastInputMode,
    },
    {
      key: 'realtimeErrorCheck' as const,
      label: '错误实时标红',
      desc: '填入错误数字时即时以墨色浅红警示',
      icon: <ShieldAlert className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.realtimeErrorCheck,
    },
    {
      key: 'highlightConflicts' as const,
      label: '冲突格高亮警示',
      desc: '同行、同列或同九宫格存在重复数字时高亮提示',
      icon: <Eye className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.highlightConflicts,
    },
    {
      key: 'highlightCross' as const,
      label: '同行同列同宫十字高亮',
      desc: '点选格子时光标十字交叉加亮相应行、列、宫',
      icon: <Crosshair className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.highlightCross,
    },
    {
      key: 'highlightSameNumbers' as const,
      label: '高亮相同数字',
      desc: '点选带数字的格子时，全盘相同数字均加亮提示',
      icon: <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.highlightSameNumbers,
    },
    {
      key: 'autoClearNotes' as const,
      label: '自动擦除笔记候选数',
      desc: '填入正确数字后，自动移除相连关联格的同名笔记',
      icon: <CheckSquare className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.autoClearNotes,
    },
    {
      key: 'autoFillLastRemaining' as const,
      label: '最后一个数字自动填充',
      desc: '当某行/列/宫仅剩最后一格，或全盘某数字已填满8个时，自动补全最后一个数字',
      icon: <Wand2 className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.autoFillLastRemaining,
    },
    {
      key: 'juniorMode' as const,
      label: '少儿启蒙引导模式',
      desc: '在卡点时提供温和启发点拨，弱化失误惩罚，适合儿童与亲子共学',
      icon: <Sparkles className="w-4 h-4 text-amber-500 stroke-[1.5]" />,
      checked: !!settings.juniorMode,
    },
    {
      key: 'showPinyinRuby' as const,
      label: '汉字显示拼音注音',
      desc: '在汉字模式下于字形上方标注声调拼音，辅助认字与拼读',
      icon: <BookOpen className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.showPinyinRuby !== false,
    },
    {
      key: 'soundEnabled' as const,
      label: '音效与震动反馈',
      desc: '落子、笔记、撤销与通关时的拟真微触震动与纸墨落子音效',
      icon: <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />,
      checked: settings.soundEnabled,
    },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="游戏偏好设置"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-md max-h-[90dvh] rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 flex flex-col text-slate-900 dark:text-slate-100 safe-pb overflow-y-auto">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
                游戏偏好设置
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">纸墨主题与辅助微调</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭偏好设置"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="my-3 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[62vh] overflow-y-auto pr-1">
          {/* Visual Theme Section */}
          <div className="pb-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500 stroke-[1.5]" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">纸墨护眼主题</span>
              </div>
              <span className="text-[10px] text-slate-400">现代极简</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateSettings({ theme: t.id })}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.theme === t.id
                      ? 'border-2 border-slate-900 bg-slate-50/80 dark:border-white dark:bg-white/10 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-full h-7 rounded-lg ${t.previewClass} mb-1.5 border flex items-center justify-center`}>
                    <span className="text-[10px] font-bold opacity-80">{t.isLight ? '浅色' : '深色'}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Symbol Theme Section */}
          <div className="py-3.5 border-t border-slate-100 dark:divide-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 stroke-[1.5]" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">棋盘符号与皮肤</span>
              </div>
              <span className="text-[10px] text-slate-400">支持 4×4 / 6×6 / 9×9</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { id: 'numbers' as SymbolTheme, name: '经典数字', preview: '1 2 3', desc: '标准数字' },
                { id: 'animals' as SymbolTheme, name: '可爱萌宠', preview: '🐱🐶🐰', desc: '动物认知' },
                { id: 'fruit' as SymbolTheme, name: '清爽蔬果', preview: '🍎🍌🍇', desc: '蔬果启蒙' },
                { id: 'pinyin' as SymbolTheme, name: '拼音启蒙', preview: 'a o e', desc: '声韵母认知' },
                { id: 'hanzi' as SymbolTheme, name: '东方汉字', preview: '春 夏 秋', desc: '国学汉字' },
              ].map((st) => {
                const isSelected = (settings.symbolTheme || 'numbers') === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onUpdateSettings({ symbolTheme: st.id })}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-amber-500 bg-amber-50/60 dark:border-amber-400 dark:bg-amber-950/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full h-7 rounded-lg bg-slate-100 dark:bg-slate-800 mb-1.5 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs tracking-wider">
                      <span>{st.preview}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{st.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{st.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle List */}
          {items.map((item) => (
            <div
              key={item.key}
              className="py-2.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
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
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  item.checked ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs transition duration-200 ease-in-out mt-0.5 ${
                    item.checked
                      ? 'bg-white dark:bg-slate-950 translate-x-5'
                      : 'bg-white dark:bg-slate-300 translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs active:scale-95 transition-all mt-2 cursor-pointer shadow-xs"
        >
          完成
        </button>
      </div>
    </div>
  );
};
