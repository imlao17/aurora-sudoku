import { describe, it, expect } from 'vitest';
import {
  createEmptyGrid,
  cloneGrid,
  isValidPlacement,
  getValidCandidates,
  solveSudoku,
  countSolutions,
  generateFullBoard,
  generatePuzzle,
  findConflicts,
  isBoardCompleted,
  getBoxIndex,
} from '../src/utils/sudoku';
import { createPRNG } from '../src/utils/prng';

describe('Sudoku Core Algorithm Suite', () => {
  it('creates an empty 9x9 grid', () => {
    const grid = createEmptyGrid();
    expect(grid).toHaveLength(9);
    expect(grid[0]).toHaveLength(9);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        expect(grid[r][c]).toBe(0);
      }
    }
  });

  it('deep clones a grid correctly without reference sharing', () => {
    const original = createEmptyGrid();
    original[0][0] = 5;
    const cloned = cloneGrid(original);

    expect(cloned[0][0]).toBe(5);
    cloned[0][0] = 9;
    expect(original[0][0]).toBe(5);
  });

  it('calculates box index properly', () => {
    expect(getBoxIndex(0, 0)).toBe(0);
    expect(getBoxIndex(2, 2)).toBe(0);
    expect(getBoxIndex(0, 4)).toBe(1);
    expect(getBoxIndex(4, 4)).toBe(4);
    expect(getBoxIndex(8, 8)).toBe(8);
  });

  it('validates placement correctly against row, column, and box constraints', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 5;

    // Row conflict
    expect(isValidPlacement(grid, 0, 8, 5)).toBe(false);
    expect(isValidPlacement(grid, 0, 8, 6)).toBe(true);

    // Column conflict
    expect(isValidPlacement(grid, 8, 0, 5)).toBe(false);
    expect(isValidPlacement(grid, 8, 0, 6)).toBe(true);

    // 3x3 Box conflict
    expect(isValidPlacement(grid, 2, 2, 5)).toBe(false);
    expect(isValidPlacement(grid, 2, 2, 6)).toBe(true);
  });

  it('finds valid candidates for a cell', () => {
    const grid = createEmptyGrid();
    // Fill row 0 with 1..8
    for (let c = 0; c < 8; c++) {
      grid[0][c] = c + 1;
    }
    const candidates = getValidCandidates(grid, 0, 8);
    expect(candidates).toEqual([9]);
  });

  it('generates a full valid board with zero empty cells and no conflicts', () => {
    const fullBoard = generateFullBoard();
    expect(fullBoard).toHaveLength(9);
    expect(isBoardCompleted(fullBoard)).toBe(true);
  });

  it('solves a solvable puzzle accurately', () => {
    const puzzle = generatePuzzle('easy');
    const boardToSolve = cloneGrid(puzzle.initialBoard);
    const success = solveSudoku(boardToSolve);

    expect(success).toBe(true);
    expect(isBoardCompleted(boardToSolve)).toBe(true);
  });

  it('returns countSolutions = 0 for an invalid contradictory puzzle', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 1;
    grid[0][1] = 1; // Contradiction
    // solver with contradiction
    const count = countSolutions(grid, 2);
    expect(count).toBe(0);
  });

  it('returns countSolutions > 1 for an empty board', () => {
    const emptyGrid = createEmptyGrid();
    const count = countSolutions(emptyGrid, 2);
    expect(count).toBe(2); // At least 2
  });

  it('guarantees unique solution for easy, medium, and hard generated puzzles', () => {
    (['easy', 'medium', 'hard'] as const).forEach((diff) => {
      const puzzle = generatePuzzle(diff);
      const solutions = countSolutions(puzzle.initialBoard, 2);
      expect(solutions).toBe(1);
    });
  });

  it('detects row, column, and box conflicts', () => {
    const grid = createEmptyGrid();
    grid[1][1] = 7;
    grid[1][5] = 7; // row conflict
    grid[6][1] = 7; // col conflict

    const conflicts = findConflicts(grid);
    expect(conflicts[1][1]).toBe(true);
    expect(conflicts[1][5]).toBe(true);
    expect(conflicts[6][1]).toBe(true);
    expect(conflicts[0][0]).toBe(false);
  });

  it('produces deterministic puzzles when seeded PRNG is used', () => {
    const seed = 123456789;
    const rng1 = createPRNG(seed);
    const rng2 = createPRNG(seed);

    const puzzle1 = generatePuzzle('medium', rng1);
    const puzzle2 = generatePuzzle('medium', rng2);

    expect(puzzle1.initialBoard).toEqual(puzzle2.initialBoard);
    expect(puzzle1.solution).toEqual(puzzle2.solution);
  });
});
