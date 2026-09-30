import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type {
  Difficulty,
  GameMode,
  CellData,
  CellPosition,
  CellDelta,
  MoveHistory,
  GameStats,
  GameSettings,
} from './types/sudoku';
import { generatePuzzle, findConflicts, isBoardCompleted, findNewlyCompletedCells, autoFillLastRemainingCells } from './utils/sudoku';
import { createPRNG, hashStringToSeed } from './utils/prng';
import { soundManager } from './utils/sound';
import { MAX_HINTS } from './constants/sudoku';
import {
  loadSettings,
  saveSettings,
  loadStats,
  saveStats,
  recordGameResult,
  loadActiveGame,
  saveActiveGame,
  clearActiveGame,
} from './utils/storage';

import { Header } from './components/Header';
import { StatusBar } from './components/StatusBar';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { NumberPad } from './components/NumberPad';
import { VictoryModal } from './components/VictoryModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';
import { HintDialog } from './components/HintDialog';
import { VisualSolverBar } from './components/VisualSolverBar';
import { TechniquesModal } from './components/TechniquesModal';
import { AchievementToast } from './components/AchievementToast';
import { TECHNIQUES_DATA } from './constants/techniques';
import { analyzeNextHint, type SmartHint } from './utils/hint';
import { generateVisualSolveSteps, type VisualSolveStep } from './utils/visualSolver';
import { evaluateAchievements, type AchievementDef } from './utils/achievements';
import { Zap } from 'lucide-react';

