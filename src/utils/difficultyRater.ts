import { GRID_SIZE, BOX_SIZE } from '../constants/sudoku';
import { cloneGrid, getBoxIndex } from './sudoku';

export type TechniqueType =
  | 'naked-single'
  | 'hidden-single-box'
  | 'hidden-single-row'
  | 'hidden-single-col'
  | 'pointing-pair'
  | 'box-line-reduction'
  | 'naked-pair'
  | 'hidden-pair'
  | 'x-wing';

export interface StepRecord {
  technique: TechniqueType;
  name: string;
  weight: number;
  row?: number;
  col?: number;
  value?: number;
  description: string;
}

export interface DifficultyAnalysis {
  score: number;
  tier: 'easy' | 'medium' | 'hard' | 'expert';
  peakTechnique: string;
  techniqueCounts: Record<string, number>;
  totalSteps: number;
  isSolvableLogically: boolean;
  clueCount: number;
}

const TECHNIQUE_WEIGHTS: Record<TechniqueType, { name: string; weight: number }> = {
  'naked-single': { name: '唯一余数 (Naked Single)', weight: 10 },
  'hidden-single-box': { name: '宫内排除 (Hidden Single Box)', weight: 20 },
  'hidden-single-row': { name: '行内排除 (Hidden Single Row)', weight: 25 },
  'hidden-single-col': { name: '列内排除 (Hidden Single Col)', weight: 25 },
  'pointing-pair': { name: '锁定候选数 (Pointing Pair/Triple)', weight: 60 },
  'box-line-reduction': { name: '行列区块排除 (Box-Line Reduction)', weight: 75 },
  'naked-pair': { name: '显性数对 (Naked Pair)', weight: 110 },
  'hidden-pair': { name: '隐性数对 (Hidden Pair)', weight: 140 },
  'x-wing': { name: '双链列四角消除 (X-Wing)', weight: 200 },
};

/**
 * Human Logic Deduction Engine & Difficulty Rater
 * Simulates human mental deduction without trial-and-error guessing.
 */
