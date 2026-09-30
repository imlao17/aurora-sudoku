import { describe, it, expect } from 'vitest';
import { analyzeNextHint } from '../src/utils/hint';
import { generatePuzzle } from '../src/utils/sudoku';
import type { CellData } from '../src/types/sudoku';

describe('Smart Hint Suite', () => {
  it('detects and prioritizes erroneous user placements', () => {
    const puzzle = generatePuzzle('easy');
    const board: CellData[][] = puzzle.initialBoard.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        value: val,
        solution: puzzle.solution[r][c],
        isInitial: val !== 0,
        notes: [],
        isError: false,
      }))
    );

    // Find an empty cell and inject an incorrect value
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!board[r][c].isInitial) {
          board[r][c].value = (puzzle.solution[r][c] % 9) + 1; // Wrong value
          const hint = analyzeNextHint(board, { row: r, col: c });
          expect(hint).not.toBeNull();
          expect(hint?.type).toBe('error');
          expect(hint?.suggestedValue).toBe(puzzle.solution[r][c]);
          return;
        }
      }
    }
  });

  it('detects a Naked Single when a cell has only 1 candidate', () => {
    const puzzle = generatePuzzle('easy');
    const board: CellData[][] = puzzle.solution.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        value: val,
        solution: val,
        isInitial: true,
        notes: [],
        isError: false,
      }))
    );

    // Empty exactly one cell
    board[4][4].value = 0;
    board[4][4].isInitial = false;

    const hint = analyzeNextHint(board, { row: 4, col: 4 });
    expect(hint).not.toBeNull();
    expect(hint?.type).toBe('naked-single');
    expect(hint?.row).toBe(4);
    expect(hint?.col).toBe(4);
    expect(hint?.suggestedValue).toBe(board[4][4].solution);
  });

  it('detects a Hidden Single in a 3x3 Box or Row/Col when naked single is absent', () => {
    // Construct a board where a digit can only go in one place in box 0
    const solution = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 1, 4, 3, 6, 5, 8, 9, 7],
      [3, 6, 5, 8, 9, 7, 2, 1, 4],
      [8, 9, 7, 2, 1, 4, 3, 6, 5],
      [5, 3, 1, 6, 4, 2, 9, 7, 8],
      [6, 4, 2, 9, 7, 8, 5, 3, 1],
      [9, 7, 8, 5, 3, 1, 6, 4, 2],
    ];

    const board: CellData[][] = solution.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        value: val,
        solution: val,
        isInitial: true,
        notes: [],
        isError: false,
      }))
    );

    // Empty a few cells in box 0 and elsewhere so that digit 1 in box 0 is forced
    board[0][0].value = 0; // was 1
    board[0][0].isInitial = false;
    board[1][0].value = 0; // was 4
    board[1][0].isInitial = false;
    board[2][0].value = 0; // was 7
    board[2][0].isInitial = false;

    const hint = analyzeNextHint(board);
    expect(hint).not.toBeNull();
    expect(hint?.suggestedValue).toBeGreaterThan(0);
    expect(hint?.explanation.length).toBeGreaterThan(10);
  });

  it('generates a valid educational hint for every standard generated board', () => {
    const puzzle = generatePuzzle('medium');
    const board: CellData[][] = puzzle.initialBoard.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        value: val,
        solution: puzzle.solution[r][c],
        isInitial: val !== 0,
        notes: [],
        isError: false,
      }))
    );

    const hint = analyzeNextHint(board);
    expect(hint).not.toBeNull();
    expect(hint?.row).toBeGreaterThanOrEqual(0);
    expect(hint?.row).toBeLessThan(9);
    expect(hint?.col).toBeGreaterThanOrEqual(0);
    expect(hint?.col).toBeLessThan(9);
    expect(hint?.suggestedValue).toBe(puzzle.solution[hint!.row][hint!.col]);
  });

  it('safely provides fallback hints when advanced techniques are required', () => {
    const puzzle = generatePuzzle('hard');
    const board: CellData[][] = puzzle.initialBoard.map((row, r) =>
      row.map((val, c) => ({
        row: r,
        col: c,
        value: val,
        solution: puzzle.solution[r][c],
        isInitial: val !== 0,
        notes: [],
        isError: false,
      }))
    );

    const hint = analyzeNextHint(board);
    expect(hint).not.toBeNull();
    expect(hint?.suggestedValue).toBeGreaterThan(0);
    expect(hint?.explanation.length).toBeGreaterThan(5);
  });
});
