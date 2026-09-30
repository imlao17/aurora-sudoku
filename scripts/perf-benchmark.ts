import { generateAlgorithmA, generateAlgorithmB, generateAlgorithmC } from '../src/utils/generators';

console.log('==============================================');
console.log('⚡ 数独算法与性能基准测试 (Performance Benchmark)');
console.log('==============================================\n');

// 1. Benchmark Algorithm Generation Times
const SAMPLES = 20;

function benchmarkAlgo(name: string, fn: () => void) {
  const times: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t0 = performance.now();
    fn();
    times.push(performance.now() - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / SAMPLES;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2) };
}

console.log(`▶ 正在压测生成算法 (每个样本 ${SAMPLES} 次采样)...`);

const resA = benchmarkAlgo('Algorithm A (Random)', () => generateAlgorithmA(36));
console.log(`  - 算法 A (简单档 - 随机挖空): 平均耗时 = ${resA.avg}ms (最快: ${resA.min}ms, 最慢: ${resA.max}ms)`);

const resB = benchmarkAlgo('Algorithm B (Symmetric)', () => generateAlgorithmB(30));
console.log(`  - 算法 B (中等档 - 对称挖空): 平均耗时 = ${resB.avg}ms (最快: ${resB.min}ms, 最慢: ${resB.max}ms)`);

const resC = benchmarkAlgo('Algorithm C (Targeted)', () => generateAlgorithmC(25));
console.log(`  - 算法 C (困难档 - 启发式定向挖空): 平均耗时 = ${resC.avg}ms (最快: ${resC.min}ms, 最慢: ${resC.max}ms)`);

console.log('\n==============================================');
console.log('🎉 性能基准测试执行完毕！');
console.log('==============================================');
