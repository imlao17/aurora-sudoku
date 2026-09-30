import { GRID_SIZE, BOX_SIZE } from '../constants/sudoku';
import { cloneGrid, getBoxIndex, solveSudoku } from './sudoku';
import type { TechniqueType } from './difficultyRater';

export interface VisualSolveStep {
  stepIndex: number;
  technique: TechniqueType | 'final-fill';
  techniqueName: string;
  weight: number;
  actionType: 'place' | 'eliminate';
  targetCells: { row: number; col: number; value?: number }[];
  causeCells: { row: number; col: number; value?: number }[];
  eliminatedCandidates?: { row: number; col: number; candidate: number }[];
  scope?: {
    type: 'row' | 'col' | 'box';
    index: number;
  };
  title: string;
  description: string;
  gridSnapshot: number[][];
  candidatesSnapshot: number[][][]; // 9x9 array of candidate numbers
}

const TECHNIQUE_LABELS: Record<TechniqueType | 'final-fill', { name: string; weight: number }> = {
  'naked-single': { name: '唯一余数 (Naked Single)', weight: 10 },
  'hidden-single-box': { name: '宫内排除 (Hidden Single Box)', weight: 20 },
  'hidden-single-row': { name: '行内排除 (Hidden Single Row)', weight: 25 },
  'hidden-single-col': { name: '列内排除 (Hidden Single Col)', weight: 25 },
  'pointing-pair': { name: '锁定候选数 (Pointing Pair/Triple)', weight: 60 },
  'box-line-reduction': { name: '行列区块排除 (Box-Line Reduction)', weight: 75 },
  'naked-pair': { name: '显性数对 (Naked Pair)', weight: 110 },
  'hidden-pair': { name: '隐性数对 (Hidden Pair)', weight: 140 },
  'x-wing': { name: '双链列四角消除 (X-Wing)', weight: 200 },
  'final-fill': { name: '终盘推演 (Deduction Complete)', weight: 30 },
};

function snapshotCandidates(candidates: Set<number>[][]): number[][][] {
  return candidates.map((row) => row.map((set) => Array.from(set).sort((a, b) => a - b)));
}

function eliminatePeers(candidates: Set<number>[][], row: number, col: number, val: number): void {
  for (let i = 0; i < GRID_SIZE; i++) {
    candidates[row][i].delete(val);
    candidates[i][col].delete(val);
  }
  const startR = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startC = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      candidates[startR + r][startC + c].delete(val);
    }
  }
}

function applyPlacement(
  grid: number[][],
  candidates: Set<number>[][],
  row: number,
  col: number,
  val: number
): void {
  grid[row][col] = val;
  candidates[row][col].clear();
  eliminatePeers(candidates, row, col, val);
}

/**
 * Generates an end-to-end step-by-step visual deduction tutorial trajectory
 * for the given board, complete with grid snapshots, candidate matrix snapshots,
 * cause cells, and rich educational Chinese commentary.
 */
