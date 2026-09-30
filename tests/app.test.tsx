import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import React from 'react';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import App from '../src/App';

describe('<App /> Integration Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders HomeScreen by default and starts a game when selecting difficulty', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('知数')).toBeDefined();
    expect(screen.getByText('经典自由对局')).toBeDefined();
    expect(screen.getByText('每日一题挑战')).toBeDefined();
    expect(screen.getByText('解题技巧百科')).toBeDefined();
    expect(screen.queryByText('检测到进行中对局')).toBeNull();

    // Click medium difficulty to start game
    const medBtn = screen.getByText('中等');
    await act(async () => {
      fireEvent.click(medBtn);
    });
    expect(screen.getByRole('grid')).toBeDefined();
  });

  it('supports navigating back to Home and resuming active game', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    expect(screen.getByRole('grid')).toBeDefined();

    // Click '首页' in Header to return to Home
    const homeBtn = screen.getByRole('button', { name: '返回首页大厅' });
    await act(async () => {
      fireEvent.click(homeBtn);
    });

    expect(screen.getByText('检测到进行中对局')).toBeDefined();
    expect(screen.getByText('继续对局')).toBeDefined();

    // Click '继续对局' to resume
    const resumeBtn = screen.getByText('继续对局');
    await act(async () => {
      fireEvent.click(resumeBtn);
    });

    expect(screen.getByRole('grid')).toBeDefined();
  });

  it('allows clicking a cell and entering a number via NumberPad', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(81);

    const emptyCell = cells.find((c) => !c.textContent?.trim());
    if (emptyCell) {
      await act(async () => {
        fireEvent.click(emptyCell);
      });

      const btn5 = screen.getByRole('button', { name: /填入数字 5/ });
      await act(async () => {
        fireEvent.click(btn5);
      });

      expect(emptyCell.textContent).toBeTruthy();
    }
  });

  it('supports toggling pencil notes mode and adding candidates', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    const noteToggle = screen.getByText('笔记');
    await act(async () => {
      fireEvent.click(noteToggle);
    });

    const cells = screen.getAllByRole('gridcell');
    const emptyCell = cells.find((c) => !c.textContent?.trim());
    if (emptyCell) {
      await act(async () => {
        fireEvent.click(emptyCell);
      });

      const btn3 = screen.getByRole('button', { name: /填入数字 3/ });
      await act(async () => {
        fireEvent.click(btn3);
      });

      expect(emptyCell.textContent).toContain('3');
    }
  });

  it('supports Undo, Redo, Erase, and Hint actions', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    const cells = screen.getAllByRole('gridcell');
    const emptyCell = cells.find((c) => !c.textContent?.trim());
    if (emptyCell) {
      await act(async () => {
        fireEvent.click(emptyCell);
      });

      // Fill a number
      const btn7 = screen.getByRole('button', { name: /填入数字 7/ });
      await act(async () => {
        fireEvent.click(btn7);
      });
      expect(emptyCell.textContent).toContain('7');

      // Undo
      const undoBtn = screen.getByText('撤销');
      await act(async () => {
        fireEvent.click(undoBtn);
      });
      expect(emptyCell.textContent?.trim()).toBe('');

      // Redo
      const redoBtn = screen.getByText('重做');
      await act(async () => {
        fireEvent.click(redoBtn);
      });
      expect(emptyCell.textContent).toContain('7');

      // Erase
      const eraseBtn = screen.getByText('擦除');
      await act(async () => {
        fireEvent.click(eraseBtn);
      });
      expect(emptyCell.textContent?.trim()).toBe('');

      // Hint
      const hintBtn = screen.getByText('提示');
      await act(async () => {
        fireEvent.click(hintBtn);
      });
      const applyBtn = screen.getByText(/填入数字/);
      expect(applyBtn).toBeDefined();

      await act(async () => {
        fireEvent.click(applyBtn);
      });
      // Dialog should close after applying hint
      expect(screen.queryByText(/填入数字/)).toBeNull();
    }
  });

  it('handles keyboard navigation and inputs', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
    });

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '9' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'n' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'y', ctrlKey: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    });
  });

  it('handles pause and resume overlay', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    const pauseBtn = screen.getByRole('timer');
    await act(async () => {
      fireEvent.click(pauseBtn);
    });

    expect(screen.getByText('游戏已暂停')).toBeDefined();

    const resumeBtn = screen.getByText('继续游戏');
    await act(async () => {
      fireEvent.click(resumeBtn);
    });

    expect(screen.queryByText('游戏已暂停')).toBeNull();
  });

  it('opens StatsModal and SettingsModal, and switches difficulty', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    // Open Stats
    const statsBtn = screen.getByLabelText('查看战绩与排行榜');
    await act(async () => {
      fireEvent.click(statsBtn);
    });
    expect(screen.getByText('数据与荣誉墙')).toBeDefined();
    await act(async () => {
      fireEvent.click(screen.getByText('关闭'));
    });

    // Open Settings
    const settingsBtn = screen.getByLabelText('打开游戏偏好设置');
    await act(async () => {
      fireEvent.click(settingsBtn);
    });
    expect(screen.getByText('游戏偏好设置')).toBeDefined();
    await act(async () => {
      fireEvent.click(screen.getByText('完成'));
    });

    // Switch Difficulty
    const easyBtn = screen.getByText('简单');
    await act(async () => {
      fireEvent.click(easyBtn);
    });

    // Switch Game Mode
    const dailyBtn = screen.getByText('每日一题');
    await act(async () => {
      fireEvent.click(dailyBtn);
    });
    expect(screen.getByText(/今日挑战题目/)).toBeDefined();

    const freeBtn = screen.getByText('自由对局');
    await act(async () => {
      fireEvent.click(freeBtn);
    });
  });

  it('enters, interacts with, and exits the Visual Solver tutorial mode', async () => {
    await act(async () => {
      render(<App initialScreen="game" />);
    });

    const visualBtn = screen.getByLabelText('进入逐步演算教学模式');
    await act(async () => {
      fireEvent.click(visualBtn);
    });

    expect(screen.getByText('逐步演算教学模式')).toBeDefined();

    // Keyboard ArrowRight navigates step
    await act(async () => {
      fireEvent.keyDown(window, { key: 'ArrowRight' });
    });

    // Keyboard Escape exits tutorial
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    expect(screen.queryByText('逐步演算教学模式')).toBeNull();
  });
});
