import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Button, AppState, Dimensions, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Board from '../../components/sudoku/Board';
import NumberPad from '../../components/sudoku/NumberPad';
import { generateSudokuPuzzle } from '../../utils/SudokuGenerator';
import { findConflicts, isBoardSolved } from '../../utils/SudokuValidator';
import { useGameSettings } from '../../contexts/GameSettingsContext';
import { saveGame, loadGame } from '../../services/GameStorageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { COLORS } from '../../constants/colors';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');
const boardSize = width * 0.9; // 90% of screen width for the board
const numberPadWidth = width * 0.85; // 85% of screen width for number pad

const GameScreen = ({ route, navigation }) => {
  const { selectedDifficulty } = useGameSettings();
  const [gameId, setGameId] = useState(null);
  const [initialBoard, setInitialBoard] = useState([]);
  const [currentBoard, setCurrentBoard] = useState([]);
  const [solutionBoard, setSolutionBoard] = useState([]);
  const [selectedCell, setSelectedCell] = useState(null);
  const [conflictingCells, setConflictingCells] = useState(new Set());
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);

  // Undo/Redo states
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);

  // Progress state
  const [filledCellsCount, setFilledCellsCount] = useState(0);

  const appState = useRef(AppState.currentState);
  const timerRef = useRef(null);

  // Helper function to format time
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Function to initialize game (new or loaded)
  const initializeGame = useCallback(async () => {
    const gameToLoadId = route.params?.gameId;
    console.log(`[initializeGame] Attempting to initialize game. gameToLoadId: ${gameToLoadId}`);

    if (gameToLoadId) {
      const loadedGame = await loadGame(gameToLoadId);
      if (loadedGame) {
        setGameId(loadedGame.id);
        setInitialBoard(loadedGame.initialBoard);
        setCurrentBoard(loadedGame.currentBoard);
        setSolutionBoard(loadedGame.solutionBoard);
        setHintsRemaining(loadedGame.hintsRemaining !== undefined ? loadedGame.hintsRemaining : 3);
        setTimeElapsed(loadedGame.timeElapsed !== undefined ? loadedGame.timeElapsed : 0);
        setHistory(loadedGame.history || []);
        setHistoryPointer(loadedGame.historyPointer !== undefined ? loadedGame.historyPointer : -1);

        const isLoadedGameSolved = isBoardSolved(loadedGame.currentBoard) && findConflicts(loadedGame.currentBoard).size === 0;

        setTimeout(() => {
          setIsGameActive(!isLoadedGameSolved);
          console.log(`[initializeGame] Game ${loadedGame.id} loaded. isGameActive set to: ${!isLoadedGameSolved} (deferred)`);
        }, 100);
      } else {
        console.warn(`Game ${gameToLoadId} not found. Starting new game.`);
        startNewGame();
      }
    } else {
      console.log('[initializeGame] No gameId in params. Starting new game.');
      startNewGame();
    }
  }, [route.params?.gameId, selectedDifficulty]);

  // Function to generate a brand new game
  const startNewGame = useCallback(() => {
    const newGameId = uuidv4();
    const { puzzle, solution } = generateSudokuPuzzle(selectedDifficulty.cellsToRemove);
    setGameId(newGameId);
    setInitialBoard(puzzle);
    setCurrentBoard(puzzle.map(row => [...row]));
    setSolutionBoard(solution);
    setConflictingCells(new Set());
    setSelectedCell(null);
    setHintsRemaining(3);
    setTimeElapsed(0);
    setIsGameActive(true);
    setHistory([puzzle.map(row => [...row])]);
    setHistoryPointer(0);
    console.log(`[startNewGame] New game started. isGameActive set to: true`);
  }, [selectedDifficulty]);

  // Effect to calculate filled cells
  useEffect(() => {
    if (currentBoard.length > 0) {
      let count = 0;
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (currentBoard[r][c] !== 0) {
            count++;
          }
        }
      }
      setFilledCellsCount(count);
    }
  }, [currentBoard]);

  // Use useFocusEffect to initialize game whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('[useFocusEffect] GameScreen focused. Initializing game...');
      initializeGame();
      return () => {
        console.log('[useFocusEffect Cleanup] GameScreen unfocused. Stopping timer.');
        setIsGameActive(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [initializeGame])
  );

  // Effect to manage the timer
  useEffect(() => {
    console.log(`[useEffect - Timer] isGameActive changed to: ${isGameActive}`);
    if (isGameActive) {
      console.log('[useEffect - Timer] Starting interval...');
      timerRef.current = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    } else {
      console.log('[useEffect - Timer] Stopping interval...');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      console.log('[useEffect - Timer Cleanup] Clearing interval on unmount/re-run.');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGameActive]);

  // Effect to save game state whenever relevant state changes
  useEffect(() => {
    if (gameId && currentBoard.length > 0) {
      const gameState = {
        id: gameId,
        initialBoard,
        currentBoard,
        solutionBoard,
        selectedDifficulty,
        hintsRemaining,
        timeElapsed,
        history,
        historyPointer,
      };
      saveGame(gameState);
    }
  }, [currentBoard, gameId, initialBoard, solutionBoard, selectedDifficulty, hintsRemaining, timeElapsed, history, historyPointer]);

  // Effect to handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground! Resuming timer.');
        if (!(isBoardSolved(currentBoard) && findConflicts(currentBoard).size === 0)) {
          setIsGameActive(true);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background! Pausing timer.');
        setIsGameActive(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      console.log('[useEffect - AppState Cleanup] Removing AppState listener.');
      if (gameId && currentBoard.length > 0) {
        const gameState = {
          id: gameId,
          initialBoard,
          currentBoard,
          solutionBoard,
          selectedDifficulty,
          hintsRemaining,
          timeElapsed,
          history,
          historyPointer,
        };
        saveGame(gameState);
      }
      subscription.remove();
    };
  }, [gameId, currentBoard, initialBoard, solutionBoard, selectedDifficulty, hintsRemaining, timeElapsed, history, historyPointer]);

  // Effect to check for conflicts and win condition
  useEffect(() => {
    if (currentBoard.length > 0) {
      const conflicts = findConflicts(currentBoard);
      setConflictingCells(conflicts);

      if (conflicts.size === 0 && isBoardSolved(currentBoard)) {
        console.log('[useEffect - Win Condition] Game solved! Stopping timer.');
        setIsGameActive(false);
        Alert.alert("Congratulations!", `You solved the Sudoku in ${formatTime(timeElapsed)}!`, [
          { text: "New Game", onPress: startNewGame },
          { text: "OK" }
        ]);
      }
    }
  }, [currentBoard, timeElapsed]);

  // Function to update board and history
  const updateBoardAndHistory = (newBoard) => {
    const newHistory = history.slice(0, historyPointer + 1);
    newHistory.push(newBoard);
    setHistory(newHistory);
    setHistoryPointer(newHistory.length - 1);
    setCurrentBoard(newBoard);
  };

  const handleNumberPress = (num) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (initialBoard[row][col] === 0) {
        const newBoard = currentBoard.map(r => [...r]);
        newBoard[row][col] = num;
        updateBoardAndHistory(newBoard);
      }
    }
  };

  const handleClearPress = () => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      if (initialBoard[row][col] === 0) {
        const newBoard = currentBoard.map(r => [...r]);
        newBoard[row][col] = 0;
        updateBoardAndHistory(newBoard);
      }
    }
  };

  const handleSolvePress = () => {
    console.log('[handleSolvePress] Solving puzzle. Stopping timer.');
    setIsGameActive(false);
    Alert.alert(
      "Solve Puzzle?",
      "Are you sure you want to solve the puzzle? This will fill in all the correct numbers.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            console.log('[handleSolvePress] Solve cancelled. Resuming timer.');
            if (!(isBoardSolved(currentBoard) && findConflicts(currentBoard).size === 0)) {
              setIsGameActive(true);
            }
          }
        },
        {
          text: "Solve",
          onPress: () => {
            setCurrentBoard(solutionBoard.map(row => [...row]));
            setSelectedCell(null);
            setHistory([solutionBoard.map(row => [...row])]);
            setHistoryPointer(0);
          }
        }
      ]
    );
  };

  const handleHintPress = () => {
    if (hintsRemaining <= 0) {
      Alert.alert("No Hints Left", "You have used all your hints. Visit the store to get more!");
      return;
    }

    let emptyCell = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCell = { row: r, col: c };
          break;
        }
      }
      if (emptyCell) break;
    }

    if (emptyCell) {
      const { row, col } = emptyCell;
      const correctValue = solutionBoard[row][col];

      const newBoard = currentBoard.map(r => [...r]);
      newBoard[row][col] = correctValue;
      updateBoardAndHistory(newBoard);
      setHintsRemaining(hintsRemaining - 1);
      setSelectedCell(null);
      Alert.alert("Hint Used!", `The correct number for (${row + 1}, ${col + 1}) is ${correctValue}.`);
    } else {
      Alert.alert("Puzzle Complete!", "There are no empty cells to provide a hint for.");
    }
  };

  // Undo function
  const handleUndoPress = () => {
    if (historyPointer > 0) {
      const newPointer = historyPointer - 1;
      setHistoryPointer(newPointer);
      setCurrentBoard(history[newPointer]);
    }
  };

  // Redo function
  const handleRedoPress = () => {
    if (historyPointer < history.length - 1) {
      const newPointer = historyPointer + 1;
      setHistoryPointer(newPointer);
      setCurrentBoard(history[newPointer]);
    }
  };

  const handleCellSelect = (row, col) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    } else {
      setSelectedCell(null);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
  navigation.navigate('MainTabs', { screen: 'Home' });
};

  if (currentBoard.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading Sudoku...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="chevron-back" size={24} color={COLORS.interactive} />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sudoku Game</Text>
      </View>

      <Text style={styles.title}>Current Sudoku Puzzle ({selectedDifficulty.name})</Text>
      
      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <Text style={styles.timerText}>Time: {formatTime(timeElapsed)}</Text>
        <Text style={styles.progressText}>Filled: {filledCellsCount} / 81</Text>
      </View>
      
      <Board
        boardData={currentBoard}
        initialBoard={initialBoard}
        selectedCell={selectedCell}
        onCellSelect={handleCellSelect}
        conflictingCells={conflictingCells}
        boardSize={boardSize}
      />
      
      <NumberPad
        onNumberPress={handleNumberPress}
        onClearPress={handleClearPress}
        numberPadWidth={numberPadWidth}
      />
      
      <View style={styles.bottomButtonsContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Solve Puzzle" onPress={handleSolvePress} color={COLORS.buttonPrimary} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title={`Hint (${hintsRemaining})`} onPress={handleHintPress} color={COLORS.buttonPrimary} />
        </View>
      </View>
      
      {/* Undo/Redo Buttons - Fixed positioning */}
      <View style={styles.undoRedoContainer}>
        <Button
          title="Undo"
          onPress={handleUndoPress}
          disabled={historyPointer <= 0}
          color={COLORS.buttonPrimary}
        />
        <Button
          title="Redo"
          onPress={handleRedoPress}
          disabled={historyPointer >= history.length - 1}
          color={COLORS.buttonPrimary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 5,
    paddingTop: 70, // Space for status bar
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.interactive,
    marginLeft: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginRight: 60, // Offset for back button to center the title
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 15,
  },
  timerText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  progressText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 15,
    width: '95%',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  undoRedoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: 10,
  },
});

export default GameScreen;