export function rateDifficulty(initialGrid: number[][]): DifficultyAnalysis {
  const grid = cloneGrid(initialGrid);

  // Candidate matrix: candidates[r][c] is a Set<number>
  const candidates: Set<number>[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
    Array.from({ length: GRID_SIZE }, (_, c) => {
      if (grid[r][c] !== 0) return new Set<number>();
      const set = new Set<number>();
      for (let n = 1; n <= GRID_SIZE; n++) set.add(n);
      return set;
    })
  );

  // Initialize candidates by eliminating existing clues
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        eliminatePeers(candidates, r, c, val);
      }
    }
  }

  let clueCount = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== 0) clueCount++;
    }
  }

  const steps: StepRecord[] = [];
  const techniqueCounts: Record<string, number> = {};
  let peakWeight = 0;
  let peakTechniqueName = '基本已知数 (Clues)';

  // Main deduction loop: try techniques from simplest to most advanced
  let progress = true;
  while (progress) {
    progress = false;

    // 1. Naked Single
    const ns = findNakedSingle(grid, candidates);
    if (ns) {
      applyPlacement(grid, candidates, ns.row, ns.col, ns.value);
      recordStep(ns, steps, techniqueCounts);
      if (ns.weight > peakWeight) {
        peakWeight = ns.weight;
        peakTechniqueName = ns.name;
      }
      progress = true;
      continue;
    }

    // 2. Hidden Single (Box -> Row -> Col)
    const hs = findHiddenSingle(grid, candidates);
    if (hs) {
      applyPlacement(grid, candidates, hs.row, hs.col, hs.value);
      recordStep(hs, steps, techniqueCounts);
      if (hs.weight > peakWeight) {
        peakWeight = hs.weight;
        peakTechniqueName = hs.name;
      }
      progress = true;
      continue;
    }

    // 3. Pointing Pairs / Triples (Candidate elimination)
    const pp = findPointingPair(grid, candidates);
    if (pp) {
      recordStep(pp, steps, techniqueCounts);
      if (pp.weight > peakWeight) {
        peakWeight = pp.weight;
        peakTechniqueName = pp.name;
      }
      progress = true;
      continue;
    }

    // 4. Box-Line Reduction (Candidate elimination)
    const blr = findBoxLineReduction(grid, candidates);
    if (blr) {
      recordStep(blr, steps, techniqueCounts);
      if (blr.weight > peakWeight) {
        peakWeight = blr.weight;
        peakTechniqueName = blr.name;
      }
      progress = true;
      continue;
    }

    // 5. Naked Pairs
    const np = findNakedPair(grid, candidates);
    if (np) {
      recordStep(np, steps, techniqueCounts);
      if (np.weight > peakWeight) {
        peakWeight = np.weight;
        peakTechniqueName = np.name;
      }
      progress = true;
      continue;
    }

    // 5b. Hidden Pairs
    const hp = findHiddenPair(grid, candidates);
    if (hp) {
      recordStep(hp, steps, techniqueCounts);
      if (hp.weight > peakWeight) {
        peakWeight = hp.weight;
        peakTechniqueName = hp.name;
      }
      progress = true;
      continue;
    }

    // 6. X-Wing
    const xw = findXWing(grid, candidates);
    if (xw) {
      recordStep(xw, steps, techniqueCounts);
      if (xw.weight > peakWeight) {
        peakWeight = xw.weight;
        peakTechniqueName = xw.name;
      }
      progress = true;
      continue;
    }
  }

  // Check if fully solved logically
  let remainingEmpty = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) remainingEmpty++;
    }
  }

  const isSolvableLogically = remainingEmpty === 0;

  // Calculate difficulty score
  let totalTechniqueScore = 0;
  for (const s of steps) {
    totalTechniqueScore += s.weight;
  }

  // Base score + Peak weight bonus + Empty cell factor
  const emptyFactor = (81 - clueCount) * 4;
  let finalScore = totalTechniqueScore + peakWeight * 2 + emptyFactor;

  if (!isSolvableLogically) {
    // Requires bifurcation / trial & error / extreme chained logic
    finalScore += 500 + remainingEmpty * 25;
  }

  // Classify Tier based on peak human technique and overall deduction complexity
  let tier: 'easy' | 'medium' | 'hard' | 'expert';
  if (!isSolvableLogically || finalScore >= 1800) {
    tier = 'expert';
  } else if (peakWeight >= 110 || finalScore >= 1200) {
    tier = 'hard';
  } else if (peakWeight >= 25 || finalScore >= 850) {
    tier = 'medium';
  } else {
    tier = 'easy';
  }

  return {
    score: Math.round(finalScore),
    tier,
    peakTechnique: peakTechniqueName,
    techniqueCounts,
    totalSteps: steps.length,
    isSolvableLogically,
    clueCount,
  };
}

function recordStep(step: StepRecord, steps: StepRecord[], counts: Record<string, number>): void {
  steps.push(step);
  counts[step.name] = (counts[step.name] || 0) + 1;
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

// 1. Naked Single
function findNakedSingle(
  grid: number[][],
  candidates: Set<number>[][]
): (StepRecord & { row: number; col: number; value: number }) | null {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 1) {
        const val = candidates[r][c].values().next().value!;
        return {
          technique: 'naked-single',
          name: TECHNIQUE_WEIGHTS['naked-single'].name,
          weight: TECHNIQUE_WEIGHTS['naked-single'].weight,
          row: r,
          col: c,
          value: val,
          description: `第 ${r + 1} 行第 ${c + 1} 列仅存唯一可能数字 【${val}】`,
        };
      }
    }
  }
  return null;
}

