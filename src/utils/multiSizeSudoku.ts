import type { BoardSize, SymbolTheme, Difficulty, CellData, CellPosition } from '../types/sudoku';

export interface BoardGeometry {
  size: BoardSize;
  boxRows: number;
  boxCols: number;
  totalBoxes: number;
}

export const BOARD_GEOMETRIES: Record<BoardSize, BoardGeometry> = {
  4: { size: 4, boxRows: 2, boxCols: 2, totalBoxes: 4 },
  6: { size: 6, boxRows: 2, boxCols: 3, totalBoxes: 6 },
  9: { size: 9, boxRows: 3, boxCols: 3, totalBoxes: 9 },
};

export const SYMBOL_PRESETS: Record<
  SymbolTheme,
  {
    name: string;
    description: string;
    symbols: {
      4: string[];
      6: string[];
      9: string[];
    };
  }
> = {
  numbers: {
    name: '经典数字',
    description: '标准清晰的阿拉伯数字',
    symbols: {
      4: ['1', '2', '3', '4'],
      6: ['1', '2', '3', '4', '5', '6'],
      9: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
  },
  animals: {
    name: '生肖萌宠',
    description: '汉字动物排他，童趣认字',
    symbols: {
      4: ['猫', '狗', '兔', '熊'],
      6: ['猫', '狗', '兔', '熊', '鹿', '鸟'],
      9: ['猫', '狗', '兔', '熊', '鹿', '鸟', '鱼', '蝶', '马'],
    },
  },
  fruit: {
    name: '极简几何',
    description: '经典几何排他，图形感知',
    symbols: {
      4: ['●', '▲', '■', '◆'],
      6: ['●', '▲', '■', '◆', '▼', '◈'],
      9: ['●', '▲', '■', '◆', '▼', '◈', '◉', '◎', '⬢'],
    },
  },
  hanzi: {
    name: '东方汉字',
    description: '传统汉字与四季意象，启蒙识字',
    symbols: {
      4: ['春', '夏', '秋', '冬'],
      6: ['日', '月', '水', '火', '木', '金'],
      9: ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'],
    },
  },
  pinyin: {
    name: '拼音启蒙',
    description: '单韵母与声母启蒙，拼读辨识',
    symbols: {
      4: ['b', 'p', 'm', 'f'],
      6: ['a', 'o', 'e', 'i', 'u', 'ü'],
      9: ['a', 'o', 'e', 'i', 'u', 'ü', 'b', 'p', 'm'],
    },
  },
};

export const HANZI_RUBY_PINYIN_MAP: Record<string, string> = {
  // 4x4 (春 夏 秋 冬)
  春: 'chūn',
  夏: 'xià',
  秋: 'qiū',
  冬: 'dōng',
  // 6x6 (日 月 水 火 木 金)
  日: 'rì',
  月: 'yuè',
  水: 'shuǐ',
  火: 'huǒ',
  木: 'mù',
  金: 'jīn',
  // 9x9 (壹 贰 叁 肆 伍 陆 柒 捌 玖)
  壹: 'yī',
  贰: 'èr',
  叁: 'sān',
  肆: 'sì',
  伍: 'wǔ',
  陆: 'liù',
  柒: 'qī',
  捌: 'bā',
  玖: 'jiǔ',
  // 生肖动物 (猫 狗 兔 熊 鹿 鸟 鱼 蝶 马)
  猫: 'māo',
  狗: 'gǒu',
  兔: 'tù',
  熊: 'xióng',
  鹿: 'lù',
  鸟: 'niǎo',
  鱼: 'yú',
  蝶: 'dié',
  马: 'mǎ',
};

/**
 * Returns the localized symbol character for a given value (1-indexed)
 */
export function getSymbolDisplay(
  value: number,
  theme: SymbolTheme = 'numbers',
  size: BoardSize = 9
): string {
  if (value <= 0) return '';
  const preset = SYMBOL_PRESETS[theme] || SYMBOL_PRESETS.numbers;
  const list = preset.symbols[size] || preset.symbols[9];
  return list[value - 1] ?? String(value);
}

/**
 * Returns the ruby pinyin annotation for a character or value
 */
export function getRubyPinyin(
  characterOrValue: string | number,
  theme: SymbolTheme = 'hanzi',
  size: BoardSize = 9
): string | null {
  if (theme === 'hanzi' || theme === 'animals') {
    let char = typeof characterOrValue === 'string' ? characterOrValue : '';
    if (typeof characterOrValue === 'number' && characterOrValue > 0) {
      char = getSymbolDisplay(characterOrValue, theme, size);
    }
    return HANZI_RUBY_PINYIN_MAP[char] || null;
  }
  return null;
}

/**
 * Speech pronunciation for Chinese characters and Pinyin
 */
export function speakChineseText(text: string): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  }
}

