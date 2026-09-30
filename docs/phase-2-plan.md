# 阶段二技术方案设计：求解器可视化教学与智能提示升级

## 1. 概述与目标

在数独游戏中，许多玩家停留在“瞎猜试错”或“卡在某个格子不知道为什么”的挫败体验中。本阶段的目标是**将数独从一款单纯的数字填充游戏，升级为兼具教学、演示与沉浸感的高级解题工坊**：
1. **"逐步演示"模式 (Visual Solver Step-by-Step Tutorial)**：
   - 对当前盘面一步一步回放完整的人类逻辑推演过程（绝非直接跳出暴力穷举结果）；
   - 每一步清晰标注当前应用的逻辑技巧（唯一余数、宫/行/列排除、锁定候选数、显性数对、行列区块排除、X-Wing 等）；
   - 动态在棋盘上网格化高亮**目标格 (Target)**、**线索格/关联格 (Causes/Peers)** 以及**排除作用域 (Scope: 行/列/宫)**；
   - 提供丰富的交互控制：【上一步】、【下一步】、【自动播放 / 暂停】、【播放速度调节 (0.5x / 1x / 2x)】、【跳至终点】、【退出演示】。
2. **提示功能升级 (Smart Hint 2.0 with Rich Reasoning)**：
   - 提示不再是盲目地从终盘抓取一个数字填入；
   - 深度结合人类解题推演引擎，寻找玩家当前盘面在人类逻辑视角下的**最优下一步突破口**；
   - 在真实棋盘上实时高亮出形成该推理的**关键关联格**与**排除区域**；
   - 给出通俗易懂的“为什么是这个数”的中文逻辑教学说明；
   - 允许玩家选择“仅看思路提示（保持草稿自行动手）”或“直接填入该数”。

---

## 2. 核心架构与数据流设计

```mermaid
flowchart TD
    subgraph 求解与分析核心 (Engine Layer)
        Rater["difficultyRater.ts 推演引擎"]
        SolverSteps["generateVisualSolveSteps() 轨迹生成器"]
        SmartHintEngine["analyzeNextHint() 智能提示分析器"]
    end

    subgraph 演示与交互状态 (State Layer)
        VisualState["VisualSolverState: steps, currentIdx, isPlaying, speed"]
        ActiveHighlight["HighlightMap: targetCells, causeCells, scopeHighlight"]
        HintState["ActiveHint: type, cell, causes, explanation"]
    end

    subgraph UI 渲染层 (UI Layer)
        Board["Board.tsx (增强型网格高亮渲染)"]
        Cell["Cell.tsx (多状态炫彩光晕 + 候选数变动标记)"]
        VisualBar["VisualSolverBar.tsx (推演步骤卡片 + 步进控制台)"]
        HintModal["HintDialog.tsx (2.0 升级版推理透视面板)"]
    end

    Rater --> SolverSteps
    Rater --> SmartHintEngine
    SolverSteps --> VisualState
    SmartHintEngine --> HintState
    VisualState --> ActiveHighlight
    HintState --> ActiveHighlight
    ActiveHighlight --> Cell
    ActiveHighlight --> Board
    VisualState --> VisualBar
    HintState --> HintModal
```

---

## 3. 推演步骤数据模型 (VisualSolveStep)

为了让前端能够精准呈现推演逻辑，扩展每一步的上下文元数据：

```typescript
export interface VisualSolveStep {
  stepIndex: number;
  technique: TechniqueType;
  techniqueName: string;
  weight: number;
  // 操作类型：填入确定数 | 消除候选数
  actionType: 'place' | 'eliminate';
  // 目标单元格列表
  targetCells: { row: number; col: number; value?: number }[];
  // 促成该推导的关键线索格（例如同行/列/宫已有该数的格子，或者锁定数对所在格）
  causeCells: { row: number; col: number; value?: number }[];
  // 消除的候选数详情 (针对 Pointing, Box-Line, Pairs, X-Wing)
  eliminatedCandidates?: { row: number; col: number; candidate: number }[];
  // 作用域标记 (用于渲染行、列、宫的区域微光背景)
  scope?: {
    type: 'row' | 'col' | 'box';
    index: number;
  };
  // 人性化中文教学解说词
  title: string;
  explanation: string;
  // 当前步骤执行后的盘面快照 (9x9) 与候选数矩阵快照 (9x9 Set<number>)
  gridSnapshot: number[][];
  candidatesSnapshot: number[][][]; // 每个格子的有效候选数数组
}
```

---

## 4. 人性化解说词生成引擎 (Explanation Generator)

针对不同技巧，自动生成直观、易懂、具备教学价值的解说文案：