export function generateVisualSolveSteps(initialGrid: number[][]): VisualSolveStep[] {
  const grid = cloneGrid(initialGrid);

  // Initialize candidate matrix
  const candidates: Set<number>[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      if (grid[r][c] !== 0) return new Set<number>();
      const set = new Set<number>();
      for (let n = 1; n <= GRID_SIZE; n++) set.add(n);
      return set;
    })
  );

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        eliminatePeers(candidates, r, c, val);
      }
    }
  }

  const steps: VisualSolveStep[] = [];

  // Step 0: Initial Board Snapshot
  steps.push({
    stepIndex: 0,
    technique: 'naked-single',
    techniqueName: '开局盘面 (Initial Board)',
    weight: 0,
    actionType: 'place',
    targetCells: [],
    causeCells: [],
    title: '开局初始盘面',
    description: '盘面已加载。接下来将依照人类解题逻辑，从基础观察到进阶技巧一步步推演求解。',
    gridSnapshot: cloneGrid(grid),
    candidatesSnapshot: snapshotCandidates(candidates),
  });

  let progress = true;
  while (progress) {
    progress = false;

    // 1. Naked Single (唯一余数)
    const ns = findVisualNakedSingle(grid, candidates);
    if (ns) {
      applyPlacement(grid, candidates, ns.target.row, ns.target.col, ns.target.value!);
      steps.push({
        stepIndex: steps.length,
        technique: 'naked-single',
        techniqueName: TECHNIQUE_LABELS['naked-single'].name,
        weight: TECHNIQUE_LABELS['naked-single'].weight,
        actionType: 'place',
        targetCells: [ns.target],
        causeCells: ns.causes,
        scope: ns.scope,
        title: '唯一余数 (Naked Single)',
        description: ns.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }

    // 2. Hidden Single (宫内 / 行内 / 列内排除)
    const hs = findVisualHiddenSingle(grid, candidates);
    if (hs) {
      applyPlacement(grid, candidates, hs.target.row, hs.target.col, hs.target.value!);
      steps.push({
        stepIndex: steps.length,
        technique: hs.technique,
        techniqueName: TECHNIQUE_LABELS[hs.technique].name,
        weight: TECHNIQUE_LABELS[hs.technique].weight,
        actionType: 'place',
        targetCells: [hs.target],
        causeCells: hs.causes,
        scope: hs.scope,
        title: hs.title,
        description: hs.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }

    // 3. Pointing Pair / Triple (锁定候选数)
    const pp = findVisualPointingPair(grid, candidates);
    if (pp) {
      steps.push({
        stepIndex: steps.length,
        technique: 'pointing-pair',
        techniqueName: TECHNIQUE_LABELS['pointing-pair'].name,
        weight: TECHNIQUE_LABELS['pointing-pair'].weight,
        actionType: 'eliminate',
        targetCells: pp.targetCells,
        causeCells: pp.causeCells,
        eliminatedCandidates: pp.eliminated,
        scope: pp.scope,
        title: '锁定候选数 (Pointing Pair/Triple)',
        description: pp.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }

    // 4. Box-Line Reduction (行列对宫排除)
    const blr = findVisualBoxLineReduction(grid, candidates);
    if (blr) {
      steps.push({
        stepIndex: steps.length,
        technique: 'box-line-reduction',
        techniqueName: TECHNIQUE_LABELS['box-line-reduction'].name,
        weight: TECHNIQUE_LABELS['box-line-reduction'].weight,
        actionType: 'eliminate',
        targetCells: blr.targetCells,
        causeCells: blr.causeCells,
        eliminatedCandidates: blr.eliminated,
        scope: blr.scope,
        title: '行列区块排除 (Box-Line Reduction)',
        description: blr.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }

    // 5. Naked Pair (显性数对)
    const np = findVisualNakedPair(grid, candidates);
    if (np) {
      steps.push({
        stepIndex: steps.length,
        technique: 'naked-pair',
        techniqueName: TECHNIQUE_LABELS['naked-pair'].name,
        weight: TECHNIQUE_LABELS['naked-pair'].weight,
        actionType: 'eliminate',
        targetCells: np.targetCells,
        causeCells: np.causeCells,
        eliminatedCandidates: np.eliminated,
        scope: np.scope,
        title: '显性数对 (Naked Pair)',
        description: np.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }

    // 6. X-Wing (双链列四角消除)
    const xw = findVisualXWing(grid, candidates);
    if (xw) {
      steps.push({
        stepIndex: steps.length,
        technique: 'x-wing',
        techniqueName: TECHNIQUE_LABELS['x-wing'].name,
        weight: TECHNIQUE_LABELS['x-wing'].weight,
        actionType: 'eliminate',
        targetCells: xw.targetCells,
        causeCells: xw.causeCells,
        eliminatedCandidates: xw.eliminated,
        title: '双链列四角消除 (X-Wing)',
        description: xw.description,
        gridSnapshot: cloneGrid(grid),
        candidatesSnapshot: snapshotCandidates(candidates),
      });
      progress = true;
      continue;
    }
  }

  // If board still has empty cells, complete remaining with backtrack solver
  let remainingEmpty = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) remainingEmpty++;
    }
  }

  if (remainingEmpty > 0) {
    const solvedGrid = cloneGrid(grid);
    solveSudoku(solvedGrid);

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          const val = solvedGrid[r][c];
          applyPlacement(grid, candidates, r, c, val);
          steps.push({
            stepIndex: steps.length,
            technique: 'final-fill',
            techniqueName: '终盘推演补全',
            weight: 30,
            actionType: 'place',
            targetCells: [{ row: r, col: c, value: val }],
            causeCells: [],
            title: '综合推演填入',
            description: `第 ${r + 1} 行第 ${c + 1} 列填入唯一确定解 【${val}】。`,
            gridSnapshot: cloneGrid(grid),
            candidatesSnapshot: snapshotCandidates(candidates),
          });
        }
      }
    }
  }

  return steps;
}

// ----------------------------------------------------------------------
// Detailed Technique Matchers with Causes & Context
// ----------------------------------------------------------------------

function findVisualNakedSingle(
  grid: number[][],
  candidates: Set<number>[][]
): {
  target: { row: number; col: number; value: number };
  causes: { row: number; col: number; value: number }[];
  scope?: { type: 'row' | 'col' | 'box'; index: number };
  description: string;
} | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 1) {
        const val = candidates[r][c].values().next().value!;

        // Collect cause cells (filled peers that eliminated other numbers)
        const causes: { row: number; col: number; value: number }[] = [];
        const seen = new Set<string>();

        // Row peers
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i !== c && grid[r][i] !== 0) {
            const key = `${r},${i}`;
            if (!seen.has(key)) {
              seen.add(key);
              causes.push({ row: r, col: i, value: grid[r][i] });
            }
          }
        }
        // Col peers
        for (let i = 0; i < GRID_SIZE; i++) {
          if (i !== r && grid[i][c] !== 0) {
            const key = `${i},${c}`;
            if (!seen.has(key)) {
              seen.add(key);
              causes.push({ row: i, col: c, value: grid[i][c] });
            }
          }
        }
        // Box peers
        const startR = Math.floor(r / BOX_SIZE) * BOX_SIZE;
        const startC = Math.floor(c / BOX_SIZE) * BOX_SIZE;
        for (let br = 0; br < BOX_SIZE; br++) {
          for (let bc = 0; bc < BOX_SIZE; bc++) {
            const cr = startR + br;
            const cc = startC + bc;
            if ((cr !== r || cc !== c) && grid[cr][cc] !== 0) {
              const key = `${cr},${cc}`;
              if (!seen.has(key)) {
                seen.add(key);
                causes.push({ row: cr, col: cc, value: grid[cr][cc] });
              }
            }
          }
        }

        const boxIdx = getBoxIndex(r, c);
        return {
          target: { row: r, col: c, value: val },
          causes,
          scope: { type: 'box', index: boxIdx },
          description: `观察第 ${r + 1} 行第 ${c + 1} 列：同行、同列及第 ${boxIdx + 1} 宫内已有数字排斥了 1~9 中除 【${val}】 外的所有候选数，故该格为唯一余数！`,
        };
      }
    }
  }
  return null;
}