// 2. Hidden Single (Box, Row, Col)
function findHiddenSingle(
  grid: number[][],
  candidates: Set<number>[][]
): (StepRecord & { row: number; col: number; value: number }) | null {
  // Check Boxes
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
        return {
          technique: 'hidden-single-box',
          name: TECHNIQUE_WEIGHTS['hidden-single-box'].name,
          weight: TECHNIQUE_WEIGHTS['hidden-single-box'].weight,
          row: places[0].r,
          col: places[0].c,
          value: num,
          description: `第 ${b + 1} 宫中数字 【${num}】 只能填在此格`,
        };
      }
    }
  }

  // Check Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let num = 1; num <= GRID_SIZE; num++) {
      const places: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          places.push(c);
        }
      }
      if (places.length === 1) {
        return {
          technique: 'hidden-single-row',
          name: TECHNIQUE_WEIGHTS['hidden-single-row'].name,
          weight: TECHNIQUE_WEIGHTS['hidden-single-row'].weight,
          row: r,
          col: places[0],
          value: num,
          description: `第 ${r + 1} 行中数字 【${num}】 只能填在此格`,
        };
      }
    }
  }

  // Check Columns
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let num = 1; num <= GRID_SIZE; num++) {
      const places: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          places.push(r);
        }
      }
      if (places.length === 1) {
        return {
          technique: 'hidden-single-col',
          name: TECHNIQUE_WEIGHTS['hidden-single-col'].name,
          weight: TECHNIQUE_WEIGHTS['hidden-single-col'].weight,
          row: places[0],
          col: c,
          value: num,
          description: `第 ${c + 1} 列中数字 【${num}】 只能填在此格`,
        };
      }
    }
  }

  return null;
}

// 3. Pointing Pair / Triple
function findPointingPair(grid: number[][], candidates: Set<number>[][]): StepRecord | null {
  for (let b = 0; b < GRID_SIZE; b++) {
    const startR = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startC = (b % BOX_SIZE) * BOX_SIZE;

    for (let num = 1; num <= GRID_SIZE; num++) {
      const rows: number[] = [];
      const cols: number[] = [];

      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = startR + r;
          const cc = startC + c;
          if (grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
            rows.push(cr);
            cols.push(cc);
          }
        }
      }

      if (rows.length >= 2 && rows.length <= 3) {
        // Check if all in same row
        if (rows.every((r) => r === rows[0])) {
          const targetRow = rows[0];
          let eliminated = false;
          for (let c = 0; c < GRID_SIZE; c++) {
            const inBox = c >= startC && c < startC + BOX_SIZE;
            if (!inBox && grid[targetRow][c] === 0 && candidates[targetRow][c].has(num)) {
              candidates[targetRow][c].delete(num);
              eliminated = true;
            }
          }
          if (eliminated) {
            return {
              technique: 'pointing-pair',
              name: TECHNIQUE_WEIGHTS['pointing-pair'].name,
              weight: TECHNIQUE_WEIGHTS['pointing-pair'].weight,
              description: `第 ${b + 1} 宫数字 【${num}】 锁定在第 ${targetRow + 1} 行，排除该行其余宫的候选数`,
            };
          }
        }

        // Check if all in same column
        if (cols.every((c) => c === cols[0])) {
          const targetCol = cols[0];
          let eliminated = false;
          for (let r = 0; r < GRID_SIZE; r++) {
            const inBox = r >= startR && r < startR + BOX_SIZE;
            if (!inBox && grid[r][targetCol] === 0 && candidates[r][targetCol].has(num)) {
              candidates[r][targetCol].delete(num);
              eliminated = true;
            }
          }
          if (eliminated) {
            return {
              technique: 'pointing-pair',
              name: TECHNIQUE_WEIGHTS['pointing-pair'].name,
              weight: TECHNIQUE_WEIGHTS['pointing-pair'].weight,
              description: `第 ${b + 1} 宫数字 【${num}】 锁定在第 ${targetCol + 1} 列，排除该列其余宫的候选数`,
            };
          }
        }
      }
    }
  }
  return null;
}

