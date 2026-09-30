import type { Difficulty, CellData, CellPosition, CellDelta } from '../types/sudoku';
import { GRID_SIZE, BOX_SIZE, DIFFICULTY_PRESETS } from '../constants/sudoku';
import { generateAlgorithmB, generateAlgorithmC, type GeneratorResult } from './generators';
import { rateDifficulty, type DifficultyAnalysis } from './difficultyRater';

export type Grid = number[][];

/**
 * Fast bit count lookup table for 9-bit integers (0 to 511)
 */
const BIT_COUNT_TABLE = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  let count = 0;
  let temp = i;
  while (temp > 0) {
    count += temp & 1;
    temp >>= 1;
  }
  BIT_COUNT_TABLE[i] = count;
}

/**
 * Creates an empty 9x9 grid
 */
export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

/**
 * Deep clones a 9x9 grid
 */
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * Helper to get box index (0..8) from row and col
 */
export function getBoxIndex(r: number, c: number): number {
  return Math.floor(r / BOX_SIZE) * BOX_SIZE + Math.floor(c / BOX_SIZE);
}

/**
 * Bitmask Solver Engine for ultra-high performance MRV search
 */
class BitmaskSolver {
  public rowMask = new Uint16Array(GRID_SIZE);
  public colMask = new Uint16Array(GRID_SIZE);
  public boxMask = new Uint16Array(GRID_SIZE);
  public grid: Grid;
  public isValidInitial: boolean = true;

  constructor(initialGrid: Grid) {
    this.grid = cloneGrid(initialGrid);
    this.initMasks();
  }

  private initMasks(): void {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const val = this.grid[r][c];
        if (val > 0) {
          const bit = 1 << (val - 1);
          const b = getBoxIndex(r, c);
          if ((this.rowMask[r] & bit) || (this.colMask[c] & bit) || (this.boxMask[b] & bit)) {
            this.isValidInitial = false;
            return;
          }
          this.rowMask[r] |= bit;
          this.colMask[c] |= bit;
          this.boxMask[b] |= bit;
        }
      }
    }
  }

  /**
   * O(1) candidate mask lookup
   */
  public getCandidateMask(r: number, c: number): number {
    const b = getBoxIndex(r, c);
    return (~(this.rowMask[r] | this.colMask[c] | this.boxMask[b])) & 0x1ff;
  }

  public getCandidateCount(r: number, c: number): number {
    return BIT_COUNT_TABLE[this.getCandidateMask(r, c)];
  }

  public findBestCell(): { r: number; c: number; mask: number; count: number } | null {
    let minCount = 10;
    let best: { r: number; c: number; mask: number; count: number } | null = null;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === 0) {
          const mask = this.getCandidateMask(r, c);
          const count = BIT_COUNT_TABLE[mask];
          if (count === 0) return { r, c, mask: 0, count: 0 }; // Dead end early prune
          if (count < minCount) {
            minCount = count;
            best = { r, c, mask, count };
            if (minCount === 1) return best; // Optimal
          }
        }
      }
    }
    return best;
  }

  public solve(): boolean {
    if (!this.isValidInitial) return false;
    const cell = this.findBestCell();
    if (!cell) return true; // Solved
    if (cell.count === 0) return false;

    let { mask } = cell;
    const { r, c } = cell;
    const b = getBoxIndex(r, c);

    while (mask > 0) {
      const bit = mask & -mask; // Extract lowest set bit in O(1)
      mask ^= bit;
      const num = 32 - Math.clz32(bit); // 1-based digit

      this.grid[r][c] = num;
      this.rowMask[r] |= bit;
      this.colMask[c] |= bit;
      this.boxMask[b] |= bit;

      if (this.solve()) return true;

      // Backtrack
      this.grid[r][c] = 0;
      this.rowMask[r] &= ~bit;
      this.colMask[c] &= ~bit;
      this.boxMask[b] &= ~bit;
    }

    return false;
  }

  public countSolutions(limit: number = 2): number {
    if (!this.isValidInitial) return 0;
    let solutions = 0;

    const backtrack = (): void => {
      if (solutions >= limit) return;

      const cell = this.findBestCell();
      if (!cell) {
        solutions++;
        return;
      }
      if (cell.count === 0) return;

      let { mask } = cell;
      const { r, c } = cell;
      const b = getBoxIndex(r, c);

      while (mask > 0) {
        const bit = mask & -mask;
        mask ^= bit;
        const num = 32 - Math.clz32(bit);

        this.grid[r][c] = num;
        this.rowMask[r] |= bit;
        this.colMask[c] |= bit;
        this.boxMask[b] |= bit;

        backtrack();

        this.grid[r][c] = 0;
        this.rowMask[r] &= ~bit;
        this.colMask[c] &= ~bit;
        this.boxMask[b] &= ~bit;

        if (solutions >= limit) return;
      }
    };

    backtrack();
    return solutions;
  }
}