function findVisualHiddenSingle(
  grid: number[][],
  candidates: Set<number>[][]
): {
  technique: 'hidden-single-box' | 'hidden-single-row' | 'hidden-single-col';
  target: { row: number; col: number; value: number };
  causes: { row: number; col: number; value: number }[];
  scope: { type: 'row' | 'col' | 'box'; index: number };
  title: string;
  description: string;
} | null {
  // 1. Box Hidden Single
  for (let b = 0; b < GRID_SIZE; b++) {
    const startR = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startC = (b % BOX_SIZE) * BOX_SIZE;
    for (let num = 1; num <= GRID_SIZE; num++) {
      const places: { r: number; c: number }[] = [];
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = startR + r;
          const cc = startC + c;
          if (grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
            places.push({ r: cr, c: cc });
          }
        }
      }
      if (places.length === 1) {
        const target = places[0];
        // Causes: cells in crossing rows/cols outside box that contain num
        const causes: { row: number; col: number; value: number }[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          if (c < startC || c >= startC + BOX_SIZE) {
            for (let r = 0; r < BOX_SIZE; r++) {
              if (grid[startR + r][c] === num) {
                causes.push({ row: startR + r, col: c, value: num });
              }
            }
          }
        }
        for (let r = 0; r < GRID_SIZE; r++) {
          if (r < startR || r >= startR + BOX_SIZE) {
            for (let c = 0; c < BOX_SIZE; c++) {
              if (grid[r][startC + c] === num) {
                causes.push({ row: r, col: startC + c, value: num });
              }
            }
          }
        }

        return {
          technique: 'hidden-single-box',
          target: { row: target.r, col: target.c, value: num },
          causes,
          scope: { type: 'box', index: b },
          title: '宫内排除 (Hidden Single Box)',
          description: `在第 ${b + 1} 宫中：因为交叉行与列中已存在数字 【${num}】，导致宫内其余空格均无法填入，因此只能填入第 ${target.r + 1} 行第 ${target.c + 1} 列。`,
        };
      }
    }
  }

  // 2. Row Hidden Single
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let num = 1; num <= GRID_SIZE; num++) {
      const places: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          places.push(c);
        }
      }
      if (places.length === 1) {
        const col = places[0];
        const causes: { row: number; col: number; value: number }[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          if (c !== col && grid[r][c] === 0) {
            for (let i = 0; i < GRID_SIZE; i++) {
              if (grid[i][c] === num) {
                causes.push({ row: i, col: c, value: num });
                break;
              }
            }
          }
        }

        return {
          technique: 'hidden-single-row',
          target: { row: r, col, value: num },
          causes,
          scope: { type: 'row', index: r },
          title: '行内排除 (Hidden Single Row)',
          description: `观察第 ${r + 1} 行：该行中只有第 ${col + 1} 列能够容纳数字 【${num}】，其余空格均受到对应列的数字排除。`,
        };
      }
    }
  }

  // 3. Col Hidden Single
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let num = 1; num <= GRID_SIZE; num++) {
      const places: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          places.push(r);
        }
      }
      if (places.length === 1) {
        const row = places[0];
        const causes: { row: number; col: number; value: number }[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          if (r !== row && grid[r][c] === 0) {
            for (let i = 0; i < GRID_SIZE; i++) {
              if (grid[r][i] === num) {
                causes.push({ row: r, col: i, value: num });
                break;
              }
            }
          }
        }

        return {
          technique: 'hidden-single-col',
          target: { row, col: c, value: num },
          causes,
          scope: { type: 'col', index: c },
          title: '列内排除 (Hidden Single Col)',
          description: `观察第 ${c + 1} 列：该列中只有第 ${row + 1} 行能够容纳数字 【${num}】，其余空格均受到对应行的数字排除。`,
        };
      }
    }
  }

  return null;
}