// 4. Box-Line Reduction (行列对宫排除)
function findBoxLineReduction(grid: number[][], candidates: Set<number>[][]): StepRecord | null {
  for (let num = 1; num <= GRID_SIZE; num++) {
    // In Rows: candidates confined to one box let us clear the rest of that box
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
          let eliminated = false;
          for (let br = 0; br < BOX_SIZE; br++) {
            for (let bc = 0; bc < BOX_SIZE; bc++) {
              const cr = startR + br;
              const cc = startC + bc;
              if (cr !== r && grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
                candidates[cr][cc].delete(num);
                eliminated = true;
              }
            }
          }
          if (eliminated) {
            return {
              technique: 'box-line-reduction',
              name: TECHNIQUE_WEIGHTS['box-line-reduction'].name,
              weight: TECHNIQUE_WEIGHTS['box-line-reduction'].weight,
              description: `第 ${r + 1} 行数字 【${num}】 局限在第 ${getBoxIndex(r, cols[0]) + 1} 宫，排除该宫其它行的候选数`,
            };
          }
        }
      }
    }

    // In Columns: same idea with rows and columns swapped
    for (let c = 0; c < GRID_SIZE; c++) {
      const rows: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          rows.push(r);
        }
      }
      if (rows.length >= 2 && rows.length <= 3) {
        const firstBox = Math.floor(rows[0] / BOX_SIZE);
        if (rows.every((r) => Math.floor(r / BOX_SIZE) === firstBox)) {
          const startR = firstBox * BOX_SIZE;
          const startC = Math.floor(c / BOX_SIZE) * BOX_SIZE;
          let eliminated = false;
          for (let br = 0; br < BOX_SIZE; br++) {
            for (let bc = 0; bc < BOX_SIZE; bc++) {
              const cr = startR + br;
              const cc = startC + bc;
              if (cc !== c && grid[cr][cc] === 0 && candidates[cr][cc].has(num)) {
                candidates[cr][cc].delete(num);
                eliminated = true;
              }
            }
          }
          if (eliminated) {
            return {
              technique: 'box-line-reduction',
              name: TECHNIQUE_WEIGHTS['box-line-reduction'].name,
              weight: TECHNIQUE_WEIGHTS['box-line-reduction'].weight,
              description: `第 ${c + 1} 列数字 【${num}】 局限在第 ${getBoxIndex(rows[0], c) + 1} 宫，排除该宫其它列的候选数`,
            };
          }
        }
      }
    }
  }
  return null;
}

