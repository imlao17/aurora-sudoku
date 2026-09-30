/**
 * Web Audio API procedural sound synthesizer for tactile feedback
 * Zero external audio files required, instant playback, zero lag.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private isUnlocked: boolean = false;

  constructor() {
    this.setupUnlockListeners();
  }

  private setupUnlockListeners(): void {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      this.isUnlocked = true;
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          return null;
        }
      }
    }

    if (this.ctx && this.ctx.state === 'suspended' && this.isUnlocked) {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Tactile haptic feedback for mobile devices
   */
  public vibrate(ms: number | number[] = 15): void {
    if (!this.enabled) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore vibration errors in restricted environments
      }
    }
  }

  /**
   * Subtle wood-like tick on selecting a cell
   */
  public playSelect(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Crisp satisfying pop on placing a primary number with melodic pitch ladder 1-9
   */
  public playPlaceNumber(num?: number, isSameNumberCountFull: boolean = false): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate(isSameNumberCountFull ? 25 : 15);

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // 1-9 melodic scale (C4 to D5)
      const SCALE_FREQS: Record<number, number> = {
        1: 261.63, // C4
        2: 293.66, // D4
        3: 329.63, // E4
        4: 349.23, // F4
        5: 392.00, // G4
        6: 440.00, // A4
        7: 493.88, // B4
        8: 523.25, // C5
        9: 587.33, // D5
      };

      const baseFreq = (num && SCALE_FREQS[num]) || 440;
      const targetFreq = isSameNumberCountFull ? baseFreq * 1.5 : baseFreq * 1.05;

      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Delicate tick on setting/removing pencil mark notes
   */
  public playNote(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate(10);

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Soft whoosh on erasing
   */
  public playErase(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate(12);

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Gentle, non-jarring error thud
   */
  public playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([30, 40, 30]);

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Magical chime for Hint
   */
  public playHint(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([20, 30, 20]);

    try {
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Sparkle sound when a row, col, or 3x3 block is fully solved
   */
  public playCompleteSection(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Glorious fanfare for game victory
   */
  public playVictory(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([40, 60, 40, 60, 100]);

    try {
      // C5 - E5 - G5 - C6
      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // Audio operation error safe catch
    }
  }

  /**
   * Triumphant harmonic chime for achievement unlock
   */
  public playAchievementFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    this.vibrate([30, 40, 70]);

    try {
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.08;
        const dur = idx === notes.length - 1 ? 0.6 : 0.25;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.01, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });
    } catch {
      // Audio operation safe catch
    }
  }
}

export const soundManager = new SoundController();
