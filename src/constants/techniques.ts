export interface CandidateNoteInfo {
  row: number;
  col: number;
  candidates: number[];
}

export interface TechniqueCellHighlight {
  row: number;
  col: number;
  value?: number;
  notes?: number[];
  label?: string;
}

export interface EliminatedCandidateInfo {
  row: number;
  col: number;
  candidate: number;
  remainingNotes?: number[];
}

export interface TechniqueExample {
  clues: number[][]; // 9x9 grid where non-zero are confirmed clues
  cellNotes?: CandidateNoteInfo[]; // Candidate notes for specific cells (for Pair/Triple/Wing/Fish)
  targetCells: TechniqueCellHighlight[];
  causeCells: TechniqueCellHighlight[];
  eliminatedCandidates?: EliminatedCandidateInfo[];
  scope?: {
    type: 'row' | 'col' | 'box';
    index: number;
  };
  secondaryScope?: {
    type: 'row' | 'col' | 'box';
    index: number;
  };
  explanation: string;
  stepBreakdown: {
    observe: string;
    deduce: string;
    conclude: string;
  };
}

export interface TechniqueItem {
  id: string;
  name: string;
  englishName: string;
  category: 'basic' | 'intermediate' | 'advanced';
  difficultyStars: number; // 1 to 5
  tagline: string; // 白话口诀
  summary: string; // 核心原理简述
  howToSpot: string[]; // 实战找法与视觉线索
  deepDive: string; // 深度逻辑剖析
  example: TechniqueExample;
}

export const TECHNIQUE_CATEGORIES = [
  { id: 'all', label: '全部技巧' },
  { id: 'basic', label: '入门基础 (3)' },
  { id: 'intermediate', label: '进阶战术 (8)' },
  { id: 'advanced', label: '大师高阶 (12)' },
] as const;

