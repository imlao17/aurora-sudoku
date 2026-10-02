import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  GraduationCap,
  X,
  Search,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  BookOpen,
  Compass,
  Star,
  Layers,
  Eye,
  Brain,
  Target,
  Crosshair,
  Check,
  Gamepad2,
  HelpCircle,
} from 'lucide-react';
import {
  TECHNIQUES_DATA,
} from '../constants/techniques';
import {
  loadMasteredTechniques,
  toggleMasteredTechnique,
} from '../utils/storage';
import { soundManager } from '../utils/sound';

interface TechniquesModalProps {
  isOpen: boolean;
  initialTechniqueId?: string | null;
  onClose: () => void;
  onSelectForPractice?: (techniqueId: string) => void;
}

const KNOWLEDGE_CHECKS: Record<
  string,
  {
    question: string;
    options: { text: string; isCorrect: boolean }[];
    explanation: string;
  }
> = {
  'hidden-single-box': {
    question: '根据示例中第 2 行与第 1 列的交叉封锁，第 1 宫中数字 1 唯一能落子的坐标是？',
    options: [
      { text: 'A. R1C3 (第1行第3列)', isCorrect: true },
      { text: 'B. R2C2 (第2行第2列)', isCorrect: false },
      { text: 'C. R3C1 (第3行第1列)', isCorrect: false },
    ],
    explanation: '第 2 行的 1 封杀 (1,1) 与 (1,2)，第 1 列的 1 封杀 (2,0)，因此第 1 宫仅剩 R1C3 可填入 1！',
  },
  'hidden-single-line': {
    question: '在第 5 行中，待填空格为 (4,3)、(4,4)、(4,5)，数字 7 最终锁定在？',
    options: [
      { text: 'A. R5C5 (第5行第5列)', isCorrect: true },
      { text: 'B. R5C4 (第5行第4列)', isCorrect: false },
      { text: 'C. R5C6 (第5行第6列)', isCorrect: false },
    ],
    explanation: '第 4 列已有 7 封锁 (4,3)，第 6 列已有 7 封锁 (4,5)，因此第 5 行中 7 只能填在 R5C5！',
  },
  'naked-single': {
    question: '中心格 (4,4) 同行、同列和同宫已占有 8 个不同数字，该格唯一的余数是？',
    options: [
      { text: 'A. 数字 5', isCorrect: true },
      { text: 'B. 数字 7', isCorrect: false },
      { text: 'C. 数字 9', isCorrect: false },
    ],
    explanation: '同行占 1,2,3，同列占 4,6,7，同九宫格占 8,9，唯独缺少 5，因此唯一余数锁定为 5！',
  },
  'pointing-pair': {
    question: '第 1 宫内数字 4 局限在第 2 行的 (1,1) 和 (1,2)，由此可对第 2 行其他宫排除哪个候选数？',
    options: [
      { text: 'A. 排除 (1,5) 与 (1,7) 中的候选数 4', isCorrect: true },
      { text: 'B. 排除第 1 宫内所有的数字 7', isCorrect: false },
      { text: 'C. 锁定 (1,5) 必填入 4', isCorrect: false },
    ],
    explanation: '第 1 宫形成了指向数对锁定第 2 行的 4，因此同行的外侧空格绝不能再出现候选数 4！',
  },
  'box-line-reduction': {
    question: '第 4 行的候选数 6 全部分布在第 4 宫内，由此可对第 4 宫产生何种排除？',
    options: [
      { text: 'A. 排除第 4 宫内其他行 (4,1) 与 (5,2) 的候选数 6', isCorrect: true },
      { text: 'B. 锁定 (3,1) 直接落子 6', isCorrect: false },
      { text: 'C. 排除整列的候选数 6', isCorrect: false },
    ],
    explanation: '第 4 行的 6 必然由第 4 宫提供，因此第 4 宫内其他行的格子绝不可能为 6！',
  },
  'naked-pair': {
    question: '在第 3 行中，(2,1) 和 (2,5) 组成 [3,8] 显性数对，同行 (2,3) 排除 3,8 后直得哪个数字？',
    options: [
      { text: 'A. 唯余直出数字 5', isCorrect: true },
      { text: 'B. 唯余直出数字 3', isCorrect: false },
      { text: 'C. 唯余直出数字 8', isCorrect: false },
    ],
    explanation: '(2,3) 原候选数为 [3,5,8]，显性数对瓜分了 3 和 8，因此该格排除后露出唯余 5！',
  },
  'hidden-pair': {
    question: '第 7 行中数字 2 和 7 仅在 (6,2) 与 (6,7) 出现，隐性数对提纯后应清除哪些杂质数？',
    options: [
      { text: 'A. 清除 (6,2) 的 4,9 与 (6,7) 的 5', isCorrect: true },
      { text: 'B. 清除整行的数字 2 和 7', isCorrect: false },
      { text: 'C. 清除 (6,2) 中的 2 和 7', isCorrect: false },
    ],
    explanation: '2 和 7 形成隐性数对占据这两格，格内除了 2 和 7 之外的多余杂质数必须彻底清除！',
  },
  'naked-triple': {
    question: '第 5 列三格候选数分别为 [2,4]、[4,9]、[2,9] 构成显性三数组，同列其他格排除后可直接确定什么？',
    options: [
      { text: 'A. (2,4) 直出 5，(6,4) 直出 7', isCorrect: true },
      { text: 'B. (2,4) 锁定为 2', isCorrect: false },
      { text: 'C. 三格全部填 9', isCorrect: false },
    ],
    explanation: '三数组锁定 {2,4,9}，同列其他格排除这三数后立刻暴露出唯余数字 5 和 7！',
  },
  'x-wing': {
    question: '数字 5 在第 2 行与第 7 行仅出现在第 3 列与第 8 列，X-Wing 排除的具体方向是？',
    options: [
      { text: 'A. 纵向排除第 3 列与第 8 列其他所有行的候选数 5', isCorrect: true },
      { text: 'B. 横向排除第 2 行与第 7 行的所有已知数字', isCorrect: false },
      { text: 'C. 排除九宫格内的对角线数字', isCorrect: false },
    ],
    explanation: '两行承包了两列的 5，因此这两列上下纵深的其他所有候选数 5 全部被天网封杀！',
  },
  'xy-wing': {
    question: '枢纽格为 [1,2]，两翼为 [1,9] 和 [2,9]，两翼共同视线交汇格 (7,7) 能排除哪个候选数？',
    options: [
      { text: 'A. 排除公共候选数 9', isCorrect: true },
      { text: 'B. 排除公共候选数 1', isCorrect: false },
      { text: 'C. 锁定填入数字 9', isCorrect: false },
    ],
    explanation: '二难推理：枢纽无论填 1 还是 2，两翼必有一翼填 9，因此共同交点绝不可能为 9！',
  },
  'swordfish': {
    question: '数字 3 在第 2、5、8 行中仅分布在第 2、5、9 列（三行锁三列），产生的影响是？',
    options: [
      { text: 'A. 纵向全线清除第 2、5、9 列其余所有格子的候选数 3', isCorrect: true },
      { text: 'B. 直接在这 9 个交点全部填入 3', isCorrect: false },
      { text: 'C. 排除对角线上所有的数字 3', isCorrect: false },
    ],
    explanation: '三行锁定三列，列上的 3 已被独占，因此对第 2、5、9 列全线排除其他候选数 3！',
  },
  'hidden-triple': {
    question: '第 5 宫中候选数 2, 5, 7 仅分布在 (3,4)、(4,4) 和 (5,4)，隐性三数组纯化后应清除哪些候选数？',
    options: [
      { text: 'A. 清除 (3,4) 的 6,8，(4,4) 的 9，(5,4) 的 8', isCorrect: true },
      { text: 'B. 清除整宫所有的 2, 5, 7', isCorrect: false },
      { text: 'C. 直接在 (3,4) 填入 2', isCorrect: false },
    ],
    explanation: '2, 5, 7 独占了这三格，格内混杂的 6, 8, 9 杂质候选必须全部被清除！',
  },
  'naked-quad': {
    question: '第 2 行中四格候选并集为 {1,3,6,8} 形成显性四数组，(1,5) 原候选数为 [3,8,9]，排除后将直出什么？',
    options: [
      { text: 'A. 唯余直出数字 9', isCorrect: true },
      { text: 'B. 唯余直出数字 3', isCorrect: false },
      { text: 'C. 依然保留 8', isCorrect: false },
    ],
    explanation: '四数组锁定了 1, 3, 6, 8，(1,5) 剔除 3 和 8 干扰后露出唯一候选 9！',
  },
  'hidden-quad': {
    question: '第 4 列中数字 1, 4, 7, 9 仅分布在四格中构成隐性四数组，(5,3) 原候选为 [4,8,9]，清洗后保留？',
    options: [
      { text: 'A. 保留纯净候选 [4, 9]，清除 8', isCorrect: true },
      { text: 'B. 保留 8，清除 4 和 9', isCorrect: false },
      { text: 'C. 直接填入数字 8', isCorrect: false },
    ],
    explanation: '1, 4, 7, 9 独占四格，杂质候选 8 必须被清除，仅保留 [4, 9]！',
  },
  'skyscraper': {
    question: '摩天楼地基为 (1,2) 和 (5,2)，楼顶为 (1,7) 和 (5,5)，交汇格 (1,5) 能排除哪个候选数？',
    options: [
      { text: 'A. 排除候选数 4', isCorrect: true },
      { text: 'B. 排除候选数 7', isCorrect: false },
      { text: 'C. 直接填入 4', isCorrect: false },
    ],
    explanation: '两座楼顶必有一真，与两楼顶同时产生视线交汇的 (1,5) 绝不能是 4！',
  },
  'two-string-kite': {
    question: '双飞燕宫内端为 (2,2) 与 (1,2)，外端为 (2,7) 与 (6,2)，十字交汇格 (6,7) 排除什么？',
    options: [
      { text: 'A. 排除候选数 6', isCorrect: true },
      { text: 'B. 排除候选数 2', isCorrect: false },
      { text: 'C. 锁定填入 6', isCorrect: false },
    ],
    explanation: '外端两点必有一真，十字交汇格 (6,7) 绝不可为 6，成功排除！',
  },
  'unique-rectangle': {
    question: '致命矩形四角为 (1,1)=[3,7]、(1,4)=[3,7]、(2,1)=[3,7]，第四角 (2,4)=[3,7,8]，根据唯一解法则：',
    options: [
      { text: 'A. (2,4) 排除 3,7，直接定解为 8', isCorrect: true },
      { text: 'B. (2,4) 只能填 3', isCorrect: false },
      { text: 'C. 整题无解', isCorrect: false },
    ],
    explanation: '为规避致命矩形多解死局，第四角绝不能落入 3 或 7，排除后直出真值 8！',
  },
  'empty-rectangle': {
    question: '第 3 宫内候选数 2 呈空矩形，结合第 9 行 (8,2)-(8,7) 强链，交叉格 (1,2) 消除什么？',
    options: [
      { text: 'A. 排除候选数 2', isCorrect: true },
      { text: 'B. 排除候选数 8', isCorrect: false },
      { text: 'C. 直接填入 2', isCorrect: false },
    ],
    explanation: '通过空矩形分流推理，交点 (1,2) 无论如何都不能为 2，成功剔除！',
  },
  'w-wing': {
    question: '两翼格 (1,1) 与 (6,7) 候选均为 [3,8]，由数字 3 强链连接，共同交点 (1,7) 排除什么？',
    options: [
      { text: 'A. 排除候选数 8', isCorrect: true },
      { text: 'B. 排除候选数 3', isCorrect: false },
      { text: 'C. 直接填入 8', isCorrect: false },
    ],
    explanation: '两翼必有一格填 8，共同视野下的 (1,7) 绝不可为 8！',
  },
  'finned-x-wing': {
    question: '鳍状 X-Wing 的鱼鳍位于 (7,7)，鱼身在第 9 列，(6,8) 同时在第 9 列且与鱼鳍同宫，消除？',
    options: [
      { text: 'A. 排除候选数 7', isCorrect: true },
      { text: 'B. 排除所有已知数', isCorrect: false },
      { text: 'C. 判定整盘题目出错', isCorrect: false },
    ],
    explanation: '无论鱼鳍是否生效，(6,8) 均被严格封锁，候选数 7 必定排除！',
  },
  'jellyfish': {
    question: '数字 1 在四行中仅出现在第 2、4、7、9 列形成水母阵，其他行的这四列中应执行什么？',
    options: [
      { text: 'A. 纵向排除所有其他格子中的候选数 1', isCorrect: true },
      { text: 'B. 填入所有空格', isCorrect: false },
      { text: 'C. 排除整行的数字', isCorrect: false },
    ],
    explanation: '四行四列天罗地网，这四列的其他所有候选数 1 全部被全线封杀！',
  },
  'xyz-wing': {
    question: 'XYZ-Wing 枢纽为 (1,1)=[1,4,5]，翼格为 (2,2)=[1,5] 与 (1,7)=[4,5]，交汇格 (1,2) 排除？',
    options: [
      { text: 'A. 排除候选数 5', isCorrect: true },
      { text: 'B. 排除候选数 1', isCorrect: false },
      { text: 'C. 直接填入 4', isCorrect: false },
    ],
    explanation: '无论枢纽取 1, 4 还是 5，交点 (1,2) 均不可为 5，成功剔除！',
  },
  'xy-chain': {
    question: 'XY-Chain 链首为 (1,1)[2,6]，链尾为 (7,3)[9,2]，交点 (1,3) 同时看到首尾两端，应排除？',
    options: [
      { text: 'A. 排除候选数 2', isCorrect: true },
      { text: 'B. 排除候选数 6', isCorrect: false },
      { text: 'C. 判定此链无效', isCorrect: false },
    ],
    explanation: '首尾两端必有一端为 2，共同视野下的 (1,3) 绝不可为 2！',
  },
};

