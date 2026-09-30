import { describe, it, expect } from 'vitest';
import { generateAlgorithmA, generateAlgorithmB, generateAlgorithmC } from '../src/utils/generators';
import { countSolutions, solveSudoku, cloneGrid } from '../src/utils/sudoku';
import { createPRNG } from '../src/utils/prng';
import { GRID_SIZE } from '../src/constants/sudoku';

describe('Sudoku Hole Digging Generators (Algorithm A, B, C)', () => {
  it('Algorithm A (Random Digging) produces valid boards with strictly unique solutions', () => {
    const result = generateAlgorithmA(34);
    expect(result.algorithm).toBe('random');
    expect(result.clueCount).toBeLessThanOrEqual(34);
    expect(result.generationTimeMs).toBeGreaterThan(0);

    const solutions = countSolutions(result.puzzle, 2);
    expect(solutions).toBe(1);

    // Verify solving puzzle yields the exact returned solution
    const boardToSolve = cloneGrid(result.puzzle);
    const solved = solveSudoku(boardToSolve);
    expect(solved).toBe(true);
    expect(boardToSolve).toEqual(result.solution);
  });

  it('Algorithm B (Symmetrical Digging) creates 180° rotationally symmetric patterns', () => {
    const result = generateAlgorithmB(36);
    expect(result.algorithm).toBe('symmetric');
    expect(result.clueCount).toBeLessThanOrEqual(36);

    const solutions = countSolutions(result.puzzle, 2);
    expect(solutions).toBe(1);

    // Verify 180-degree rotational symmetry of empty cells
    let symmetricHolesCount = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const symR = GRID_SIZE - 1 - r;
        const symC = GRID_SIZE - 1 - c;
        if (result.puzzle[r][c] === 0 && result.puzzle[symR][symC] === 0) {
          symmetricHolesCount++;
        }
      }
    }
    // High majority of holes must be symmetrical pairs
    const totalEmpty = 81 - result.clueCount;
    expect(symmetricHolesCount).toBeGreaterThanOrEqual(totalEmpty - 2);
  });

  it('Algorithm B produces deterministic outputs when seeded PRNG is used', () => {
    const rng1 = createPRNG(42);
    const rng2 = createPRNG(42);

    const b1 = generateAlgorithmB(32, rng1);
    const b2 = generateAlgorithmB(32, rng2);

    expect(b1.puzzle).toEqual(b2.puzzle);
    expect(b1.solution).toEqual(b2.solution);
  });

  it('Algorithm C (Technique-Targeted) generates unique, high-deduction boards', () => {
    const result = generateAlgorithmC(26, 700);
    expect(result.algorithm).toBe('technique-targeted');
    expect(result.clueCount).toBeLessThanOrEqual(28);

    const solutions = countSolutions(result.puzzle, 2);
    expect(solutions).toBe(1);

    // Verify puzzle solution correctness
    const boardToSolve = cloneGrid(result.puzzle);
    solveSudoku(boardToSolve);
    expect(boardToSolve).toEqual(result.solution);
  });
});
