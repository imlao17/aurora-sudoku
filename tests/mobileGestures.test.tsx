import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from '../src/components/Board';
import { DEFAULT_SETTINGS } from '../src/utils/storage';
import type { CellData } from '../src/types/sudoku';
import { UserAuthModal } from '../src/components/UserAuthModal';
import { UserProfileModal } from '../src/components/UserProfileModal';
import { createGuestProfile } from '../src/utils/auth';
import { getDefaultStats } from '../src/utils/storage';

function createEmptyBoard(): CellData[][] {
  return Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => ({
      row: r,
      col: c,
      value: 0,
      solution: 1,
      isInitial: false,
      notes: [],
      isError: false,
    }))
  );
}

describe('Mobile Gestures on Board', () => {
  it('detects horizontal and vertical touch swipes to navigate selected cell', () => {
    const onSelectCell = vi.fn();
    const board = createEmptyBoard();

    render(
      <Board
        board={board}
        selectedCell={{ row: 4, col: 4 }}
        conflicts={Array.from({ length: 9 }, () => Array(9).fill(false))}
        settings={DEFAULT_SETTINGS}
        isPaused={false}
        onSelectCell={onSelectCell}
        onResume={vi.fn()}
      />
    );

    const grid = screen.getByRole('grid', { name: '数独棋盘 9乘9' });

    // Swipe Right: dx = +50px
    fireEvent.touchStart(grid, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 150, clientY: 100 }],
    });
    expect(onSelectCell).toHaveBeenCalledWith(4, 5);

    // Swipe Left: dx = -50px
    fireEvent.touchStart(grid, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 50, clientY: 100 }],
    });
    expect(onSelectCell).toHaveBeenCalledWith(4, 3);

    // Swipe Down: dy = +50px
    fireEvent.touchStart(grid, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 100, clientY: 150 }],
    });
    expect(onSelectCell).toHaveBeenCalledWith(5, 4);

    // Swipe Up: dy = -50px
    fireEvent.touchStart(grid, {
      touches: [{ clientX: 100, clientY: 100 }],
    });
    fireEvent.touchEnd(grid, {
      changedTouches: [{ clientX: 100, clientY: 50 }],
    });
    expect(onSelectCell).toHaveBeenCalledWith(3, 4);
  });
});

describe('UserAuthModal and UserProfileModal components', () => {
  it('renders UserAuthModal with tabs and inputs', () => {
    const onSuccess = vi.fn();
    render(
      <UserAuthModal
        isOpen={true}
        initialMode="register"
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('注册个人账号')).toBeTruthy();
    expect(screen.getByText('选择专属印章头像')).toBeTruthy();
    expect(screen.getByPlaceholderText('如：数独游侠')).toBeTruthy();
  });

  it('renders UserProfileModal with user profile and cloud backup tools', () => {
    const user = createGuestProfile();
    const stats = getDefaultStats();

    render(
      <UserProfileModal
        isOpen={true}
        user={user}
        stats={stats}
        masteredTechsCount={3}
        onClose={vi.fn()}
        onLogout={vi.fn()}
        onOpenAuth={vi.fn()}
      />
    );

    expect(screen.getByText('个人账号与数据中心')).toBeTruthy();
    expect(screen.getByText('数独小友')).toBeTruthy();
    expect(screen.getByText('立即云端同步')).toBeTruthy();
    expect(screen.getByText('导出数据备份')).toBeTruthy();
  });
});