const CATEGORY_COUNTS = {
  basic: TECHNIQUES_DATA.filter((t) => t.category === 'basic').length,
  intermediate: TECHNIQUES_DATA.filter((t) => t.category === 'intermediate').length,
  advanced: TECHNIQUES_DATA.filter((t) => t.category === 'advanced').length,
};

export const TechniquesModal: React.FC<TechniquesModalProps> = ({
  isOpen,
  initialTechniqueId,
  onClose,
  onSelectForPractice,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTechniqueId, setActiveTechniqueId] = useState<string>(
    initialTechniqueId || TECHNIQUES_DATA[0].id
  );
  // On mobile viewports (< 768px), allow toggling between list and detail
  const [mobileDetailView, setMobileDetailView] = useState<boolean>(
    Boolean(initialTechniqueId)
  );

  // Mastered techniques list tracking
  const [masteredIds, setMasteredIds] = useState<string[]>(() => loadMasteredTechniques());
  const [selectedDemoCell, setSelectedDemoCell] = useState<{ row: number; col: number } | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const [prevInitialTechniqueId, setPrevInitialTechniqueId] = useState(initialTechniqueId);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (initialTechniqueId !== prevInitialTechniqueId || isOpen !== prevIsOpen) {
    setPrevInitialTechniqueId(initialTechniqueId);
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialTechniqueId) {
        const match = TECHNIQUES_DATA.find((t) => t.id === initialTechniqueId);
        if (match) {
          setActiveTechniqueId(match.id);
        }
        setMobileDetailView(true);
      } else {
        setMobileDetailView(false);
      }
    }
  }

  const modalRef = useRef<HTMLDivElement>(null);
  // Ref, not a dependency: the parent re-renders every second while the clock
  // runs, and re-running this effect would steal focus back out of the search
  // box mid-typing.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Escape handling
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileDetailView) {
          setMobileDetailView(false);
        } else {
          onCloseRef.current();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, mobileDetailView]);

  // Reset quiz state when active technique changes
  const [prevActiveId, setPrevActiveId] = useState(activeTechniqueId);
  if (activeTechniqueId !== prevActiveId) {
    setPrevActiveId(activeTechniqueId);
    setQuizSelectedOption(null);
    setQuizFeedback(null);
    setSelectedDemoCell(null);
  }

  // Filtered technique list
  const filteredTechniques = useMemo(() => {
    return TECHNIQUES_DATA.filter((tech) => {
      let matchesCategory = true;
      if (selectedCategoryId === 'mastered') {
        matchesCategory = masteredIds.includes(tech.id);
      } else if (selectedCategoryId === 'unmastered') {
        matchesCategory = !masteredIds.includes(tech.id);
      } else if (selectedCategoryId !== 'all') {
        matchesCategory = tech.category === selectedCategoryId;
      }
      const matchesQuery =
        !searchQuery.trim() ||
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategoryId, searchQuery, masteredIds]);

  const activeTechnique = useMemo(() => {
    const inFiltered = filteredTechniques.find((t) => t.id === activeTechniqueId);
    if (inFiltered) return inFiltered;
    return filteredTechniques[0] || TECHNIQUES_DATA[0];
  }, [activeTechniqueId, filteredTechniques]);

  const example = activeTechnique.example;
  const isMastered = masteredIds.includes(activeTechnique.id);
  const currentQuiz = KNOWLEDGE_CHECKS[activeTechnique.id];

  const handleToggleMastered = (techId: string) => {
    const { isMastered: nowMastered, allMastered } = toggleMasteredTechnique(techId);
    setMasteredIds(allMastered);
    if (nowMastered) {
      soundManager.playVictory();
    } else {
      soundManager.playSelect();
    }
  };

  const handleAnswerQuiz = (index: number, isCorrect: boolean) => {
    setQuizSelectedOption(index);
    if (isCorrect) {
      setQuizFeedback('correct');
      soundManager.playVictory();
      if (!masteredIds.includes(activeTechnique.id)) {
        const { allMastered } = toggleMasteredTechnique(activeTechnique.id);
        setMasteredIds(allMastered);
      }
    } else {
      setQuizFeedback('incorrect');
      soundManager.playError();
    }
  };

  const cellNotesMap = useMemo(() => {
    const map = new Map<string, number[]>();
    if (example.cellNotes) {
      for (const cn of example.cellNotes) {
        map.set(`${cn.row}-${cn.col}`, cn.candidates);
      }
    }
    return map;
  }, [example]);

  const targetMap = useMemo(() => {
    const map = new Map<string, (typeof example.targetCells)[0]>();
    for (const tc of example.targetCells) {
      map.set(`${tc.row}-${tc.col}`, tc);
    }
    return map;
  }, [example]);

  const causeMap = useMemo(() => {
    const map = new Map<string, (typeof example.causeCells)[0]>();
    for (const cc of example.causeCells) {
      map.set(`${cc.row}-${cc.col}`, cc);
    }
    return map;
  }, [example]);

  const eliminatedMap = useMemo(() => {
    const map = new Map<string, NonNullable<typeof example.eliminatedCandidates>>();
    if (example.eliminatedCandidates) {
      for (const ec of example.eliminatedCandidates) {
        const key = `${ec.row}-${ec.col}`;
        const existing = map.get(key) || [];
        existing.push(ec);
        map.set(key, existing);
      }
    }
    return map;
  }, [example]);

  const groupedEliminations = useMemo(() => {
    if (!example.eliminatedCandidates || example.eliminatedCandidates.length === 0) {
      return [];
    }
    const grouped = new Map<
      string,
      { row: number; col: number; candidates: number[]; remaining?: number[] }
    >();
    for (const ec of example.eliminatedCandidates) {
      const key = `${ec.row}-${ec.col}`;
      const existing = grouped.get(key);
      if (existing) {
        if (!existing.candidates.includes(ec.candidate)) {
          existing.candidates.push(ec.candidate);
        }
        if (ec.remainingNotes) {
          existing.remaining = ec.remainingNotes;
        }
      } else {
        grouped.set(key, {
          row: ec.row,
          col: ec.col,
          candidates: [ec.candidate],
          remaining: ec.remainingNotes,
        });
      }
    }
    return Array.from(grouped.values());
  }, [example]);

  if (!isOpen) return null;

  const renderStars = (count: number) => {
    return (
      <div className="flex items-center gap-0.5" title={`难度星级: ${count} 星`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 stroke-[1.5] ${
              star <= count
                ? 'text-amber-500 fill-amber-500'
                : 'text-slate-300 dark:text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  const filterTabs = [
    { id: 'all', label: '全部技巧' },
    { id: 'mastered', label: `已掌握 (${masteredIds.length})` },
    { id: 'unmastered', label: `待学习 (${TECHNIQUES_DATA.length - masteredIds.length})` },
    { id: 'basic', label: `入门基础 (${CATEGORY_COUNTS.basic})` },
    { id: 'intermediate', label: `进阶战术 (${CATEGORY_COUNTS.intermediate})` },
    { id: 'advanced', label: `大师高阶 (${CATEGORY_COUNTS.advanced})` },
  ];

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="数独解题技巧宝典"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none"
    >
      <div className="relative w-full max-w-4xl h-[94dvh] sm:h-[92dvh] max-h-[820px] rounded-t-[28px] sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100 safe-pb">
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700 mx-auto mt-2 mb-1 shrink-0 sm:hidden" />

        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-xs">
              <GraduationCap className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white leading-tight">
                  数独解题方法百科
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-semibold hidden sm:inline">
                  已掌握 {masteredIds.length}/{TECHNIQUES_DATA.length} (
                  {Math.round((masteredIds.length / TECHNIQUES_DATA.length) * 100)}%)
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                从基础摒除到大师 X-Wing，系统逻辑推演与图解教学
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="关闭技巧宝典"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="px-4 sm:px-6 py-2 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Category & Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {filterTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryId === cat.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 stroke-[1.5] absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索方法口诀..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Modal Main Body: 2 Columns on desktop, toggled view on mobile */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Column 1: Technique Catalog List */}
          <div
            className={`w-full md:w-72 lg:w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto shrink-0 divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-2.5 space-y-1 ${
              mobileDetailView ? 'hidden md:block' : 'block'
            }`}
          >
            {filteredTechniques.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
                未找到匹配的方法，换个关键词或分类试试
              </div>
            ) : (
              filteredTechniques.map((tech) => {
                const isActive = tech.id === activeTechnique.id;
                const techMastered = masteredIds.includes(tech.id);

                return (
                  <button
                    key={tech.id}
                    onClick={() => {
                      setActiveTechniqueId(tech.id);
                      setMobileDetailView(true);
                    }}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1 border ${
                      isActive
                        ? 'bg-slate-100/90 border-slate-900 dark:bg-slate-800 dark:border-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200/80 dark:bg-slate-900 dark:hover:bg-slate-850 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`text-xs font-bold truncate ${
                            isActive
                              ? 'text-slate-950 dark:text-white'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {tech.name}
                        </span>
                        {techMastered ? (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-[9px]">
                            <Check className="w-2.5 h-2.5 stroke-[2]" />
                            <span>已掌握</span>
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 font-medium text-[9px]">
                            待学
                          </span>
                        )}
                      </div>
                      {renderStars(tech.difficultyStars)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-[9px] opacity-80">
                        {tech.englishName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {tech.category === 'basic'
                          ? '基础'
                          : tech.category === 'intermediate'
                          ? '进阶'
                          : '高阶'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 m-0 pt-0.5">
                      {tech.tagline}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Column 2: Technique Detail View & Interactive Mini Board */}
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 ${
              mobileDetailView ? 'block' : 'hidden md:flex'
            }`}
          >
            {/* Mobile Back Button */}
            <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setMobileDetailView(false)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>返回技巧列表</span>
              </button>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeTechnique.name}
              </div>
            </div>

            {/* Title, Mastery Button & Action Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeTechnique.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    ({activeTechnique.englishName})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Mark as Mastered button */}
                  <button
                    onClick={() => handleToggleMastered(activeTechnique.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isMastered
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                    }`}
                    title={isMastered ? '点击取消掌握标记' : '标记为已掌握该方法'}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 stroke-[1.5] ${isMastered ? 'text-white dark:text-slate-950' : 'text-slate-400'}`}
                    />
                    <span>{isMastered ? '已掌握 · 核对通过' : '标记为已掌握'}</span>
                  </button>

                  {/* Practice button */}
                  {onSelectForPractice && (
                    <button
                      onClick={() => onSelectForPractice(activeTechnique.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                      title="开启一局契合此技法难度的实战挑战"
                    >
                      <Gamepad2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>实战演练</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tagline / Catchphrase Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-slate-950 dark:text-white text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5] shrink-0" />
                  <span>口诀：{activeTechnique.tagline}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">难度:</span>
                  {renderStars(activeTechnique.difficultyStars)}
                </div>
              </div>
            </div>

            {/* Principle Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 stroke-[1.5]" />
                <span>核心原理解析</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed m-0">
                {activeTechnique.summary}
              </p>
            </div>

            {/* How to Spot It in Real Puzzles */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-950 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400 stroke-[1.5]" />
                <span>实战找法秘籍 (How to Spot It)</span>
              </span>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 m-0 pl-4 list-disc leading-relaxed">
                {activeTechnique.howToSpot.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Interactive Mini-Board Walkthrough Demo */}
            <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <Compass className="w-4 h-4 text-slate-800 dark:text-slate-200 stroke-[1.5]" />
                  <span>经典实战图解演示 (可点击格子查看细节)</span>
                </div>
                {/* Visual Legend */}
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-1 ring-amber-500" />
                    <span>目标/数对</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-1 ring-sky-500" />
                    <span>条件/枢纽</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-1 ring-rose-500" />
                    <span>排除候选</span>
                  </span>
                  {example.scope && (
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-300 dark:bg-indigo-700" />
                      <span>观测范围</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Mini 9x9 Diagram Grid */}
              <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-square mx-auto bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-400 dark:border-slate-700 shadow-md flex flex-col">
                {example.clues.map((rowCells, r) => (
                  <div key={`demo-row-${r}`} className="flex-1 grid grid-cols-9 w-full">
                    {rowCells.map((val, c) => {
                      const key = `${r}-${c}`;
                      const targetObj = targetMap.get(key);
                      const isTarget = Boolean(targetObj);
                      const causeObj = causeMap.get(key);
                      const isCause = Boolean(causeObj);
                      const elimList = eliminatedMap.get(key);
                      const isEliminated = Boolean(elimList && elimList.length > 0);
                      const cellNotes = cellNotesMap.get(key) || targetObj?.notes || causeObj?.notes;
                      const isSelectedDemo = selectedDemoCell?.row === r && selectedDemoCell?.col === c;

                      // Scopes checking
                      const scopes = [example.scope, example.secondaryScope].filter(Boolean);
                      let isScope = false;
                      for (const sc of scopes) {
                        if (!sc) continue;
                        if (sc.type === 'row' && sc.index === r) isScope = true;
                        if (sc.type === 'col' && sc.index === c) isScope = true;
                        if (
                          sc.type === 'box' &&
                          Math.floor(r / 3) * 3 + Math.floor(c / 3) === sc.index
                        ) {
                          isScope = true;
                        }
                      }

                      // Border right/bottom
                      const borderRight =
                        c === 2 || c === 5
                          ? 'border-r-2 border-r-slate-400 dark:border-r-slate-600'
                          : c === 8
                          ? ''
                          : 'border-r border-r-slate-200 dark:border-r-slate-800';
                      const borderBottom =
                        r === 2 || r === 5
                          ? 'border-b-2 border-b-slate-400 dark:border-b-slate-600'
                          : r === 8
                          ? ''
                          : 'border-b border-b-slate-200 dark:border-b-slate-800';

                      let cellBg = 'bg-transparent';
                      if (isSelectedDemo) {
                        cellBg = 'bg-blue-100/90 dark:bg-sky-500/30 ring-2 ring-blue-500 z-20';
                      } else if (isTarget) {
                        cellBg = 'bg-amber-100/90 dark:bg-amber-500/25 ring-2 ring-amber-500 z-10';
                      } else if (isCause) {
                        cellBg = 'bg-sky-100/90 dark:bg-sky-500/20 ring-1 ring-sky-400 z-10';
                      } else if (isEliminated) {
                        cellBg = 'bg-rose-50/90 dark:bg-rose-950/40 ring-1 ring-rose-400 z-10';
                      } else if (isScope) {
                        cellBg = 'bg-indigo-50/40 dark:bg-indigo-950/20';
                      }

                      const targetVal = targetObj?.value;
                      const clueVal = val;
                      const displayVal =
                        targetVal !== undefined ? targetVal : clueVal !== 0 ? clueVal : null;

                      return (
                        <button
                          key={`demo-cell-${r}-${c}`}
                          type="button"
                          onClick={() => setSelectedDemoCell({ row: r, col: c })}
                          className={`relative flex items-center justify-center text-center font-mono select-none p-0.5 cursor-pointer transition-colors ${borderRight} ${borderBottom} ${cellBg}`}
                        >
                          {displayVal !== null ? (
                            <span
                              className={`font-bold leading-none ${
                                isTarget
                                  ? 'text-amber-700 dark:text-amber-300 font-extrabold text-sm sm:text-base scale-110'
                                  : isCause
                                  ? 'text-sky-700 dark:text-sky-300 text-xs sm:text-sm'
                                  : 'text-slate-800 dark:text-slate-200 text-xs sm:text-sm'
                              }`}
                            >
                              {displayVal}
                            </span>
                          ) : (
                            <div className="w-full h-full p-0.5 grid grid-cols-3 grid-rows-3 pointer-events-none select-none">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                const isElim = elimList?.some((e) => e.candidate === num);
                                const isNote = cellNotes?.includes(num);
                                if (!isElim && !isNote) return <div key={num} />;
                                if (isElim) {
                                  return (
                                    <div key={num} className="flex items-center justify-center leading-none">
                                      <span className="text-[7px] sm:text-[8px] font-extrabold text-rose-600 dark:text-rose-400 line-through bg-rose-100/90 dark:bg-rose-950/80 px-0.5 rounded leading-tight">
                                        {num}
                                      </span>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={num} className="flex items-center justify-center leading-none">
                                    <span
                                      className={`text-[7px] sm:text-[8px] font-bold leading-tight ${
                                        isTarget
                                          ? 'text-amber-800 dark:text-amber-200 font-extrabold scale-110'
                                          : isCause
                                          ? 'text-sky-800 dark:text-sky-200 font-extrabold scale-110'
                                          : 'text-slate-600 dark:text-slate-300'
                                      }`}
                                    >
                                      {num}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Cell Tap Inspector */}
              {selectedDemoCell && (
                <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-sky-950/40 border border-blue-200 dark:border-sky-500/30 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700 dark:text-sky-300">
                      选中格 R{selectedDemoCell.row + 1}C{selectedDemoCell.col + 1}:
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {(() => {
                        const r = selectedDemoCell.row;
                        const c = selectedDemoCell.col;
                        const key = `${r}-${c}`;
                        const targetObj = targetMap.get(key);
                        const causeObj = causeMap.get(key);
                        const elimList = eliminatedMap.get(key);
                        const cellNotes = cellNotesMap.get(key) || targetObj?.notes || causeObj?.notes;
                        const val = example.clues[r][c];

                        if (targetObj) {
                          return `目标格 [${targetObj.label || (targetObj.value ? `填入 ${targetObj.value}` : `锁定候选 [${targetObj.notes?.join(',')}]`)}]`;
                        }
                        if (causeObj) {
                          return `条件格 [${causeObj.label || (causeObj.value ? `已知 ${causeObj.value}` : `条件 [${causeObj.notes?.join(',')}]`)}]`;
                        }
                        if (elimList && elimList.length > 0) {
                          return `排除候选格 [已排除 ${elimList.map((e) => e.candidate).join(',')}]${elimList[0]?.remainingNotes ? ` → 露出唯一数 [${elimList[0].remainingNotes.join(',')}]` : ''}`;
                        }
                        if (cellNotes && cellNotes.length > 0) {
                          return `候选笔记 [${cellNotes.join(', ')}]`;
                        }
                        if (val !== 0) {
                          return `已知题面线索 ${val}`;
                        }
                        return '空余待推导格';
                      })()}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDemoCell(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer ml-2 flex items-center gap-1"
                  >
                    <X className="w-3 h-3 stroke-[1.5]" />
                    <span>取消选中</span>
                  </button>
                </div>
              )}

              {/* Key Cells Coordinate Badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {example.targetCells.map((tc, idx) => (
                  <span
                    key={`target-badge-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-200 text-[10px] font-medium border border-amber-200 dark:border-amber-500/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>
                      R{tc.row + 1}C{tc.col + 1}:{' '}
                      {tc.label ||
                        (tc.value
                          ? `落子 ${tc.value}`
                          : `锁定 [${tc.notes?.join(', ')}]`)}
                    </span>
                  </span>
                ))}

                {example.causeCells.map((cc, idx) => (
                  <span
                    key={`cause-badge-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-200 text-[10px] font-medium border border-sky-200 dark:border-sky-500/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span>
                      R{cc.row + 1}C{cc.col + 1}:{' '}
                      {cc.label ||
                        (cc.value
                          ? `已知 ${cc.value}`
                          : `条件格 [${cc.notes?.join(', ')}]`)}
                    </span>
                  </span>
                ))}

                {groupedEliminations.map((ge, idx) => (
                  <span
                    key={`elim-badge-${idx}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-200 text-[10px] font-medium border border-rose-200 dark:border-rose-500/30"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>
                      R{ge.row + 1}C{ge.col + 1}: 排除候选 [{ge.candidates.join(', ')}]
                      {ge.remaining ? ` → 露出 [${ge.remaining.join(', ')}]` : ''}
                    </span>
                  </span>
                ))}
              </div>

              {/* Step-by-Step Logic Breakdown Card */}
              {example.stepBreakdown && (
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
                    <span>三步推导解析 (Step-by-Step Logic)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-slate-850/80 border border-blue-100 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-blue-700 dark:text-sky-400 flex items-center gap-1">
                        <Eye className="w-3 h-3 stroke-[1.5]" />
                        <span>1. 观察线索</span>
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                        {example.stepBreakdown.observe}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-slate-850/80 border border-amber-100 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Crosshair className="w-3 h-3 stroke-[1.5]" />
                        <span>2. 逻辑推演</span>
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                        {example.stepBreakdown.deduce}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-slate-850/80 border border-emerald-100 dark:border-slate-800 flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Target className="w-3 h-3 stroke-[1.5]" />
                        <span>3. 最终判定</span>
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed m-0">
                        {example.stepBreakdown.conclude}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Walkthrough Explanation Text */}
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white mr-1">
                  推导实录：
                </span>
                {example.explanation}
              </div>
            </div>

            {/* Quick Knowledge Check (核对检验) */}
            {currentQuiz && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <HelpCircle className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
                    <span>随堂核对检验 (Quick Check)</span>
                  </div>
                  {isMastered && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3 stroke-[1.5]" />
                      <span>已核对通过</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium m-0">
                  {currentQuiz.question}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  {currentQuiz.options.map((opt, idx) => {
                    const isSelected = quizSelectedOption === idx;
                    let btnStyle =
                      'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 dark:border-slate-800';
                    if (isSelected) {
                      if (opt.isCorrect) {
                        btnStyle =
                          'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold';
                      } else {
                        btnStyle =
                          'bg-rose-600 text-white border-rose-600 shadow-xs font-bold';
                      }
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerQuiz(idx, opt.isCorrect)}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {quizFeedback === 'correct' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[1.5]" />
                      <span>核对成功！您已透彻理解「{activeTechnique.name}」</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      已自动标记为已掌握
                    </span>
                  </div>
                )}

                {quizFeedback === 'incorrect' && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                    <X className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 stroke-[1.5]" />
                    <span>核对未通过，再仔细观察一下图解推导哦！{currentQuiz.explanation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Deep dive expansion */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 stroke-[1.5]" />
                <span>数学与逻辑延伸</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                {activeTechnique.deepDive}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            掌握这些技法，任何数独皆可凭逻辑破解，无需盲目猜测
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            我已知晓，开始挑战
          </button>
        </div>
      </div>
    </div>
  );
};
