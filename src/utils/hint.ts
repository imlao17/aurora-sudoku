import type { CellData } from '../types/sudoku';
import { GRID_SIZE, BOX_SIZE } from '../constants/sudoku';
import { getValidCandidates, getBoxIndex } from './sudoku';

export interface SmartHint {
  type: 'error' | 'naked-single' | 'hidden-single' | 'pointing-pair' | 'general';
  row: number;
  col: number;
  suggestedValue: number;
  title: string;
  explanation: string;
  techniqueName?: string;
  relatedCells?: { row: number; col: number }[];
  causeCells?: { row: number; col: number; value?: number }[];
  scope?: {
    type: 'row' | 'col' | 'box';
    index: number;
  };
}

/**
 * Enhanced educational hint analyzer:
 * 1. Diagnoses player errors immediately with actionable corrections
 * 2. Prioritizes player's currently selected cell if a deduction applies
 * 3. Identifies the lowest-tier human deduction step across the board
 * 4. Yields cause cells and regional scope for interactive visual highlighting
 */
export function analyzeNextHint(
  board: CellData[][],
  selectedPos?: { row: number; col: number } | null
): SmartHint | null {
  const numGrid = board.map((row) => row.map((c) => c.value));

  // 1. Check if currently selected cell has an error
  if (selectedPos) {
    const sel = board[selectedPos.row][selectedPos.col];
    if (!sel.isInitial && sel.value !== 0 && sel.value !== sel.solution) {
      return {
        type: 'error',
        row: selectedPos.row,
        col: selectedPos.col,
        suggestedValue: sel.solution,
        title: '修正当前失误格',
        techniqueName: '失误纠正',
        explanation: `第 ${selectedPos.row + 1} 行第 ${selectedPos.col + 1} 列当前填写的数字 ${sel.value} 存在冲突，正确数字应为 【${sel.solution}】。`,
        relatedCells: [{ row: selectedPos.row, col: selectedPos.col }],
      };
    }
  }

  // 2. Check any cell across the board that is filled incorrectly
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = board[r][c];
      if (!cell.isInitial && cell.value !== 0 && cell.value !== cell.solution) {
        return {
          type: 'error',
          row: r,
          col: c,
          suggestedValue: cell.solution,
          title: '修正盘面失误格',
          techniqueName: '失误纠正',
          explanation: `第 ${r + 1} 行第 ${c + 1} 列填写的数字 ${cell.value} 与数独规则冲突，正确数字应为 【${cell.solution}】。`,
          relatedCells: [{ row: r, col: c }],
        };
      }
    }
  }

  // Helper to extract cause cells for a cell's naked single
  function getPeerCauses(r: number, c: number): { row: number; col: number; value: number }[] {
    const causes: { row: number; col: number; value: number }[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < GRID_SIZE; i++) {
      if (i !== c && numGrid[r][i] !== 0) {
        const key = `${r},${i}`;
        if (!seen.has(key)) {
          seen.add(key);
          causes.push({ row: r, col: i, value: numGrid[r][i] });
        }
      }
      if (i !== r && numGrid[i][c] !== 0) {
        const key = `${i},${c}`;
        if (!seen.has(key)) {
          seen.add(key);
          causes.push({ row: i, col: c, value: numGrid[i][c] });
        }
      }
    }

    const startR = Math.floor(r / BOX_SIZE) * BOX_SIZE;
    const startC = Math.floor(c / BOX_SIZE) * BOX_SIZE;
    for (let br = 0; br < BOX_SIZE; br++) {
      for (let bc = 0; bc < BOX_SIZE; bc++) {
        const cr = startR + br;
        const cc = startC + bc;
        if ((cr !== r || cc !== c) && numGrid[cr][cc] !== 0) {
          const key = `${cr},${cc}`;
          if (!seen.has(key)) {
            seen.add(key);
            causes.push({ row: cr, col: cc, value: numGrid[cr][cc] });
          }
        }
      }
    }
    return causes;
  }

  // 3. Look for Naked Single (唯一余数) - check selected cell first
  if (selectedPos) {
    const sel = board[selectedPos.row][selectedPos.col];
    if (sel.value === 0) {
      const candidates = getValidCandidates(numGrid, selectedPos.row, selectedPos.col);
      if (candidates.length === 1) {
        const val = candidates[0];
        const causes = getPeerCauses(selectedPos.row, selectedPos.col);
        const b = getBoxIndex(selectedPos.row, selectedPos.col);
        return {
          type: 'naked-single',
          row: selectedPos.row,
          col: selectedPos.col,
          suggestedValue: val,
          title: '唯一余数 (Naked Single)',
          techniqueName: '唯一余数法',
          explanation: `当前选中格所在的行、列及第 ${b + 1} 宫已填满了其他 8 个数字，排除后仅剩唯一可能数字 【${val}】！`,
          causeCells: causes,
          relatedCells: causes.map(cc => ({ row: cc.row, col: cc.col })),
          scope: { type: 'box', index: b },
        };
      }
    }
  }

  // 4. Scan entire board for Naked Singles
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (numGrid[r][c] === 0) {
        const candidates = getValidCandidates(numGrid, r, c);
        if (candidates.length === 1) {
          const val = candidates[0];
          const causes = getPeerCauses(r, c);
          const b = getBoxIndex(r, c);
          return {
            type: 'naked-single',
            row: r,
            col: c,
            suggestedValue: val,
            title: '唯一余数 (Naked Single)',
            techniqueName: '唯一余数法',
            explanation: `观察第 ${r + 1} 行第 ${c + 1} 列：受到同行、同列和第 ${b + 1} 宫现有数字的排除，该单元格仅剩唯一候选数 【${val}】。`,
            causeCells: causes,
            relatedCells: causes.map(cc => ({ row: cc.row, col: cc.col })),
            scope: { type: 'box', index: b },
          };
        }
      }
    }
  }

  // 5. Look for Hidden Single in 3x3 Box (宫内排除法)
  for (let b = 0; b < GRID_SIZE; b++) {
    const startRow = Math.floor(b / BOX_SIZE) * BOX_SIZE;
    const startCol = (b % BOX_SIZE) * BOX_SIZE;

    for (let digit = 1; digit <= GRID_SIZE; digit++) {
      let boxHasDigit = false;
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          if (numGrid[startRow + r][startCol + c] === digit) {
            boxHasDigit = true;
            break;
          }
        }
      }
      if (boxHasDigit) continue;

      const validCells: { r: number; c: number }[] = [];
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const cr = startRow + r;
          const cc = startCol + c;
          if (numGrid[cr][cc] === 0) {
            const candidates = getValidCandidates(numGrid, cr, cc);
            if (candidates.includes(digit)) {
              validCells.push({ r: cr, c: cc });
            }
          }
        }
      }

      if (validCells.length === 1) {
        const target = validCells[0];
        // Collect cross-row / cross-col cells containing this digit
        const causes: { row: number; col: number; value: number }[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          if (c < startCol || c >= startCol + BOX_SIZE) {
            for (let r = 0; r < BOX_SIZE; r++) {
              if (numGrid[startRow + r][c] === digit) {
                causes.push({ row: startRow + r, col: c, value: digit });
              }
            }
          }
        }
        for (let r = 0; r < GRID_SIZE; r++) {
          if (r < startRow || r >= startRow + BOX_SIZE) {
            for (let c = 0; c < BOX_SIZE; c++) {
              if (numGrid[r][startCol + c] === digit) {
                causes.push({ row: r, col: startCol + c, value: digit });
              }
            }
          }
        }

        return {
          type: 'hidden-single',
          row: target.r,
          col: target.c,
          suggestedValue: digit,
          title: '宫内排除 (Hidden Single Box)',
          techniqueName: '宫内排除法',
          explanation: `在第 ${b + 1} 宫中：因为交叉行与列的外部阻断，数字 【${digit}】 在本宫其他位置均无法填入，只能落子于此！`,
          causeCells: causes,
          relatedCells: causes.map(cc => ({ row: cc.row, col: cc.col })),
          scope: { type: 'box', index: b },
        };
      }
    }
  }

  // 6. Look for Hidden Single in Row (行内排除法)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let digit = 1; digit <= GRID_SIZE; digit++) {
      if (numGrid[r].includes(digit)) continue;

      const validCols: number[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        if (numGrid[r][c] === 0) {
          const candidates = getValidCandidates(numGrid, r, c);
          if (candidates.includes(digit)) {
            validCols.push(c);
          }
        }
      }

      if (validCols.length === 1) {
        const col = validCols[0];
        const causes: { row: number; col: number; value: number }[] = [];
        for (let c = 0; c < GRID_SIZE; c++) {
          if (c !== col && numGrid[r][c] === 0) {
            for (let i = 0; i < GRID_SIZE; i++) {
              if (numGrid[i][c] === digit) {
                causes.push({ row: i, col: c, value: digit });
                break;
              }
            }
          }
        }

        return {
          type: 'hidden-single',
          row: r,
          col,
          suggestedValue: digit,
          title: '行内排除 (Hidden Single Row)',
          techniqueName: '行内排除法',
          explanation: `观察第 ${r + 1} 行：该行数字 【${digit}】 受到其他列对应数字的封锁，仅剩第 ${col + 1} 列能够容纳！`,
          causeCells: causes,
          relatedCells: causes.map(cc => ({ row: cc.row, col: cc.col })),
          scope: { type: 'row', index: r },
        };
      }
    }
  }

  // 7. Look for Hidden Single in Column (列内排除法)
  for (let c = 0; c < GRID_SIZE; c++) {
    const colValues = numGrid.map((row) => row[c]);
    for (let digit = 1; digit <= GRID_SIZE; digit++) {
      if (colValues.includes(digit)) continue;

      const validRows: number[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (numGrid[r][c] === 0) {
          const candidates = getValidCandidates(numGrid, r, c);
          if (candidates.includes(digit)) {
            validRows.push(r);
          }
        }
      }

      if (validRows.length === 1) {
        const row = validRows[0];
        const causes: { row: number; col: number; value: number }[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          if (r !== row && numGrid[r][c] === 0) {
            for (let i = 0; i < GRID_SIZE; i++) {
              if (numGrid[r][i] === digit) {
                causes.push({ row: r, col: i, value: digit });
                break;
              }
            }
          }
        }

        return {
          type: 'hidden-single',
          row,
          col: c,
          suggestedValue: digit,
          title: '列内排除 (Hidden Single Col)',
          techniqueName: '列内排除法',
          explanation: `观察第 ${c + 1} 列：该列数字 【${digit}】 受到各行已有数字的封锁，仅剩第 ${row + 1} 行能够容纳！`,
          causeCells: causes,
          relatedCells: causes.map(cc => ({ row: cc.row, col: cc.col })),
          scope: { type: 'col', index: c },
        };
      }
    }
  }

  // 8. Fallback: Find empty cell with solution
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (numGrid[r][c] === 0) {
        return {
          type: 'general',
          row: r,
          col: c,
          suggestedValue: board[r][c].solution,
          title: '深度逻辑推导',
          techniqueName: '终盘逻辑推演',
          explanation: `结合全盘链式逻辑关系，第 ${r + 1} 行第 ${c + 1} 列的确定解为 【${board[r][c].solution}】。`,
          relatedCells: [{ row: r, col: c }],
        };
      }
    }
  }

  return null;
}
