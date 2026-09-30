import { describe, it, expect } from 'vitest';
import { createPRNG, hashStringToSeed } from '../src/utils/prng';

describe('PRNG & Seeding Suite', () => {
  it('hashes identical strings to identical seeds', () => {
    const s1 = hashStringToSeed('2026-09-29');
    const s2 = hashStringToSeed('2026-09-29');
    expect(s1).toBe(s2);
    expect(typeof s1).toBe('number');
  });

  it('hashes different strings to different seeds', () => {
    const s1 = hashStringToSeed('2026-09-29');
    const s2 = hashStringToSeed('2026-09-30');
    expect(s1).not.toBe(s2);
  });

  it('generates uniform numbers in [0, 1)', () => {
    const rng = createPRNG(42);
    for (let i = 0; i < 100; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('reproduces identical sequence with identical seed', () => {
    const rngA = createPRNG(987654321);
    const rngB = createPRNG(987654321);

    const seqA = Array.from({ length: 20 }, () => rngA());
    const seqB = Array.from({ length: 20 }, () => rngB());

    expect(seqA).toEqual(seqB);
  });
});
