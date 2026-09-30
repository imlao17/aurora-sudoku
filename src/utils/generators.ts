import { GRID_SIZE } from '../constants/sudoku';
import { cloneGrid, countSolutions, generateFullBoard, shuffleArray } from './sudoku';
import { rateDifficulty } from './difficultyRater';

export interface GeneratorResult {
  puzzle: number[][];
  solution: number[][];
  algorithm: 'random' | 'symmetric' | 'technique-targeted';
  clueCount: number;
  generationTimeMs: number;
}

/**
 * Algorithm A: 随机挖空 + 唯一解回溯校验 (Random Digging + Uniqueness Backtracking)
 * Completely random hole excavation with immediate uniqueness check.
 */
export function generateAlgorithmA(
  targetClues: number = 32,
  rng: () => number = Math.random
): GeneratorResult {
  const t0 = performance.now();
  const solution = generateFullBoard(rng);
  const puzzle = cloneGrid(solution);

  const coords: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      coords.push({ r, c });
    }
  }
  shuffleArray(coords, rng);

  let currentClues = 81;
  for (const { r, c } of coords) {
    if (currentClues <= targetClues) break;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    if (countSolutions(puzzle, 2) === 1) {
      currentClues--;
    } else {
      puzzle[r][c] = backup;
    }
  }

  const generationTimeMs = performance.now() - t0;
  return {
    puzzle,
    solution,
    algorithm: 'random',
    clueCount: currentClues,
    generationTimeMs,
  };
}

/**
 * Algorithm B: 中心旋转对称 pattern 挖空 (180° Rotational Symmetrical Digging)
 * Excavates holes in symmetrical pairs: (r, c) and (8-r, 8-c).
 */
export function generateAlgorithmB(
  targetClues: number = 32,
  rng: () => number = Math.random
): GeneratorResult {
  const t0 = performance.now();
  const solution = generateFullBoard(rng);
  const puzzle = cloneGrid(solution);

  // Group cells into symmetric pairs
  const pairs: { r1: number; c1: number; r2: number; c2: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const symR = (GRID_SIZE - 1) - r;
      const symC = (GRID_SIZE - 1) - c;
      if (r < symR || (r === symR && c <= symC)) {
        pairs.push({ r1: r, c1: c, r2: symR, c2: symC });
      }
    }
  }
  shuffleArray(pairs, rng);

  let currentClues = 81;
  for (const { r1, c1, r2, c2 } of pairs) {
    if (currentClues <= targetClues) break;
    const val1 = puzzle[r1][c1];
    const val2 = puzzle[r2][c2];

    puzzle[r1][c1] = 0;
    puzzle[r2][c2] = 0;

    if (countSolutions(puzzle, 2) === 1) {
      currentClues -= (r1 === r2 && c1 === c2) ? 1 : 2;
    } else {
      puzzle[r1][c1] = val1;
      puzzle[r2][c2] = val2;
    }
  }

  // If symmetry alone didn't reach target, fine-tune single cells
  if (currentClues > targetClues) {
    const coords: { r: number; c: number }[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (puzzle[r][c] !== 0) coords.push({ r, c });
      }
    }
    shuffleArray(coords, rng);
    for (const { r, c } of coords) {
      if (currentClues <= targetClues) break;
      const val = puzzle[r][c];
      puzzle[r][c] = 0;
      if (countSolutions(puzzle, 2) === 1) {
        currentClues--;
      } else {
        puzzle[r][c] = val;
      }
    }
  }

  const generationTimeMs = performance.now() - t0;
  return {
    puzzle,
    solution,
    algorithm: 'symmetric',
    clueCount: currentClues,
    generationTimeMs,
  };
}

/**
 * Algorithm C: 基于技巧需求的定向挖空 (Technique-Targeted Digging)
 * Actively drives up human difficulty by prioritizing removal of cells that
 * satisfy easy techniques (e.g. naked singles), forcing higher tier deductions.
 */
export function generateAlgorithmC(
  targetClues: number = 26,
  _minRequiredScore: number = 650,
  rng: () => number = Math.random
): GeneratorResult {
  const t0 = performance.now();

  for (let retry = 0; retry < 6; retry++) {
    // 1. Initial symmetrical dig to reach an intermediate state (~34 clues)
    const intermediateTarget = Math.max(34, targetClues + 8);
    const intermediate = generateAlgorithmB(intermediateTarget, rng);
    const solution = intermediate.solution;
    const puzzle = cloneGrid(intermediate.puzzle);

    let currentClues = intermediate.clueCount;

    // 2. Iteratively dig clues with highest neighbor concentration to eliminate simple singles
    let attempts = 0;
    while (currentClues > targetClues && attempts < 80) {
      attempts++;

      // Find all remaining non-zero clues
      const remainingClues: { r: number; c: number; neighborCount: number }[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (puzzle[r][c] !== 0) {
            // Count how many peers in row/col/box are filled
            let filledPeers = 0;
            for (let i = 0; i < GRID_SIZE; i++) {
              if (puzzle[r][i] !== 0) filledPeers++;
              if (puzzle[i][c] !== 0) filledPeers++;
            }
            remainingClues.push({ r, c, neighborCount: filledPeers });
          }
        }
      }

      // Sort clues with highest neighbor concentration first (digging these breaks easy naked singles)
      remainingClues.sort((a, b) => b.neighborCount - a.neighborCount + (rng() - 0.5) * 4);

      let dug = false;
      for (const { r, c } of remainingClues) {
        const backup = puzzle[r][c];
        puzzle[r][c] = 0;

        if (countSolutions(puzzle, 2) === 1) {
          currentClues--;
          dug = true;
          break; // Re-evaluate logic with new board
        } else {
          puzzle[r][c] = backup;
        }
      }

      if (!dug) {
        // No more single clues can be removed without breaking uniqueness
        break;
      }
    }

    const rating = rateDifficulty(puzzle);
    if (rating.isSolvableLogically || retry === 5) {
      const generationTimeMs = performance.now() - t0;
      return {
        puzzle,
        solution,
        algorithm: 'technique-targeted',
        clueCount: currentClues,
        generationTimeMs,
      };
    }
  }

  const fallback = generateAlgorithmB(targetClues, rng);
  return {
    puzzle: fallback.puzzle,
    solution: fallback.solution,
    algorithm: 'technique-targeted',
    clueCount: fallback.clueCount,
    generationTimeMs: performance.now() - t0,
  };
}