/**
 * Computes box index from row and col for any board size (4, 6, 9)
 */
export function getMultiSizeBoxIndex(row: number, col: number, size: BoardSize): number {
  const geo = BOARD_GEOMETRIES[size];
  const boxR = Math.floor(row / geo.boxRows);
  const boxC = Math.floor(col / geo.boxCols);
  return boxR * (size / geo.boxCols) + boxC;
}

/**
 * Checks if a number can be placed at (row, col) in a grid
 */
export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  size: BoardSize
): boolean {
  const geo = BOARD_GEOMETRIES[size];

  // Row and column checks
  for (let i = 0; i < size; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }

  // Box check
  const startRow = Math.floor(row / geo.boxRows) * geo.boxRows;
  const startCol = Math.floor(col / geo.boxCols) * geo.boxCols;

  for (let r = 0; r < geo.boxRows; r++) {
    for (let c = 0; c < geo.boxCols; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }

  return true;
}

/**
 * Backtracking solver that counts solutions (stops counting when limit reached)
 */
export function solveMultiSizeGrid(
  grid: number[][],
  size: BoardSize,
  countLimit: number = 2
): { solved: boolean; solution: number[][]; count: number } {
  const copy = grid.map((r) => [...r]);
  let count = 0;
  let firstSolution: number[][] | null = null;

  function findEmpty(): [number, number] | null {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (copy[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  function search(): boolean {
    const empty = findEmpty();
    if (!empty) {
      count++;
      if (!firstSolution) {
        firstSolution = copy.map((r) => [...r]);
      }
      return count >= countLimit;
    }

    const [r, c] = empty;
    for (let num = 1; num <= size; num++) {
      if (isValidPlacement(copy, r, c, num, size)) {
        copy[r][c] = num;
        if (search()) return true;
        copy[r][c] = 0;
      }
    }

    return false;
  }

  search();

  return {
    solved: count > 0,
    solution: firstSolution || copy,
    count,
  };
}

/**
 * Generates a completely filled valid solution grid using randomized backtracking
 */
export function generateCompletedGrid(size: BoardSize): number[][] {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  function shuffle(arr: number[]): number[] {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }

  function fillCell(r: number, c: number): boolean {
    if (r === size) return true;
    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    const nums = shuffle(Array.from({ length: size }, (_, i) => i + 1));
    for (const num of nums) {
      if (isValidPlacement(grid, r, c, num, size)) {
        grid[r][c] = num;
        if (fillCell(nextR, nextC)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  fillCell(0, 0);
  return grid;
}

/**
 * Generates a playable 4x4 or 6x6 Sudoku puzzle with 100% unique solution guarantee
 */
export function generateMultiSizePuzzle(
  size: BoardSize,
  difficulty: Difficulty = 'easy'
): { puzzle: number[][]; solution: number[][] } {
  const solution = generateCompletedGrid(size);
  const puzzle = solution.map((r) => [...r]);

  // Target number of blanks (removals) by size and difficulty
  let targetBlanks: number;
  if (size === 4) {
    targetBlanks = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  } else if (size === 6) {
    targetBlanks = difficulty === 'easy' ? 12 : difficulty === 'medium' ? 16 : 20;
  } else {
    // 9x9 defaults
    targetBlanks = difficulty === 'easy' ? 43 : difficulty === 'medium' ? 50 : 56;
  }

  // Generate all positions and shuffle
  const positions: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push([r, c]);
    }
  }

  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  let blanksCount = 0;

  for (const [r, c] of positions) {
    if (blanksCount >= targetBlanks) break;

    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    // Check if puzzle still has a unique solution
    const res = solveMultiSizeGrid(puzzle, size, 2);
    if (res.count === 1) {
      blanksCount++;
    } else {
      // Restore if removing leads to multiple solutions
      puzzle[r][c] = backup;
    }
  }

  return { puzzle, solution };
}

/**
 * Checks for conflicts across rows, cols, and boxes for any board size (4, 6, 9)
 */
export function checkMultiSizeConflicts(
  board: CellData[][],
  size: BoardSize
): boolean[][] {
  const conflicts: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const geo = BOARD_GEOMETRIES[size];

  // 1. Check rows
  for (let r = 0; r < size; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < size; c++) {
      const val = board[r]?.[c]?.value;
      if (val && val > 0) {
        const list = seen.get(val) || [];
        list.push(c);
        seen.set(val, list);
      }
    }
    for (const cols of seen.values()) {
      if (cols.length > 1) {
        for (const c of cols) conflicts[r][c] = true;
      }
    }
  }

  // 2. Check columns
  for (let c = 0; c < size; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < size; r++) {
      const val = board[r]?.[c]?.value;
      if (val && val > 0) {
        const list = seen.get(val) || [];
        list.push(r);
        seen.set(val, list);
      }
    }
    for (const rows of seen.values()) {
      if (rows.length > 1) {
        for (const r of rows) conflicts[r][c] = true;
      }
    }
  }

  // 3. Check boxes
  const numBoxRows = size / geo.boxRows;
  const numBoxCols = size / geo.boxCols;

  for (let br = 0; br < numBoxRows; br++) {
    for (let bc = 0; bc < numBoxCols; bc++) {
      const seen = new Map<number, [number, number][]>();
      for (let r = 0; r < geo.boxRows; r++) {
        for (let c = 0; c < geo.boxCols; c++) {
          const row = br * geo.boxRows + r;
          const col = bc * geo.boxCols + c;
          const val = board[row]?.[col]?.value;
          if (val && val > 0) {
            const list = seen.get(val) || [];
            list.push([row, col]);
            seen.set(val, list);
          }
        }
      }
      for (const cells of seen.values()) {
        if (cells.length > 1) {
          for (const [row, col] of cells) conflicts[row][col] = true;
        }
      }
    }
  }

  return conflicts;
}

/**
 * Generates an encouraging, pedagogical hint for young learners in Junior mode
 */
export function generateJuniorHint(
  board: CellData[][],
  size: BoardSize,
  symbolTheme: SymbolTheme = 'numbers'
): { row: number; col: number; value: number; message: string } | null {
  // 1. Look for a row with only 1 empty cell
  for (let r = 0; r < size; r++) {
    const empties: number[] = [];
    const present = new Set<number>();
    for (let c = 0; c < size; c++) {
      if (board[r][c].value === 0) empties.push(c);
      else present.add(board[r][c].value);
    }
    if (empties.length === 1) {
      const col = empties[0];
      const correctVal = board[r][col].solution;
      const symbol = getSymbolDisplay(correctVal, symbolTheme, size);
      return {
        row: r,
        col,
        value: correctVal,
        message: `瞧！第 ${r + 1} 横行只差一个【${symbol}】啦，快把它填上去吧！`,
      };
    }
  }

  // 2. Look for a column with only 1 empty cell
  for (let c = 0; c < size; c++) {
    const empties: number[] = [];
    for (let r = 0; r < size; r++) {
      if (board[r][c].value === 0) empties.push(r);
    }
    if (empties.length === 1) {
      const row = empties[0];
      const correctVal = board[row][c].solution;
      const symbol = getSymbolDisplay(correctVal, symbolTheme, size);
      return {
        row,
        col: c,
        value: correctVal,
        message: `看呀！第 ${c + 1} 竖列正好还缺一个【${symbol}】哦！`,
      };
    }
  }

  // 3. Fallback: Find first empty cell with correct value
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c].value === 0) {
        const correctVal = board[r][c].solution;
        const symbol = getSymbolDisplay(correctVal, symbolTheme, size);
        return {
          row: r,
          col: c,
          value: correctVal,
          message: `仔细看看这里，填入【${symbol}】刚刚好！`,
        };
      }
    }
  }

  return null;
}

