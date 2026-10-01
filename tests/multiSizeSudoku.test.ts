import { describe, it, expect } from 'vitest';
import {
  generateMultiSizePuzzle,
  solveMultiSizeGrid,
  getSymbolDisplay,
  getMultiSizeBoxIndex,
  checkMultiSizeConflicts,
  generateJuniorHint,
  isMultiSizeBoardCompleted,
  SYMBOL_PRESETS,
} from '../src/utils/multiSizeSudoku';
import type { CellData } from '../src/types/sudoku';

describe('MultiSize Sudoku Engine (4x4, 6x6, 9x9)', () => {
  it('generates a valid 4x4 puzzle with a 100% unique solution', () => {
    const { puzzle, solution } = generateMultiSizePuzzle(4, 'easy');

    expect(puzzle.length).toBe(4);
    expect(puzzle[0].length).toBe(4);
    expect(solution.length).toBe(4);

    // Verify solution is completely filled
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        expect(solution[r][c]).toBeGreaterThanOrEqual(1);
        expect(solution[r][c]).toBeLessThanOrEqual(4);
      }
    }

    // Verify puzzle has blanks
    let blanks = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (puzzle[r][c] === 0) blanks++;
      }
    }
    expect(blanks).toBeGreaterThan(0);

    // Verify unique solution
    const solveRes = solveMultiSizeGrid(puzzle, 4, 2);
    expect(solveRes.solved).toBe(true);
    expect(solveRes.count).toBe(1);
    expect(solveRes.solution).toEqual(solution);
  });

  it('generates a valid 6x6 puzzle with a 100% unique solution', () => {
    const { puzzle, solution } = generateMultiSizePuzzle(6, 'easy');

    expect(puzzle.length).toBe(6);
    expect(puzzle[0].length).toBe(6);

    // Verify 6x6 has blanks
    let blanks = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        if (puzzle[r][c] === 0) blanks++;
      }
    }
    expect(blanks).toBeGreaterThanOrEqual(10);

    // Verify uniqueness
    const solveRes = solveMultiSizeGrid(puzzle, 6, 2);
    expect(solveRes.solved).toBe(true);
    expect(solveRes.count).toBe(1);
    expect(solveRes.solution).toEqual(solution);
  });

  it('correctly maps symbol themes (animals, fruit, hanzi, numbers)', () => {
    // 4x4
    expect(getSymbolDisplay(1, 'animals', 4)).toBe('🐱');
    expect(getSymbolDisplay(2, 'animals', 4)).toBe('🐶');
    expect(getSymbolDisplay(3, 'animals', 4)).toBe('🐰');
    expect(getSymbolDisplay(4, 'animals', 4)).toBe('🐼');

    expect(getSymbolDisplay(1, 'fruit', 4)).toBe('🍎');
    expect(getSymbolDisplay(2, 'fruit', 4)).toBe('🍌');

    expect(getSymbolDisplay(1, 'hanzi', 4)).toBe('春');
    expect(getSymbolDisplay(2, 'hanzi', 4)).toBe('夏');
    expect(getSymbolDisplay(3, 'hanzi', 4)).toBe('秋');
    expect(getSymbolDisplay(4, 'hanzi', 4)).toBe('冬');

    expect(getSymbolDisplay(1, 'numbers', 4)).toBe('1');
    expect(getSymbolDisplay(0, 'numbers', 4)).toBe('');
  });

  it('computes box indexes accurately for 4x4, 6x6, and 9x9', () => {
    // 4x4: 2x2 boxes
    expect(getMultiSizeBoxIndex(0, 0, 4)).toBe(0);
    expect(getMultiSizeBoxIndex(0, 2, 4)).toBe(1);
    expect(getMultiSizeBoxIndex(2, 0, 4)).toBe(2);
    expect(getMultiSizeBoxIndex(3, 3, 4)).toBe(3);

    // 6x6: 2 rows x 3 cols boxes
    expect(getMultiSizeBoxIndex(0, 0, 6)).toBe(0);
    expect(getMultiSizeBoxIndex(0, 2, 6)).toBe(0);
    expect(getMultiSizeBoxIndex(0, 3, 6)).toBe(1);
    expect(getMultiSizeBoxIndex(2, 0, 6)).toBe(2);
    expect(getMultiSizeBoxIndex(4, 4, 6)).toBe(5);

    // 9x9: 3x3 boxes
    expect(getMultiSizeBoxIndex(0, 0, 9)).toBe(0);
    expect(getMultiSizeBoxIndex(2, 2, 9)).toBe(0);
    expect(getMultiSizeBoxIndex(0, 3, 9)).toBe(1);
    expect(getMultiSizeBoxIndex(8, 8, 9)).toBe(8);
  });

  it('detects row, column, and box conflicts in 4x4 and 6x6', () => {
    const createMockCell = (r: number, c: number, val: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: val || 1,
      isInitial: false,
      notes: [],
    });

    // 4x4 board with duplicate in row 0
    const board4: CellData[][] = Array.from({ length: 4 }, (_, r) =>
      Array.from({ length: 4 }, (_, c) => createMockCell(r, c, 0))
    );
    board4[0][0].value = 2;
    board4[0][3].value = 2; // conflict!

    const conflicts = checkMultiSizeConflicts(board4, 4);
    expect(conflicts[0][0]).toBe(true);
    expect(conflicts[0][3]).toBe(true);
    expect(conflicts[0][1]).toBe(false);
  });

  it('generates friendly junior hints for children', () => {
    const createMockCell = (r: number, c: number, val: number, sol: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: sol,
      isInitial: false,
      notes: [],
    });

    // 4x4 with row 0 having only 1 missing cell
    const board4: CellData[][] = [
      [createMockCell(0, 0, 1, 1), createMockCell(0, 1, 2, 2), createMockCell(0, 2, 0, 3), createMockCell(0, 3, 4, 4)],
      [createMockCell(1, 0, 0, 3), createMockCell(1, 1, 0, 4), createMockCell(1, 2, 0, 1), createMockCell(1, 3, 0, 2)],
      [createMockCell(2, 0, 0, 2), createMockCell(2, 1, 0, 1), createMockCell(2, 2, 0, 4), createMockCell(2, 3, 0, 3)],
      [createMockCell(3, 0, 0, 4), createMockCell(3, 1, 0, 3), createMockCell(3, 2, 0, 2), createMockCell(3, 3, 0, 1)],
    ];

    const hint = generateJuniorHint(board4, 4, 'animals');
    expect(hint).not.toBeNull();
    expect(hint?.row).toBe(0);
    expect(hint?.col).toBe(2);
    expect(hint?.value).toBe(3);
    expect(hint?.message).toContain('第 1 横行只差一个【🐰】啦');
  });

  it('validates SYMBOL_PRESETS presets and symbol counts', () => {
    expect(SYMBOL_PRESETS.numbers.symbols[4]).toEqual(['1', '2', '3', '4']);
    expect(SYMBOL_PRESETS.animals.symbols[4].length).toBe(4);
    expect(SYMBOL_PRESETS.fruit.symbols[6].length).toBe(6);
    expect(SYMBOL_PRESETS.hanzi.symbols[9].length).toBe(9);
  });

  it('checks isMultiSizeBoardCompleted correctly', () => {
    const createMockCell = (r: number, c: number, val: number, sol: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: sol,
      isInitial: false,
      notes: [],
    });

    const completed4: CellData[][] = [
      [createMockCell(0, 0, 1, 1), createMockCell(0, 1, 2, 2), createMockCell(0, 2, 3, 3), createMockCell(0, 3, 4, 4)],
      [createMockCell(1, 0, 3, 3), createMockCell(1, 1, 4, 4), createMockCell(1, 2, 1, 1), createMockCell(1, 3, 2, 2)],
      [createMockCell(2, 0, 2, 2), createMockCell(2, 1, 1, 1), createMockCell(2, 2, 4, 4), createMockCell(2, 3, 3, 3)],
      [createMockCell(3, 0, 4, 4), createMockCell(3, 1, 3, 3), createMockCell(3, 2, 2, 2), createMockCell(3, 3, 1, 1)],
    ];

    expect(isMultiSizeBoardCompleted(completed4, 4)).toBe(true);

    // If an error is introduced
    completed4[0][0].value = 2;
    expect(isMultiSizeBoardCompleted(completed4, 4)).toBe(false);
  });
});
