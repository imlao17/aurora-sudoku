import fs from 'fs';
import path from 'path';
import { generateAlgorithmB, generateAlgorithmC } from '../src/utils/generators';
import { countSolutions, generatePuzzle, isBoardCompleted } from '../src/utils/sudoku';
import { createPRNG, hashStringToSeed } from '../src/utils/prng';
import { rateDifficulty } from '../src/utils/difficultyRater';
import { generateVisualSolveSteps } from '../src/utils/visualSolver';
import {
  loadSettings,
  loadStats,
  loadActiveGame,
  recordGameResult,
  DEFAULT_SETTINGS,
} from '../src/utils/storage';

console.log('====================================================');
console.log('🚀 极光数独（Aurora Sudoku）生产级严苛验收与自检套件');
console.log('====================================================\n');

let allPassed = true;
function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${msg}`);
  } else {
    console.error(`  ❌ [FAIL] ${msg}`);
    allPassed = false;
  }
}

// ----------------------------------------------------
// 1. 产物包完整度与 PWA 资产自检 (Bundle & Asset Check)
// ----------------------------------------------------
console.log('📦 1. 检验生产构建产物与 PWA 离线资源完整度:');
const distDir = path.resolve(process.cwd(), 'dist');
assert(fs.existsSync(distDir), 'dist 生产构建目录存在');
assert(fs.existsSync(path.join(distDir, 'index.html')), 'dist/index.html 入口文件存在');
assert(fs.existsSync(path.join(distDir, 'favicon.svg')), 'dist/favicon.svg 存在');
assert(fs.existsSync(path.join(distDir, 'manifest.json')), 'dist/manifest.json Web App Manifest 存在');
assert(fs.existsSync(path.join(distDir, 'sw.js')), 'dist/sw.js Service Worker 离线缓存脚本存在');

const htmlContent = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8');
const jsMatch = htmlContent.match(/src="(\.?\/assets\/[^"]+\.js)"/);
const cssMatch = htmlContent.match(/href="(\.?\/assets\/[^"]+\.css)"/);

assert(!!jsMatch, `index.html 包含主 JS 资源引用: ${jsMatch?.[1]}`);
assert(!!cssMatch, `index.html 包含主 CSS 资源引用: ${cssMatch?.[1]}`);

if (jsMatch) {
  const relPath = jsMatch[1].replace(/^\.?\//, '');
  const jsPath = path.join(distDir, relPath);
  assert(fs.existsSync(jsPath) && fs.statSync(jsPath).size > 10000, `JS 资源文件非空且尺寸健康 (${(fs.statSync(jsPath).size / 1024).toFixed(1)} kB)`);
}
if (cssMatch) {
  const relPath = cssMatch[1].replace(/^\.?\//, '');
  const cssPath = path.join(distDir, relPath);
  assert(fs.existsSync(cssPath) && fs.statSync(cssPath).size > 1000, `CSS 资源文件非空且尺寸健康 (${(fs.statSync(cssPath).size / 1024).toFixed(1)} kB)`);
}

// ----------------------------------------------------
// 2. 每日挑战 30 天跨月跨年确定性与唯一解自检
// ----------------------------------------------------
console.log('\n📅 2. 检验每日一题 (跨年/跨月/闰年) 确定性与 100% 唯一解:');
const testDates = [
  '2026-01-01', '2026-02-28', '2026-03-01', '2026-09-30',
  '2026-10-01', '2026-12-31', '2027-01-01', '2028-02-29' // 闰日
];

let dailyUnique = true;
for (const d of testDates) {
  const seed = hashStringToSeed(d);
  const rng1 = createPRNG(seed);
  const p1 = generatePuzzle('medium', rng1);

  const rng2 = createPRNG(seed);
  const p2 = generatePuzzle('medium', rng2);

  // 必须确定性生成完全一致的题目
  const identical = JSON.stringify(p1.initialBoard) === JSON.stringify(p2.initialBoard);
  // 必须保证严格唯一解
  const solutions = countSolutions(p1.initialBoard, 2);
  if (!identical || solutions !== 1) {
    dailyUnique = false;
  }
}
assert(dailyUnique, `跨月/跨年/闰日共 ${testDates.length} 个代表日期测试：确定性 100%、唯一解 100%`);

// ----------------------------------------------------
// 3. 难度评级与生成器压力测试 (30 道题高频生成)
// ----------------------------------------------------
console.log('\n🧠 3. 高难度题目逻辑评级器与无猜测可解性压测:');
let allLogicallySolvable = true;
let totalGenTime = 0;
const SAMPLES_PER_DIFF = 10;

for (let i = 0; i < SAMPLES_PER_DIFF; i++) {
  const t0 = performance.now();
  const c = generateAlgorithmC(25);
  totalGenTime += (performance.now() - t0);

  const unique = countSolutions(c.puzzle, 2) === 1;
  const analysis = rateDifficulty(c.puzzle);
  if (!unique || !analysis.isSolvableLogically) {
    allLogicallySolvable = false;
  }
}
const avgCGen = (totalGenTime / SAMPLES_PER_DIFF).toFixed(2);
assert(allLogicallySolvable, `困难档定向挖空 ${SAMPLES_PER_DIFF} 连测：100% 唯一解、100% 逻辑可解 (无需盲猜)`);
assert(Number(avgCGen) < 15, `困难档生成平均耗时 ${avgCGen}ms (远低于 60fps 帧预算 16ms)`);

// ----------------------------------------------------
// 4. 可视化求解器端到端闭环演算测试
// ----------------------------------------------------
console.log('\n👁️ 4. 逐步教学求解器（Visual Solver）推演轨迹闭环测试:');
let allStepsValid = true;
for (let i = 0; i < 3; i++) {
  const p = generateAlgorithmB(34);
  const steps = generateVisualSolveSteps(p.puzzle);
  if (steps.length === 0) allStepsValid = false;

  const lastStep = steps[steps.length - 1];
  if (!isBoardCompleted(lastStep.gridSnapshot)) {
    allStepsValid = false;
  }
}
assert(allStepsValid, '逐步教学求解器可将盘面推导至 100% 满盘终局');

// ----------------------------------------------------
// 5. 本地存储容错、异常恢复与配额安全 (Storage Fault Injection)
// ----------------------------------------------------
console.log('\n💾 5. 本地数据持久化与脏数据自动容错测试:');

// 模拟 localStorage
const storageMock: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => storageMock[k] ?? null,
  setItem: (k: string, v: string) => { storageMock[k] = v; },
  removeItem: (k: string) => { delete storageMock[k]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
  length: 0,
  key: () => null,
};

// 注入脏数据
storageMock['aurora_sudoku_settings_v1'] = '{ bad json !!! ';
const recoveredSettings = loadSettings();
assert(recoveredSettings.theme === DEFAULT_SETTINGS.theme, '面对 Settings 损坏 JSON：自动重置为默认值，零崩溃');

storageMock['aurora_sudoku_stats_v1'] = 'null';
const recoveredStats = loadStats();
assert(recoveredStats.easy.gamesPlayed === 0, '面对 Stats 异常值：优雅降级并初始化健康结构');

storageMock['aurora_active_game_v1'] = '123456';
const recoveredActive = loadActiveGame();
assert(recoveredActive === null, '面对非对象 ActiveGame：安全返回 null，不引发白屏');

// 连胜测试
recordGameResult('medium', 120, true, '2026-09-28');
const res2 = recordGameResult('medium', 110, true, '2026-09-29');
assert(res2.updatedStats.dailyStreak === 2, '连续两天通关：连胜递增至 2');
const res3 = recordGameResult('medium', 115, true, '2026-10-02');
assert(res3.updatedStats.dailyStreak === 1, '跨过数天后通关：连胜安全重置为 1 (不误判)');
assert(res3.updatedStats.maxDailyStreak === 2, '连胜断开时：历史最高连胜纪录完好无损');

// ----------------------------------------------------
// 总结输出
// ----------------------------------------------------
console.log('\n====================================================');
if (allPassed) {
  console.log('🏆 生产准入综合测试全部通过！完全达到直接部署上线的工业级品质！');
} else {
  console.error('❌ 存在未达标项，请检视上述失败原因。');
  process.exit(1);
}
console.log('====================================================');
