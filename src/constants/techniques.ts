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
  { id: 'intermediate', label: '进阶战术 (5)' },
  { id: 'advanced', label: '大师高阶 (3)' },
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

  // 9. X-Wing 矩阵排除法 (四角天网)
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
];
