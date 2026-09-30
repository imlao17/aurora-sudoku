import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import React from 'react';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import { Cell } from '../src/components/Cell';
import { Header } from '../src/components/Header';
import { StatusBar } from '../src/components/StatusBar';
import { Controls } from '../src/components/Controls';
import { NumberPad } from '../src/components/NumberPad';
import { SettingsModal } from '../src/components/SettingsModal';
import { StatsModal } from '../src/components/StatsModal';
import { VictoryModal } from '../src/components/VictoryModal';
import { HelpModal } from '../src/components/HelpModal';
import { HintDialog } from '../src/components/HintDialog';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from '../src/utils/storage';

describe('React Components Test Suite', () => {
  describe('<Cell />', () => {
    it('renders primary value and calls onClick when tapped', () => {
      const handleClick = vi.fn();
      const mockCell = {
        row: 1,
        col: 2,
        value: 7,
        solution: 7,
        isInitial: true,
        notes: [],
        isError: false,
      };

      render(
        <Cell
          cell={mockCell}
          isSelected={false}
          isRelated={false}
          isSameNumber={false}
          isConflict={false}
          showError={true}
          onClick={handleClick}
        />
      );

      const button = screen.getByRole('gridcell');
      expect(button).toBeDefined();
      expect(button.textContent).toContain('7');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledWith(1, 2);
    });

    it('renders pencil mark notes when value is 0', () => {
      const mockCell = {
        row: 0,
        col: 0,
        value: 0,
        solution: 5,
        isInitial: false,
        notes: [1, 4, 9],
        isError: false,
      };

      render(
        <Cell
          cell={mockCell}
          isSelected={true}
          isRelated={false}
          isSameNumber={false}
          isConflict={false}
          showError={true}
          onClick={vi.fn()}
        />
      );

      const cellElement = screen.getByRole('gridcell');
      expect(cellElement.textContent).toContain('1');
      expect(cellElement.textContent).toContain('4');
      expect(cellElement.textContent).toContain('9');
    });
  });

  describe('<Header />', () => {
    it('renders brand title and handles difficulty selection', () => {
      const onSelectDiff = vi.fn();
      render(
        <Header
          difficulty="medium"
          gameMode="random"
          dateStr="2026-09-29"
          isDailyCompleted={false}
          soundEnabled={true}
          onSelectDifficulty={onSelectDiff}
          onSelectMode={vi.fn()}
          onNewGame={vi.fn()}
          onOpenStats={vi.fn()}
          onOpenSettings={vi.fn()}
          onOpenHelp={vi.fn()}
          onToggleSound={vi.fn()}
        />
      );

      expect(screen.getByText('知数')).toBeDefined();
      const hardBtn = screen.getByText('困难');
      fireEvent.click(hardBtn);
      expect(onSelectDiff).toHaveBeenCalledWith('hard');
    });
  });

  describe('<StatusBar />', () => {
    it('displays elapsed time, mistakes and triggers pause toggle', () => {
      const onTogglePause = vi.fn();
      render(
        <StatusBar
          difficulty="medium"
          gameMode="random"
          elapsedTime={135} // 02:15
          isPaused={false}
          mistakesCount={2}
          hintsRemaining={2}
          onTogglePause={onTogglePause}
        />
      );

      expect(screen.getByText('02:15')).toBeDefined();
      expect(screen.getByText('2')).toBeDefined();

      const timerSpan = screen.getByRole('timer');
      expect(timerSpan.textContent).toBe('02:15');

      const pauseBtn = screen.getByTitle('暂停计时');
      fireEvent.click(pauseBtn);
      expect(onTogglePause).toHaveBeenCalledTimes(1);
    });
  });

  describe('<Controls />', () => {
    it('handles undo, redo, erase, note mode, and hint clicks', () => {
      const onUndo = vi.fn();
      const onRedo = vi.fn();
      const onErase = vi.fn();
      const onToggleNote = vi.fn();
      const onHint = vi.fn();

      render(
        <Controls
          isNoteMode={false}
          canUndo={true}
          canRedo={true}
          hintsRemaining={3}
          onToggleNoteMode={onToggleNote}
          onUndo={onUndo}
          onRedo={onRedo}
          onErase={onErase}
          onHint={onHint}
        />
      );

      fireEvent.click(screen.getByText('撤销'));
      expect(onUndo).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('重做'));
      expect(onRedo).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('擦除'));
      expect(onErase).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('笔记'));
      expect(onToggleNote).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText('提示'));
      expect(onHint).toHaveBeenCalledTimes(1);
    });
  });

  describe('<NumberPad />', () => {
    it('renders all 9 digits and handles clicks', () => {
      const onNumberClick = vi.fn();
      const counts = { 1: 9, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

      render(
        <NumberPad
          numberCounts={counts}
          selectedNumber={2}
          isNoteMode={false}
          onNumberClick={onNumberClick}
        />
      );

      const btn5 = screen.getByText('5');
      fireEvent.click(btn5);
      expect(onNumberClick).toHaveBeenCalledWith(5);
    });
  });

  describe('<SettingsModal />', () => {
    it('renders toggles and triggers update on toggle switch click', () => {
      const onUpdate = vi.fn();
      const onClose = vi.fn();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onUpdateSettings={onUpdate}
          onClose={onClose}
        />
      );

      expect(screen.getByText('游戏偏好设置')).toBeDefined();

      // Test theme buttons
      const zenThemeBtn = screen.getByText('极简和纸');
      fireEvent.click(zenThemeBtn);
      expect(onUpdate).toHaveBeenCalledWith({ theme: 'zen' });

      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThan(0);
      fireEvent.click(switches[0]);
      expect(onUpdate).toHaveBeenCalledTimes(2);

      // Keyboard tests
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      fireEvent.click(screen.getByText('完成'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('<StatsModal />', () => {
    it('renders stats dialog, changes difficulty tabs, achievements tab, and keyboard navigation', () => {
      const onClose = vi.fn();
      render(
        <StatsModal
          isOpen={true}
          stats={DEFAULT_STATS}
          initialTab="stats"
          onClose={onClose}
        />
      );

      expect(screen.getByText('数据与荣誉墙')).toBeDefined();
      const hardTab = screen.getByText('困难');
      fireEvent.click(hardTab);
      expect(screen.getByText('通关局数')).toBeDefined();

      // Switch to achievements tab
      const achTab = screen.getByText(/成就徽章/);
      fireEvent.click(achTab);
      expect(screen.getByText('初出茅庐')).toBeDefined();

      // Keyboard navigation
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      fireEvent.click(screen.getByText('关闭'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('<VictoryModal />', () => {
    it('renders victory screen with statistics and play again button', async () => {
      const onPlayAgain = vi.fn();
      const onClose = vi.fn();

      render(
        <VictoryModal
          isOpen={true}
          timeTaken={185}
          difficulty="hard"
          gameMode="daily"
          dateStr="2026-09-29"
          mistakesCount={1}
          hintsUsed={0}
          isNewBest={true}
          onPlayAgain={onPlayAgain}
          onClose={onClose}
        />
      );

      expect(screen.getByText('恭喜通关！')).toBeDefined();
      expect(screen.getByText('03:05')).toBeDefined();

      // Test share button
      const shareBtn = screen.getByText('分享战绩');
      expect(shareBtn).toBeDefined();
      await act(async () => {
        fireEvent.click(shareBtn);
      });

      // Test keyboard shortcuts
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      // Enter is intentionally not a global shortcut: it used to trigger
      // "play again" even while focus was on Close or Share, so activation is
      // left to the focused button instead.
      onPlayAgain.mockClear();
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(onPlayAgain).not.toHaveBeenCalled();

      const playAgainBtn = screen.getByText('再来一局');
      fireEvent.click(playAgainBtn);
      expect(onPlayAgain).toHaveBeenCalled();
    });
  });

  describe('<HelpModal />', () => {
    it('renders keyboard shortcuts guide and handles close and keyboard trap', () => {
      const onClose = vi.fn();
      render(<HelpModal isOpen={true} onClose={onClose} />);
      expect(screen.getByText('快捷键操作指南')).toBeDefined();

      // Test Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();

      // Test Tab navigation
      fireEvent.keyDown(window, { key: 'Tab' });
      fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

      fireEvent.click(screen.getByText('我已知晓'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('<HintDialog />', () => {
    it('renders hint deduction and handles apply/close', () => {
      const onApply = vi.fn();
      const onClose = vi.fn();
      const mockHint = {
        type: 'naked-single' as const,
        row: 2,
        col: 3,
        suggestedValue: 6,
        title: '唯一余数 (Naked Single)',
        explanation: '该格仅剩唯一候选数 6',
      };

      render(
        <HintDialog
          hint={mockHint}
          onApply={onApply}
          onClose={onClose}
        />
      );

      expect(screen.getByText('唯一余数 (Naked Single)')).toBeDefined();
      expect(screen.getByText('该格仅剩唯一候选数 6')).toBeDefined();

      fireEvent.click(screen.getByText(/填入数字/));
      expect(onApply).toHaveBeenCalledTimes(1);
    });
  });
});
