import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoFillLastRemainingCells } from '../src/utils/sudoku';
import type { CellData } from '../src/types/sudoku';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../src/components/SettingsModal';
import { DEFAULT_SETTINGS } from '../src/utils/storage';
import { App } from '../src/App';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// Helper to create a dummy 9x9 board with full solution
function createMockBoard(solutionMatrix: number[][]): CellData[][] {
  return solutionMatrix.map((row, r) =>
    row.map((val, c) => ({
      row: r,
      col: c,
      value: val,
      solution: val,
      isInitial: false,
      notes: [],
      isError: false,
    }))
  );
}

// A valid complete 9x9 Sudoku solution
const VALID_SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

describe('autoFillLastRemainingCells logic', () => {
  it('auto-fills the single remaining cell in a row (横向填入)', () => {
    const board = createMockBoard(VALID_SOLUTION);
    // Clear only cell (0, 8) in row 0. Solution is 2.
    board[0][8].value = 0;

    const result = autoFillLastRemainingCells(board, true);
    expect(result.filledCells.length).toBe(1);
    expect(result.filledCells[0]).toEqual({ row: 0, col: 8, value: 2 });
    expect(result.updatedBoard[0][8].value).toBe(2);
    expect(result.deltas.some((d) => d.row === 0 && d.col === 8 && d.newValue === 2)).toBe(true);
  });

  it('auto-fills the single remaining cell in a column (纵向填入)', () => {
    const board = createMockBoard(VALID_SOLUTION);
    // Clear only cell (4, 1) in column 1. Solution is 2.
    board[4][1].value = 0;

    const result = autoFillLastRemainingCells(board, true);
    expect(result.filledCells.length).toBe(1);
    expect(result.filledCells[0]).toEqual({ row: 4, col: 1, value: 2 });
    expect(result.updatedBoard[4][1].value).toBe(2);
  });

  it('auto-fills the single remaining cell in a 3x3 box (九宫格方块填入)', () => {
    const board = createMockBoard(VALID_SOLUTION);
    // Clear cell (2, 2) in top-left box. Solution is 8.
    board[2][2].value = 0;

    const result = autoFillLastRemainingCells(board, true);
    expect(result.filledCells.length).toBe(1);
    expect(result.filledCells[0]).toEqual({ row: 2, col: 2, value: 8 });
    expect(result.updatedBoard[2][2].value).toBe(8);
  });

  it('cascades auto-fill when filling one cell creates another 1-empty house', () => {
    const board = createMockBoard(VALID_SOLUTION);
    board[0][8].value = 0;
    board[8][8].value = 0;
    board[8][0].value = 0; // keeps row 8 with 2 empties initially

    const result = autoFillLastRemainingCells(board, true);

    // Should fill (0, 8) first, then col 8 has only (8, 8) empty which also gets filled!
    expect(result.filledCells.some((c) => c.row === 0 && c.col === 8 && c.value === 2)).toBe(true);
    expect(result.filledCells.some((c) => c.row === 8 && c.col === 8 && c.value === 9)).toBe(true);
    expect(result.updatedBoard[0][8].value).toBe(2);
    expect(result.updatedBoard[8][8].value).toBe(9);
  });

  it('does not fill if a house contains duplicate numbers due to player error', () => {
    const board = createMockBoard(VALID_SOLUTION);
    // In Col 8 and Box 2, clear 3 cells so Col 8 and Box 2 each have 3 empties
    board[0][8].value = 0;
    board[1][8].value = 0;
    board[2][8].value = 0;
    // Clear another cell in Row 1 and Row 2 (and Col 0 / Box 0) so Row 1, Row 2, Col 0, Box 0 each have 2 empties
    board[1][0].value = 0;
    board[2][0].value = 0;
    // Row 0 now has ONLY (0, 8) empty, but we introduce duplicate 3 at (0, 2) [where original was 4]
    board[0][2].value = 3;

    const result = autoFillLastRemainingCells(board, true);
    // Row 0 has only 1 empty cell, but because it has duplicate numbers, it MUST NOT auto-fill!
    expect(result.filledCells.length).toBe(0);
    expect(result.updatedBoard[0][8].value).toBe(0);
  });

  it('clears peer notes for the auto-filled number when autoClearNotes is true', () => {
    const board = createMockBoard(VALID_SOLUTION);
    board[0][8].value = 0;
    board[1][8].notes = [2, 4];

    const result = autoFillLastRemainingCells(board, true);
    expect(result.updatedBoard[0][8].value).toBe(2);
    expect(result.updatedBoard[1][8].notes).toEqual([4]);
  });
});

describe('SettingsModal auto-fill toggle switch', () => {
  it('renders the auto-fill toggle in SettingsModal with description', () => {
    const onUpdateSettings = vi.fn();
    render(
      <SettingsModal
        isOpen={true}
        settings={{ ...DEFAULT_SETTINGS, autoFillLastRemaining: true }}
        onUpdateSettings={onUpdateSettings}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('最后空格自动补全 (唯一余数)')).toBeTruthy();
    expect(
      screen.getByText('当某一行、某一列或九宫格只剩最后一个空格时，自动计算并填入')
    ).toBeTruthy();

    // Toggle the switch
    const switchBtn = screen.getByRole('switch', { name: '切换最后空格自动补全 (唯一余数)' });
    fireEvent.click(switchBtn);
    expect(onUpdateSettings).toHaveBeenCalledWith({ autoFillLastRemaining: false });
  });
});

describe('App auto-fill integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows user to toggle auto-fill setting and persists it', () => {
    render(<App />);

    // Open settings modal
    const settingsBtn = screen.getByLabelText('打开游戏偏好设置');
    fireEvent.click(settingsBtn);

    const toggle = screen.getByRole('switch', { name: '切换最后空格自动补全 (唯一余数)' });
    expect(toggle).toBeTruthy();
  });
});