// 5. Naked Pair
function findNakedPair(grid: number[][], candidates: Set<number>[][]): StepRecord | null {
  // Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const pairs: { c: number; nums: string }[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        const sorted = Array.from(candidates[r][c]).sort().join(',');
        pairs.push({ c, nums: sorted });
      }
    }
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].nums === pairs[j].nums) {
          const [n1, n2] = pairs[i].nums.split(',').map(Number);
          let eliminated = false;
          for (let c = 0; c < GRID_SIZE; c++) {
            if (c !== pairs[i].c && c !== pairs[j].c && grid[r][c] === 0) {
              if (candidates[r][c].has(n1) || candidates[r][c].has(n2)) {
                candidates[r][c].delete(n1);
                candidates[r][c].delete(n2);
                eliminated = true;
              }
            }
          }
          if (eliminated) {
            return {
              technique: 'naked-pair',
              name: TECHNIQUE_WEIGHTS['naked-pair'].name,
              weight: TECHNIQUE_WEIGHTS['naked-pair'].weight,
              description: `第 ${r + 1} 行出现显性数对 【${n1}, ${n2}】，已排除该行其它格相应候选数`,
            };
          }
        }
      }
    }
  }

  // Columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const pairs: { r: number; nums: string }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] === 0 && candidates[r][c].size === 2) {
        const sorted = Array.from(candidates[r][c]).sort().join(',');
        pairs.push({ r, nums: sorted });
      }
    }
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].nums === pairs[j].nums) {
          const [n1, n2] = pairs[i].nums.split(',').map(Number);
          let eliminated = false;
          for (let r = 0; r < GRID_SIZE; r++) {
            if (r !== pairs[i].r && r !== pairs[j].r && grid[r][c] === 0) {
              if (candidates[r][c].has(n1) || candidates[r][c].has(n2)) {
                candidates[r][c].delete(n1);
                candidates[r][c].delete(n2);
                eliminated = true;
              }
            }
          }
          if (eliminated) {
            return {
              technique: 'naked-pair',
              name: TECHNIQUE_WEIGHTS['naked-pair'].name,
              weight: TECHNIQUE_WEIGHTS['naked-pair'].weight,
              description: `第 ${c + 1} 列出现显性数对 【${n1}, ${n2}】，已排除该列其它格相应候选数`,
            };
          }
        }
      }
    }
  }

  // Boxes
  for (let b = 0; b < GRID_SIZE; b++) {
    const startR = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startC = (b % BOX_SIZE) * BOX_SIZE;
    const pairs: { r: number; c: number; nums: string }[] = [];
    for (let br = 0; br < BOX_SIZE; br++) {
      for (let bc = 0; bc < BOX_SIZE; bc++) {
        const r = startR + br;
        const c = startC + bc;
        if (grid[r][c] === 0 && candidates[r][c].size === 2) {
          const sorted = Array.from(candidates[r][c]).sort().join(',');
          pairs.push({ r, c, nums: sorted });
        }
      }
    }
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i + 1; j < pairs.length; j++) {
        if (pairs[i].nums === pairs[j].nums) {
          const [n1, n2] = pairs[i].nums.split(',').map(Number);
          let eliminated = false;
          for (let br = 0; br < BOX_SIZE; br++) {
            for (let bc = 0; bc < BOX_SIZE; bc++) {
              const r = startR + br;
              const c = startC + bc;
              const isPairCell =
                (r === pairs[i].r && c === pairs[i].c) || (r === pairs[j].r && c === pairs[j].c);
              if (!isPairCell && grid[r][c] === 0) {
                if (candidates[r][c].has(n1) || candidates[r][c].has(n2)) {
                  candidates[r][c].delete(n1);
                  candidates[r][c].delete(n2);
                  eliminated = true;
                }
              }
            }
          }
          if (eliminated) {
            return {
              technique: 'naked-pair',
              name: TECHNIQUE_WEIGHTS['naked-pair'].name,
              weight: TECHNIQUE_WEIGHTS['naked-pair'].weight,
              description: `第 ${b + 1} 宫出现显性数对 【${n1}, ${n2}】，已排除该宫其它格相应候选数`,
            };
          }
        }
      }
    }
  }

  return null;
}

// 5b. Hidden Pair
function findHiddenPair(grid: number[][], candidates: Set<number>[][]): StepRecord | null {
  type Unit = { label: string; cells: { r: number; c: number }[] };

  const units: Unit[] = [];

  // 1. Rows
  for (let r = 0; r < GRID_SIZE; r++) {
    units.push({
      label: `第 ${r + 1} 行`,
      cells: Array.from({ length: GRID_SIZE }, (_, c) => ({ r, c })),
    });
  }

  // 2. Columns
  for (let c = 0; c < GRID_SIZE; c++) {
    units.push({
      label: `第 ${c + 1} 列`,
      cells: Array.from({ length: GRID_SIZE }, (_, r) => ({ r, c })),
    });
  }

  // 3. Boxes
  for (let b = 0; b < GRID_SIZE; b++) {
    const startR = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startC = (b % BOX_SIZE) * BOX_SIZE;
    const cells: { r: number; c: number }[] = [];
    for (let br = 0; br < BOX_SIZE; br++) {
      for (let bc = 0; bc < BOX_SIZE; bc++) {
        cells.push({ r: startR + br, c: startC + bc });
      }
    }
    units.push({
      label: `第 ${b + 1} 宫`,
      cells,
    });
  }

  return findHiddenPairInUnits(grid, candidates, units);
}

