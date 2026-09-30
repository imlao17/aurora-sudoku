import { generatePuzzle, solveSudoku, countSolutions, generateFullBoard } from '../src/utils/sudoku.ts';
import { Difficulty } from '../src/types/sudoku.ts';

console.log('====================================================');
console.log('⚡ 极光数独性能基准评测 (Performance Benchmark)');
console.log('====================================================\n');

// 1. Full Board Generation Benchmark
const FULL_BOARD_RUNS = 50;
const startFullBoard = performance.now();
for (let i = 0; i < FULL_BOARD_RUNS; i++) {
  generateFullBoard();
}
const fullBoardTotal = performance.now() - startFullBoard;
const fullBoardAvg = (fullBoardTotal / FULL_BOARD_RUNS).toFixed(2);
console.log(`1. 完整终盘生成速度: 平均 ${fullBoardAvg} ms / 盘 (${FULL_BOARD_RUNS} 轮采样)`);

// 2. Solver Speed on 100 Solvable Boards
const SOLVER_RUNS = 100;
const boardsToSolve = Array.from({ length: SOLVER_RUNS }, () => {
  const p = generatePuzzle('medium');
  return p.initialBoard;
});

const startSolve = performance.now();
for (const b of boardsToSolve) {
  solveSudoku(b);
}
const solveTotal = performance.now() - startSolve;
const solveAvg = (solveTotal / SOLVER_RUNS).toFixed(3);
console.log(`2. MRV 求解器解题耗时: 平均 ${solveAvg} ms / 盘 (${SOLVER_RUNS} 题连续求解)`);

// 3. Puzzle Generation by Difficulty
const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
console.log('\n3. 各难度题目生成与唯一解挖空耗时:');

for (const diff of difficulties) {
  const count = 10;
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    generatePuzzle(diff);
  }
  const total = performance.now() - start;
  const avg = (total / count).toFixed(2);
  const throughput = Math.round(1000 / (total / count));
  console.log(`   - [${diff.toUpperCase()}]: 平均 ${avg} ms / 题 | 吞吐量: ~${throughput} 题/秒`);
}

// 4. Uniqueness Checker Throughput
const testBoard = generatePuzzle('easy').initialBoard;
const CHECK_RUNS = 200;
const startCheck = performance.now();
for (let i = 0; i < CHECK_RUNS; i++) {
  countSolutions(testBoard, 2);
}
const checkTotal = performance.now() - startCheck;
const checkAvg = (checkTotal / CHECK_RUNS).toFixed(3);
console.log(`\n4. 唯一解判定 (countSolutions<=2) 耗时: 平均 ${checkAvg} ms / 次 (${CHECK_RUNS} 轮)`);

console.log('\n====================================================');
console.log('🎯 基准测试完成！');
console.log('====================================================\n');