/**
 * Checks if placing `num` at (row, col) is valid according to Sudoku rules
 */
export function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (grid[row][i] === num && i !== col) return false;
    if (grid[i][col] === num && i !== row) return false;
  }

  const startRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if (grid[cr][cc] === num && (cr !== row || cc !== col)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get all valid candidate numbers for a cell
 */
export function getValidCandidates(grid: Grid, row: number, col: number): number[] {
  if (grid[row][col] !== 0) return [];
  const candidates: number[] = [];
  for (let num = 1; num <= GRID_SIZE; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      candidates.push(num);
    }
  }
  return candidates;
}

/**
 * Fast bitmask uniqueness counter
 */
export function countSolutions(grid: Grid, limit: number = 2): number {
  const solver = new BitmaskSolver(grid);
  return solver.countSolutions(limit);
}

/**
 * Solves a Sudoku grid in place using bitmask MRV backtracking
 */
export function solveSudoku(grid: Grid): boolean {
  const solver = new BitmaskSolver(grid);
  const solved = solver.solve();
  if (solved) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        grid[r][c] = solver.grid[r][c];
      }
    }
  }
  return solved;
}

/**
 * Shuffle an array in place using PRNG
 */
export function shuffleArray<T>(array: T[], rng: () => number = Math.random): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Fills a 3x3 block with random permutation of 1..9
 */
function fillBox(grid: Grid, startRow: number, startCol: number, rng: () => number): void {
  const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  let idx = 0;
  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      grid[startRow + r][startCol + c] = nums[idx++];
    }
  }
}

/**
 * Generates a full valid 9x9 board with randomized candidates
 */
export function generateFullBoard(rng: () => number = Math.random): Grid {
  const grid = createEmptyGrid();
  // Fill the three independent diagonal 3x3 blocks
  fillBox(grid, 0, 0, rng);
  fillBox(grid, 3, 3, rng);
  fillBox(grid, 6, 6, rng);

  const solver = new BitmaskSolver(grid);

  function solveRandom(): boolean {
    const cell = solver.findBestCell();
    if (!cell) return true;
    if (cell.count === 0) return false;

    // Extract candidates into array and shuffle
    const candidates: number[] = [];
    let { mask } = cell;
    while (mask > 0) {
      const bit = mask & -mask;
      mask ^= bit;
      candidates.push(32 - Math.clz32(bit));
    }
    shuffleArray(candidates, rng);

    const { r, c } = cell;
    const b = getBoxIndex(r, c);

    for (const num of candidates) {
      const bit = 1 << (num - 1);
      solver.grid[r][c] = num;
      solver.rowMask[r] |= bit;
      solver.colMask[c] |= bit;
      solver.boxMask[b] |= bit;

      if (solveRandom()) return true;

      solver.grid[r][c] = 0;
      solver.rowMask[r] &= ~bit;
      solver.colMask[c] &= ~bit;
      solver.boxMask[b] &= ~bit;
    }
    return false;
  }

  solveRandom();
  return solver.grid;
}

