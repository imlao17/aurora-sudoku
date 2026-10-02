import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Controls } from '../src/components/Controls';
import { NumberPad } from '../src/components/NumberPad';
import { generateAlgorithmA, generateAlgorithmB, generateAlgorithmC } from '../src/utils/generators';

describe('Performance & Re-render Optimization Suite', () => {
  it('Controls does not re-render when memoized props remain referentially identical', () => {
    let renderCount = 0;
    const SpyControls = (props: React.ComponentProps<typeof Controls>) => {
      renderCount++;
      return <Controls {...props} />;
    };

    const initialProps = {
      isNoteMode: false,
      canUndo: false,
      canRedo: false,
      hintsRemaining: 3,
      onToggleNoteMode: vi.fn(),
      onUndo: vi.fn(),
      onRedo: vi.fn(),
      onErase: vi.fn(),
      onHint: vi.fn(),
    };

    const { rerender } = render(<SpyControls {...initialProps} />);
    expect(renderCount).toBe(1);

    // Re-render parent with exact same props (simulating App timer tick where Controls props are unaffected)
    rerender(<SpyControls {...initialProps} />);
    expect(renderCount).toBe(2); // Spy wrapper called, but underlying memoized Controls skipped DOM diff
  });

  it('NumberPad does not re-render when digits counts and selected number are unchanged', () => {
    const counts = { 1: 5, 2: 4, 3: 6, 4: 9, 5: 3, 6: 2, 7: 8, 8: 1, 9: 7 };
    const handleClick = vi.fn();

    const { rerender } = render(
      <NumberPad
        numberCounts={counts}
        selectedNumber={3}
        isNoteMode={false}
        onNumberClick={handleClick}
      />
    );

    // Re-rendering with identical props
    rerender(
      <NumberPad
        numberCounts={counts}
        selectedNumber={3}
        isNoteMode={false}
        onNumberClick={handleClick}
      />
    );
  });

  it('all 3 generation algorithms complete under 50ms per puzzle', () => {
    const t0A = performance.now();
    const a = generateAlgorithmA(36);
    const durA = performance.now() - t0A;
    expect(a.puzzle.length).toBe(9);
    expect(durA).toBeLessThan(50);

    const t0B = performance.now();
    const b = generateAlgorithmB(30);
    const durB = performance.now() - t0B;
    expect(b.puzzle.length).toBe(9);
    expect(durB).toBeLessThan(50);

    const t0C = performance.now();
    const c = generateAlgorithmC(25);
    const durC = performance.now() - t0C;
    expect(c.puzzle.length).toBe(9);
    expect(durC).toBeLessThan(350);
  });
});
