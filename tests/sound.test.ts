import { describe, it, expect, vi, beforeEach } from 'vitest';
import { soundManager } from '../src/utils/sound';

describe('SoundController Suite', () => {
  beforeEach(() => {
    soundManager.enabled = true;

    // Mock AudioContext to test the audio graph generation
    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockCtx = {
      state: 'running',
      currentTime: 10,
      destination: {},
      resume: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      createGain: vi.fn(() => ({ ...mockGain })),
    };

    (soundManager as any).ctx = mockCtx;
    (soundManager as any).isUnlocked = true;
  });

  it('can enable and disable sound feedback', () => {
    soundManager.enabled = false;
    expect(soundManager.enabled).toBe(false);
    soundManager.playSelect();
    soundManager.enabled = true;
    expect(soundManager.enabled).toBe(true);
  });

  it('safely handles vibrate API', () => {
    expect(() => soundManager.vibrate(20)).not.toThrow();
  });

  it('executes all synthesizer audio graph methods', () => {
    soundManager.playSelect();
    soundManager.playPlaceNumber(false);
    soundManager.playPlaceNumber(true);
    soundManager.playNote();
    soundManager.playErase();
    soundManager.playError();
    soundManager.playHint();
    soundManager.playCompleteSection();
    soundManager.playVictory();
  });
});