export interface GeneratedPuzzle {
  initialBoard: Grid;
  solution: Grid;
  difficultyAnalysis?: DifficultyAnalysis;
  algorithmUsed?: 'random' | 'symmetric' | 'technique-targeted';
}

/**
 * Generates a puzzle guaranteed to have a UNIQUE solution,
 * binding the optimal generator algorithm to each difficulty tier:
 * - 简单 (Easy): Algorithm B (中心旋转对称挖空), targetClues = 38 (36~40 clues)
 * - 中等 (Medium): Algorithm B (中心旋转对称挖空), targetClues = 31 (28~32 clues)
 * - 困难 (Hard): Algorithm C (技巧驱动定向挖空), targetClues = 25 (24~26 clues, minScore = 800)
 */
export function generatePuzzle(
  difficulty: Difficulty,
  rng: () => number = Math.random
): GeneratedPuzzle {
  const { targetClues } = DIFFICULTY_PRESETS[difficulty];

  for (let attempt = 0; attempt < 8; attempt++) {
    let result: GeneratorResult;
    if (difficulty === 'hard') {
      result = generateAlgorithmC(targetClues, 800, rng);
    } else {
      result = generateAlgorithmB(targetClues, rng);
    }

    // Safety fallback: strictly guarantee exactly 1 unique solution
    if (countSolutions(result.puzzle, 2) !== 1) {
      continue;
    }

    const rating = rateDifficulty(result.puzzle);
    if (!rating.isSolvableLogically && attempt < 5) {
      continue;
    }

    return {
      initialBoard: result.puzzle,
      solution: result.solution,
      difficultyAnalysis: rating,
      algorithmUsed: result.algorithm,
    };
  }

  const fallback = generateAlgorithmB(targetClues, rng);
  return {
    initialBoard: fallback.puzzle,
    solution: fallback.solution,
    difficultyAnalysis: rateDifficulty(fallback.puzzle),
    algorithmUsed: fallback.algorithm,
  };
}

/**
 * Checks all conflicting cells across the board
 */
export function findConflicts(grid: Grid): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  if (!Array.isArray(grid) || grid.length < GRID_SIZE) return conflicts;

  // Check rows
  for (let r = 0; r < GRID_SIZE; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(c);
      }
    }
    seen.forEach((cols) => {
      if (cols.length > 1) {
        for (const c of cols) conflicts[r][c] = true;
      }
    });
  }

  // Check columns
  for (let c = 0; c < GRID_SIZE; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < GRID_SIZE; r++) {
      const val = grid[r][c];
      if (val !== 0) {
        if (!seen.has(val)) seen.set(val, []);
        seen.get(val)!.push(r);
      }
    }
    seen.forEach((rows) => {
      if (rows.length > 1) {
        for (const r of rows) conflicts[r][c] = true;
      }
    });
  }

  // Check 3x3 boxes
  for (let b = 0; b < GRID_SIZE; b++) {
    const startRow = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startCol = (b % BOX_SIZE) * BOX_SIZE;
    const seen = new Map<number, { r: number; c: number }[]>();
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const cr = startRow + r;
        const cc = startCol + c;
        const val = grid[cr][cc];
        if (val !== 0) {
          if (!seen.has(val)) seen.set(val, []);
          seen.get(val)!.push({ r: cr, c: cc });
        }
      }
    }
    seen.forEach((cells) => {
      if (cells.length > 1) {
        for (const cell of cells) conflicts[cell.r][cell.c] = true;
      }
    });
  }

  return conflicts;
}

/**
 * Checks if the board is completely filled and has no conflicts
 */
export function isBoardCompleted(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  const conflicts = findConflicts(grid);
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (conflicts[r][c]) return false;
    }
  }
  return true;
}

/**
 * Detects if filling a cell at (changedRow, changedCol) freshly completes
 * its row, column, or 3x3 box (house) with all 9 correct numbers.
 * Returns the list of affected cell coordinates for celebratory wave animation.
 */
