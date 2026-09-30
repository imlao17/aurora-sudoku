import { generateAlgorithmA, generateAlgorithmB, generateAlgorithmC, GeneratorResult } from '../src/utils/generators.ts';
import { rateDifficulty, DifficultyAnalysis } from '../src/utils/difficultyRater.ts';
import { countSolutions } from '../src/utils/sudoku.ts';

interface BenchmarkRun {
  genResult: GeneratorResult;
  rating: DifficultyAnalysis;
  unique: boolean;
}

interface AlgorithmSummary {
  name: string;
  count: number;
  allUnique: boolean;
  time: { min: number; max: number; mean: number; stddev: number };
  clues: { min: number; max: number; mean: number };
  score: { min: number; max: number; mean: number; stddev: number };
  tiers: Record<string, number>;
  solvableRate: number;
  techniques: Record<string, number>;
  sampleRuns: { clues: number; score: number; tier: string; timeMs: number; peak: string }[];
}

function calculateStats(values: number[]): { min: number; max: number; mean: number; stddev: number } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stddev = Math.sqrt(variance);
  return { min, max, mean, stddev };
}

function benchmarkAlgorithm(
  name: string,
  generatorFn: () => GeneratorResult,
  runs: number = 20
): AlgorithmSummary {
  const records: BenchmarkRun[] = [];

  for (let i = 0; i < runs; i++) {
    const gen = generatorFn();
    const unique = countSolutions(gen.puzzle, 2) === 1;
    const rating = rateDifficulty(gen.puzzle);
    records.push({ genResult: gen, rating, unique });
  }

  const times = records.map(r => r.genResult.generationTimeMs);
  const clues = records.map(r => r.genResult.clueCount);
  const scores = records.map(r => r.rating.score);
  const allUnique = records.every(r => r.unique);

  const timeStats = calculateStats(times);
  const clueStats = calculateStats(clues);
  const scoreStats = calculateStats(scores);

  const tiers: Record<string, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
  const techniques: Record<string, number> = {};
  let logicallySolvableCount = 0;

  for (const r of records) {
    tiers[r.rating.tier] = (tiers[r.rating.tier] || 0) + 1;
    if (r.rating.isSolvableLogically) logicallySolvableCount++;
    for (const [tech, count] of Object.entries(r.rating.techniqueCounts)) {
      techniques[tech] = (techniques[tech] || 0) + count;
    }
  }

  const sampleRuns = records.slice(0, 5).map(r => ({
    clues: r.genResult.clueCount,
    score: r.rating.score,
    tier: r.rating.tier,
    timeMs: Math.round(r.genResult.generationTimeMs * 10) / 10,
    peak: r.rating.peakTechnique,
  }));

  return {
    name,
    count: runs,
    allUnique,
    time: timeStats,
    clues: clueStats,
    score: scoreStats,
    tiers,
    solvableRate: (logicallySolvableCount / runs) * 100,
    techniques,
    sampleRuns,
  };
}

console.log('========================================================================');
console.log('⚔️  数独生成器大战：3 种算法实测基准对比 (Generator Battle Benchmark)  ⚔️');
console.log('    样本量: 每种算法严格生成 20 道真实题板 (总计 60 道完整演算)');
console.log('========================================================================\n');

console.log('正在评测 算法 A (随机挖空 + 唯一解回溯)...');
const summaryA = benchmarkAlgorithm('算法 A: 随机挖空 (Random Digging)', () => generateAlgorithmA(32), 20);

console.log('正在评测 算法 B (中心旋转对称挖空)...');
const summaryB = benchmarkAlgorithm('算法 B: 中心旋转对称挖空 (Symmetrical Digging)', () => generateAlgorithmB(32), 20);

console.log('正在评测 算法 C (技巧驱动定向挖空)...');
const summaryC = benchmarkAlgorithm('算法 C: 技巧驱动定向挖空 (Technique-Targeted)', () => generateAlgorithmC(26, 650), 20);

const summaries = [summaryA, summaryB, summaryC];

console.log('\n------------------------------------------------------------------------');
console.log('📊 核心指标横向汇总表');
console.log('------------------------------------------------------------------------');
console.log('| 算法名称 | 唯一解率 | 平均耗时 (ms) | 耗时区间 (ms) | 平均提示数 | 难度分 (Mean±Std) | 逻辑可解率 | 主导难度等级 |');
console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |');

for (const s of summaries) {
  const domTier = Object.entries(s.tiers).sort((a, b) => b[1] - a[1])[0];
  console.log(
    `| ${s.name} | ${s.allUnique ? '100% (20/20)' : '⚠️ 存在非唯一解'} | ${s.time.mean.toFixed(2)} ms | ${s.time.min.toFixed(1)} ~ ${s.time.max.toFixed(1)} | ${s.clues.mean.toFixed(1)} | ${s.score.mean.toFixed(0)} ± ${s.score.stddev.toFixed(0)} | ${s.solvableRate.toFixed(0)}% | ${domTier[0]} (${domTier[1]}/20) |`
  );
}

console.log('\n------------------------------------------------------------------------');
console.log('🎯 技巧覆盖度频次分布 (20 题总计触发次数 / 平均每题出现次数)');
console.log('------------------------------------------------------------------------');

// Collect all unique technique names across all summaries
const allTechs = new Set<string>();
for (const s of summaries) {
  for (const t of Object.keys(s.techniques)) allTechs.add(t);
}

for (const tech of Array.from(allTechs).sort()) {
  const countA = summaryA.techniques[tech] || 0;
  const countB = summaryB.techniques[tech] || 0;
  const countC = summaryC.techniques[tech] || 0;
  console.log(`- ${tech}:`);
  console.log(`    算法 A: 总计 ${countA} 次 (均题 ${(countA / 20).toFixed(1)} 次)`);
  console.log(`    算法 B: 总计 ${countB} 次 (均题 ${(countB / 20).toFixed(1)} 次)`);
  console.log(`    算法 C: 总计 ${countC} 次 (均题 ${(countC / 20).toFixed(1)} 次)`);
}

console.log('\n------------------------------------------------------------------------');
console.log('🗂️ 难度分级区间分布 (Easy / Medium / Hard / Expert)');
console.log('------------------------------------------------------------------------');
for (const s of summaries) {
  console.log(`${s.name}:`);
  console.log(`    - 简单 (Easy):   ${s.tiers.easy} 题`);
  console.log(`    - 中等 (Medium): ${s.tiers.medium} 题`);
  console.log(`    - 困难 (Hard):   ${s.tiers.hard} 题`);
  console.log(`    - 大师 (Expert): ${s.tiers.expert} 题`);
}

console.log('\n========================================================================');
console.log('✅ 基准对战运行完毕！');
console.log('========================================================================\n');
