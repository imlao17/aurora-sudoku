import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import { TECHNIQUES_DATA } from '../src/constants/techniques';
import { TechniquesModal } from '../src/components/TechniquesModal';
import { HintDialog } from '../src/components/HintDialog';
import { VisualSolverBar } from '../src/components/VisualSolverBar';
import { Header } from '../src/components/Header';
import { App } from '../src/App';
import type { VisualSolveStep } from '../src/utils/visualSolver';
import type { SmartHint } from '../src/utils/hint';

describe('Sudoku Solving Techniques Encyclopedia - Data & Logic', () => {
  it('contains all 11 classic and advanced human deduction techniques', () => {
    expect(TECHNIQUES_DATA.length).toBe(11);
    
    const categories = new Set(TECHNIQUES_DATA.map((t) => t.category));
    expect(categories.has('basic')).toBe(true);
    expect(categories.has('intermediate')).toBe(true);
    expect(categories.has('advanced')).toBe(true);

    TECHNIQUES_DATA.forEach((tech) => {
      expect(tech.id).toBeTruthy();
      expect(tech.name).toBeTruthy();
      expect(tech.tagline).toBeTruthy();
      expect(tech.summary).toBeTruthy();
      expect(tech.howToSpot.length).toBeGreaterThanOrEqual(2);
      expect(tech.deepDive).toBeTruthy();
      expect(tech.example.clues.length).toBe(9);
      expect(tech.example.clues[0].length).toBe(9);
      expect(tech.example.explanation).toBeTruthy();
    });
  });

  it('covers basic, intermediate, and advanced technique categories correctly', () => {
    const basic = TECHNIQUES_DATA.filter((t) => t.category === 'basic');
    const intermediate = TECHNIQUES_DATA.filter((t) => t.category === 'intermediate');
    const advanced = TECHNIQUES_DATA.filter((t) => t.category === 'advanced');

    expect(basic.length).toBe(3); // 宫摒除, 行列摒除, 唯一余数
    expect(intermediate.length).toBe(5); // 宫内区块, 行列区块, 显性数对, 隐性数对, 显性三数组
    expect(advanced.length).toBe(3); // X-Wing, XY-Wing, 剑鱼矩阵
  });

  it('all 11 technique clue boards are mathematically valid with no duplicate numbers in any row, column, or box', () => {
    TECHNIQUES_DATA.forEach((tech) => {
      const { clues } = tech.example;
      // 1. Check rows
      for (let r = 0; r < 9; r++) {
        const seen = new Set<number>();
        for (let c = 0; c < 9; c++) {
          const val = clues[r][c];
          if (val !== 0) {
            expect(val).toBeGreaterThanOrEqual(1);
            expect(val).toBeLessThanOrEqual(9);
            expect(seen.has(val)).toBe(false);
            seen.add(val);
          }
        }
      }

      // 2. Check cols
      for (let c = 0; c < 9; c++) {
        const seen = new Set<number>();
        for (let r = 0; r < 9; r++) {
          const val = clues[r][c];
          if (val !== 0) {
            expect(seen.has(val)).toBe(false);
            seen.add(val);
          }
        }
      }

      // 3. Check 3x3 boxes
      for (let b = 0; b < 9; b++) {
        const startR = Math.floor(b / 3) * 3;
        const startC = (b % 3) * 3;
        const seen = new Set<number>();
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const val = clues[startR + r][startC + c];
            if (val !== 0) {
              expect(seen.has(val)).toBe(false);
              seen.add(val);
            }
          }
        }
      }
    });
  });

  it('all 11 techniques have complete 3-step breakdown and valid coordinates', () => {
    TECHNIQUES_DATA.forEach((tech) => {
      const { stepBreakdown, targetCells, causeCells, eliminatedCandidates, cellNotes } = tech.example;
      expect(stepBreakdown).toBeTruthy();
      expect(stepBreakdown.observe.length).toBeGreaterThan(5);
      expect(stepBreakdown.deduce.length).toBeGreaterThan(5);
      expect(stepBreakdown.conclude.length).toBeGreaterThan(5);

      targetCells.forEach((tc) => {
        expect(tc.row).toBeGreaterThanOrEqual(0);
        expect(tc.row).toBeLessThan(9);
        expect(tc.col).toBeGreaterThanOrEqual(0);
        expect(tc.col).toBeLessThan(9);
      });

      causeCells.forEach((cc) => {
        expect(cc.row).toBeGreaterThanOrEqual(0);
        expect(cc.row).toBeLessThan(9);
        expect(cc.col).toBeGreaterThanOrEqual(0);
        expect(cc.col).toBeLessThan(9);
      });

      if (eliminatedCandidates) {
        eliminatedCandidates.forEach((ec) => {
          expect(ec.row).toBeGreaterThanOrEqual(0);
          expect(ec.row).toBeLessThan(9);
          expect(ec.col).toBeGreaterThanOrEqual(0);
          expect(ec.col).toBeLessThan(9);
          expect(ec.candidate).toBeGreaterThanOrEqual(1);
          expect(ec.candidate).toBeLessThanOrEqual(9);
        });
      }

      if (cellNotes) {
        cellNotes.forEach((cn) => {
          expect(cn.row).toBeGreaterThanOrEqual(0);
          expect(cn.row).toBeLessThan(9);
          expect(cn.col).toBeGreaterThanOrEqual(0);
          expect(cn.col).toBeLessThan(9);
          expect(cn.candidates.length).toBeGreaterThanOrEqual(2);
        });
      }
    });
  });
});

