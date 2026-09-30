# 阶段三技术方案设计：本地深度战绩与成就徽章系统

## 1. 概述与目标

在数独应用中，玩家的长线动力来自于技能的成长、数据的沉淀与挑战的认可。本阶段目标是**构建完整、精细、极具正反馈的本地战绩统计与成就徽章体系**：
1. **多维度本地战绩系统 (Comprehensive Local Statistics)**：
   - 按难度（简单、中等、困难）全面追踪：
     - 游戏场次与完成数（`gamesPlayed`, `gamesWon`, 胜率）；
     - 平均通关用时（`avgTime`）与历史最好成绩（`bestTime`）；
     - 当前连胜场次（`currentStreak`）与历史最高连胜纪录（`maxStreak`）。
   - 每日一题专属追踪：当前连续打卡天数（`dailyStreak`）、历史最长打卡天数（`maxDailyStreak`）及完整打卡日历列表。
2. **成就徽章系统 (Achievement Badges System - 10 大精品徽章)**：
   - 设计至少 8 个（实际实现 10 个）涵盖速度、耐力、无提示挑战、连胜与探索维度的成就；
   - 每个成就支持进度追踪（例如打卡 3/7 天、单日 2/3 盘等）；
3. **沉浸式解锁庆祝体验 (Unlock Celebration & Feedback)**：
   - 新成就达成瞬间触发全屏礼花粒子（Confetti）、徽章发光弹窗提示与专有和弦音效；
   - `StatsModal` 升级为【数据看板】与【成就墙】双选项卡界面，支持查看已解锁与未解锁徽章详情。

---

## 2. 成就徽章详细设计矩阵 (10 大成就)

| 编号 | 成就 ID | 徽章名称 | 图标 | 解锁条件 | 体验导向 |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **1** | `first_win` | **初出茅庐** | `Award` | 任意模式或难度下成功通关 1 局 | 新手入坑破冰 |
| **2** | `speed_demon` | **极速如风** | `Zap` | 任意难度在 **180 秒（3 分钟）** 内通关 | 极限手速挑战 |
| **3** | `no_hint_hard` | **纯粹心流** | `ShieldCheck` | 在**完全不使用提示**的情况下通关【困难】难度 | 硬核推理考验 |
| **4** | `flawless` | **完美盘面** | `Sparkles` | 通关一局且**失误次数为 0** | 严谨专注度 |
| **5** | `daily_trio` | **单日三连通**| `Flame` | 在**同一自然日内**成功通关 3 盘数独 | 单日心流深度 |
| **6** | `weekly_streak`| **持之以恒** | `Calendar` | 每日一题连续打卡达成 **7 天** | 长线粘性与习惯 |
| **7** | `visual_learner`| **逻辑学者** | `Compass` | 完整体验一次“逐步演算教学模式” | 拥抱解题教学 |
| **8** | `hard_master` | **硬核宗师** | `Crown` | 通关【困难】难度且用时在 **480 秒（8 分钟）** 内 | 高阶技术成熟度 |
| **9** | `all_rounder` | **全能选手** | `Trophy` | 在简单、中等、困难三个难度均至少通关 1 局 | 全面体验 |
| **10**| `sudoku_fan` | **数独狂热者**| `Star` | 累计通关总局数达到 **10 局** | 忠诚度里程碑 |

---

## 3. 数据结构扩展设计

### 3.1 战绩与连胜数据模型 (`GameStats`)
在 `src/types/sudoku.ts` 与 `src/utils/storage.ts` 中升级战绩模型：

```typescript
export interface DifficultyStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number | null; // 秒
  totalTime: number;       // 累计秒数
  currentStreak: number;   // 当前连胜
  maxStreak: number;       // 历史最高连胜
}

export interface AchievementRecord {
  id: string;
  unlockedAt: string | null; // ISO 时间戳，null 为未解锁
  progress: number;          // 当前进度
  maxProgress: number;       // 达标数值
}

export interface GameStats {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
  dailyStreak: number;
  maxDailyStreak: number;
  lastDailyDate?: string;
  completedDailies: string[];
  // 当日通关记录 (存储日期 YYYY-MM-DD -> 计数)
  dailyWinCounts: Record<string, number>;
  // 成就解锁字典
  achievements: Record<string, AchievementRecord>;
}
```

### 3.2 结算上下文与成就检查器 (`checkAchievements`)
在每盘游戏胜利（或特定操作）时传入当前游戏上下文：

```typescript
export interface GameWinContext {
  difficulty: Difficulty;
  gameMode: GameMode;
  timeTaken: number;
  mistakesCount: number;
  hintsUsed: number;
  todayStr: string;
  stats: GameStats;
}

export function evaluateAchievements(ctx: GameWinContext): {
  newlyUnlocked: AchievementDefinition[];
  updatedStats: GameStats;
}
```

---

## 4. UI 视觉与庆祝动效设计

### 4.1 新成就解锁弹窗 (`AchievementToast` / `AchievementModal`)
- 当结算时 `newlyUnlocked.length > 0`：
  - 触发多色纸屑礼花喷射（`canvas-confetti`）；
  - 播放专属成就解锁音效（升级 `src/utils/sound.ts` 增加 `playAchievementFanfare()`，使用高低三度琶音合成）；
  - 弹出顶部浮动成就徽章卡片，附带金属质感边框和光芒呼吸动效（Glow Pulse）；
  - 支持连续解锁多个徽章的队列轮播。

### 4.2 战绩面板升级 (`StatsModal.tsx`)
- 顶部双 Tab 切换：
  - 📊 **【战绩数据】**：连胜统计、胜率饼状环形图、平均用时柱形对比、各难度最佳纪录；
  - 🏆 **【成就荣誉墙】**：网格化陈列 10 个徽章卡片。已解锁呈现绚丽金属光泽（金/蓝/紫/翡翠），未解锁呈现半透明锁闭轮廓并带有清晰的进度指示条（如 `5 / 7 天`）。

---

## 5. 实施与验证步骤

1. **底层类型与存储扩展**：
   - 在 `src/types/sudoku.ts` 扩展 `GameStats` 与 `DifficultyStats`；
   - 在 `src/utils/storage.ts` 编写数据迁移与向前兼容代码，并扩展连胜算法；
2. **成就引擎实现**：
   - 编写 `src/utils/achievements.ts`，定义 10 个成就的标准属性、判断条件与进度计算；
3. **音效与动画支持**：
   - 在 `src/utils/sound.ts` 中实现成就和弦音效 `playAchievementFanfare()`；
4. **组件研发与升级**：
   - 升级 `src/components/StatsModal.tsx`（添加战绩连胜卡片 + 成就荣誉墙 Tab）；
   - 编写 `src/components/AchievementToast.tsx`（实时解锁弹窗动画）；
   - 在 `src/App.tsx` 中集成胜利后的成就判定与弹窗调度；
5. **单元测试与全量验收**：
   - 编写 `tests/achievements.test.ts`；
   - 运行 `npx vitest run --coverage`，保证全覆盖；
   - 运行 `npm test` 冒烟测试与 `npm run build` 打包验证。