1. **唯一余数 (Naked Single)**：
   - *“观察第 R 行第 C 列：该格受同行已有数字 [..]、同列数字 [..] 以及第 B 宫数字 [..] 的共同排斥，仅剩唯一合法数字 【V】。”*
2. **宫内排除 (Hidden Single Box)**：
   - *“观察第 B 宫：数字 【V】 在第 R1 行和第 R2 行已被占用，因此在第 B 宫内只能填入第 R 行第 C 列。”*
3. **行/列内排除 (Hidden Single Row/Col)**：
   - *“观察第 R 行：数字 【V】 在本行其他空格均被对应列/宫的已有数字排斥，只能填入第 C 列。”*
4. **锁定候选数 (Pointing Pair/Triple)**：
   - *“观察第 B 宫：数字 【V】 的候选位置全部集中在第 R 行，因此该行其他宫的单元格绝不能为 【V】，可安全排除其候选数。”*
5. **显性数对 (Naked Pair)**：
   - *“观察第 R 行：单元格 (R, C1) 与 (R, C2) 的候选数均只有 【V1, V2】，形成显性双核数对。该行其余空格中的 【V1, V2】 均可排除。”*
6. **双链列四角消除 (X-Wing)**：
   - *“数字 【V】 在第 R1 行与第 R2 行中，候选位置仅位于第 C1 列与第 C2 列，形成矩形四角锁定。因此第 C1 列与第 C2 列其他行的候选数 【V】 均被排除。”*

---

## 5. UI 视觉渲染与手感系统

### 5.1 棋盘高亮色彩设计
- **目标格 (Target Cell)**：
  - 填入数字格：琥珀金色脉冲呼吸光晕（Amber Glow: `ring-2 ring-amber-400 bg-amber-500/20 text-amber-200`）；
  - 候选数消除格：紫罗兰色微光（Violet Glow: `ring-1 ring-purple-400 bg-purple-500/15`）。
- **线索格 (Cause Cells)**：
  - 天蓝色高亮轮廓（Sky Accent: `ring-2 ring-sky-400/80 bg-sky-500/15`），清晰告诉用户“是因为这些格子的存在，才推导出了目标”。
- **作用域连带背景 (Scope Highlight)**：
  - 涉及的整行、整列或九宫格施加温润的底色微光（`bg-indigo-500/5`），让视线快速聚焦推理焦点。

### 5.2 逐步演示控制台 (Visual Solver Bar)
- 顶部/底部吸附的轻量化卡片式设计；
- 包含步骤进度指示器（如 `步骤 12 / 46`，支持点击直接跳转进度条）；
- 技巧等级勋章（绿色代表基础技巧，蓝色代表中级进阶，紫色/金色代表高阶锁链）；
- 完整播放控制器：
  - `⏮ 到起点`
  - `◀ 上一步`
  - `▶ 播放 / ⏸ 暂停`（支持 0.5x、1x、2x 变速）
  - `▶ 下一步`
  - `⏭ 到终点`
  - `✕ 退出演示`（恢复玩家原本棋局）

---

## 6. 提示功能升级 (Smart Hint 2.0)

1. 当玩家在普通游戏中点击【提示】时：
   - 调用 `analyzeNextHint(board, selectedCell)`；
   - 若用户当前选中的空格正是逻辑突破口，优先以此为教学展开；
   - 若不是，则由引擎推演出当前盘面上**难度最低、最优雅的逻辑突破口**；
2. 棋盘同步联动：
   - 弹窗呼出的同时，棋盘自动切换到高亮对应目标格与线索格；
3. 玩家自主决策：
   - **“我已知晓（去试试）”**：不消耗提示次数（或提示次数保留），棋盘保留高亮提示让玩家自己填数；
   - **“直接填入”**：扣减 1 次提示次数，并自动填入该数字。

---

## 7. 实施与验证步骤

1. **推演扩展**：在 `src/utils/difficultyRater.ts` 中增强每一步记录的 `causeCells`、`scope`、`eliminatedCandidates` 与 `gridSnapshot`。
2. **教学轨迹生成**：编写 `generateVisualSolveSteps(initialGrid)` 工具函数，完整输出可供前端重放的步进数组。
3. **提示引擎升级**：升级 `src/utils/hint.ts`，支持更全面的高阶技巧识别与原因提取。
4. **组件研发**：
   - 编写 `src/components/VisualSolverBar.tsx`；
   - 升级 `src/components/Board.tsx` 与 `src/components/Cell.tsx` 的多重动态高亮机制；
   - 升级 `src/components/HintDialog.tsx`。
5. **单元测试与验证**：
   - 编写 `tests/visualSolver.test.ts`；
   - 确保 `npm test`、`npx vitest run --coverage`、`npm run build` 全部 PASS；
   - 验证无死循环、无内存泄漏。
