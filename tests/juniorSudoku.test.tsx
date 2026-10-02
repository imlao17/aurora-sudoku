import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import App from '../src/App';
import { HomeScreen } from '../src/components/HomeScreen';
import { Board } from '../src/components/Board';
import { NumberPad } from '../src/components/NumberPad';
import type { CellData, GameSettings } from '../src/types/sudoku';
import { DEFAULT_SETTINGS } from '../src/utils/storage';

describe('Junior Sudoku & Multi-Size Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Junior Enlightenment tab and switches symbol skins in HomeScreen', async () => {
    const handleStart = vi.fn();
    render(
      <HomeScreen
        onStartGame={handleStart}
        hasActiveGame={false}
        dailyStreak={0}
        isDailyCompletedToday={false}
        todayDateStr="2026-10-01"
        masteredTechniquesCount={0}
        totalTechniquesCount={23}
        soundEnabled={true}
        theme="nordic"
        onToggleSound={() => {}}
        onCycleTheme={() => {}}
        onOpenSettings={() => {}}
        onOpenStats={() => {}}
        onOpenTechniques={() => {}}
        onOpenHelp={() => {}}
      />
    );

    // Click Junior tab
    const juniorTab = screen.getByText('🌱 小知数·启蒙');
    fireEvent.click(juniorTab);

    // Verify 4x4 and 6x6 cards are visible
    expect(screen.getByText('4×4 幼儿启蒙')).toBeDefined();
    expect(screen.getByText('6×6 亲子进阶')).toBeDefined();

    // Verify skin selection buttons
    const animalsBtn = screen.getByRole('button', { name: /可爱萌宠/ });
    expect(animalsBtn).toBeDefined();
    fireEvent.click(animalsBtn);

    // Start 4x4 entry level
    const start4x4Btn = screen.getByRole('button', { name: '开始 4×4 入门对局' });
    fireEvent.click(start4x4Btn);

    expect(handleStart).toHaveBeenCalledWith('easy', 'random', true, 4, 'animals');
  });

  it('renders 4x4 board with animal symbols and 4-button numberpad', () => {
    const createCell = (r: number, c: number, val: number, sol: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: sol,
      isInitial: val !== 0,
      notes: [],
    });

    const board4: CellData[][] = [
      [createCell(0, 0, 1, 1), createCell(0, 1, 2, 2), createCell(0, 2, 0, 3), createCell(0, 3, 0, 4)],
      [createCell(1, 0, 0, 3), createCell(1, 1, 0, 4), createCell(1, 2, 1, 1), createCell(1, 3, 2, 2)],
      [createCell(2, 0, 0, 2), createCell(2, 1, 1, 1), createCell(2, 2, 0, 4), createCell(2, 3, 0, 3)],
      [createCell(3, 0, 0, 4), createCell(3, 1, 0, 3), createCell(3, 2, 2, 2), createCell(3, 3, 1, 1)],
    ];

    const settings: GameSettings = { ...DEFAULT_SETTINGS, symbolTheme: 'animals' };

    render(
      <div>
        <Board
          board={board4}
          boardSize={4}
          symbolTheme="animals"
          selectedCell={{ row: 0, col: 0 }}
          conflicts={Array.from({ length: 4 }, () => Array(4).fill(false))}
          settings={settings}
          isPaused={false}
          onSelectCell={() => {}}
        />
        <NumberPad
          boardSize={4}
          symbolTheme="animals"
          numberCounts={{ 1: 4, 2: 3, 3: 0, 4: 1 }}
          selectedNumber={1}
          isNoteMode={false}
          onNumberClick={() => {}}
        />
      </div>
    );

    // Verify Board grid has 16 cells (4x4)
    const gridcells = screen.getAllByRole('gridcell');
    expect(gridcells.length).toBe(16);

    // Verify animal emoji displayed on board (cell 0,0 has value 1 which is 🐱)
    expect(screen.getAllByText('🐱').length).toBeGreaterThan(0);

    // Verify NumberPad has only 4 buttons (for digits 1-4)
    const catBtn = screen.getByRole('button', { name: /填入 🐱/ });
    const dogBtn = screen.getByRole('button', { name: /填入 🐶/ });
    const rabbitBtn = screen.getByRole('button', { name: /填入 🐰/ });
    const pandaBtn = screen.getByRole('button', { name: /填入 🐼/ });

    expect(catBtn).toBeDefined();
    expect(dogBtn).toBeDefined();
    expect(rabbitBtn).toBeDefined();
    expect(pandaBtn).toBeDefined();
    expect(screen.queryByRole('button', { name: /填入 🦊/ })).toBeNull();
  });

  it('plays a full junior 4x4 game from App home and triggers friendly hints', async () => {
    await act(async () => {
      render(<App />);
    });

    // 1. Switch to Junior Tab
    const juniorTab = screen.getByText('🌱 小知数·启蒙');
    await act(async () => {
      fireEvent.click(juniorTab);
    });

    // 2. Click Fruit Theme
    const fruitBtn = screen.getByRole('button', { name: /清爽蔬果/ });
    await act(async () => {
      fireEvent.click(fruitBtn);
    });

    // 3. Start 4x4 Entry game
    const start4x4Btn = screen.getByRole('button', { name: '开始 4×4 入门对局' });
    await act(async () => {
      fireEvent.click(start4x4Btn);
    });

    // 4. Verify in game view with 4x4 board
    expect(screen.getByRole('grid')).toBeDefined();
    const cells = screen.getAllByRole('gridcell');
    expect(cells.length).toBe(16);

    // 5. Click Hint button
    const hintBtn = screen.getByRole('button', { name: /提示功能/ });
    await act(async () => {
      fireEvent.click(hintBtn);
    });

    // 6. Verify friendly pedagogical hint dialog opened
    expect(screen.getAllByText('启发点拨 (小知数)').length).toBeGreaterThan(0);

    // 7. Apply hint
    const applyBtn = screen.getByRole('button', { name: /直接填入/ });
    await act(async () => {
      fireEvent.click(applyBtn);
    });

    // Dialog closes
    expect(screen.queryByText('启发点拨 (小知数)')).toBeNull();
  });

  it('renders 6x6 board with Pinyin symbols and Pinyin numberpad', () => {
    const createCell = (r: number, c: number, val: number, sol: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: sol,
      isInitial: val !== 0,
      notes: [],
    });

    const board6: CellData[][] = Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 6 }, (_, c) => createCell(r, c, (r + c) % 6 + 1, (r + c) % 6 + 1))
    );

    const settings: GameSettings = { ...DEFAULT_SETTINGS, symbolTheme: 'pinyin' };

    render(
      <div>
        <Board
          board={board6}
          boardSize={6}
          symbolTheme="pinyin"
          selectedCell={{ row: 0, col: 0 }}
          conflicts={Array.from({ length: 6 }, () => Array(6).fill(false))}
          settings={settings}
          isPaused={false}
          onSelectCell={() => {}}
        />
        <NumberPad
          boardSize={6}
          symbolTheme="pinyin"
          numberCounts={{ 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6 }}
          selectedNumber={1}
          isNoteMode={false}
          onNumberClick={() => {}}
        />
      </div>
    );

    // Verify 36 cells (6x6)
    const gridcells = screen.getAllByRole('gridcell');
    expect(gridcells.length).toBe(36);

    // Verify single finals (a, o, e, i, u, ü) are present on the board
    expect(screen.getAllByText('a').length).toBeGreaterThan(0);
    expect(screen.getAllByText('o').length).toBeGreaterThan(0);
    expect(screen.getAllByText('e').length).toBeGreaterThan(0);
    expect(screen.getAllByText('i').length).toBeGreaterThan(0);
    expect(screen.getAllByText('u').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ü').length).toBeGreaterThan(0);

    // Verify NumberPad has buttons with pinyin aria-labels
    expect(screen.getByRole('button', { name: /填入拼音 a/ })).toBeDefined();
    expect(screen.getByRole('button', { name: /填入拼音 ü/ })).toBeDefined();
  });

  it('renders ruby pinyin above Hanzi and respects showPinyinRuby toggle', () => {
    const createCell = (r: number, c: number, val: number, sol: number): CellData => ({
      row: r,
      col: c,
      value: val,
      solution: sol,
      isInitial: val !== 0,
      notes: [],
    });

    const board4: CellData[][] = [
      [createCell(0, 0, 1, 1), createCell(0, 1, 2, 2), createCell(0, 2, 3, 3), createCell(0, 3, 4, 4)],
      [createCell(1, 0, 3, 3), createCell(1, 1, 4, 4), createCell(1, 2, 1, 1), createCell(1, 3, 2, 2)],
      [createCell(2, 0, 2, 2), createCell(2, 1, 1, 1), createCell(2, 2, 4, 4), createCell(2, 3, 3, 3)],
      [createCell(3, 0, 4, 4), createCell(3, 1, 3, 3), createCell(3, 2, 2, 2), createCell(3, 3, 1, 1)],
    ];

    // 1. With showPinyinRuby: true
    const { unmount } = render(
      <div>
        <Board
          board={board4}
          boardSize={4}
          symbolTheme="hanzi"
          selectedCell={{ row: 0, col: 0 }}
          conflicts={Array.from({ length: 4 }, () => Array(4).fill(false))}
          settings={{ ...DEFAULT_SETTINGS, symbolTheme: 'hanzi', showPinyinRuby: true }}
          isPaused={false}
          onSelectCell={() => {}}
        />
        <NumberPad
          boardSize={4}
          symbolTheme="hanzi"
          showPinyinRuby={true}
          numberCounts={{ 1: 4, 2: 4, 3: 4, 4: 4 }}
          selectedNumber={1}
          isNoteMode={false}
          onNumberClick={() => {}}
        />
      </div>
    );

    // Verify ruby annotations (chūn for 春, xià for 夏, qiū for 秋, dōng for 冬)
    expect(screen.getAllByText('chūn').length).toBeGreaterThan(0);
    expect(screen.getAllByText('xià').length).toBeGreaterThan(0);
    expect(screen.getAllByText('qiū').length).toBeGreaterThan(0);
    expect(screen.getAllByText('dōng').length).toBeGreaterThan(0);
    unmount();

    // 2. With showPinyinRuby: false
    render(
      <div>
        <Board
          board={board4}
          boardSize={4}
          symbolTheme="hanzi"
          selectedCell={{ row: 0, col: 0 }}
          conflicts={Array.from({ length: 4 }, () => Array(4).fill(false))}
          settings={{ ...DEFAULT_SETTINGS, symbolTheme: 'hanzi', showPinyinRuby: false }}
          isPaused={false}
          onSelectCell={() => {}}
        />
        <NumberPad
          boardSize={4}
          symbolTheme="hanzi"
          showPinyinRuby={false}
          numberCounts={{ 1: 4, 2: 4, 3: 4, 4: 4 }}
          selectedNumber={1}
          isNoteMode={false}
          onNumberClick={() => {}}
        />
      </div>
    );

    // Ruby annotations should not exist
    expect(screen.queryByText('chūn')).toBeNull();
    expect(screen.queryByText('xià')).toBeNull();
  });
});