/**
 * Automatically fills the last remaining cells for 4x4 and 6x6 (rows, cols, boxes)
 */
export function autoFillMultiSizeLastRemainingCells(
  currentBoard: CellData[][],
  size: BoardSize
): {
  updatedBoard: CellData[][];
  filledCells: { row: number; col: number; value: number }[];
  deltas: { row: number; col: number; prevValue: number; newValue: number; prevNotes: number[]; newNotes: number[] }[];
} {
  const conflicts = checkMultiSizeConflicts(currentBoard, size);
  if (conflicts.some((r) => r.some(Boolean))) {
    return { updatedBoard: currentBoard, filledCells: [], deltas: [] };
  }

  const geo = BOARD_GEOMETRIES[size];
  const filledCells: { row: number; col: number; value: number }[] = [];
  const deltas: { row: number; col: number; prevValue: number; newValue: number; prevNotes: number[]; newNotes: number[] }[] = [];
  let foundAny = true;
  let loopCount = 0;

  while (foundAny && loopCount < size * size) {
    foundAny = false;
    loopCount++;
    const toFill = new Map<string, { row: number; col: number; value: number }>();

    // 1. Check rows
    for (let r = 0; r < size; r++) {
      const emptyCells: { row: number; col: number }[] = [];
      const filled = new Set<number>();
      for (let c = 0; c < size; c++) {
        const val = currentBoard[r][c].value;
        if (val === 0) emptyCells.push({ row: r, col: c });
        else filled.add(val);
      }
      if (emptyCells.length === 1 && filled.size === size - 1) {
        for (let d = 1; d <= size; d++) {
          if (!filled.has(d)) {
            const pos = emptyCells[0];
            if (d === currentBoard[pos.row][pos.col].solution) {
              toFill.set(`${pos.row}-${pos.col}`, { row: pos.row, col: pos.col, value: d });
            }
            break;
          }
        }
      }
    }

    // 2. Check columns
    for (let c = 0; c < size; c++) {
      const emptyCells: { row: number; col: number }[] = [];
      const filled = new Set<number>();
      for (let r = 0; r < size; r++) {
        const val = currentBoard[r][c].value;
        if (val === 0) emptyCells.push({ row: r, col: c });
        else filled.add(val);
      }
      if (emptyCells.length === 1 && filled.size === size - 1) {
        for (let d = 1; d <= size; d++) {
          if (!filled.has(d)) {
            const pos = emptyCells[0];
            if (d === currentBoard[pos.row][pos.col].solution) {
              toFill.set(`${pos.row}-${pos.col}`, { row: pos.row, col: pos.col, value: d });
            }
            break;
          }
        }
      }
    }

    // 3. Check boxes
    const numBoxRows = size / geo.boxRows;
    const numBoxCols = size / geo.boxCols;
    for (let br = 0; br < numBoxRows; br++) {
      for (let bc = 0; bc < numBoxCols; bc++) {
        const emptyCells: { row: number; col: number }[] = [];
        const filled = new Set<number>();
        for (let r = 0; r < geo.boxRows; r++) {
          for (let c = 0; c < geo.boxCols; c++) {
            const row = br * geo.boxRows + r;
            const col = bc * geo.boxCols + c;
            const val = currentBoard[row][col].value;
            if (val === 0) emptyCells.push({ row, col });
            else filled.add(val);
          }
        }
        if (emptyCells.length === 1 && filled.size === size - 1) {
          for (let d = 1; d <= size; d++) {
            if (!filled.has(d)) {
              const pos = emptyCells[0];
              if (d === currentBoard[pos.row][pos.col].solution) {
                toFill.set(`${pos.row}-${pos.col}`, { row: pos.row, col: pos.col, value: d });
              }
              break;
            }
          }
        }
      }
    }

    if (toFill.size > 0) {
      foundAny = true;
      for (const item of toFill.values()) {
        const cell = currentBoard[item.row][item.col];
        deltas.push({
          row: item.row,
          col: item.col,
          prevValue: cell.value,
          newValue: item.value,
          prevNotes: [...cell.notes],
          newNotes: [],
        });
        currentBoard[item.row][item.col] = {
          ...cell,
          value: item.value,
          notes: [],
          isError: false,
        };
        filledCells.push(item);
      }
    }
  }

  return { updatedBoard: currentBoard, filledCells, deltas };
}

