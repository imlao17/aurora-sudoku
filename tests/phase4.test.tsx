import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { findNewlyCompletedCells } from '../src/utils/sudoku';
import { soundManager } from '../src/utils/sound';
import { HelpModal } from '../src/components/HelpModal';
import { SettingsModal } from '../src/components/SettingsModal';
import { Cell } from '../src/components/Cell';
import { Board } from '../src/components/Board';
import { DEFAULT_SETTINGS } from '../src/utils/storage';
import type { CellData } from '../src/types/sudoku';

// Helper to build a solved 9x9 test grid
function createSampleSolvedBoard(): CellData[][] {
  const sampleSolution = [
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

  return sampleSolution.map((rowVals, r) =>
    rowVals.map((val, c) => ({
      row: r,
      col: c,
      value: val,
      solution: val,
      isInitial: false,
      notes: [],
    }))
  );
}

describe('Phase 4: Experience Polish & Multi-Theme Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findNewlyCompletedCells (House Completion Wave)', () => {
    it('detects newly completed row when the 9th cell is correctly filled', () => {
      const prevBoard = createSampleSolvedBoard();
      // Leave cell (0, 8) empty in prevBoard
      prevBoard[0][8].value = 0;

      const newBoard = createSampleSolvedBoard(); // (0, 8) filled with 2

      const newlyCompleted = findNewlyCompletedCells(prevBoard, newBoard, 0, 8);
      expect(newlyCompleted.length).toBeGreaterThanOrEqual(9);

      // Verify all cells in row 0 are returned
      for (let c = 0; c < 9; c++) {
        expect(newlyCompleted.some((p) => p.row === 0 && p.col === c)).toBe(true);
      }
    });

    it('does not trigger completed row if filled with an incorrect number', () => {
      const prevBoard = createSampleSolvedBoard();
      prevBoard[0][8].value = 0;

      const newBoard = createSampleSolvedBoard();
      newBoard[0][8].value = 7; // Wrong! solution is 2

      const newlyCompleted = findNewlyCompletedCells(prevBoard, newBoard, 0, 8);
      // Row is NOT complete because cell (0, 8) value !== solution
      const row0Completed = newlyCompleted.filter((p) => p.row === 0);
      expect(row0Completed.length).toBe(0);
    });

    it('detects column completion when the last cell in column is filled', () => {
      const prevBoard = createSampleSolvedBoard();
      // Make cell (8, 4) empty
      prevBoard[8][4].value = 0;

      const newBoard = createSampleSolvedBoard(); // (8, 4) filled with 8

      const newlyCompleted = findNewlyCompletedCells(prevBoard, newBoard, 8, 4);

      // Verify all cells in column 4 are included
      for (let r = 0; r < 9; r++) {
        expect(newlyCompleted.some((p) => p.row === r && p.col === 4)).toBe(true);
      }
    });

    it('detects 3x3 box completion when last cell in box is filled', () => {
      const prevBoard = createSampleSolvedBoard();
      // Cell (1, 1) in top-left box
      prevBoard[1][1].value = 0;

      const newBoard = createSampleSolvedBoard();

      const newlyCompleted = findNewlyCompletedCells(prevBoard, newBoard, 1, 1);

      // Verify all 9 cells in top-left box (rows 0-2, cols 0-2) are included
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          expect(newlyCompleted.some((p) => p.row === r && p.col === c)).toBe(true);
        }
      }
    });
  });

  describe('Sound System Melodic Pitch Ladder', () => {
    it('executes playPlaceNumber for digits 1-9 with varying pitch', () => {
      soundManager.enabled = true;
      for (let num = 1; num <= 9; num++) {
        expect(() => soundManager.playPlaceNumber(num, false)).not.toThrow();
      }
      expect(() => soundManager.playPlaceNumber(9, true)).not.toThrow();
    });

    it('bypasses sound generation when soundEnabled is false', () => {
      soundManager.enabled = false;
      expect(() => {
        soundManager.playSelect();
        soundManager.playPlaceNumber(5);
        soundManager.playNote();
        soundManager.playErase();
        soundManager.playError();
        soundManager.playCompleteSection();
        soundManager.playVictory();
      }).not.toThrow();
      soundManager.enabled = true;
    });
  });

  describe('Theme Customization & SettingsModal', () => {
    it('renders all 3 themes in SettingsModal and updates theme preference', () => {
      const onUpdateSettings = vi.fn();
      const onClose = vi.fn();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onUpdateSettings={onUpdateSettings}
          onClose={onClose}
        />
      );

      expect(screen.getByText('游戏偏好设置')).toBeDefined();
      expect(screen.getByText('极光幻夜')).toBeDefined();
      expect(screen.getByText('极简和纸')).toBeDefined();
      expect(screen.getByText('赛博霓虹')).toBeDefined();

      // Click Zen theme
      fireEvent.click(screen.getByText('极简和纸'));
      expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'zen' });

      // Click Cyberpunk theme
      fireEvent.click(screen.getByText('赛博霓虹'));
      expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'cyberpunk' });
    });
  });

  describe('HelpModal Keyboard Shortcuts', () => {
    it('renders full keyboard guide including Pause and Navigation', () => {
      const onClose = vi.fn();
      render(<HelpModal isOpen={true} onClose={onClose} />);

      expect(screen.getByText('快捷键操作指南')).toBeDefined();
      expect(screen.getByText('移动光标选中格子')).toBeDefined();
      expect(screen.getByText('暂停 / 继续游戏计时')).toBeDefined();
      expect(screen.getByText('P')).toBeDefined();
      expect(screen.getByText('?')).toBeDefined();

      // Close modal
      fireEvent.click(screen.getByText('我已知晓'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cell & Board Micro-Animation States', () => {
    it('applies animate-house-wave class when isHouseCompleted is true', () => {
      const mockCell: CellData = {
        row: 0,
        col: 0,
        value: 5,
        solution: 5,
        isInitial: false,
        notes: [],
      };

      const { container } = render(
        <Cell
          cell={mockCell}
          isSelected={false}
          isRelated={false}
          isSameNumber={false}
          isConflict={false}
          showError={true}
          isHouseCompleted={true}
          onClick={vi.fn()}
        />
      );

      const button = container.querySelector('button');
      expect(button?.className).toContain('animate-house-wave');
    });

    it('passes completedHouseCells down to cells in Board', () => {
      const boardData = createSampleSolvedBoard();
      const conflicts = Array.from({ length: 9 }, () => Array(9).fill(false));

      const { container } = render(
        <Board
          board={boardData}
          selectedCell={null}
          conflicts={conflicts}
          settings={DEFAULT_SETTINGS}
          isPaused={false}
          completedHouseCells={{ '0-0': true, '0-1': true }}
          onSelectCell={vi.fn()}
          onResume={vi.fn()}
        />
      );

      // Buttons for 0-0 and 0-1 should have animate-house-wave
      const buttons = container.querySelectorAll('button');
      expect(buttons[0].className).toContain('animate-house-wave');
      expect(buttons[1].className).toContain('animate-house-wave');
      expect(buttons[2].className).not.toContain('animate-house-wave');
    });
  });
});