export function App() {
  // Current Date String for Daily Challenge (formatted as YYYY-MM-DD)
  const getTodayDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [activeDateStr, setActiveDateStr] = useState<string>(getTodayDateStr);

  // Settings & Stats
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState<GameStats>(() => loadStats());

  // Game configuration
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [gameMode, setGameMode] = useState<GameMode>('random');

  // Game State
  const [board, setBoard] = useState<CellData[][]>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>({ row: 0, col: 0 });
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(MAX_HINTS);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Visual Solver State
  const [isVisualSolverActive, setIsVisualSolverActive] = useState(false);
  const [visualSteps, setVisualSteps] = useState<VisualSolveStep[]>([]);
  const [visualStepIndex, setVisualStepIndex] = useState(0);
  const [isVisualPlaying, setIsVisualPlaying] = useState(false);
  const [visualSpeed, setVisualSpeed] = useState(1);

  // Undo / Redo History
  const [history, setHistory] = useState<MoveHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTechniquesModal, setShowTechniquesModal] = useState(false);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<string | null>(null);
  const [currentHint, setCurrentHint] = useState<SmartHint | null>(null);
  const [isNewBestRecord, setIsNewBestRecord] = useState(false);
  const [unlockedAchievementsQueue, setUnlockedAchievementsQueue] = useState<AchievementDef[]>([]);
  const [statsModalTab, setStatsModalTab] = useState<'stats' | 'achievements'>('stats');
  const [completedHouseCells, setCompletedHouseCells] = useState<Record<string, boolean>>({});
  const [activePaintDigit, setActivePaintDigit] = useState<number | null>(null);
  const houseWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize soundManager
  useEffect(() => {
    soundManager.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Synchronize theme attribute and dark class on document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', settings.theme);
      document.body.className = `theme-${settings.theme}`;
      const isDark = ['aurora', 'cyberpunk', 'twilight'].includes(settings.theme);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Keep a ref of all reactive states so handleKeyDown never suffers from stale closures
  const stateRef = useRef({
    board,
    selectedCell,
    isNoteMode,
    isPaused,
    isCompleted,
    history,
    historyIndex,
    hintsRemaining,
    hintsUsed,
    mistakesCount,
    elapsedTime,
    settings,
    stats,
    difficulty,
    gameMode,
    activeDateStr,
    showVictoryModal,
    showStatsModal,
    showSettingsModal,
    showHelpModal,
    showTechniquesModal,
    isVisualSolverActive,
    visualSteps,
    visualStepIndex,
    isVisualPlaying,
  });

  useEffect(() => {
    stateRef.current = {
      board,
      selectedCell,
      isNoteMode,
      isPaused,
      isCompleted,
      history,
      historyIndex,
      hintsRemaining,
      hintsUsed,
      mistakesCount,
      elapsedTime,
      settings,
      stats,
      difficulty,
      gameMode,
      activeDateStr,
      showVictoryModal,
      showStatsModal,
      showSettingsModal,
      showHelpModal,
      showTechniquesModal,
      isVisualSolverActive,
      visualSteps,
      visualStepIndex,
      isVisualPlaying,
    };
  });


  // Initialize a new game
  const initGame = useCallback((diff: Difficulty, mode: GameMode, forceReset: boolean = false) => {
    const today = getTodayDateStr();
    setActiveDateStr(today);

    // Check if there is an in-progress game in localStorage
    if (!forceReset) {
      const saved = loadActiveGame();
      if (saved && !saved.isCompleted && saved.difficulty === diff && saved.gameMode === mode) {
        if (mode === 'daily' && saved.dateStr !== today) {
          // Stale daily game from yesterday, generate new
        } else {
          setBoard(saved.board);
          setElapsedTime(saved.elapsedTime);
          setMistakesCount(saved.mistakesCount);
          setHintsRemaining(saved.hintsRemaining);
          setHintsUsed(saved.hintsUsed ?? (MAX_HINTS - saved.hintsRemaining));
          setIsPaused(saved.isPaused);
          setIsCompleted(false);
          setHistory([]);
          setHistoryIndex(-1);
          setSelectedCell({ row: 0, col: 0 });
          setActivePaintDigit(null);
          return;
        }
      }
    }

    // Generate puzzle
    let rng = Math.random;
    if (mode === 'daily') {
      const seed = hashStringToSeed(today);
      rng = createPRNG(seed);
    }

    const { initialBoard, solution } = generatePuzzle(diff, rng);

    const newBoard: CellData[][] = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => {
        const val = initialBoard[r][c];
        return {
          row: r,
          col: c,
          value: val,
          solution: solution[r][c],
          isInitial: val !== 0,
          notes: [],
          isError: false,
        };
      })
    );

    setBoard(newBoard);
    setSelectedCell({ row: 0, col: 0 });
    setActivePaintDigit(null);
    setElapsedTime(0);
    setIsPaused(false);
    setIsCompleted(false);
    setMistakesCount(0);
    setHintsRemaining(MAX_HINTS);
    setHintsUsed(0);
    setHistory([]);
    setHistoryIndex(-1);
    clearActiveGame();
  }, []);

  // Mount initialization
  useEffect(() => {
    initGame(difficulty, gameMode);
    return () => {
      if (houseWaveTimerRef.current) {
        clearTimeout(houseWaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer interval
  useEffect(() => {
    if (isPaused || isCompleted || board.length === 0 || isVisualSolverActive) return;

    const timer = setInterval(() => {
      setElapsedTime((prev) => {
        const nextTime = prev + 1;
        // Autosave active game every 5 seconds
        if (nextTime % 5 === 0) {
          const s = stateRef.current;
          saveActiveGame({
            difficulty: s.difficulty,
            gameMode: s.gameMode,
            dateStr: s.activeDateStr,
            board: s.board,
            elapsedTime: nextTime,
            mistakesCount: s.mistakesCount,
            hintsRemaining: s.hintsRemaining,
            hintsUsed: s.hintsUsed,
            isPaused: s.isPaused,
            isCompleted: false,
          });
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isCompleted, board.length, isVisualSolverActive]);

  // Conflicts calculation
  const conflicts = useMemo(() => {
    if (board.length === 0) return Array.from({ length: 9 }, () => Array(9).fill(false));
    const numGrid = board.map((row) => row.map((c) => c.value));
    return findConflicts(numGrid);
  }, [board]);

  // Accurate number counts: excludes erroneous cells so completion isn't spoofed
  const numberCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    if (board.length === 0) return counts;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = board[r][c];
        if (cell.value >= 1 && cell.value <= 9 && !cell.isError) {
          counts[cell.value] = (counts[cell.value] || 0) + 1;
        }
      }
    }
    return counts;
  }, [board]);

  // Check victory condition
  const checkVictory = useCallback((currentBoard: CellData[][]) => {
    const numGrid = currentBoard.map((row) => row.map((c) => c.value));
    if (isBoardCompleted(numGrid)) {
      setIsCompleted(true);
      clearActiveGame();
      soundManager.playVictory();

      // Record in storage
      const s = stateRef.current;
      const { isNewBest, updatedStats } = recordGameResult(
        s.difficulty,
        s.elapsedTime,
        s.gameMode === 'daily',
        s.activeDateStr,
        s.mistakesCount,
        s.hintsUsed
      );

      // Evaluate achievements
      const { newlyUnlocked, updatedStats: finalStats } = evaluateAchievements(updatedStats, {
        difficulty: s.difficulty,
        gameMode: s.gameMode,
        timeTaken: s.elapsedTime,
        mistakesCount: s.mistakesCount,
        hintsUsed: s.hintsUsed,
        todayStr: s.activeDateStr,
        actionType: 'win',
      });

      setStats(finalStats);
      saveStats(finalStats);
      setIsNewBestRecord(isNewBest);
      setShowVictoryModal(true);

      if (newlyUnlocked.length > 0) {
        setUnlockedAchievementsQueue((q) => [...q, ...newlyUnlocked]);
        soundManager.playAchievementFanfare();
      }
    }
  }, []);

  // Save settings when changed and immediately apply auto-fills if enabled
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });

    if (newSettings.autoFillLastRemaining) {
      const s = stateRef.current;
      if (s.board.length > 0 && !s.isCompleted && !s.isPaused && !s.isVisualSolverActive) {
        const autoFillRes = autoFillLastRemainingCells(s.board, s.settings.autoClearNotes);
        if (autoFillRes.filledCells.length > 0) {
          const move: MoveHistory = {
            selectedBefore: s.selectedCell,
            selectedAfter: s.selectedCell,
            changes: autoFillRes.deltas,
          };
          const newHistory = s.history.slice(0, s.historyIndex + 1);
          newHistory.push(move);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          setBoard(autoFillRes.updatedBoard);
          soundManager.playCompleteSection();
          checkVictory(autoFillRes.updatedBoard);
        }
      }
    }
  }, [checkVictory]);

  // Fill number or notes into the selected cell (or specified target cell)
  const handleInputNumber = useCallback((num: number, targetPos?: CellPosition) => {
    const s = stateRef.current;
    setActivePaintDigit(num);

    const cellPos = targetPos || s.selectedCell;
    if (!cellPos || s.isPaused || s.isCompleted) return;
    const { row, col } = cellPos;
    const targetCell = s.board[row]?.[col];
    if (!targetCell) return;

    if (targetCell.isInitial) {
      soundManager.playError();
      return;
    }

    if (s.isNoteMode) {
      // Pencil marks mode
      const currentNotes = [...targetCell.notes];
      const noteIdx = currentNotes.indexOf(num);
      let nextNotes: number[];

      if (noteIdx >= 0) {
        nextNotes = currentNotes.filter((n) => n !== num);
      } else {
        nextNotes = [...currentNotes, num].sort((a, b) => a - b);
      }

      const newBoard = s.board.map((rList, r) =>
        rList.map((cData, c) => {
          if (r === row && c === col) {
            return { ...cData, notes: nextNotes };
          }
          return cData;
        })
      );

      const move: MoveHistory = {
        selectedBefore: s.selectedCell,
        selectedAfter: s.selectedCell,
        changes: [
          {
            row,
            col,
            prevValue: targetCell.value,
            newValue: targetCell.value,
            prevNotes: targetCell.notes,
            newNotes: nextNotes,
          },
        ],
      };

      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(move);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setBoard(newBoard);
      soundManager.playNote();
    } else {
      // Primary number placement
      const nextValue = targetCell.value === num ? 0 : num;
      const isError = nextValue !== 0 && nextValue !== targetCell.solution;

      if (isError) {
        setMistakesCount((m) => m + 1);
        soundManager.playError();
      } else if (nextValue !== 0) {
        const willBeFull = (numberCounts[nextValue] || 0) + 1 >= 9;
        soundManager.playPlaceNumber(nextValue, willBeFull);
      } else {
        soundManager.playErase();
      }

      const changes: CellDelta[] = [];

      // Primary cell change
      changes.push({
        row,
        col,
        prevValue: targetCell.value,
        newValue: nextValue,
        prevNotes: targetCell.notes,
        newNotes: [],
      });

      // Update board and track peer note eliminations in changes array
      const newBoard = s.board.map((rList, r) =>
        rList.map((cData, c) => {
          if (r === row && c === col) {
            return {
              ...cData,
              value: nextValue,
              notes: [],
              isError,
            };
          }
          if (s.settings.autoClearNotes && nextValue !== 0 && !isError) {
            const sameRow = r === row;
            const sameCol = c === col;
            const sameBox =
              Math.floor(r / 3) === Math.floor(row / 3) &&
              Math.floor(c / 3) === Math.floor(col / 3);
            if ((sameRow || sameCol || sameBox) && cData.notes.includes(nextValue)) {
              const updatedNotes = cData.notes.filter((n) => n !== nextValue);
              changes.push({
                row: r,
                col: c,
                prevValue: cData.value,
                newValue: cData.value,
                prevNotes: cData.notes,
                newNotes: updatedNotes,
              });
              return {
                ...cData,
                notes: updatedNotes,
              };
            }
          }
          return cData;
        })
      );

      let finalBoard = newBoard;
      const allChanges = [...changes];
      const allChangedPositions: { row: number; col: number }[] = [{ row, col }];

      if (!isError && nextValue !== 0 && s.settings.autoFillLastRemaining) {
        const autoFillRes = autoFillLastRemainingCells(newBoard, s.settings.autoClearNotes);
        if (autoFillRes.filledCells.length > 0) {
          finalBoard = autoFillRes.updatedBoard;
          allChanges.push(...autoFillRes.deltas);
          allChangedPositions.push(...autoFillRes.filledCells);
        }
      }

      const move: MoveHistory = {
        selectedBefore: s.selectedCell,
        selectedAfter: s.selectedCell,
        changes: allChanges,
      };

      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(move);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setBoard(finalBoard);

      // Trigger house completion wave animation & sound if a row, column, or box is completed
      if (!isError && nextValue !== 0) {
        const newlyCompletedMap = new Map<string, { row: number; col: number }>();
        for (const pos of allChangedPositions) {
          const completedInPos = findNewlyCompletedCells(s.board, finalBoard, pos.row, pos.col);
          for (const c of completedInPos) {
            newlyCompletedMap.set(`${c.row}-${c.col}`, c);
          }
        }
        if (newlyCompletedMap.size > 0) {
          const map: Record<string, boolean> = {};
          newlyCompletedMap.forEach((_, key) => {
            map[key] = true;
          });
          setCompletedHouseCells(map);
          soundManager.playCompleteSection();
          if (houseWaveTimerRef.current) {
            clearTimeout(houseWaveTimerRef.current);
          }
          houseWaveTimerRef.current = setTimeout(() => {
            setCompletedHouseCells({});
            houseWaveTimerRef.current = null;
          }, 700);
        }
      }

      checkVictory(finalBoard);
    }
  }, [checkVictory, numberCounts]);

  // Select Cell handler with Fast Input Paint support
  const handleSelectCell = useCallback((row: number, col: number) => {
    const s = stateRef.current;
    if (s.isPaused) {
      setIsPaused(false);
    }
    setSelectedCell({ row, col });

    // If Fast Input Mode is enabled and there is a currently selected digit, immediately paint
    if (s.settings.fastInputMode && activePaintDigit !== null) {
      const target = s.board[row]?.[col];
      if (target && !target.isInitial) {
        handleInputNumber(activePaintDigit, { row, col });
        return;
      }
    }
    soundManager.playSelect();
  }, [activePaintDigit, handleInputNumber]);

  // Erase current cell
  const handleErase = useCallback(() => {
    const s = stateRef.current;
    if (!s.selectedCell || s.isPaused || s.isCompleted) return;
    const { row, col } = s.selectedCell;
    const targetCell = s.board[row][col];

    if (targetCell.isInitial) return;
    if (targetCell.value === 0 && targetCell.notes.length === 0) return;

    const newBoard = s.board.map((rList, r) =>
      rList.map((cData, c) => {
        if (r === row && c === col) {
          return {
            ...cData,
            value: 0,
            notes: [],
            isError: false,
          };
        }
        return cData;
      })
    );

    const move: MoveHistory = {
      selectedBefore: s.selectedCell,
      selectedAfter: s.selectedCell,
      changes: [
        {
          row,
          col,
          prevValue: targetCell.value,
          newValue: 0,
          prevNotes: targetCell.notes,
          newNotes: [],
        },
      ],
    };

    const newHistory = s.history.slice(0, s.historyIndex + 1);
    newHistory.push(move);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setBoard(newBoard);
    soundManager.playErase();
  }, []);

  // Undo (Restores all changes including peer notes)
  const handleUndo = useCallback(() => {
    const s = stateRef.current;
    if (s.historyIndex < 0 || s.isPaused || s.isCompleted) return;
    const move = s.history[s.historyIndex];

    // Create a mutable map of changed cell coordinates for O(1) lookup
    const changeMap = new Map<string, CellDelta>();
    for (const delta of move.changes) {
      changeMap.set(`${delta.row},${delta.col}`, delta);
    }

    const newBoard = s.board.map((rList, r) =>
      rList.map((cData, c) => {
        const delta = changeMap.get(`${r},${c}`);
        if (delta) {
          const isError = delta.prevValue !== 0 && delta.prevValue !== cData.solution;
          return {
            ...cData,
            value: delta.prevValue,
            notes: delta.prevNotes,
            isError,
          };
        }
        return cData;
      })
    );

    setBoard(newBoard);
    if (move.selectedBefore) {
      setSelectedCell(move.selectedBefore);
    }
    setHistoryIndex(s.historyIndex - 1);
    soundManager.playSelect();
  }, []);

  // Redo (Applies all changes)
  const handleRedo = useCallback(() => {
    const s = stateRef.current;
    if (s.historyIndex >= s.history.length - 1 || s.isPaused || s.isCompleted) return;
    const move = s.history[s.historyIndex + 1];

    const changeMap = new Map<string, CellDelta>();
    for (const delta of move.changes) {
      changeMap.set(`${delta.row},${delta.col}`, delta);
    }

    const newBoard = s.board.map((rList, r) =>
      rList.map((cData, c) => {
        const delta = changeMap.get(`${r},${c}`);
        if (delta) {
          const isError = delta.newValue !== 0 && delta.newValue !== cData.solution;
          return {
            ...cData,
            value: delta.newValue,
            notes: delta.newNotes,
            isError,
          };
        }
        return cData;
      })
    );

    setBoard(newBoard);
    if (move.selectedAfter) {
      setSelectedCell(move.selectedAfter);
    }
    setHistoryIndex(s.historyIndex + 1);
    soundManager.playSelect();
    checkVictory(newBoard);
  }, [checkVictory]);

  // Hint with Educational Smart Deduction Analyzer
  const handleHint = useCallback(() => {
    const s = stateRef.current;
    if (s.hintsRemaining <= 0 || s.isPaused || s.isCompleted) return;

    const hint = analyzeNextHint(s.board, s.selectedCell);
    if (!hint) return;

    setSelectedCell({ row: hint.row, col: hint.col });
    setCurrentHint(hint);
    soundManager.playHint();
  }, []);

  const handleApplyHint = useCallback(() => {
    if (!currentHint) return;
    handleInputNumber(currentHint.suggestedValue, { row: currentHint.row, col: currentHint.col });
    setHintsRemaining((h) => Math.max(0, h - 1));
    setHintsUsed((h) => h + 1);
    setCurrentHint(null);
  }, [currentHint, handleInputNumber]);

  // Visual Solver Handlers
  const handleStartVisualSolver = useCallback(() => {
    const s = stateRef.current;
    if (s.board.length === 0) return;
    const initialGrid = s.board.map((r) => r.map((c) => (c.isInitial ? c.value : 0)));
    const steps = generateVisualSolveSteps(initialGrid);
    setVisualSteps(steps);
    setVisualStepIndex(0);
    setIsVisualPlaying(false);
    setIsVisualSolverActive(true);
    setCurrentHint(null);
    soundManager.playSelect();

    // Check visual learner achievement
    const { newlyUnlocked, updatedStats } = evaluateAchievements(s.stats, {
      todayStr: s.activeDateStr,
      actionType: 'explore_tutorial',
    });
    if (newlyUnlocked.length > 0) {
      setStats(updatedStats);
      saveStats(updatedStats);
      setUnlockedAchievementsQueue((q) => [...q, ...newlyUnlocked]);
      soundManager.playAchievementFanfare();
    }
  }, []);

  const handleExitVisualSolver = useCallback(() => {
    setIsVisualSolverActive(false);
    setIsVisualPlaying(false);
    soundManager.playSelect();
  }, []);

  const handleOpenTechnique = useCallback((techIdOrName?: string) => {
    const s = stateRef.current;
    if (techIdOrName) {
      const lower = techIdOrName.toLowerCase();
      const matched = TECHNIQUES_DATA.find(
        (t) =>
          t.id === techIdOrName ||
          t.id.toLowerCase() === lower ||
          t.name.toLowerCase().includes(lower) ||
          lower.includes(t.name.split(' ')[0].toLowerCase())
      );
      setSelectedTechniqueId(matched ? matched.id : techIdOrName);
    } else {
      setSelectedTechniqueId(null);
    }
    setShowTechniquesModal(true);
    soundManager.playSelect();

    const { newlyUnlocked, updatedStats } = evaluateAchievements(s.stats, {
      todayStr: s.activeDateStr,
      actionType: 'explore_tutorial',
    });
    if (newlyUnlocked.length > 0) {
      setStats(updatedStats);
      saveStats(updatedStats);
      setUnlockedAchievementsQueue((q) => [...q, ...newlyUnlocked]);
      soundManager.playAchievementFanfare();
    }
  }, []);

  const handlePracticeTechnique = useCallback((techniqueId: string) => {
    const tech = TECHNIQUES_DATA.find((t) => t.id === techniqueId);
    let diff: Difficulty = 'medium';
    if (tech) {
      if (tech.category === 'basic') diff = 'easy';
      else if (tech.category === 'intermediate') diff = 'medium';
      else diff = 'hard';
    }
    setShowTechniquesModal(false);
    initGame(diff, 'random', true);
  }, [initGame]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      // Don't intercept if an active modal is open or target is form element
      if (s.showVictoryModal || s.showStatsModal || s.showSettingsModal || s.showHelpModal || s.showTechniquesModal) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key;

      // Handle Visual Solver hotkeys
      if (s.isVisualSolverActive) {
        if (key === 'Escape') {
          handleExitVisualSolver();
          e.preventDefault();
          return;
        }
        if (key === 'ArrowLeft' || key === 'ArrowUp') {
          setVisualStepIndex((i) => Math.max(0, i - 1));
          e.preventDefault();
          return;
        }
        if (key === 'ArrowRight' || key === 'ArrowDown') {
          setVisualStepIndex((i) => Math.min(s.visualSteps.length - 1, i + 1));
          e.preventDefault();
          return;
        }
        if (key === ' ') {
          setIsVisualPlaying((p) => !p);
          e.preventDefault();
          return;
        }
        return;
      }

      const dirKey = key.toLowerCase();

      // Directions (Arrow keys and WASD)
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(dirKey)) {
        if (!s.selectedCell) {
          setSelectedCell({ row: 0, col: 0 });
          return;
        }

        let { row, col } = s.selectedCell;
        if (dirKey === 'arrowup' || dirKey === 'w') row = (row - 1 + 9) % 9;
        if (dirKey === 'arrowdown' || dirKey === 's') row = (row + 1) % 9;
        if (dirKey === 'arrowleft' || dirKey === 'a') col = (col - 1 + 9) % 9;
        if (dirKey === 'arrowright' || dirKey === 'd') col = (col + 1) % 9;

        setSelectedCell({ row, col });
        soundManager.playSelect();
        e.preventDefault();
        return;
      }

      // Digits 1-9
      if (key >= '1' && key <= '9') {
        handleInputNumber(parseInt(key, 10));
        e.preventDefault();
        return;
      }

      // Delete / Backspace
      if (key === 'Backspace' || key === 'Delete' || key === '0') {
        handleErase();
        e.preventDefault();
        return;
      }

      // Note mode toggle (N or Space)
      if (key.toLowerCase() === 'n' || key === ' ') {
        setIsNoteMode((prev) => !prev);
        soundManager.playNote();
        e.preventDefault();
        return;
      }

      // Hint hotkey (H)
      if (key.toLowerCase() === 'h') {
        handleHint();
        e.preventDefault();
        return;
      }

      // Pause toggle (P)
      if (key.toLowerCase() === 'p') {
        setIsPaused((p) => !p);
        soundManager.playSelect();
        e.preventDefault();
        return;
      }

      // Escape to deselect
      if (key === 'Escape') {
        setSelectedCell(null);
        setCurrentHint(null);
        e.preventDefault();
        return;
      }

      // Techniques Encyclopedia hotkey (M)
      if (key.toLowerCase() === 'm') {
        handleOpenTechnique();
        e.preventDefault();
        return;
      }

      // Help guide hotkey (?)
      if (key === '?' || key === '？') {
        setShowHelpModal(true);
        e.preventDefault();
        return;
      }

      // Undo (Ctrl+Z or Z)
      if ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'z' && !e.shiftKey) {
        handleUndo();
        e.preventDefault();
        return;
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z)
      if (
        ((e.ctrlKey || e.metaKey) && key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && key.toLowerCase() === 'z')
      ) {
        handleRedo();
        e.preventDefault();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputNumber, handleErase, handleHint, handleUndo, handleRedo, handleExitVisualSolver, handleOpenTechnique]);

  const isDailyCompletedToday = stats.completedDailies.includes(activeDateStr);

  const selectedCellValue =
    selectedCell && board.length > 0 && board[selectedCell.row]
      ? board[selectedCell.row][selectedCell.col]?.value ?? 0
      : 0;

  const currentVisualStep = isVisualSolverActive ? visualSteps[visualStepIndex] : null;

  return (
    <div className={`min-h-[100dvh] min-h-screen flex flex-col justify-between selection:bg-sky-500/30 transition-colors duration-200 relative overflow-x-hidden safe-pt theme-${settings.theme} ${
      settings.theme === 'nordic'
        ? 'bg-slate-50 text-slate-900'
        : settings.theme === 'zen'
        ? 'bg-[#faf7f2] text-stone-900'
        : settings.theme === 'matcha'
        ? 'bg-[#f2f7f4] text-emerald-950'
        : settings.theme === 'cyberpunk'
        ? 'bg-[#020806] text-emerald-100'
        : settings.theme === 'twilight'
        ? 'bg-[#090514] text-purple-100'
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Header */}
      <div>
        <Header
          difficulty={difficulty}
          gameMode={gameMode}
          dateStr={activeDateStr}
          isDailyCompleted={isDailyCompletedToday}
          soundEnabled={settings.soundEnabled}
          onSelectDifficulty={(diff) => {
            setDifficulty(diff);
            setGameMode('random');
            initGame(diff, 'random', true);
          }}
          onSelectMode={(mode) => {
            setGameMode(mode);
            initGame(difficulty, mode, false);
          }}
          onNewGame={() => initGame(difficulty, gameMode, true)}
          onStartVisualSolver={handleStartVisualSolver}
          onOpenStats={() => {
            setStatsModalTab('stats');
            setShowStatsModal(true);
          }}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          onOpenTechniques={() => handleOpenTechnique()}
          onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        />

        {/* Status Bar */}
        <StatusBar
          difficulty={difficulty}
          gameMode={gameMode}
          elapsedTime={elapsedTime}
          isPaused={isPaused}
          mistakesCount={mistakesCount}
          hintsRemaining={hintsRemaining}
          onTogglePause={() => setIsPaused((p) => !p)}
        />

        {/* 9x9 Board */}
        <main className="mt-0.5 sm:mt-1 mb-1 sm:mb-2 flex items-center justify-center">
          <Board
            board={board}
            selectedCell={selectedCell}
            conflicts={conflicts}
            settings={settings}
            isPaused={isPaused && !isVisualSolverActive}
            targetHighlightCells={
              isVisualSolverActive
                ? currentVisualStep?.targetCells
                : currentHint
                ? [{ row: currentHint.row, col: currentHint.col }]
                : undefined
            }
            causeHighlightCells={
              isVisualSolverActive
                ? currentVisualStep?.causeCells
                : currentHint?.causeCells
            }
            scopeHighlight={
              isVisualSolverActive
                ? currentVisualStep?.scope
                : currentHint?.scope
            }
            completedHouseCells={completedHouseCells}
            customValuesGrid={isVisualSolverActive ? currentVisualStep?.gridSnapshot : undefined}
            customCandidatesMap={isVisualSolverActive ? currentVisualStep?.candidatesSnapshot : undefined}
            onSelectCell={handleSelectCell}
            onResume={() => setIsPaused(false)}
          />
        </main>
      </div>

      {/* Bottom Controls & Number Pad or Visual Solver Bar */}
      <div className="w-full flex flex-col justify-end">
        {isVisualSolverActive ? (
          <VisualSolverBar
            steps={visualSteps}
            currentStepIndex={visualStepIndex}
            isPlaying={isVisualPlaying}
            speed={visualSpeed}
            onStepChange={setVisualStepIndex}
            onTogglePlay={() => setIsVisualPlaying((p) => !p)}
            onSpeedChange={setVisualSpeed}
            onExit={handleExitVisualSolver}
            onOpenTechnique={handleOpenTechnique}
          />
        ) : (
          <>
            <Controls
              isNoteMode={isNoteMode}
              canUndo={historyIndex >= 0}
              canRedo={historyIndex < history.length - 1}
              hintsRemaining={hintsRemaining}
              onToggleNoteMode={() => setIsNoteMode((p) => !p)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onErase={handleErase}
              onHint={handleHint}
            />

            {/* Fast Input Mode Indicator on mobile */}
            {settings.fastInputMode && (
              <div className="w-full max-w-xl mx-auto px-3 sm:px-4 pb-1 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 select-none animate-fadeIn">
                <span className="flex items-center gap-1 font-medium">
                  <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>
                    数字先行模式：
                    {activePaintDigit ? (
                      <strong>已选【{activePaintDigit}】，点空格填入</strong>
                    ) : (
                      '轻点下方数字激活'
                    )}
                  </span>
                </span>
                {activePaintDigit && (
                  <button
                    onClick={() => setActivePaintDigit(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                  >
                    取消选择
                  </button>
                )}
              </div>
            )}

            <NumberPad
              numberCounts={numberCounts}
              selectedNumber={
                settings.fastInputMode && activePaintDigit !== null
                  ? activePaintDigit
                  : selectedCellValue
              }
              isNoteMode={isNoteMode}
              onNumberClick={handleInputNumber}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <VictoryModal
        isOpen={showVictoryModal}
        timeTaken={elapsedTime}
        difficulty={difficulty}
        gameMode={gameMode}
        dateStr={activeDateStr}
        mistakesCount={mistakesCount}
        hintsUsed={hintsUsed}
        isNewBest={isNewBestRecord}
        onPlayAgain={() => {
          setShowVictoryModal(false);
          initGame(difficulty, gameMode, true);
        }}
        onClose={() => setShowVictoryModal(false)}
      />

      <StatsModal
        isOpen={showStatsModal}
        stats={stats}
        initialTab={statsModalTab}
        onClose={() => setShowStatsModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        settings={settings}
        onUpdateSettings={updateSettings}
        onClose={() => setShowSettingsModal(false)}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Smart Hint Dialog */}
      <HintDialog
        hint={currentHint}
        onApply={handleApplyHint}
        onClose={() => setCurrentHint(null)}
        onOpenTechnique={handleOpenTechnique}
      />

      {/* Solving Techniques Encyclopedia Modal */}
      <TechniquesModal
        isOpen={showTechniquesModal}
        initialTechniqueId={selectedTechniqueId}
        onClose={() => setShowTechniquesModal(false)}
        onSelectForPractice={handlePracticeTechnique}
      />

      {/* Achievement Unlock Toast */}
      <AchievementToast
        achievements={unlockedAchievementsQueue}
        onClose={() => setUnlockedAchievementsQueue((q) => q.slice(1))}
        onViewAll={() => {
          setUnlockedAchievementsQueue([]);
          setStatsModalTab('achievements');
          setShowStatsModal(true);
        }}
      />
    </div>
  );
}

export default App;
