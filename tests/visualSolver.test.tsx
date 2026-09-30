import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { generateVisualSolveSteps, VisualSolveStep } from '../src/utils/visualSolver';
import { generateAlgorithmB } from '../src/utils/generators';
import { isBoardCompleted } from '../src/utils/sudoku';
import { analyzeNextHint } from '../src/utils/hint';
import { VisualSolverBar } from '../src/components/VisualSolverBar';
import type { CellData } from '../src/types/sudoku';

describe('Visual Solver & Step-by-Step Trajectory', () => {
  it('generates a complete, non-empty step-by-step solving trajectory to 100% completion', () => {
    const puzzle = generateAlgorithmB(36);
    const steps = generateVisualSolveSteps(puzzle.puzzle);

    expect(steps.length).toBeGreaterThan(10);

    // Step 0 must be initial board
    expect(steps[0].stepIndex).toBe(0);
    expect(steps[0].techniqueName).toContain('开局');
    expect(steps[0].gridSnapshot).toEqual(puzzle.puzzle);

    // Each step must contain valid metadata
    for (let i = 1; i < steps.length; i++) {
      const step = steps[i];
      expect(step.stepIndex).toBe(i);
      expect(step.techniqueName.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
      expect(step.gridSnapshot.length).toBe(9);
      expect(step.candidatesSnapshot.length).toBe(9);
    }

    // Final step snapshot must be fully completed and valid
    const finalStep = steps[steps.length - 1];
    expect(isBoardCompleted(finalStep.gridSnapshot)).toBe(true);
  });

  it('includes cause cells and target cells in single deductions', () => {
    const puzzle = generateAlgorithmB(38);
    const steps = generateVisualSolveSteps(puzzle.puzzle);

    // Find first placement step
    const firstPlacement = steps.find((s) => s.actionType === 'place' && s.stepIndex > 0);
    expect(firstPlacement).toBeDefined();
    if (firstPlacement) {
      expect(firstPlacement.targetCells.length).toBeGreaterThanOrEqual(1);
      expect(firstPlacement.targetCells[0].value).toBeGreaterThan(0);
      // Explanation should explain the cell coordinates
      expect(firstPlacement.description).toContain(String(firstPlacement.targetCells[0].row + 1));
    }
  });

  it('Smart Hint 2.0 provides cause cells, scope and rich educational explanation', () => {
    const puzzle = generateAlgorithmB(36);
    const numGrid = puzzle.puzzle;

    const board: CellData[][] = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ({
        row: r,
        col: c,
        value: numGrid[r][c],
        solution: puzzle.solution[r][c],
        isInitial: numGrid[r][c] !== 0,
        notes: [],
        isError: false,
      }))
    );

    const hint = analyzeNextHint(board, null);
    expect(hint).not.toBeNull();
    if (hint) {
      expect(hint.row).toBeGreaterThanOrEqual(0);
      expect(hint.row).toBeLessThan(9);
      expect(hint.col).toBeGreaterThanOrEqual(0);
      expect(hint.col).toBeLessThan(9);
      expect(hint.suggestedValue).toBe(puzzle.solution[hint.row][hint.col]);
      expect(hint.explanation.length).toBeGreaterThan(10);
      expect(hint.techniqueName).toBeDefined();
    }
  });

  it('Smart Hint detects player errors and guides correction', () => {
    const puzzle = generateAlgorithmB(38);
    const board: CellData[][] = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ({
        row: r,
        col: c,
        value: puzzle.puzzle[r][c],
        solution: puzzle.solution[r][c],
        isInitial: puzzle.puzzle[r][c] !== 0,
        notes: [],
        isError: false,
      }))
    );

    // Find an empty cell and set a wrong value
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!board[r][c].isInitial) {
          const wrongVal = (board[r][c].solution % 9) + 1;
          board[r][c].value = wrongVal;
          board[r][c].isError = true;

          const hint = analyzeNextHint(board, { row: r, col: c });
          expect(hint).not.toBeNull();
          expect(hint?.type).toBe('error');
          expect(hint?.suggestedValue).toBe(board[r][c].solution);
          expect(hint?.explanation).toContain('存在冲突');
          return;
        }
      }
    }
  });

  it('VisualSolverBar component renders controls and navigates steps cleanly', () => {
    const mockSteps: VisualSolveStep[] = [
      {
        stepIndex: 0,
        technique: 'naked-single',
        techniqueName: '开局盘面',
        weight: 0,
        actionType: 'place',
        targetCells: [],
        causeCells: [],
        title: '初始盘面',
        description: '准备开始推演',
        gridSnapshot: Array.from({ length: 9 }, () => Array(9).fill(0)),
        candidatesSnapshot: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [1, 2])),
      },
      {
        stepIndex: 1,
        technique: 'naked-single',
        techniqueName: '唯一余数 (Naked Single)',
        weight: 10,
        actionType: 'place',
        targetCells: [{ row: 0, col: 0, value: 5 }],
        causeCells: [{ row: 0, col: 1, value: 1 }],
        title: '唯一余数解',
        description: '第1行第1列填入5',
        gridSnapshot: Array.from({ length: 9 }, () => Array(9).fill(0)),
        candidatesSnapshot: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [1, 2])),
      },
    ];

    const onStepChange = vi.fn();
    const onTogglePlay = vi.fn();
    const onSpeedChange = vi.fn();
    const onExit = vi.fn();

    const { rerender } = render(
      <VisualSolverBar
        steps={mockSteps}
        currentStepIndex={0}
        isPlaying={false}
        speed={1}
        onStepChange={onStepChange}
        onTogglePlay={onTogglePlay}
        onSpeedChange={onSpeedChange}
        onExit={onExit}
      />
    );

    expect(screen.getByText('逐步演算教学模式')).toBeDefined();
    expect(screen.getByText('初始盘面')).toBeDefined();

    // Click Next Step
    const nextBtn = screen.getByTitle('下一步');
    fireEvent.click(nextBtn);
    expect(onStepChange).toHaveBeenCalledWith(1);

    // Re-render at step 1 to test back/first buttons
    rerender(
      <VisualSolverBar
        steps={mockSteps}
        currentStepIndex={1}
        isPlaying={false}
        speed={1}
        onStepChange={onStepChange}
        onTogglePlay={onTogglePlay}
        onSpeedChange={onSpeedChange}
        onExit={onExit}
      />
    );

    // Click Previous Step
    const prevBtn = screen.getByTitle('上一步');
    fireEvent.click(prevBtn);
    expect(onStepChange).toHaveBeenCalledWith(0);

    // Click First Step & Last Step
    const firstBtn = screen.getByTitle('跳转到起点');
    fireEvent.click(firstBtn);
    expect(onStepChange).toHaveBeenCalledWith(0);

    const lastBtn = screen.getByTitle('跳转到终点');
    fireEvent.click(lastBtn);
    expect(onStepChange).toHaveBeenCalledWith(1);

    // Click Speed buttons
    const speed2xBtn = screen.getByText('2x');
    fireEvent.click(speed2xBtn);
    expect(onSpeedChange).toHaveBeenCalledWith(2);

    // Click Play
    const playBtn = screen.getByText('播放');
    fireEvent.click(playBtn);
    expect(onTogglePlay).toHaveBeenCalled();

    // Click Exit
    const exitBtn = screen.getByText('退出演示');
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalled();
  });

  it('handles fully completed grid as input safely', () => {
    const fullGrid = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 1, 4, 3, 6, 5, 8, 9, 7],
      [3, 6, 5, 8, 9, 7, 2, 1, 4],
      [8, 9, 7, 2, 1, 4, 3, 6, 5],
      [5, 3, 1, 6, 4, 2, 9, 7, 8],
      [6, 4, 2, 9, 7, 8, 5, 3, 1],
      [9, 7, 8, 5, 3, 1, 6, 4, 2],
    ];
    const steps = generateVisualSolveSteps(fullGrid);
    expect(steps.length).toBeGreaterThanOrEqual(1);
    expect(steps[0].gridSnapshot).toEqual(fullGrid);
  });

  it('renders gracefully without crashing when steps is empty', () => {
    const { container } = render(
      <VisualSolverBar
        steps={[]}
        currentStepIndex={0}
        isPlaying={false}
        speed={1}
        onStepChange={vi.fn()}
        onTogglePlay={vi.fn()}
        onSpeedChange={vi.fn()}
        onExit={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