export function findNewlyCompletedCells(
  prevBoard: CellData[][],
  newBoard: CellData[][],
  changedRow: number,
  changedCol: number
): CellPosition[] {
  const completedCellsMap = new Map<string, CellPosition>();

  const addCell = (r: number, c: number) => {
    completedCellsMap.set(`${r}-${c}`, { row: r, col: c });
  };

  // 1. Check Row
  const prevRowIncomplete = prevBoard[changedRow].some((cell) => cell.value === 0);
  const newRowComplete = newBoard[changedRow].every(
    (cell) => cell.value > 0 && cell.value === cell.solution
  );
  if (prevRowIncomplete && newRowComplete) {
    for (let c = 0; c < GRID_SIZE; c++) addCell(changedRow, c);
  }

  // 2. Check Column
  let prevColIncomplete = false;
  let newColComplete = true;
  for (let r = 0; r < GRID_SIZE; r++) {
    if (prevBoard[r][changedCol].value === 0) prevColIncomplete = true;
    if (newBoard[r][changedCol].value === 0 || newBoard[r][changedCol].value !== newBoard[r][changedCol].solution) {
      newColComplete = false;
    }
  }
  if (prevColIncomplete && newColComplete) {
    for (let r = 0; r < GRID_SIZE; r++) addCell(r, changedCol);
  }

  // 3. Check 3x3 Box
  const startRow = Math.floor(changedRow / BOX_SIZE) * BOX_SIZE;
  const startCol = Math.floor(changedCol / BOX_SIZE) * BOX_SIZE;
  let prevBoxIncomplete = false;
  let newBoxComplete = true;

  for (let r = 0; r < BOX_SIZE; r++) {
    for (let c = 0; c < BOX_SIZE; c++) {
      const cr = startRow + r;
      const cc = startCol + c;
      if (prevBoard[cr][cc].value === 0) prevBoxIncomplete = true;
      if (newBoard[cr][cc].value === 0 || newBoard[cr][cc].value !== newBoard[cr][cc].solution) {
        newBoxComplete = false;
      }
    }
  }
  if (prevBoxIncomplete && newBoxComplete) {
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        addCell(startRow + r, startCol + c);
      }
    }
  }

  return Array.from(completedCellsMap.values());
}

export interface AutoFillResult {
  updatedBoard: CellData[][];
  filledCells: { row: number; col: number; value: number }[];
  deltas: CellDelta[];
}

/**
 * Automatically detects and fills any row, column, or 3x3 box that has
 * exactly one empty cell remaining with a unique valid digit.
 * Cascades iteratively if filling a cell causes another house to have only 1 empty cell left.
 */