describe('TechniquesModal Component', () => {
  it('renders modal with technique list, tagline, and details when open', () => {
    const onClose = vi.fn();
    render(<TechniquesModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('数独解题方法百科')).toBeTruthy();
    expect(screen.getByText(/从基础摒除到大师 X-Wing/)).toBeTruthy();
    
    // First technique is active by default
    const firstTech = TECHNIQUES_DATA[0];
    expect(screen.getAllByText(firstTech.name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(firstTech.tagline)).toBeTruthy();
  });

  it('filters techniques by category tab', () => {
    render(<TechniquesModal isOpen={true} onClose={vi.fn()} />);

    // Click "大师高阶" category tab
    const advancedTab = screen.getByText('大师高阶 (3)');
    fireEvent.click(advancedTab);

    expect(screen.getAllByText(/X-Wing 矩阵排除法/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/XY-Wing 弯矩对消除/)).toBeTruthy();
    expect(screen.getByText(/剑鱼排除法/)).toBeTruthy();

    // Basic techniques should not appear in the list when filtered
    expect(screen.queryByText('唯一余数法 (唯余)')).toBeNull();
  });

  it('filters techniques by search query', () => {
    render(<TechniquesModal isOpen={true} onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('搜索方法口诀...');
    fireEvent.change(searchInput, { target: { value: '三数组' } });

    expect(screen.getByText(/显性三数组/)).toBeTruthy();
    expect(screen.queryByText('宫内排除法 (宫摒除)')).toBeNull();
  });

  it('switches active technique when clicking on a technique item', () => {
    render(<TechniquesModal isOpen={true} onClose={vi.fn()} />);

    const nakedPairItem = screen.getByText(/显性数对法/);
    fireEvent.click(nakedPairItem);

    // Active details should now show Naked Pair details
    const nakedPairData = TECHNIQUES_DATA.find((t) => t.id === 'naked-pair')!;
    expect(screen.getByText(nakedPairData.tagline)).toBeTruthy();
  });

  it('renders mini interactive board and calls onClose on button or escape', () => {
    const onClose = vi.fn();
    render(<TechniquesModal isOpen={true} onClose={onClose} />);

    // Renders visual demo board
    expect(screen.getByText('推导实录：')).toBeTruthy();

    // Click close button
    const closeBtn = screen.getByLabelText('关闭技巧宝典');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders 3-step deduction card with observe, deduce, and conclude steps', () => {
    render(<TechniquesModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('三步推导解析 (Step-by-Step Logic)')).toBeTruthy();
    expect(screen.getByText('1. 观察线索')).toBeTruthy();
    expect(screen.getByText('2. 逻辑推演')).toBeTruthy();
    expect(screen.getByText('3. 最终判定')).toBeTruthy();

    // Check content of first technique's breakdown
    const firstTech = TECHNIQUES_DATA[0];
    expect(screen.getByText(firstTech.example.stepBreakdown.observe)).toBeTruthy();
    expect(screen.getByText(firstTech.example.stepBreakdown.deduce)).toBeTruthy();
    expect(screen.getByText(firstTech.example.stepBreakdown.conclude)).toBeTruthy();
  });

  it('renders candidate notes and key coordinate badges for advanced techniques', () => {
    render(<TechniquesModal isOpen={true} initialTechniqueId="naked-pair" onClose={vi.fn()} />);

    // Check that Naked Pair coordinates and candidate badges appear
    expect(screen.getByText(/R3C2: 显性数对 \[3,8\]/)).toBeTruthy();
    expect(screen.getByText(/R3C6: 显性数对 \[3,8\]/)).toBeTruthy();
    expect(screen.getByText(/R3C4: 排除候选 \[3, 8\]/)).toBeTruthy();
    expect(screen.getByText(/R3C8: 排除候选 \[3, 8\]/)).toBeTruthy();

    // Check eliminated candidate numbers in 3x3 slots
    expect(screen.getAllByText('3✕').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8✕').length).toBeGreaterThanOrEqual(1);
  });

  it('supports toggle mastery, knowledge quiz check, and practice button', () => {
    const onSelectForPractice = vi.fn();
    render(
      <TechniquesModal
        isOpen={true}
        initialTechniqueId="hidden-single-box"
        onClose={vi.fn()}
        onSelectForPractice={onSelectForPractice}
      />
    );

    // Initial state: not mastered
    const markBtn = screen.getByText('标记为已掌握');
    expect(markBtn).toBeTruthy();

    // Click toggle mastered
    fireEvent.click(markBtn);
    expect(screen.getByText('已掌握 · 核对通过')).toBeTruthy();

    // Test knowledge quiz
    expect(screen.getByText('随堂核对检验 (Quick Check)')).toBeTruthy();
    const correctOpt = screen.getByText(/R1C3 \(第1行第3列\)/);
    fireEvent.click(correctOpt);

    // Shows "核对成功" feedback
    expect(screen.getByText(/核对成功！您已透彻理解/)).toBeTruthy();

    // Test practice button
    const practiceBtn = screen.getByText('实战演练');
    fireEvent.click(practiceBtn);
    expect(onSelectForPractice).toHaveBeenCalledWith('hidden-single-box');
  });
});

describe('Unified Learning Loop Deep-linking', () => {
  it('triggers onOpenTechniques from Header button', () => {
    const onOpenTechniques = vi.fn();
    render(
      <Header
        difficulty="medium"
        gameMode="random"
        dateStr="2026-09-30"
        isDailyCompleted={false}
        soundEnabled={true}
        onSelectDifficulty={vi.fn()}
        onSelectMode={vi.fn()}
        onNewGame={vi.fn()}
        onOpenStats={vi.fn()}
        onOpenSettings={vi.fn()}
        onOpenHelp={vi.fn()}
        onOpenTechniques={onOpenTechniques}
        onToggleSound={vi.fn()}
      />
    );

    const techBtn = screen.getByLabelText('查看数独解题技巧百科');
    fireEvent.click(techBtn);
    expect(onOpenTechniques).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenTechnique when clicking technique badge in HintDialog', () => {
    const onOpenTechnique = vi.fn();
    const hint: SmartHint = {
      type: 'naked-single',
      row: 2,
      col: 3,
      suggestedValue: 7,
      title: '唯一余数推导',
      explanation: '该空格只有数字 7 可填',
      techniqueName: '唯一余数法',
    };

    render(
      <HintDialog
        hint={hint}
        onApply={vi.fn()}
        onClose={vi.fn()}
        onOpenTechnique={onOpenTechnique}
      />
    );

    const badgeBtn = screen.getByTitle('点击查看该技法百科与图解');
    fireEvent.click(badgeBtn);
    expect(onOpenTechnique).toHaveBeenCalledWith('唯一余数法', 'naked-single');
  });

  it('triggers onOpenTechnique when clicking technique badge in VisualSolverBar', () => {
    const onOpenTechnique = vi.fn();
    const steps: VisualSolveStep[] = [
      {
        stepIndex: 0,
        technique: 'x-wing',
        techniqueName: 'X-Wing 矩阵排除法',
        description: '在第 2 行和第 8 行发现 X-Wing 矩阵',
        gridSnapshot: Array.from({ length: 9 }, () => Array(9).fill(0)),
        candidatesSnapshot: {},
      },
    ];

    render(
      <VisualSolverBar
        steps={steps}
        currentStepIndex={0}
        isPlaying={false}
        speed={1}
        onStepChange={vi.fn()}
        onTogglePlay={vi.fn()}
        onSpeedChange={vi.fn()}
        onExit={vi.fn()}
        onOpenTechnique={onOpenTechnique}
      />
    );

    const badgeBtn = screen.getByTitle('点击查看该解题技巧的图解教学');
    fireEvent.click(badgeBtn);
    expect(onOpenTechnique).toHaveBeenCalledWith('x-wing');
  });

  it('opens TechniquesModal in App when pressing M key', () => {
    render(<App />);

    expect(screen.queryByText('数独解题方法百科')).toBeNull();

    // Press 'm'
    fireEvent.keyDown(window, { key: 'm' });

    expect(screen.getByText('数独解题方法百科')).toBeTruthy();
  });
});