/**
 * Checks if the board of the given size is fully completed with valid entries
 */
export function isMultiSizeBoardCompleted(board: CellData[][], size: BoardSize): boolean {
  if (board.length !== size) return false;
  for (let r = 0; r < size; r++) {
    if (!board[r] || board[r].length !== size) return false;
    for (let c = 0; c < size; c++) {
      const cell = board[r][c];
      if (!cell || cell.value === 0 || cell.value !== cell.solution) return false;
    }
  }
  const conflicts = checkMultiSizeConflicts(board, size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (conflicts[r][c]) return false;
    }
  }
  return true;
}

/**
 * Detects if filling a cell at (changedRow, changedCol) freshly completes
 * its row, column, or box for any board size (4, 6, 9)
 */
export function findNewlyCompletedMultiSizeCells(
  prevBoard: CellData[][],
  newBoard: CellData[][],
  changedRow: number,
  changedCol: number,
  size: BoardSize
): CellPosition[] {
  const completedCellsMap = new Map<string, CellPosition>();
  const addCell = (r: number, c: number) => {
    completedCellsMap.set(`${r}-${c}`, { row: r, col: c });
  };

  // 1. Check Row
  const prevRowIncomplete = prevBoard[changedRow]?.some((cell) => cell.value === 0);
  const newRowComplete = newBoard[changedRow]?.every(
    (cell) => cell.value > 0 && cell.value === cell.solution
  );
  if (prevRowIncomplete && newRowComplete) {
    for (let c = 0; c < size; c++) addCell(changedRow, c);
  }

  // 2. Check Column
  let prevColIncomplete = false;
  let newColComplete = true;
  for (let r = 0; r < size; r++) {
    if (prevBoard[r]?.[changedCol]?.value === 0) prevColIncomplete = true;
    const val = newBoard[r]?.[changedCol]?.value;
    const sol = newBoard[r]?.[changedCol]?.solution;
    if (!val || val !== sol) newColComplete = false;
  }
  if (prevColIncomplete && newColComplete) {
    for (let r = 0; r < size; r++) addCell(r, changedCol);
  }

  // 3. Check Box
  const geo = BOARD_GEOMETRIES[size];
  const boxRowStart = Math.floor(changedRow / geo.boxRows) * geo.boxRows;
  const boxColStart = Math.floor(changedCol / geo.boxCols) * geo.boxCols;
  let prevBoxIncomplete = false;
  let newBoxComplete = true;

  for (let r = 0; r < geo.boxRows; r++) {
    for (let c = 0; c < geo.boxCols; c++) {
      const cr = boxRowStart + r;
      const cc = boxColStart + c;
      if (prevBoard[cr]?.[cc]?.value === 0) prevBoxIncomplete = true;
      const val = newBoard[cr]?.[cc]?.value;
      const sol = newBoard[cr]?.[cc]?.solution;
      if (!val || val !== sol) newBoxComplete = false;
    }
  }
  if (prevBoxIncomplete && newBoxComplete) {
    for (let r = 0; r < geo.boxRows; r++) {
      for (let c = 0; c < geo.boxCols; c++) {
        addCell(boxRowStart + r, boxColStart + c);
      }
    }
  }

  return Array.from(completedCellsMap.values());
}

