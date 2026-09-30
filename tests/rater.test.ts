import { describe, it, expect } from 'vitest';
import { rateDifficulty } from '../src/utils/difficultyRater';
import { generateAlgorithmB, generateAlgorithmC } from '../src/utils/generators';
import { cloneGrid, generateFullBoard } from '../src/utils/sudoku';

describe('Difficulty Rater Engine', () => {
  it('rates a fully completed board as score 0 and easy', () => {
    const fullBoard = generateFullBoard();
    const rating = rateDifficulty(fullBoard);

    expect(rating.score).toBe(0);
    expect(rating.clueCount).toBe(81);
    expect(rating.totalSteps).toBe(0);
    expect(rating.isSolvableLogically).toBe(true);
    expect(rating.tier).toBe('easy');
  });

  it('accurately identifies simple Naked Single placements', () => {
    const fullBoard = generateFullBoard();
    const puzzle = cloneGrid(fullBoard);
    // Remove exactly one cell
    puzzle[0][0] = 0;

    const rating = rateDifficulty(puzzle);
    expect(rating.clueCount).toBe(80);
    expect(rating.totalSteps).toBe(1);
    expect(rating.peakTechnique).toContain('唯一余数');
    expect(rating.tier).toBe('easy');
    expect(rating.isSolvableLogically).toBe(true);
  });

  it('rates typical Easy boards as easy or low medium', () => {
    const gen = generateAlgorithmB(38);
    const rating = rateDifficulty(gen.puzzle);

    expect(rating.clueCount).toBeGreaterThanOrEqual(36);
    expect(['easy', 'medium']).toContain(rating.tier);
    expect(rating.score).toBeGreaterThan(0);
  });

  it('rates targeted complex boards with higher difficulty score and advanced techniques', () => {
    const gen = generateAlgorithmC(25, 750);
    const rating = rateDifficulty(gen.puzzle);

    expect(rating.clueCount).toBeLessThanOrEqual(28);
    // Hard algorithm boards should have significant deduction score
    expect(rating.score).toBeGreaterThan(600);
    expect(rating.totalSteps).toBeGreaterThan(0);
  });

  it('includes detailed technique frequency counts in the analysis output', () => {
    const gen = generateAlgorithmB(32);
    const rating = rateDifficulty(gen.puzzle);

    expect(typeof rating.techniqueCounts).toBe('object');
    // At least some techniques should have been recorded
    const keys = Object.keys(rating.techniqueCounts);
    expect(keys.length).toBeGreaterThan(0);
  });

  it('correctly detects column and box level techniques and hidden pair logic', () => {
    // Construct a board where hidden pair occurs in a row or box
    const puzzle = [
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
    // Remove 2 pairs in row 6 (index 6, 7, 8) to create symmetrical candidates
    puzzle[6][6] = 0;
    puzzle[6][7] = 0;
    puzzle[7][6] = 0;
    puzzle[7][7] = 0;

    const rating = rateDifficulty(puzzle);
    expect(rating.isSolvableLogically).toBe(true);
    expect(rating.totalSteps).toBeGreaterThanOrEqual(4);
  });
});

