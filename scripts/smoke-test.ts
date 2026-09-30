import { generatePuzzle, countSolutions } from '../src/utils/sudoku.ts';
import { createPRNG, hashStringToSeed } from '../src/utils/prng.ts';
import { Difficulty } from '../src/types/sudoku.ts';

console.log('==============================================');
console.log('🧪 开始数独求解器自检与唯一解冒烟测试 (Smoke Test)');
console.log('==============================================\n');

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];
const testCountPerDifficulty = 3;

let allPassed = true;

for (const diff of difficulties) {
  console.log(`▶ 正在测试难度: [${diff.toUpperCase()}] ...`);
  for (let i = 1; i <= testCountPerDifficulty; i++) {
    const startTime = performance.now();
    const puzzle = generatePuzzle(diff);
    const genTime = (performance.now() - startTime).toFixed(1);

    // Count non-empty clues
    let clues = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle.initialBoard[r][c] !== 0) clues++;
      }
    }

    // Verify uniqueness with solver
    const solutions = countSolutions(puzzle.initialBoard, 2);
    const passed = solutions === 1;

    if (!passed) {
      allPassed = false;
      console.error(`  ❌ 样本 #${i} 失败: 解的数量为 ${solutions} (非唯一解)`);
    } else {
      console.log(`  ✅ 样本 #${i}: 初始已知数=${clues}, 解的数量=${solutions} (唯一解保证), 生成耗时=${genTime}ms`);
    }
  }
}

// Test deterministic PRNG for Daily Challenge
console.log('\n▶ 正在测试每日一题确定性 (Date Seeded PRNG)...');
const testDate = '2026-09-29';
const seed1 = hashStringToSeed(testDate);
const seed2 = hashStringToSeed(testDate);
const rng1 = createPRNG(seed1);
const rng2 = createPRNG(seed2);

const daily1 = generatePuzzle('medium', rng1);
const daily2 = generatePuzzle('medium', rng2);

let identical = true;
for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    if (daily1.initialBoard[r][c] !== daily2.initialBoard[r][c]) {
      identical = false;
    }
  }
}

const dailySolutions = countSolutions(daily1.initialBoard, 2);
if (identical && dailySolutions === 1) {
  console.log(`  ✅ 每日一题 (${testDate}) 确定性生成一致且解唯一！`);
} else {
  allPassed = false;
  console.error(`  ❌ 每日一题测试失败: 相同性=${identical}, 解数=${dailySolutions}`);
}

console.log('\n==============================================');
if (allPassed) {
  console.log('🎉 冒烟测试全部通过！所有生成题目均保证严格唯一解！');
} else {
  console.log('❌ 冒烟测试存在失败项，请检查算法！');
  process.exit(1);
}
console.log('==============================================\n');