function findVisualPointingPair(
  grid: number[][],
  candidates: Set<number>[][]
): {
  targetCells: { row: number; col: number }[];
  causeCells: { row: number; col: number }[];
  eliminated: { row: number; col: number; candidate: number }[];
  scope: { type: 'box'; index: number };
  description: string;
} | null {
  for (let b = 0; b < GRID_SIZE; b++) {
    const startR = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startC = (b % BOX_SIZE) * BOX_SIZE;

    for (let num = 1; num <= GRID_SIZE; num++) {
      const rows: number[] = [];
      const cols: number[] = [];
      const boxCells: { row: number; col: number }[] = [];

      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = startR + r;
          const cc = startC + c;
          if (grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
            rows.push(cr);
            cols.push(cc);
            boxCells.push({ row: cr, col: cc });
          }
        }
      }

      if (rows.length >= 2 && rows.length <= 3) {
        // Pointing Row
        if (rows.every((r) => r === rows[0])) {
          const targetRow = rows[0];
          const eliminated: { row: number; col: number; candidate: number }[] = [];
          const targetCells: { row: number; col: number }[] = [];

          for (let c = 0; c < GRID_SIZE; c++) {
            const inBox = c >= startC && c < startC + BOX_SIZE;
            if (!inBox && grid[targetRow][c] === 0 && candidates[targetRow][c].has(num)) {
              candidates[targetRow][c].delete(num);
              eliminated.push({ row: targetRow, col: c, candidate: num });
              targetCells.push({ row: targetRow, col: c });
            }
          }

          if (eliminated.length > 0) {
            return {
              targetCells,
              causeCells: boxCells,
              eliminated,
              scope: { type: 'box', index: b },
              description: `第 ${b + 1} 宫中数字 【${num}】 仅锁定在第 ${targetRow + 1} 行。因此该行其余宫内的单元格绝不能填入 【${num}】，已排除其候选数！`,
            };
          }
        }

        // Pointing Col
        if (cols.every((c) => c === cols[0])) {
          const targetCol = cols[0];
          const eliminated: { row: number; col: number; candidate: number }[] = [];
          const targetCells: { row: number; col: number }[] = [];

          for (let r = 0; r < GRID_SIZE; r++) {
            const inBox = r >= startR && r < startR + BOX_SIZE;
            if (!inBox && grid[r][targetCol] === 0 && candidates[r][targetCol].has(num)) {
              candidates[r][targetCol].delete(num);
              eliminated.push({ row: r, col: targetCol, candidate: num });
              targetCells.push({ row: r, col: targetCol });
            }
          }

          if (eliminated.length > 0) {
            return {
              targetCells,
              causeCells: boxCells,
              eliminated,
              scope: { type: 'box', index: b },
              description: `第 ${b + 1} 宫中数字 【${num}】 仅锁定在第 ${targetCol + 1} 列。因此该列其余宫内的单元格绝不能填入 【${num}】，已排除其候选数！`,
            };
          }
        }
      }
    }
  }
  return null;
}