/**
 * Shared hidden-pair scan. A "unit" is any set of nine cells that must contain
 * the digits 1-9 exactly once (row, column or box).
 */
function findHiddenPairInUnits(
  grid: number[][],
  candidates: Set<number>[][],
  units: { label: string; cells: { r: number; c: number }[] }[]
): StepRecord | null {
  for (const unit of units) {
    const emptyCells = unit.cells.filter(({ r, c }) => grid[r][c] === 0);
    // Digit -> the empty cells of this unit that still allow it
    const positions = new Map<number, { r: number; c: number }[]>();
    for (let num = 1; num <= GRID_SIZE; num++) {
      const cells = emptyCells.filter(({ r, c }) => candidates[r][c].has(num));
      positions.set(num, cells);
    }

    const digits = Array.from(positions.keys());
    for (let i = 0; i < digits.length; i++) {
      for (let j = i + 1; j < digits.length; j++) {
        const d1 = digits[i];
        const d2 = digits[j];
        const p1 = positions.get(d1)!;
        const p2 = positions.get(d2)!;
        if (p1.length !== 2 || p2.length !== 2) continue;
        if (!p1.every((a) => p2.some((b) => a.r === b.r && a.c === b.c))) continue;

        // d1 and d2 both live in exactly these two cells, so those cells hold
        // nothing else.
        let eliminated = false;
        for (const { r, c } of p1) {
          const before = candidates[r][c].size;
          for (const n of Array.from(candidates[r][c])) {
            if (n !== d1 && n !== d2) candidates[r][c].delete(n);
          }
          if (candidates[r][c].size !== before) eliminated = true;
        }

        if (eliminated) {
          return {
            technique: 'hidden-pair',
            name: TECHNIQUE_WEIGHTS['hidden-pair'].name,
            weight: TECHNIQUE_WEIGHTS['hidden-pair'].weight,
            description: `${unit.label}中数字 【${d1}】 与 【${d2}】 仅出现在同两格，清除这两格内的其它候选数`,
          };
        }
      }
    }
  }
  return null;
}

// 6. X-Wing
function findXWing(grid: number[][], candidates: Set<number>[][]): StepRecord | null {
  for (let num = 1; num <= GRID_SIZE; num++) {
    const rowCandCols: { r: number; c1: number; c2: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const cols: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0 && candidates[r][c].has(num)) {
          cols.push(c);
        }
      }
      if (cols.length === 2) {
        rowCandCols.push({ r, c1: cols[0], c2: cols[1] });
      }
    }

    if (rowCandCols.length >= 2) {
      for (let i = 0; i < rowCandCols.length; i++) {
        for (let j = i + 1; j < rowCandCols.length; j++) {
          if (rowCandCols[i].c1 === rowCandCols[j].c1 && rowCandCols[i].c2 === rowCandCols[j].c2) {
            const { c1, c2 } = rowCandCols[i];
            const r1 = rowCandCols[i].r;
            const r2 = rowCandCols[j].r;
            let eliminated = false;
            for (let r = 0; r < GRID_SIZE; r++) {
              if (r !== r1 && r !== r2) {
                if (grid[r][c1] === 0 && candidates[r][c1].has(num)) {
                  candidates[r][c1].delete(num);
                  eliminated = true;
                }
                if (grid[r][c2] === 0 && candidates[r][c2].has(num)) {
                  candidates[r][c2].delete(num);
                  eliminated = true;
                }
              }
            }
            if (eliminated) {
              return {
                technique: 'x-wing',
                name: TECHNIQUE_WEIGHTS['x-wing'].name,
                weight: TECHNIQUE_WEIGHTS['x-wing'].weight,
                description: `数字 【${num}】 在第 ${r1 + 1}、${r2 + 1} 行形成 X-Wing 结构，排除对应列其它格该候选数`,
              };
            }
          }
        }
      }
    }
  }
  return null;
}