export function autoFillLastRemainingCells(
  board: CellData[][],
  autoClearNotes: boolean = true
): AutoFillResult {
  let currentBoard = board.map((rList) =>
    rList.map((cData) => ({ ...cData, notes: [...cData.notes] }))
  );
  const filledCells: { row: number; col: number; value: number }[] = [];
  const deltas: CellDelta[] = [];

  let foundAny = true;
  let loopCount = 0;

  while (foundAny && loopCount < 81) {
    foundAny = false;
    loopCount++;

    const toFill = new Map<string, { row: number; col: number; value: number }>();

    // 1. Check Rows
    for (let r = 0; r < GRID_SIZE; r++) {
      const emptyCells: { row: number; col: number }[] = [];
      const filledValues = new Set<number>();
      for (let c = 0; c < GRID_SIZE; c++) {
        const cell = currentBoard[r][c];
        if (cell.value === 0) {
          emptyCells.push({ row: r, col: c });
        } else {
          filledValues.add(cell.value);
        }
      }
      if (emptyCells.length === 1 && filledValues.size === 8) {
        const pos = emptyCells[0];
        let missingDigit = 0;
        for (let d = 1; d <= 9; d++) {
          if (!filledValues.has(d)) {
            missingDigit = d;
            break;
          }
        }
        const cell = currentBoard[pos.row][pos.col];
        if (missingDigit > 0 && missingDigit === cell.solution) {
          toFill.set(`${pos.row}-${pos.col}`, {
            row: pos.row,
            col: pos.col,
            value: missingDigit,
          });
        }
      }
    }

    // 2. Check Columns
    for (let c = 0; c < GRID_SIZE; c++) {
      const emptyCells: { row: number; col: number }[] = [];
      const filledValues = new Set<number>();
      for (let r = 0; r < GRID_SIZE; r++) {
        const cell = currentBoard[r][c];
        if (cell.value === 0) {
          emptyCells.push({ row: r, col: c });
        } else {
          filledValues.add(cell.value);
        }
      }
      if (emptyCells.length === 1 && filledValues.size === 8) {
        const pos = emptyCells[0];
        let missingDigit = 0;
        for (let d = 1; d <= 9; d++) {
          if (!filledValues.has(d)) {
            missingDigit = d;
            break;
          }
        }
        const cell = currentBoard[pos.row][pos.col];
        if (missingDigit > 0 && missingDigit === cell.solution) {
          toFill.set(`${pos.row}-${pos.col}`, {
            row: pos.row,
            col: pos.col,
            value: missingDigit,
          });
        }
      }
    }

    // 3. Check 3x3 Boxes
    for (let b = 0; b < GRID_SIZE; b++) {
      const startRow = Math.floor(b / BOX_SIZE) * BOX_SIZE;
      const startCol = (b % BOX_SIZE) * BOX_SIZE;
      const emptyCells: { row: number; col: number }[] = [];
      const filledValues = new Set<number>();

      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = startRow + r;
          const cc = startCol + c;
          const cell = currentBoard[cr][cc];
          if (cell.value === 0) {
            emptyCells.push({ row: cr, col: cc });
          } else {
            filledValues.add(cell.value);
          }
        }
      }

      if (emptyCells.length === 1 && filledValues.size === 8) {
        const pos = emptyCells[0];
        let missingDigit = 0;
        for (let d = 1; d <= 9; d++) {
          if (!filledValues.has(d)) {
            missingDigit = d;
            break;
          }
        }
        const cell = currentBoard[pos.row][pos.col];
        if (missingDigit > 0 && missingDigit === cell.solution) {
          toFill.set(`${pos.row}-${pos.col}`, {
            row: pos.row,
            col: pos.col,
            value: missingDigit,
          });
        }
      }
    }

    if (toFill.size > 0) {
      foundAny = true;
      for (const item of toFill.values()) {
        const prevCell = currentBoard[item.row][item.col];
        deltas.push({
          row: item.row,
          col: item.col,
          prevValue: prevCell.value,
          newValue: item.value,
          prevNotes: prevCell.notes,
          newNotes: [],
        });
        filledCells.push(item);

        currentBoard = currentBoard.map((rList, r) =>
          rList.map((cData, c) => {
            if (r === item.row && c === item.col) {
              return {
                ...cData,
                value: item.value,
                notes: [],
                isError: false,
              };
            }
            if (autoClearNotes && cData.notes.includes(item.value)) {
              const sameRow = r === item.row;
              const sameCol = c === item.col;
              const sameBox =
                Math.floor(r / 3) === Math.floor(item.row / 3) &&
                Math.floor(c / 3) === Math.floor(item.col / 3);
              if (sameRow || sameCol || sameBox) {
                const updatedNotes = cData.notes.filter((n) => n !== item.value);
                deltas.push({
                  row: r,
                  col: c,
                  prevValue: cData.value,
                  newValue: cData.value,
                  prevNotes: cData.notes,
                  newNotes: updatedNotes,
                });
                return {
                  ...cData,
                  notes: updatedNotes,
                };
              }
            }
            return cData;
          })
        );
      }
    }
  }

  return {
    updatedBoard: currentBoard,
    filledCells,
    deltas,
  };
}