function findVisualBoxLineReduction(
  grid: number[][],
  candidates: Set<number>[][]
): {
  targetCells: { row: number; col: number }[];
  causeCells: { row: number; col: number }[];
  eliminated: { row: number; col: number; candidate: number }[];
  scope: { type: 'row' | 'col'; index: number };
  description: string;
} | null {
  for (let num = 1; num <= GRID_SIZE; num++) {
    // In Rows
    for (let r = 0; r < GRID_SIZE; r++) {
      const cols: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          cols.push(c);
        }
      }
      if (cols.length >= 2 && cols.length <= 3) {
        const firstBox = Math.floor(cols[0] / BOX_SIZE);
        if (cols.every((c) => Math.floor(c / BOX_SIZE) === firstBox)) {
          const startR = Math.floor(r / BOX_SIZE) * BOX_SIZE;
          const startC = firstBox * BOX_SIZE;
          const eliminated: { row: number; col: number; candidate: number }[] = [];
          const targetCells: { row: number; col: number }[] = [];

          for (let br = 0; br < BOX_SIZE; br++) {
            for (let bc = 0; bc < BOX_SIZE; bc++) {
              const cr = startR + br;
              const cc = startC + bc;
              if (cr !== r && grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
                candidates[cr][cc].delete(num);
                eliminated.push({ row: cr, col: cc, candidate: num });
                targetCells.push({ row: cr, col: cc });
              }
            }
          }

          if (eliminated.length > 0) {
            const causeCells = cols.map((c) => ({ row: r, col: c }));
            const boxIdx = Math.floor(startR / BOX_SIZE) * BOX_SIZE + Math.floor(startC / BOX_SIZE);
            return {
              targetCells,
              causeCells,
              eliminated,
              scope: { type: 'row', index: r },
              description: `第 ${r + 1} 行中数字 【${num}】 完全局限在第 ${boxIdx + 1} 宫。因此该宫其余行绝不可能包含 【${num}】，已剔除其候选数！`,
            };
          }
        }
      }
    }
  }
  return null;
}