export const TECHNIQUES_DATA: TechniqueItem[] = [
  // 1. 宫内排除法 (Hidden Single in Box)
  {
    id: 'hidden-single-box',
    name: '宫内排除法 (宫摒除)',
    englishName: 'Hidden Single in Box',
    category: 'basic',
    difficultyStars: 1,
    tagline: '视线纵横封杀，宫内唯我独尊',
    summary: '利用九宫格外部已知数字所在的行与列，在目标九宫格内进行双向封杀。当某数字在目标九宫格内被各方交叉封杀后仅剩唯一空格可填时，该格必为此数。',
    howToSpot: [
      '挑选盘面上已出现 5~7 次的高频已知数字。',
      '观察包含该数字的各行和各列，在它们穿过目标九宫格时拉出“封杀视线”。',
      '目标九宫格内排除掉所有冲突格后，只剩唯一未被封杀的空格即为答案！',
    ],
    deepDive:
      '根据数独基本规则，每个 3×3 九宫格必须包含数字 1~9 各一次。当其他格子由于同宫已填、同行已有或同列已有该数字而被全部否定时，该数字就只能落在剩下的唯一点上。在常规数独中，超过 60% 的基础落子均由宫摒除完成。',
    example: {
      clues: [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [1, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ],
      targetCells: [{ row: 0, col: 2, value: 1, label: '落子 1' }],
      causeCells: [
        { row: 1, col: 3, value: 1, label: '第2行已知 1' },
        { row: 6, col: 0, value: 1, label: '第1列已知 1' },
      ],
      scope: { type: 'box', index: 0 },
      explanation:
        '观察左上角第 1 宫：(0,0)=5，(0,1)=3，(1,0)=6，(2,1)=9，(2,2)=8 均已填数。第 2 行在 (1,3) 处已有 1，横向封锁 (1,1) 与 (1,2)；第 1 列在 (6,0) 处已有 1，纵向封锁 (2,0)。因此第 1 宫内数字 1 只能落在【第 1 行第 3 列】！',
      stepBreakdown: {
        observe: '聚焦数字 1，观察左上角第 1 宫尚未填入 1。',
        deduce: '第 2 行的已知数 1 封杀 (1,1) 和 (1,2)，第 1 列的已知数 1 封杀 (2,0)。',
        conclude: '第 1 宫只剩 (0,2) 一格可以容纳 1，锁定填入数字 1！',
      },
    },
  },

  // 2. 行列排除法 (Hidden Single in Row / Col)
  {
    id: 'hidden-single-line',
    name: '行列排除法 (线摒除)',
    englishName: 'Hidden Single in Row / Column',
    category: 'basic',
    difficultyStars: 1,
    tagline: '单线九格寻真踪，交叉垂线定乾坤',
    summary: '聚焦某一行或某一列，利用垂直交叉线（列或行）及各九宫格中的已有数字，排除该线上其他空格。当某数字在整行或整列中仅剩一格可填时，直接落子。',
    howToSpot: [
      '寻找空格较少（如已填 6~7 个数字）的长行或长列。',
      '查看尚未填入的缺失数字，观察垂直穿过的交叉线是否已有该数字。',
      '若某个数字在整条长线上仅有 1 个空格不产生冲突，即锁定该格！',
    ],
    deepDive:
      '每行和每列也是一个独立的“域”（House），必须完整包含 1~9 各一次。有时在单个九宫格内部无法直接用宫摒除定数，但从整条长线的全局视角切入，该数字在整行/整列的其他空格都被垂直交叉线否定，线摒除能迅速撕开僵局。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 7, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 2, 3, 0, 0, 0, 4, 5, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 7, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      targetCells: [{ row: 4, col: 4, value: 7, label: '落子 7' }],
      causeCells: [
        { row: 1, col: 3, value: 7, label: '第4列已知 7' },
        { row: 7, col: 5, value: 7, label: '第6列已知 7' },
      ],
      scope: { type: 'row', index: 4 },
      explanation:
        '观察第 5 行：已填入数字 {1, 2, 3, 4, 5, 6}，未填空格仅剩 (4,3)、(4,4)、(4,5)。此时第 4 列已有 7 封杀 (4,3)，第 6 列已有 7 封杀 (4,5)。因此第 5 行中数字 7 只能填在【第 5 行第 5 列】！',
      stepBreakdown: {
        observe: '第 5 行已经填满 6 格，待填数字包含 7、8、9。',
        deduce: '考察数字 7：第 4 列的 7 垂直封锁 (4,3)，第 6 列的 7 垂直封锁 (4,5)。',
        conclude: '第 5 行仅剩中心空格 (4,4) 能够填入 7，锁定答案！',
      },
    },
  },

  // 3. 唯一余数法 (Naked Single)
  {
    id: 'naked-single',
    name: '唯一余数法 (唯余解)',
    englishName: 'Naked Single (Sole Candidate)',
    category: 'basic',
    difficultyStars: 1,
    tagline: '环视同域八个伴，余数唯一即真身',
    summary: '从单个格子的微观视角出发，检查它所在的行、所在的列以及所在的九宫格。如果这三者合并起来已经占有了 1~9 中的 8 个不同数字，则该格的候选数只剩下唯一点。',
    howToSpot: [
      '寻找多线交叉的交汇空格：找处于填数密集的行、列和宫交叉点的空格。',
      '数出该格同行有谁、同列有谁、同宫有谁。',
      '如果 1 到 9 报数报到最后只剩一个数字没出现过，该数字即为唯一解！',
    ],
    deepDive:
      '唯余法与摒除法是一体两面的核心逻辑。摒除法是“这个数字在这一区域只能去哪里”，而唯余法是“这个空格在这个位置只能容纳哪个数字”。在开启“候选数笔记”后，唯余格内只会孤零零显示一个候选笔记数。',
    example: {
      clues: [
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 6, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 0, 0, 0, 0],
        [1, 2, 3, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 9, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 7, 0, 0, 0, 0],
      ],
      targetCells: [{ row: 4, col: 4, value: 5, label: '唯余 5' }],
      causeCells: [
        { row: 4, col: 0, value: 1, label: '同行 1' },
        { row: 4, col: 1, value: 2, label: '同行 2' },
        { row: 4, col: 2, value: 3, label: '同行 3' },
        { row: 0, col: 4, value: 4, label: '同列 4' },
        { row: 1, col: 4, value: 6, label: '同列 6' },
        { row: 8, col: 4, value: 7, label: '同列 7' },
        { row: 3, col: 3, value: 8, label: '同宫 8' },
        { row: 5, col: 5, value: 9, label: '同宫 9' },
      ],
      scope: { type: 'box', index: 4 },
      explanation:
        '观察中心格【第 5 行第 5 列】：同行有 {1, 2, 3}，同列有 {4, 6, 7}，同宫有 {8, 9}。这三者合并包含了 1~9 中除 5 以外的所有 8 个数字。排除所有不可能后，该格候选数只剩唯一的 【5】！',
      stepBreakdown: {
        observe: '十字交叉扫描 (4,4) 所在行、列与九宫格的已知数。',
        deduce: '同行占有 1,2,3，同列占有 4,6,7，同九宫格占有 8,9。',
        conclude: '8 个数字已全部被占用，(4,4) 只能填入唯一余数 5！',
      },
    },
  },

  // 4. 宫内区块排除法 (Pointing Pair / Triple)
  {
    id: 'pointing-pair',
    name: '锁定候选区块 (指向数对/三数组)',
    englishName: 'Pointing Pair / Triple',
    category: 'intermediate',
    difficultyStars: 2,
    tagline: '宫内候选锁一线，顺藤摸瓜杀外格',
    summary: '如果某个数字在某个九宫格内的所有可能候选位置恰好都落在同一行（或同一列）上，那么整条线上的该数字必出自该宫，因此该行（或列）在其他九宫格中的同名候选数都可以安全剔除。',
    howToSpot: [
      '在开启候选笔记时，检查九宫格内某个数字的分布。',
      '发现数字 X 只能出现在该九宫格的同一行（或列）的 2~3 个格子里。',
      '沿着这一行向外延伸，其他九宫格同处于这行的格子里如果含有候选数 X，全部擦除！',
    ],
    deepDive:
      '数对虽然尚未确定具体填在哪个格子里，但已经形成了“空间锁定”。既然该九宫格必须拥有一个 X，且只能出现在这一行，那么这一行的 X 额度就彻底被该九宫格独占了。任何位于该行、却在该九宫格外面的 X 都是不可能存在的。',
    example: {
      clues: [
        [0, 0, 0, 0, 4, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 4],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [4, 7] },
        { row: 1, col: 2, candidates: [4, 9] },
        { row: 1, col: 5, candidates: [2, 4, 6] },
        { row: 1, col: 7, candidates: [3, 4, 8] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [4, 7], label: '指向数对 [4,7]' },
        { row: 1, col: 2, notes: [4, 9], label: '指向数对 [4,9]' },
      ],
      causeCells: [
        { row: 0, col: 4, value: 4, label: '已知 4 封锁第 1 行' },
        { row: 2, col: 8, value: 4, label: '已知 4 封锁第 3 行' },
      ],
      eliminatedCandidates: [
        { row: 1, col: 5, candidate: 4, remainingNotes: [2, 6] },
        { row: 1, col: 7, candidate: 4, remainingNotes: [3, 8] },
      ],
      scope: { type: 'row', index: 1 },
      explanation:
        '在第 1 宫内，第 1 行与第 3 行已被外部的 4 封锁，导致数字 4 只能出现在第 2 行的 (1,1) 与 (1,2) 之中。因此第 2 行的数字 4 必定产生于第 1 宫！顺着第 2 行向右延伸，其他宫的空格 (1,5) 和 (1,7) 中的候选数 4 全部被成功排除！',
      stepBreakdown: {
        observe: '观察左上第 1 宫：数字 4 的候选格仅局限于第 2 行的 (1,1) 和 (1,2)。',
        deduce: '数字 4 形成“指向数对”，整条第 2 行的数字 4 已被第 1 宫锁定。',
        conclude: '同处第 2 行外侧的 (1,5) 与 (1,7) 绝不可能为 4，清除其中的候选数 4！',
      },
    },
  },

  // 5. 行列区块排除法 (Box-Line Reduction)
  {
    id: 'box-line-reduction',
    name: '行列区块排除 (行/列锁宫)',
    englishName: 'Box-Line Reduction',
    category: 'intermediate',
    difficultyStars: 2,
    tagline: '单线候选拘一宫，同宫闲格尽可除',
    summary: '与指向数对方向相反：当某一行（或列）中某个数字的所有候选位置恰好都落在同一个九宫格内时，该数字在该九宫格内的配额已被这条线锁死，同宫内其他格子的该候选数全部排除。',
    howToSpot: [
      '观察某一行（或某一列）的候选数分布。',
      '发现数字 X 在这一整行中，只有 2~3 个位置能填，且它们都恰好在同一个 3×3 宫内。',
      '回头看这个宫，该宫内其他不在这条线上的格子里的 X 全部划掉！',
    ],
    deepDive:
      '这是数独中由“线”向“宫”反哺的高效剪枝技巧。此法常常能让一个原本拥有 3~4 个候选数的僵局宫迅速显露出唯一余数（Naked Single）或显性数对。',
    example: {
      clues: [
        [0, 0, 0, 6, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 6, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 6, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 6],
        [6, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 6, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 6, 0],
      ],
      cellNotes: [
        { row: 3, col: 1, candidates: [2, 6] },
        { row: 3, col: 2, candidates: [5, 6] },
        { row: 4, col: 1, candidates: [1, 6, 8] },
        { row: 5, col: 2, candidates: [3, 6, 7] },
      ],
      targetCells: [
        { row: 3, col: 1, notes: [2, 6], label: '行锁宫格 [2,6]' },
        { row: 3, col: 2, notes: [5, 6], label: '行锁宫格 [5,6]' },
      ],
      causeCells: [
        { row: 3, col: 1, notes: [2, 6] },
        { row: 3, col: 2, notes: [5, 6] },
      ],
      eliminatedCandidates: [
        { row: 4, col: 1, candidate: 6, remainingNotes: [1, 8] },
        { row: 5, col: 2, candidate: 6, remainingNotes: [3, 7] },
      ],
      scope: { type: 'box', index: 3 },
      explanation:
        '在第 4 行中，中间与右侧各列已全被 6 封锁，导致整行中数字 6 的候选格仅剩 (3,1) 与 (3,2)，且它们都在第 4 宫内。这意味着第 4 宫的 6 必然在这两个格子里。因此第 4 宫内其他行（第 5、6 行）的格子 (4,1) 与 (5,2) 中的候选数 6 全部被排除！',
      stepBreakdown: {
        observe: '观察第 4 行：数字 6 只能出现在 (3,1) 和 (3,2) 两格。',
        deduce: '这两格全部位于第 4 宫，说明第 4 宫的 6 必定出现在第 4 行。',
        conclude: '第 4 宫内其他两行的空格 (4,1) 与 (5,2) 绝不可能是 6，果断排除！',
      },
    },
  },

  // 6. 显性数对法 (Naked Pair)
  {
    id: 'naked-pair',
    name: '显性数对法 (双子占位)',
    englishName: 'Naked Pair',
    category: 'intermediate',
    difficultyStars: 3,
    tagline: '两格同占两同数，同域他格立时休',
    summary: '在同一行、列或宫中，有两个空格的候选数完全相同且仅有这两个数（例如都是 [3, 8]）。这意味着 3 和 8 必定被这两个格子瓜分，因此同域内其他所有格子都不能再包含 3 或 8。',
    howToSpot: [
      '快速浏览笔记中只写了 2 个候选数的小格（双候选格）。',
      '在同一行、列或九宫格中，寻找内容完全一样的两对（如都是 3、8）。',
      '锁定这对“孪生兄弟”，将同线或同宫其他格子中的 3 和 8 全部擦除！',
    ],
    deepDive:
      '显性数对是数独迈向中高难度的分水岭。它的美妙之处在于“二律背反”：我们虽然暂时不知道谁是 3 谁是 8，但确定它们俩把 3 和 8 的名额占满了。排除掉其他格的干扰数后，往往会连锁引发一系列唯余或摒除。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 4, 0, 6, 0, 7, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 2, col: 1, candidates: [3, 8] },
        { row: 2, col: 5, candidates: [3, 8] },
        { row: 2, col: 3, candidates: [3, 5, 8] },
        { row: 2, col: 7, candidates: [3, 8, 9] },
      ],
      targetCells: [
        { row: 2, col: 1, notes: [3, 8], label: '显性数对 [3,8]' },
        { row: 2, col: 5, notes: [3, 8], label: '显性数对 [3,8]' },
      ],
      causeCells: [
        { row: 2, col: 1, notes: [3, 8] },
        { row: 2, col: 5, notes: [3, 8] },
      ],
      eliminatedCandidates: [
        { row: 2, col: 3, candidate: 3, remainingNotes: [5] },
        { row: 2, col: 3, candidate: 8, remainingNotes: [5] },
        { row: 2, col: 7, candidate: 3, remainingNotes: [9] },
        { row: 2, col: 7, candidate: 8, remainingNotes: [9] },
      ],
      scope: { type: 'row', index: 2 },
      explanation:
        '在第 3 行中，(2,1) 与 (2,5) 两个格子的候选数均只有 [3, 8]。它们构成了显性数对，必定一格填 3 另一格填 8。因此同在第 3 行的 (2,3) 排除 3、8 后直接露出唯余 【5】！(2,7) 排除 3、8 后露出唯余 【9】！',
      stepBreakdown: {
        observe: '检查第 3 行，发现 (2,1) 和 (2,5) 只有候选数 3 和 8。',
        deduce: '两格锁定数字 3 和 8，该行其他格子不能再填入 3 或 8。',
        conclude: '(2,3) 排除 3,8 后直得 5，(2,7) 排除 3,8 后直得 9，局面大开！',
      },
    },
  },

  // 7. 隐性数对法 (Hidden Pair)
  {
    id: 'hidden-pair',
    name: '隐性数对法 (密友结伴)',
    englishName: 'Hidden Pair',
    category: 'intermediate',
    difficultyStars: 3,
    tagline: '两数同行双格现，杂数洗净见青天',
    summary: '在某一行、列或宫中，某两个数字在整域中只出现在相同的两个格子里（尽管这两个格子可能还混杂了其他候选数）。这两个格子必须归属于这两个数，因此其中的其他杂乱候选数全部擦除。',
    howToSpot: [
      '统计某一行或宫内各数字在笔记中的出现频率。',
      '如果发现数字 A 和数字 B 在整行中都恰好只在格甲和格乙中可能存在。',
      '格甲和格乙已经被 A 和 B 占满，把这两个格子里除了 A、B 之外的其他候选数全部清除！',
    ],
    deepDive:
      '隐性数对是显性数对的镜像。显性数对是“格数少（只有两个数字），位置明”；隐性数对是“格内数字多（杂质多），但这两个特定数字在区域内无处可去”。清除杂质后，隐性数对会立刻转化为纯净的显性数对。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 6, 0, 8, 3, 5, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 6, col: 2, candidates: [2, 4, 7, 9] },
        { row: 6, col: 7, candidates: [2, 5, 7] },
      ],
      targetCells: [
        { row: 6, col: 2, notes: [2, 7], label: '隐性数对 [2,7]' },
        { row: 6, col: 7, notes: [2, 7], label: '隐性数对 [2,7]' },
      ],
      causeCells: [
        { row: 6, col: 2, notes: [2, 7] },
        { row: 6, col: 7, notes: [2, 7] },
      ],
      eliminatedCandidates: [
        { row: 6, col: 2, candidate: 4, remainingNotes: [2, 7] },
        { row: 6, col: 2, candidate: 9, remainingNotes: [2, 7] },
        { row: 6, col: 7, candidate: 5, remainingNotes: [2, 7] },
      ],
      scope: { type: 'row', index: 6 },
      explanation:
        '在第 7 行中，数字 2 和 7 在整行其他所有格子中都无法填入，只能出现在 (6,2) 与 (6,7) 两个位置。这意味着这两格必须给 2 和 7 留着，因此 (6,2) 里的干扰数 4、9 以及 (6,7) 里的干扰数 5 全部被剥离消除，纯化为 [2, 7]！',
      stepBreakdown: {
        observe: '观察第 7 行的候选数，发现数字 2 和 7 仅在 (6,2) 和 (6,7) 出现。',
        deduce: '数字 2 和 7 构成隐性数对，这两格不容其他多余数字插足。',
        conclude: '擦除 (6,2) 中的 4,9 和 (6,7) 中的 5，隐性数对成功提纯！',
      },
    },
  },

  // 8. 显性三数组 (Naked Triple)
  {
    id: 'naked-triple',
    name: '显性三数组 (三羽共舞)',
    englishName: 'Naked Triple',
    category: 'intermediate',
    difficultyStars: 3,
    tagline: '三格同包三组数，即便残缺亦封杀',
    summary: '同一区域中有三个格子，它们包含的候选数总集合恰好只有 3 个不同的数字（例如分别包含 [2,4]、[4,9]、[2,9]）。这三个数字必在这三格中分配，同域其他格子可全部排除这三数。',
    howToSpot: [
      '寻找同一行/列/宫中候选数只有 2~3 个的格子。',
      '将其中 3 个格子的候选数字求并集。如果并集刚好只有 3 个不同数字。',
      '同域内其他所有格子的这 3 个候选数立刻清除！',
    ],
    deepDive:
      '三数组不要求每个格子都集齐 3 个数，只要三个格子的候选数字全部落在同一个三元集合（如 {A, B, C}）内即可。这是高级数独解题中打破中盘胶着状态的利器。',
    example: {
      clues: [
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 3, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 6, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 8, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 4, candidates: [2, 4] },
        { row: 4, col: 4, candidates: [4, 9] },
        { row: 7, col: 4, candidates: [2, 9] },
        { row: 2, col: 4, candidates: [2, 5, 9] },
        { row: 6, col: 4, candidates: [4, 7] },
      ],
      targetCells: [
        { row: 1, col: 4, notes: [2, 4], label: '三数组 [2,4]' },
        { row: 4, col: 4, notes: [4, 9], label: '三数组 [4,9]' },
        { row: 7, col: 4, notes: [2, 9], label: '三数组 [2,9]' },
      ],
      causeCells: [
        { row: 1, col: 4, notes: [2, 4] },
        { row: 4, col: 4, notes: [4, 9] },
        { row: 7, col: 4, notes: [2, 9] },
      ],
      eliminatedCandidates: [
        { row: 2, col: 4, candidate: 2, remainingNotes: [5] },
        { row: 2, col: 4, candidate: 9, remainingNotes: [5] },
        { row: 6, col: 4, candidate: 4, remainingNotes: [7] },
      ],
      scope: { type: 'col', index: 4 },
      explanation:
        '在第 5 列中，(1,4) 含 [2,4]、(4,4) 含 [4,9]、(7,4) 含 [2,9]，三格候选数并集恰好是 {2, 4, 9}。这三数被这三格彻底锁定，因此同列的 (2,4) 排除 2,9 后露出唯余 【5】！(6,4) 排除 4 后露出唯余 【7】！',
      stepBreakdown: {
        observe: '观察第 5 列的三格：分别有 [2,4]、[4,9]、[2,9]。',
        deduce: '三格恰好覆盖 2、4、9 三个数字，形成显性三数组闭环。',
        conclude: '同列其他格子清除 2,4,9，(2,4) 直出 5，(6,4) 直出 7！',
      },
    },
  },

  // 9. 隐性三数组 (三影遁形)
  {
    id: 'hidden-triple',
    name: '隐性三数组 (三影遁形)',
    englishName: 'Hidden Triple',
    category: 'intermediate',
    difficultyStars: 3,
    tagline: '三数独占三格位，杂质候选尽归空',
    summary:
      '在同一行、列或宫中，有 3 个特定数字只在特定的 3 个空格中出现。虽然这 3 个格子中还混杂着其他候选数，但这 3 个数字必须由这 3 格包揽，因此必须将这 3 格中除这三数之外的所有候选杂质彻底清除。',
    howToSpot: [
      '统计某九宫格或行/列中出现频次较低（仅出现 2~3 次）的候选数。',
      '若发现有 3 个数字（例如 2, 5, 7）的出现位置全部被局限在相同的 3 个格子里。',
      '这 3 格即为隐性三数组，立即清除这 3 格中除了这 3 数之外的所有多余候选数！',
    ],
    deepDive:
      '隐性三数组是隐性数对的三阶演进版。其数学本质是鸽巢原理：3 个确定数字要填入 3 个格子，必然每个格子各占其一。因此这 3 格的名额已被这 3 个数字完全锁死，格内其他任何候选数都毫无立足之地。清洗杂质后常能暴露出其他格的唯余解。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 3, col: 3, candidates: [1, 4] },
        { row: 3, col: 4, candidates: [2, 5, 6, 8] },
        { row: 3, col: 5, candidates: [1, 9] },
        { row: 4, col: 3, candidates: [3, 8] },
        { row: 4, col: 4, candidates: [2, 7, 9] },
        { row: 4, col: 5, candidates: [4, 6] },
        { row: 5, col: 3, candidates: [1, 3] },
        { row: 5, col: 4, candidates: [5, 7, 8] },
        { row: 5, col: 5, candidates: [4, 9] },
      ],
      targetCells: [
        { row: 3, col: 4, notes: [2, 5], label: '隐三格 [2,5]' },
        { row: 4, col: 4, notes: [2, 7], label: '隐三格 [2,7]' },
        { row: 5, col: 4, notes: [5, 7], label: '隐三格 [5,7]' },
      ],
      causeCells: [
        { row: 3, col: 4, notes: [2, 5, 6, 8] },
        { row: 4, col: 4, notes: [2, 7, 9] },
        { row: 5, col: 4, notes: [5, 7, 8] },
      ],
      eliminatedCandidates: [
        { row: 3, col: 4, candidate: 6, remainingNotes: [2, 5] },
        { row: 3, col: 4, candidate: 8, remainingNotes: [2, 5] },
        { row: 4, col: 4, candidate: 9, remainingNotes: [2, 7] },
        { row: 5, col: 4, candidate: 8, remainingNotes: [5, 7] },
      ],
      scope: { type: 'box', index: 4 },
      explanation:
        '观察中央第 5 宫，数字 2, 5, 7 在整宫的所有空格中，仅在中间第 5 列的 (3,4)、(4,4)、(5,4) 三格出现。因此这三格必须由 2, 5, 7 瓜分，格内其余候选杂质无容身之处。清除 (3,4) 的 6、8，(4,4) 的 9，(5,4) 的 8，提纯出精简的三数组！',
      stepBreakdown: {
        observe: '检查第 5 宫各候选数分布，发现数字 2, 5, 7 仅局限在 (3,4)、(4,4)、(5,4) 三格。',
        deduce: '三个数字锁定三个格子，该三格必须填 2, 5, 7，绝不可能填入任何其他干扰数字。',
        conclude: '彻底清除格内杂质：移除 (3,4) 的 6,8，(4,4) 的 9，(5,4) 的 8！',
      },
    },
  },

  // 10. 显性四数组 (四灵合围)
  {
    id: 'naked-quad',
    name: '显性四数组 (四灵合围)',
    englishName: 'Naked Quad',
    category: 'intermediate',
    difficultyStars: 3,
    tagline: '四位一体占四格，同域闲杂尽避席',
    summary:
      '在某一行、列或宫中，有 4 个空格的候选数集合加起来恰好只有 4 个不同数字（例如分别属于 {1, 3, 6, 8} 的子集）。这 4 个数字必定被这 4 格完全占满，因此同域内其他所有格子中的这 4 个候选数均可全线排除。',
    howToSpot: [
      '在候选数较密集的行或列中，寻找候选数较少（2~3 个）的小格。',
      '挑选 4 个格子，若它们的候选数字取并集刚好为 4 个数字（如 [1,3], [3,6], [1,6,8], [6,8]）。',
      '锁定这 4 个合围格，将同线或同宫其他格子中的这 4 个数字全部划掉！',
    ],
    deepDive:
      '显性四数组是锁闭集合（Locked Sets）的中级核心。哪怕 4 个格子都不完整包含全部 4 个数，只要它们候选数的并集大小等于格数（4 格占 4 数），这 4 个数就无法溢出到其他格。排除其他格的这 4 个候选数后，往往会直接暴露出唯余数字。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 0, 0, 0, 0, 0, 0, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [1, 3] },
        { row: 1, col: 2, candidates: [3, 6] },
        { row: 1, col: 4, candidates: [1, 6, 8] },
        { row: 1, col: 6, candidates: [6, 8] },
        { row: 1, col: 3, candidates: [1, 4, 7] },
        { row: 1, col: 5, candidates: [3, 8, 9] },
        { row: 1, col: 7, candidates: [6, 7] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [1, 3], label: '四数组格 (1,1)' },
        { row: 1, col: 2, notes: [3, 6], label: '四数组格 (1,2)' },
        { row: 1, col: 4, notes: [1, 6, 8], label: '四数组格 (1,4)' },
        { row: 1, col: 6, notes: [6, 8], label: '四数组格 (1,6)' },
      ],
      causeCells: [
        { row: 1, col: 1, notes: [1, 3] },
        { row: 1, col: 2, notes: [3, 6] },
        { row: 1, col: 4, notes: [1, 6, 8] },
        { row: 1, col: 6, notes: [6, 8] },
      ],
      eliminatedCandidates: [
        { row: 1, col: 3, candidate: 1, remainingNotes: [4, 7] },
        { row: 1, col: 5, candidate: 3, remainingNotes: [9] },
        { row: 1, col: 5, candidate: 8, remainingNotes: [9] },
        { row: 1, col: 7, candidate: 6, remainingNotes: [7] },
      ],
      scope: { type: 'row', index: 1 },
      explanation:
        '在第 2 行中，(1,1)、(1,2)、(1,4)、(1,6) 四格的候选数并集恰好为 {1, 3, 6, 8}，构成了显性四数组。这 4 个数字已被这四格完全承包，因此同在第 2 行的 (1,3) 排除 1，(1,7) 排除 6 露出 7，而 (1,5) 排除 3 和 8 后直接暴露出唯余数字 【9】！',
      stepBreakdown: {
        observe: '检查第 2 行，(1,1)、(1,2)、(1,4)、(1,6) 四格候选数总合集为 {1,3,6,8}。',
        deduce: '四格占满四数，同在第 2 行的其他空格绝不可能填入 1、3、6、8 中任何一数。',
        conclude: '排除 (1,3) 的 1、(1,7) 的 6，(1,5) 剔除 3,8 干扰后唯余直出数字 9！',
      },
    },
  },

  // 11. 隐性四数组 (四象潜隐)
  {
    id: 'hidden-quad',
    name: '隐性四数组 (四象潜隐)',
    englishName: 'Hidden Quad',
    category: 'intermediate',
    difficultyStars: 4,
    tagline: '四王暗驻四方格，闲杂候选莫留痕',
    summary:
      '在某一行、列或宫中，有 4 个特定数字只在某 4 个空格中有可能出现。这 4 个数字已将这 4 个格子的所有可能性占满，因此这 4 个格子内包含的任何其他多余候选数都可以安全清除。',
    howToSpot: [
      '统计某一行或列中候选数字的分布情况。',
      '发现有 4 个数字（如 1, 4, 7, 9）在整行/整列中只出现于相同的 4 个格子中。',
      '把这 4 格视作这 4 个数字的专属领地，将格内其他所有杂质数字全部清除！',
    ],
    deepDive:
      '隐性四数组与显性五数组互为对偶。在 9×9 盘面上，当 4 个数字潜藏在 4 个格子里时，由于它们在其他格子里都不可能出现，这 4 格就只能填这 4 个数。清除格内其他杂质候选后，这 4 格将转变为显性四数组，大幅精简盘面候选。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 5, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 6, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 0, col: 3, candidates: [1, 2, 4, 3] },
        { row: 2, col: 3, candidates: [1, 7, 2] },
        { row: 5, col: 3, candidates: [4, 9, 3] },
        { row: 8, col: 3, candidates: [7, 9, 2] },
        { row: 6, col: 3, candidates: [2, 3] },
        { row: 7, col: 3, candidates: [2, 3] },
      ],
      targetCells: [
        { row: 0, col: 3, notes: [1, 4], label: '隐四格 (0,3)' },
        { row: 2, col: 3, notes: [1, 7], label: '隐四格 (2,3)' },
        { row: 5, col: 3, notes: [4, 9], label: '隐四格 (5,3)' },
        { row: 8, col: 3, notes: [7, 9], label: '隐四格 (8,3)' },
      ],
      causeCells: [
        { row: 0, col: 3, notes: [1, 2, 4, 3] },
        { row: 2, col: 3, notes: [1, 7, 2] },
        { row: 5, col: 3, notes: [4, 9, 3] },
        { row: 8, col: 3, notes: [7, 9, 2] },
      ],
      eliminatedCandidates: [
        { row: 0, col: 3, candidate: 2, remainingNotes: [1, 4] },
        { row: 0, col: 3, candidate: 3, remainingNotes: [1, 4] },
        { row: 2, col: 3, candidate: 2, remainingNotes: [1, 7] },
        { row: 5, col: 3, candidate: 3, remainingNotes: [4, 9] },
        { row: 8, col: 3, candidate: 2, remainingNotes: [7, 9] },
      ],
      scope: { type: 'col', index: 3 },
      explanation:
        '在第 4 列中，数字 1, 4, 7, 9 仅出现在 (0,3)、(2,3)、(5,3)、(8,3) 四个空格中（其他格均为已知数 5,6,8 或只含 2,3）。这 4 个数字锁死了这四格，因此这四格内的多余杂质候选数 2 和 3 全部被剔除，提纯出纯净的候选数！',
      stepBreakdown: {
        observe: '统计第 4 列各候选数，数字 1, 4, 7, 9 仅出现在 (0,3)、(2,3)、(5,3)、(8,3) 四格。',
        deduce: '四数占四格，1、4、7、9 必须在此四格落子，格内杂质数字 2、3 无立足之地。',
        conclude: '清除 (0,3) 的 2,3、(2,3) 的 2、(5,3) 的 3、(8,3) 的 2，完成四象提纯！',
      },
    },
  },

  // 12. X-Wing 矩阵排除法 (四角天网)
  {
    id: 'x-wing',
    name: 'X-Wing 矩阵排除法 (四角天网)',
    englishName: 'X-Wing',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '双行双列定四角，交叉长线锁杀网',
    summary: '某数字在两行中都恰好只能出现在相同的两列（构成一个矩形的四个顶点）。根据对角互斥逻辑，该数字在这两列上的其他所有候选数都可以彻底排除。',
    howToSpot: [
      '用候选高亮聚焦某个特定数字 X。',
      '寻找两行，每一行中的 X 都只有 2 个候选格。',
      '检查这四格是否垂直对齐于相同的两列。如果构成矩形四角，即可向上下纵深排除整列的其他 X！',
    ],
    deepDive:
      'X-Wing 属于经典的鱼类（Fish）技巧。当两行中只有两列可选时，若左上选了 X，则右下必须是 X；若右上选了 X，则左下必须是 X。无论哪种真值分支，这两列的 X 已经全部被这四格占用，绝不可能出现在两列的其他格中。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 2, candidates: [3, 5] },
        { row: 1, col: 7, candidates: [5, 8] },
        { row: 6, col: 2, candidates: [5, 9] },
        { row: 6, col: 7, candidates: [1, 5] },
        { row: 3, col: 2, candidates: [1, 5, 7] },
        { row: 8, col: 2, candidates: [4, 5, 6] },
        { row: 4, col: 7, candidates: [2, 5, 9] },
      ],
      targetCells: [
        { row: 1, col: 2, notes: [3, 5], label: '矩阵角 (1,2)' },
        { row: 1, col: 7, notes: [5, 8], label: '矩阵角 (1,7)' },
        { row: 6, col: 2, notes: [5, 9], label: '矩阵角 (6,2)' },
        { row: 6, col: 7, notes: [1, 5], label: '矩阵角 (6,7)' },
      ],
      causeCells: [
        { row: 1, col: 2, notes: [3, 5] },
        { row: 1, col: 7, notes: [5, 8] },
        { row: 6, col: 2, notes: [5, 9] },
        { row: 6, col: 7, notes: [1, 5] },
      ],
      eliminatedCandidates: [
        { row: 3, col: 2, candidate: 5, remainingNotes: [1, 7] },
        { row: 8, col: 2, candidate: 5, remainingNotes: [4, 6] },
        { row: 4, col: 7, candidate: 5, remainingNotes: [2, 9] },
      ],
      scope: { type: 'col', index: 2 },
      secondaryScope: { type: 'col', index: 7 },
      explanation:
        '数字 5 在第 2 行与第 7 行都恰好只出现在第 3 列与第 8 列，四个端点构成标准的 X-Wing 矩阵。两行中的 5 必定呈对角交叉出现，因此第 3 列与第 8 列上下纵深的其余格子（如 (3,2)、(8,2)、(4,7)）中的候选数 5 全部被排除！',
      stepBreakdown: {
        observe: '高亮候选数 5，发现第 2 行与第 7 行的 5 都只在第 3 列与第 8 列。',
        deduce: '四格构成 X-Wing 矩形，第 3 列与第 8 列的 5 已被这两行承包。',
        conclude: '纵向全线清理：第 3 列与第 8 列其他位置的候选数 5 全部清除！',
      },
    },
  },

  // 10. XY-Wing 弯矩对消除 (三联锁定)
  {
    id: 'xy-wing',
    name: 'XY-Wing 弯矩对消除 (三联锁定)',
    englishName: 'XY-Wing',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '核心枢纽连双翼，交叉视域斩强敌',
    summary: '由一个包含 [X, Y] 的枢纽格（Pivot）和两个分别包含 [X, Z] 与 [Y, Z] 的翼格（Pincers）组成。两个翼格都能看到枢纽格。不论枢纽格填 X 还是 Y，两翼中必有一个填 Z，因此能同时看到两个翼格的交汇空格中的候选数 Z 全部排除。',
    howToSpot: [
      '寻找双候选格（例如格子里只有 2 个数字）。',
      '找一个形如 [A, B] 的枢纽格，看它能看到的行或列中是否有 [A, C] 和 [B, C]。',
      '寻找两翼共同能看到的交叉视野格，将那里的公共数字 C 全部剔除！',
    ],
    deepDive:
      'XY-Wing 是短链推导（Short Chain）中最优雅实用的高阶武器。它利用了命题逻辑的二难推理：枢纽为 A → 翼 1 为 C；枢纽为 B → 翼 2 为 C。无论何种情况，必有一翼为 C，因此交叉交集处绝对不可能为 C。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 3, col: 3, candidates: [1, 2] },
        { row: 3, col: 7, candidates: [1, 9] },
        { row: 7, col: 3, candidates: [2, 9] },
        { row: 7, col: 7, candidates: [4, 6, 9] },
      ],
      targetCells: [
        { row: 3, col: 3, notes: [1, 2], label: '枢纽格 [1,2]' },
        { row: 3, col: 7, notes: [1, 9], label: '翼格一 [1,9]' },
        { row: 7, col: 3, notes: [2, 9], label: '翼格二 [2,9]' },
      ],
      causeCells: [
        { row: 3, col: 3, notes: [1, 2] },
        { row: 3, col: 7, notes: [1, 9] },
        { row: 7, col: 3, notes: [2, 9] },
      ],
      eliminatedCandidates: [
        { row: 7, col: 7, candidate: 9, remainingNotes: [4, 6] },
      ],
      explanation:
        '枢纽格 (3,3) 为 [1,2]，两个翼格分别为同行 (3,7) 的 [1,9] 与同列 (7,3) 的 [2,9]。若枢纽为 1，则翼格一必为 9；若枢纽为 2，则翼格二必为 9。因此同时能被两翼看到的交汇格 (7,7) 绝不可能为 9，候选数 9 被成功排除！',
      stepBreakdown: {
        observe: '锁定枢纽格 (3,3) 的 [1,2] 以及它能看到的两个双候选翼格 [1,9] 和 [2,9]。',
        deduce: '二难推导：无论枢纽格填 1 还是填 2，两翼中至少有一格必定为 9。',
        conclude: '交汇格 (7,7) 同时处于两翼的视野下，排除其候选数 9！',
      },
    },
  },

  // 11. 剑鱼排除法 (Swordfish 3x3 矩阵)
  {
    id: 'swordfish',
    name: '剑鱼排除法 (三维天罗地网)',
    englishName: 'Swordfish (3-Fish)',
    category: 'advanced',
    difficultyStars: 5,
    tagline: '三行锁定三列阵，大浪淘沙荡平川',
    summary: 'X-Wing 的三阶扩展版：某数字在三行中的所有候选位置仅分布在相同的三列之内（即 3×3 矩阵内）。该数字在这三列上的其他所有行候选数全部清除，威力巨大。',
    howToSpot: [
      '使用高亮按键聚焦某个难以推进的数字。',
      '筛选出含有 2~3 个候选该数的行，找出正好有三行被限制在相同的 3 个纵列中。',
      '对这三列进行纵向全线清理！',
    ],
    deepDive:
      '剑鱼是高阶数独（Hard / Master 级）中极具观赏性与统治力的大型鱼类阵型。在九宫格布局中，三行三列由 9 个可能的交点织成天罗地网。剑鱼一旦成型，往往能一口气扫除 4~8 个顽固候选数，令终盘推演势如破竹。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [3, 7] },
        { row: 1, col: 4, candidates: [3, 9] },
        { row: 4, col: 4, candidates: [2, 3] },
        { row: 4, col: 8, candidates: [3, 5] },
        { row: 7, col: 1, candidates: [3, 8] },
        { row: 7, col: 8, candidates: [1, 3] },
        { row: 3, col: 1, candidates: [3, 6, 9] },
        { row: 5, col: 4, candidates: [3, 5, 8] },
        { row: 8, col: 8, candidates: [2, 3, 7] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [3, 7], label: '鱼顶点 (1,1)' },
        { row: 1, col: 4, notes: [3, 9], label: '鱼顶点 (1,4)' },
        { row: 4, col: 4, notes: [2, 3], label: '鱼顶点 (4,4)' },
        { row: 4, col: 8, notes: [3, 5], label: '鱼顶点 (4,8)' },
        { row: 7, col: 1, notes: [3, 8], label: '鱼顶点 (7,1)' },
        { row: 7, col: 8, notes: [1, 3], label: '鱼顶点 (7,8)' },
      ],
      causeCells: [
        { row: 1, col: 1, notes: [3, 7] },
        { row: 1, col: 4, notes: [3, 9] },
        { row: 4, col: 4, notes: [2, 3] },
        { row: 4, col: 8, notes: [3, 5] },
        { row: 7, col: 1, notes: [3, 8] },
        { row: 7, col: 8, notes: [1, 3] },
      ],
      eliminatedCandidates: [
        { row: 3, col: 1, candidate: 3, remainingNotes: [6, 9] },
        { row: 5, col: 4, candidate: 3, remainingNotes: [5, 8] },
        { row: 8, col: 8, candidate: 3, remainingNotes: [2, 7] },
      ],
      scope: { type: 'col', index: 1 },
      secondaryScope: { type: 'col', index: 4 },
      explanation:
        '数字 3 在第 2、5、8 行中，所有候选位置恰好只分布在第 2、5、9 列（三行锁三列），构成壮观的剑鱼阵。这三列的 3 必须被这三行承包，因此这三列上的其余格子 (3,1)、(5,4)、(8,8) 中的候选数 3 全部被全线清除！',
      stepBreakdown: {
        observe: '筛选候选数 3：第 2、5、8 行中，3 的位置全部分布在第 2、5、9 列。',
        deduce: '3 行 × 3 列形成闭合的 Swordfish 剑鱼骨架，列上的 3 已被独占。',
        conclude: '对第 2、5、9 列进行全线排除：清除这三列其余所有格子的候选数 3！',
      },
    },
  },

  // 13. 摩天楼战术 (悬崖双强链)
  {
    id: 'skyscraper',
    name: '摩天楼战术 (悬崖双强链)',
    englishName: 'Skyscraper',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '双柱同基不同高，双楼顶上斩余妖',
    summary:
      '基于单候选数强链的双线结构。某数字在两行中都只有 2 个候选格（强链），且两行各自有一端处于同一列（地基对齐），而另一端处于不同的两列（两座高低不同的楼顶）。同时能被这两个“楼顶”看到的任何公共格子，都不能再填入该数字。',
    howToSpot: [
      '高亮数字 X，在盘面上寻找两行，每行该数字都恰好只有 2 格可选。',
      '若其中一端在同一纵列对齐（Base 地基），另一端不在同一列（Roofs 楼顶）。',
      '找到同时处于两楼顶行或列视野内的交汇空格，将其候选数 X 坚决排除！',
    ],
    deepDive:
      '摩天楼属于经典的 Turbot Fish 家族。推导逻辑：基底的两格在同一列，绝不能同时为真（至多一真）。若楼顶一为假，则其同行基底必为真，导致另一基底为假，从而推导出另一楼顶必为真。两座楼顶必有一真，因此能同时看到两个楼顶的格子绝不能填该数字。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 2, candidates: [4, 7] },
        { row: 1, col: 7, candidates: [4, 9] },
        { row: 5, col: 2, candidates: [4, 6] },
        { row: 5, col: 5, candidates: [4, 8] },
        { row: 1, col: 5, candidates: [3, 4, 8] },
      ],
      targetCells: [
        { row: 1, col: 7, notes: [4, 9], label: '楼顶一 (1,7)' },
        { row: 5, col: 5, notes: [4, 8], label: '楼顶二 (5,5)' },
      ],
      causeCells: [
        { row: 1, col: 2, notes: [4, 7], label: '地基一 (1,2)' },
        { row: 5, col: 2, notes: [4, 6], label: '地基二 (5,2)' },
      ],
      eliminatedCandidates: [
        { row: 1, col: 5, candidate: 4, remainingNotes: [3, 8] },
      ],
      scope: { type: 'col', index: 2 },
      explanation:
        '数字 4 在第 2 行仅能填入 (1,2) 与 (1,7)，在第 6 行仅能填入 (5,2) 与 (5,5)。其中 (1,2) 与 (5,2) 同在第 3 列构成共同地基。由于同列两地基互斥，两个楼顶 (1,7) 与 (5,5) 必有一个为 4。空格 (1,5) 同时与 (1,7) 同行、与 (5,5) 同列，绝不可能为 4，候选数 4 被成功排除！',
      stepBreakdown: {
        observe: '高亮候选数 4，发现第 2 行与第 6 行各只有 2 处可选，且 (1,2) 与 (5,2) 同列对齐。',
        deduce: '同列地基至多一真，推导出两楼顶 (1,7) 与 (5,5) 必有一处必定为真（填入 4）。',
        conclude: '交汇格 (1,5) 处于两楼顶的共同交叉视野中，安全排除候选数 4！',
      },
    },
  },

  // 14. 双飞燕法 (牵牛星十字锁)
  {
    id: 'two-string-kite',
    name: '双飞燕法 (牵牛星十字锁)',
    englishName: 'Two-String Kite',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '宫中系定风筝尾，十字横空断杀芒',
    summary:
      '由同一九宫格连接的一条横向强链与一条纵向强链构成。数字 X 在某行只有 2 格、在某列也只有 2 格，且它们各自有一端深入同一个九宫格内。那么远离该宫的另外两端向外延伸出的十字交汇格，绝对不可能为数字 X。',
    howToSpot: [
      '选择一个数字 X，观察某行有且仅有 2 个候选格，某列也有且仅有 2 个候选格。',
      '发现它们各有一端落在同一个九宫格内。',
      '顺着留在外侧的另外两个端点向外拉出十字射线，交叉格中的候选数 X 即可消除！',
    ],
    deepDive:
      '双飞燕利用九宫格作为强链转换器。若行外端不为 X，则该行宫内端必为 X；因为同宫互斥，导致同宫的列端必不为 X；进而推导列外端必定为 X。反之亦然。行外端与列外端构成二难推理必有一真，因此十字交点绝不可为 X。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 2, col: 2, candidates: [6, 1] },
        { row: 2, col: 7, candidates: [6, 3] },
        { row: 1, col: 2, candidates: [6, 5] },
        { row: 6, col: 2, candidates: [6, 9] },
        { row: 6, col: 7, candidates: [2, 6, 8] },
      ],
      targetCells: [
        { row: 2, col: 7, notes: [6, 3], label: '行外翼 (2,7)' },
        { row: 6, col: 2, notes: [6, 9], label: '列外翼 (6,2)' },
      ],
      causeCells: [
        { row: 2, col: 2, notes: [6, 1], label: '宫内端一 (2,2)' },
        { row: 1, col: 2, notes: [6, 5], label: '宫内端二 (1,2)' },
      ],
      eliminatedCandidates: [
        { row: 6, col: 7, candidate: 6, remainingNotes: [2, 8] },
      ],
      explanation:
        '数字 6 在第 3 行仅在 (2,2) 与 (2,7) 出现，在第 3 列仅在 (1,2) 与 (6,2) 出现。其中 (2,2) 与 (1,2) 共同深入第 1 宫。由于同宫互斥，行外端 (2,7) 与列外端 (6,2) 必有一处为 6。两翼十字交汇格 (6,7) 绝不可为 6，成功排除！',
      stepBreakdown: {
        observe: '数字 6 在第 3 行与第 3 列各只有 2 处可选，且内端 (2,2) 与 (1,2) 同在第 1 宫。',
        deduce: '宫内两端互斥，推导两只外翼 (2,7) 与 (6,2) 必定有一端为数字 6。',
        conclude: '交汇格 (6,7) 同时处于两只风筝翼的视野中，排除其候选数 6！',
      },
    },
  },

  // 15. 唯一矩形一型 (致命矩形破局)
  {
    id: 'unique-rectangle',
    name: '唯一矩形一型 (致命矩形破局)',
    englishName: 'Unique Rectangle (UR Type 1)',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '致命矩形避双解，多余候选立成真',
    summary:
      '基于数独唯一解公理。当跨越两个九宫格、两行、两列的 4 个空格中，有 3 格的候选数仅为相同的双候选 [A, B]，而第 4 格包含 [A, B, C] 时，为了避免形成可任意对调导致多解的“致命矩形”，第 4 格必须排除 A 和 B，直接由多余候选数 C 定解。',
    howToSpot: [
      '寻找跨越两个相邻九宫格、两行、两列构成的标准矩形四角。',
      '发现其中 3 个角都是一模一样的双值格 [A, B]。',
      '第 4 个角除 [A, B] 外还含有额外数字 C，立即在第 4 角抹去 A 和 B！',
    ],
    deepDive:
      '唯一解法则是高级数独的杀手锏。若矩形四角全为 [A, B]，则填 A-B-B-A 或 B-A-A-B 均能通过检验，整盘数独将出现多个解，这在合规数独中是绝对被禁止的死局（Deadly Pattern）。为了捍卫数独唯一解，第 4 格绝不能填 A 也绝不能填 B，必须由多出的候选数接管。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [3, 7] },
        { row: 1, col: 4, candidates: [3, 7] },
        { row: 2, col: 1, candidates: [3, 7] },
        { row: 2, col: 4, candidates: [3, 7, 8] },
      ],
      targetCells: [
        { row: 2, col: 4, value: 8, label: '定解 8' },
      ],
      causeCells: [
        { row: 1, col: 1, notes: [3, 7], label: '矩形角一 (1,1)' },
        { row: 1, col: 4, notes: [3, 7], label: '矩形角二 (1,4)' },
        { row: 2, col: 1, notes: [3, 7], label: '矩形角三 (2,1)' },
      ],
      eliminatedCandidates: [
        { row: 2, col: 4, candidate: 3, remainingNotes: [8] },
        { row: 2, col: 4, candidate: 7, remainingNotes: [8] },
      ],
      explanation:
        '(1,1)、(1,4)、(2,1)、(2,4) 四格跨越第 1 宫与第 2 宫，前三格均为纯粹的 [3,7]。若 (2,4) 也填 3 或 7，盘面将陷入致命矩形双解。根据唯一解公理，(2,4) 必须排除 3 与 7，唯一留下额外候选数 8，直接锁定真值数字 【8】！',
      stepBreakdown: {
        observe: '四个角分布在两行、两列和两宫，(1,1)、(1,4)、(2,1) 均为双值 [3,7]。',
        deduce: '为规避 [3,7] 致命多解死局，第四角 (2,4) 绝不能填入 3 或 7。',
        conclude: '排除 (2,4) 中的候选数 3 和 7，直出确定解数字 8！',
      },
    },
  },

  // 16. 空矩形战术 (十字断空法)
  {
    id: 'empty-rectangle',
    name: '空矩形战术 (十字断空法)',
    englishName: 'Empty Rectangle',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '宫中虚空定十字，长链贯穿锁残局',
    summary:
      '某数字在某个九宫格内聚集在直角拐角分布（只占据该宫的某一行和某一列，无其他格子）。如果盘面外部存在一条关于该数字的强链，且强链的一端与该宫的这一行对齐，那么强链的另一端所对应的纵列与该宫另一列的交叉点，绝不能为该数字。',
    howToSpot: [
      '寻找某宫内候选数 X 呈直角拐角分布（核心交点为空，候选集中在同宫一行和一列）。',
      '在宫外寻找一条候选数 X 的强链（某行或列仅有 2 个候选格）。',
      '顺着强链另一端与该宫十字投影线的交汇格，排除其中的候选数 X！',
    ],
    deepDive:
      '空矩形完美融合了九宫格几何形态与单行强链。若该宫内的 X 在横臂上，则直接封锁交叉格同行；若在纵臂上，则该宫对齐的强链端必为假，逼迫强链另一端为真，从而纵向封锁交叉格。无论何种可能，交叉格都绝不可能是 X。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 0, col: 7, candidates: [2, 4] },
        { row: 1, col: 7, candidates: [2, 9] },
        { row: 1, col: 6, candidates: [2, 5] },
        { row: 8, col: 2, candidates: [2, 1] },
        { row: 8, col: 7, candidates: [2, 3] },
        { row: 1, col: 2, candidates: [2, 8] },
      ],
      targetCells: [
        { row: 1, col: 2, notes: [2, 8], label: '交汇格 (1,2)' },
      ],
      causeCells: [
        { row: 0, col: 7, notes: [2, 4], label: '空矩形拐角 (0,7)' },
        { row: 1, col: 7, notes: [2, 9], label: '空矩形枢纽 (1,7)' },
        { row: 1, col: 6, notes: [2, 5], label: '空矩形拐角 (1,6)' },
        { row: 8, col: 2, notes: [2, 1], label: '外部强链端一 (8,2)' },
        { row: 8, col: 7, notes: [2, 3], label: '外部强链端二 (8,7)' },
      ],
      eliminatedCandidates: [
        { row: 1, col: 2, candidate: 2, remainingNotes: [8] },
      ],
      explanation:
        '在第 3 宫中，候选数 2 局限在第 2 行 (1,6)、(1,7) 与第 8 列 (0,7)、(1,7) 构成的空矩形直角中。在第 9 行，候选数 2 存在强链 (8,2) 与 (8,7)。若 (8,7) 不为 2，则 (8,2) 必为 2 封杀第 3 列；若 (8,7) 为 2 则宫内 2 只能在第 2 行封杀该行。因此交叉点 (1,2) 无论如何都不能填 2，排除候选数 2！',
      stepBreakdown: {
        observe: '第 3 宫内候选数 2 呈空矩形拐角分布，第 9 行在 (8,2) 与 (8,7) 形成关于 2 的强链。',
        deduce: '空矩形二难分流推演：无论 2 落在拐角何处，均会逼迫第 3 列或第 2 行产生封杀。',
        conclude: '交汇格 (1,2) 受到双重夹击，安全排除候选数 2！',
      },
    },
  },

  // 18. W-Wing 翼链排除法 (强链引桥)
  {
    id: 'w-wing',
    name: 'W-Wing 翼链排除法 (强链引桥)',
    englishName: 'W-Wing',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '二翼同值各西东，强链作桥斩共融',
    summary:
      '盘面上有两个不共线、不共宫的空格，它们的候选数完全相同且都是 [A, B]。如果存在一条候选数 A 的强链（某行或列中只有两处能填 A），且强链的两端分别能看到这两个 [A, B] 格，那么能同时看到这两个 [A, B] 格的所有公共空格，都绝不能是 B！',
    howToSpot: [
      '寻找两个彼此看不见的相同双候选格（如都是 [3, 8]）。',
      '寻找一条数字 3 的强链（某行/列仅 2 处有 3），且强链两端分别能照看到这两个 [3, 8]。',
      '找出同时能看到这两个 [3, 8] 的交叉区域空格，将那里的候选数 8 坚决剔除！',
    ],
    deepDive:
      'W-Wing 构思极其精巧：因为强链的两端必有一端为真（必有一个填 3），所以必然会有一个 [3, 8] 格被剥夺填 3 的权利，从而被迫必须填 8。这意味着这两个 [3, 8] 格中至少有一个必定是 8。因此任何能同时看见它们的格子都绝不可能填 8。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [3, 8] },
        { row: 6, col: 7, candidates: [3, 8] },
        { row: 1, col: 4, candidates: [3, 5] },
        { row: 6, col: 4, candidates: [3, 9] },
        { row: 1, col: 7, candidates: [4, 8] },
        { row: 6, col: 1, candidates: [2, 8] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [3, 8], label: '翼格一 (1,1)' },
        { row: 6, col: 7, notes: [3, 8], label: '翼格二 (6,7)' },
      ],
      causeCells: [
        { row: 1, col: 4, notes: [3, 5], label: '强链端一 (1,4)' },
        { row: 6, col: 4, notes: [3, 9], label: '强链端二 (6,4)' },
      ],
      eliminatedCandidates: [
        { row: 1, col: 7, candidate: 8, remainingNotes: [4] },
        { row: 6, col: 1, candidate: 8, remainingNotes: [2] },
      ],
      explanation:
        '(1,1) 与 (6,7) 均为双值候选 [3,8]。第 5 列中数字 3 形成强链 (1,4) 与 (6,4)，它们分别与两个 [3,8] 格同行。强链两端必有一端为 3，必定迫使 (1,1) 或 (6,7) 之一填入 8。因此同时能被两翼看到的 (1,7) 与 (6,1) 绝不可能为 8，候选数 8 被排除！',
      stepBreakdown: {
        observe: '寻找两个相同的双值格 (1,1) 与 (6,7) [3,8]，以及连接两者的数字 3 强链 (1,4)-(6,4)。',
        deduce: '强链两端必有一处为 3，推导出两个 [3,8] 翼格中必定有一格必须填 8。',
        conclude: '共同视野交叉格 (1,7) 与 (6,1) 绝不可能为 8，安全清除候选数 8！',
      },
    },
  },

  // 19. 鳍状 X-Wing (带鳍鱼群)
  {
    id: 'finned-x-wing',
    name: '鳍状 X-Wing (带鳍鱼群)',
    englishName: 'Finned X-Wing',
    category: 'advanced',
    difficultyStars: 4,
    tagline: '鱼阵一角添尾鳍，同宫列首显神威',
    summary:
      '在标准 X-Wing 的基础上，其中一个顶点所在的九宫格内多出了 1~2 个候选数（鱼鳍 Fin）。虽然这破坏了纯粹的矩形对齐，但同时能被这组鱼鳍和该列鱼身共同看到的那些格子，仍然可以排除该候选数！',
    howToSpot: [
      '寻找两行中几乎构成 X-Wing 的结构，但在某一角所在宫内多出了同行同宫的额外候选格。',
      '将这枚多出来的额外格标定为“鱼鳍”。',
      '在鱼鳍所在的九宫格内、且对齐于对角纵列的格子中，排除该候选数！',
    ],
    deepDive:
      '鳍鱼是准锁闭集（ALS）与鱼类的完美融合。双重命题推导：若鱼鳍为假，则退化为标准 X-Wing，消除整列候选；若鱼鳍为真，则鱼鳍直接封杀同宫格子。因此，既属于该列又在鱼鳍同宫内的重叠区域，无论鱼鳍真假都绝不可能成立。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 2, candidates: [7, 3] },
        { row: 1, col: 8, candidates: [7, 5] },
        { row: 7, col: 2, candidates: [7, 4] },
        { row: 7, col: 7, candidates: [7, 9] },
        { row: 7, col: 8, candidates: [7, 6] },
        { row: 6, col: 8, candidates: [7, 1] },
      ],
      targetCells: [
        { row: 1, col: 2, notes: [7, 3], label: '鱼角 (1,2)' },
        { row: 1, col: 8, notes: [7, 5], label: '鱼角 (1,8)' },
        { row: 7, col: 2, notes: [7, 4], label: '鱼角 (7,2)' },
        { row: 7, col: 8, notes: [7, 6], label: '鱼角 (7,8)' },
        { row: 7, col: 7, notes: [7, 9], label: '鱼鳍 Fin (7,7)' },
      ],
      causeCells: [
        { row: 7, col: 7, notes: [7, 9], label: '鱼鳍 (7,7)' },
      ],
      eliminatedCandidates: [
        { row: 6, col: 8, candidate: 7, remainingNotes: [1] },
      ],
      scope: { type: 'box', index: 8 },
      explanation:
        '数字 7 在第 2 行位于第 3 列与第 9 列，在第 8 行位于第 3 列、第 8 列与第 9 列。其中 (7,7) 属于同宫额外多出的“鱼鳍”。空格 (6,8) 同在第 9 宫且同在第 9 列：若鱼鳍为假，X-Wing 成立封杀 (6,8)；若鱼鳍为真，同宫封杀 (6,8)。因此 (6,8) 排除候选数 7，露出数字 1！',
      stepBreakdown: {
        observe: '第 2 行与第 8 行几乎构成 X-Wing 矩阵，第 8 行 (7,7) 是附带的同宫鱼鳍。',
        deduce: '若鱼鳍为假则 X-Wing 成立封杀第 9 列；若鱼鳍为真则同宫直接封锁 (6,8)。',
        conclude: '重叠交汇格 (6,8) 无论如何都不能填 7，安全排除候选数 7！',
      },
    },
  },

  // 21. 水母战术 (四阶海网)
  {
    id: 'jellyfish',
    name: '水母战术 (四阶海网)',
    englishName: 'Jellyfish (4-Fish)',
    category: 'advanced',
    difficultyStars: 5,
    tagline: '四行四列织天网，浩瀚烟波锁四魔',
    summary:
      '鱼类矩阵的高阶形态（4-Fish）。某数字在 4 行中出现的所有候选格，其所在的纵列加起来不超过 4 列。这 4 行的该数字必定分布在这 4 列的交点上，因此这 4 列其余所有格子中的该候选数均可全线抹除。',
    howToSpot: [
      '当 2 阶 X-Wing 和 3 阶剑鱼均无法突破时，审视数字在全局各行的分布。',
      '挑选 4 行，观察它们的候选数 X 是否仅仅被限制在相同的 4 列之中。',
      '顺着这 4 列纵向巡查，将这 4 行以外的所有候选数 X 全部扫清！',
    ],
    deepDive:
      '水母战术是鱼类排除理论的四维展现。在 9×9 棋盘中，4 行对应 4 列锁死后，剩下的 5 行 5 列也必然完全互锁。这属于高级玩家手工破拆恶魔级题目的杀手锏，一击即可扫除纵向四条战线上的大量干扰。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [1, 4] },
        { row: 1, col: 3, candidates: [1, 7] },
        { row: 3, col: 3, candidates: [1, 9] },
        { row: 3, col: 6, candidates: [1, 8] },
        { row: 5, col: 1, candidates: [1, 5] },
        { row: 5, col: 8, candidates: [1, 2] },
        { row: 7, col: 6, candidates: [1, 3] },
        { row: 7, col: 8, candidates: [1, 6] },
        { row: 0, col: 1, candidates: [1, 9] },
        { row: 4, col: 3, candidates: [1, 4] },
        { row: 8, col: 6, candidates: [1, 5] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [1, 4], label: '水母角 (1,1)' },
        { row: 1, col: 3, notes: [1, 7], label: '水母角 (1,3)' },
        { row: 3, col: 3, notes: [1, 9], label: '水母角 (3,3)' },
        { row: 3, col: 6, notes: [1, 8], label: '水母角 (3,6)' },
        { row: 5, col: 1, notes: [1, 5], label: '水母角 (5,1)' },
        { row: 5, col: 8, notes: [1, 2], label: '水母角 (5,8)' },
        { row: 7, col: 6, notes: [1, 3], label: '水母角 (7,6)' },
        { row: 7, col: 8, notes: [1, 6], label: '水母角 (7,8)' },
      ],
      causeCells: [
        { row: 1, col: 1, notes: [1, 4] },
        { row: 3, col: 3, notes: [1, 9] },
        { row: 5, col: 8, notes: [1, 2] },
        { row: 7, col: 6, notes: [1, 3] },
      ],
      eliminatedCandidates: [
        { row: 0, col: 1, candidate: 1, remainingNotes: [9] },
        { row: 4, col: 3, candidate: 1, remainingNotes: [4] },
        { row: 8, col: 6, candidate: 1, remainingNotes: [5] },
      ],
      explanation:
        '数字 1 在第 2、4、6、8 行中的所有候选位，全部局限在第 2、4、7、9 列中，构成标准水母战术。这四行的数字 1 已经把这四列的名额完全瓜分，因此第 2、4、7、9 列在其他所有行中的候选数 1 全部被纵向清除！',
      stepBreakdown: {
        observe: '排查候选数 1，发现第 2、4、6、8 行的 1 全部落在第 2、4、7、9 列。',
        deduce: '四行四列形成完全封闭水母网，这四列其他位置不可能再出现候选数 1。',
        conclude: '全线扫除：清除 (0,1)、(4,3)、(8,6) 中的候选数 1！',
      },
    },
  },

  // 22. XYZ-Wing 枢纽消除法 (三面合围)
  {
    id: 'xyz-wing',
    name: 'XYZ-Wing 枢纽消除法 (三面合围)',
    englishName: 'XYZ-Wing',
    category: 'advanced',
    difficultyStars: 5,
    tagline: '枢纽三数坐核心，双翼同锁共宫格',
    summary:
      'XY-Wing 的三维立体升级版。枢纽格包含 3 个候选数 [X, Y, Z]，两个翼格分别包含 [X, Z] 和 [Y, Z]。其中一个翼格必须与枢纽格在同一个九宫格内，另一个在同行或同列。能同时看到枢纽格和两个翼格的交汇空格，绝不可能为 Z！',
    howToSpot: [
      '寻找一个包含 3 个候选数的核心枢纽格 [X, Y, Z]。',
      '在同宫内找到包含 [X, Z] 的翼格一，在同行/列找到包含 [Y, Z] 的翼格二。',
      '在同宫内寻找能同时被这三格看到的空格，彻底抹去候选数 Z！',
    ],
    deepDive:
      'XYZ-Wing 严密的三分支逻辑推演：1. 若枢纽填 Z，则交汇格不能为 Z；2. 若枢纽填 X，同宫翼格必为 Z，交汇格不能为 Z；3. 若枢纽填 Y，同行翼格必为 Z，交汇格不能为 Z。三条分支均推导出交汇格不可为 Z，逻辑天衣无缝。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [1, 4, 5] },
        { row: 2, col: 2, candidates: [1, 5] },
        { row: 1, col: 7, candidates: [4, 5] },
        { row: 1, col: 2, candidates: [5, 8] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [1, 4, 5], label: '三数中枢 [1,4,5]' },
        { row: 2, col: 2, notes: [1, 5], label: '同宫翼格 [1,5]' },
        { row: 1, col: 7, notes: [4, 5], label: '同行翼格 [4,5]' },
      ],
      causeCells: [
        { row: 1, col: 1, notes: [1, 4, 5] },
        { row: 2, col: 2, notes: [1, 5] },
        { row: 1, col: 7, notes: [4, 5] },
      ],
      eliminatedCandidates: [
        { row: 1, col: 2, candidate: 5, remainingNotes: [8] },
      ],
      scope: { type: 'box', index: 0 },
      explanation:
        '枢纽格 (1,1) 为 [1,4,5]，同在第 1 宫的翼格 (2,2) 为 [1,5]，同行外侧翼格 (1,7) 为 [4,5]。无论枢纽格填 5、填 1 还是填 4，枢纽或两翼必有一格填入 5。处于同宫且同行、同时能被三格看到的 (1,2) 绝不能填 5，排除后唯余直出 【8】！',
      stepBreakdown: {
        observe: '枢纽格 (1,1) 为 [1,4,5]，同宫翼格 (2,2) 为 [1,5]，同行翼格 (1,7) 为 [4,5]。',
        deduce: '三难推导：无论枢纽填 1、4 或 5，三格中至少有一格必定为 5。',
        conclude: '同宫交点 (1,2) 同时被三者共同压制，排除候选数 5 露出唯余 8！',
      },
    },
  },

  // 23. XY-Chain 双值交替链
  {
    id: 'xy-chain',
    name: 'XY-Chain 双值交替链',
    englishName: 'XY-Chain',
    category: 'advanced',
    difficultyStars: 5,
    tagline: '双值珠链环环扣，首尾同辉诛异端',
    summary:
      '由一系列双候选数空格首尾相传构成的逻辑传导链：(A,B) - (B,C) - (C,D) - (D,A)。根据双值互斥传导，链首为 A 或链尾必为 A，因此首尾两端至少有一端必定是 A！任何能同时看到链首与链尾两个端点的空格，都绝不能是 A。',
    howToSpot: [
      '在双值格密集的死局中，挑选某个双值格作为链条起点 (A, B)。',
      '寻找视线相通且共享候选数的下一个双值格 (B, C)，依次建立传导链。',
      '找到链尾与起点共享数字 A 的格子，在同时能看到链首与链尾的空格中排除候选数 A！',
    ],
    deepDive:
      'XY-Chain 是现代数独交替推理链（AIC）中最纯粹优美的形态。它仅依赖双值格内部的局部强弱链传导，跨越多个宫格和行列形成超长视距打击。这是人类手工推演解决各类魔王级数独的终极重器。',
    example: {
      clues: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
      ],
      cellNotes: [
        { row: 1, col: 1, candidates: [2, 6] },
        { row: 1, col: 7, candidates: [6, 8] },
        { row: 7, col: 7, candidates: [8, 9] },
        { row: 7, col: 3, candidates: [9, 2] },
        { row: 1, col: 3, candidates: [2, 4] },
      ],
      targetCells: [
        { row: 1, col: 1, notes: [2, 6], label: '链起点 [2,6]' },
        { row: 7, col: 3, notes: [9, 2], label: '链终点 [9,2]' },
      ],
      causeCells: [
        { row: 1, col: 7, notes: [6, 8], label: '中继一 [6,8]' },
        { row: 7, col: 7, notes: [8, 9], label: '中继二 [8,9]' },
      ],
      eliminatedCandidates: [
        { row: 1, col: 3, candidate: 2, remainingNotes: [4] },
      ],
      explanation:
        '构建四节点双值交替链：(1,1)[2,6] → (1,7)[6,8] → (7,7)[8,9] → (7,3)[9,2]。若起点 (1,1) 不为 2，则其必为 6，进而推导 (1,7) 为 8、(7,7) 为 9、终点 (7,3) 必为 2。首尾两端至少有一处必为 2。空格 (1,3) 同时看到首尾两端，绝不可能为 2，排除后唯余露出 【4】！',
      stepBreakdown: {
        observe: '四个双值格形成严密传递环链：[2,6]-(行)-[6,8]-(列)-[8,9]-(行)-[9,2]。',
        deduce: '链式传导推理：若起点不是 2，沿链传递必然导致终点必须是 2。首尾必有一端为 2。',
        conclude: '交汇格 (1,3) 同时暴露在链首与链尾的视野中，排除候选数 2 露出唯余 4！',
      },
    },
  },
];