function findVisualNakedPair(
  grid: number[][],
  candidates: Set<number>[][]
): {
  targetCells: { row: number; col: number }[];
  causeCells: { row: number; col: number }[];
  eliminated: { row: number; col: number; candidate: number }[];
  scope: { type: 'row' | 'col' | 'box'; index: number };
  description: string;
} | null {
  // Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const pairCells: { c: number; nums: number[] }[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        pairCells.push({ c, nums: Array.from(candidates[r][c]).sort((a, b) => a - b) });
      }
    }

    for (let i = 0; i < pairCells.length; i++) {
      for (let j = i + 1; j < pairCells.length; j++) {
        const p1 = pairCells[i];
        const p2 = pairCells[j];
        if (p1.nums[0] === p2.nums[0] && p1.nums[1] === p2.nums[1]) {
          const eliminated: { row: number; col: number; candidate: number }[] = [];
          const targetCells: { row: number; col: number }[] = [];

          for (let c = 0; c < GRID_SIZE; c++) {
            if (c !== p1.c && c !== p2.c && grid[r][c] === 0) {
              for (const n of p1.nums) {
                if (candidates[r][c].has(n)) {
                  candidates[r][c].delete(n);
                  eliminated.push({ row: r, col: c, candidate: n });
                  targetCells.push({ row: r, col: c });
                }
              }
            }
          }

          if (eliminated.length > 0) {
            return {
              targetCells,
              causeCells: [{ row: r, col: p1.c }, { row: r, col: p2.c }],
              eliminated,
              scope: { type: 'row', index: r },
              description: `在第 ${r + 1} 行中，第 ${p1.c + 1} 列与第 ${p2.c + 1} 列形成显性数对 【${p1.nums.join(', ')}】。该行其余单元格已排除这些候选数！`,
            };
          }
        }
      }
    }
  }
  return null;
}

function findVisualXWing(
  grid: number[][],
  candidates: Set<number>[][]
): {
  targetCells: { row: number; col: number }[];
  causeCells: { row: number; col: number }[];
  eliminated: { row: number; col: number; candidate: number }[];
  description: string;
} | null {
  for (let num = 1; num <= GRID_SIZE; num++) {
    const rowPositions: { r: number; c1: number; c2: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const cols: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          cols.push(c);
        }
      }
      if (cols.length === 2) {
        rowPositions.push({ r, c1: cols[0], c2: cols[1] });
      }
    }

    for (let i = 0; i < rowPositions.length; i++) {
      for (let j = i + 1; j < rowPositions.length; j++) {
        const rp1 = rowPositions[i];
        const rp2 = rowPositions[j];
        if (rp1.c1 === rp2.c1 && rp1.c2 === rp2.c2) {
          const eliminated: { row: number; col: number; candidate: number }[] = [];
          const targetCells: { row: number; col: number }[] = [];

          for (let r = 0; r < GRID_SIZE; r++) {
            if (r !== rp1.r && r !== rp2.r) {
              if (grid[r][rp1.c1] === 0 && candidates[r][rp1.c1].has(num)) {
                candidates[r][rp1.c1].delete(num);
                eliminated.push({ row: r, col: rp1.c1, candidate: num });
                targetCells.push({ row: r, col: rp1.c1 });
              }
              if (grid[r][rp1.c2] === 0 && candidates[r][rp1.c2].has(num)) {
                candidates[r][rp1.c2].delete(num);
                eliminated.push({ row: r, col: rp1.c2, candidate: num });
                targetCells.push({ row: r, col: rp1.c2 });
              }
            }
          }

          if (eliminated.length > 0) {
            return {
              targetCells,
              causeCells: [
                { row: rp1.r, col: rp1.c1 },
                { row: rp1.r, col: rp1.c2 },
                { row: rp2.r, col: rp2.c1 },
                { row: rp2.r, col: rp2.c2 },
              ],
              eliminated,
              description: `数字 【${num}】 在第 ${rp1.r + 1} 行与第 ${rp2.r + 1} 行的候选数仅位于第 ${rp1.c1 + 1} 列与第 ${rp1.c2 + 1} 列，构成 X-Wing 四角矩形。这两列其余行的候选数已安全消除！`,
            };
          }
        }
      }
    }
  }
  return null;
}
