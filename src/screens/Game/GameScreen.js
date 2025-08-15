// File: src/screens/Game/GameScreen.js

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Button,
  AppState,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import { showInterstitial } from '../../components/InterstitialAd'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

import Board from '../../components/sudoku/SudokuBoard'
import NumberPad from '../../components/sudoku/NumberPad'
import HintButton from '../../components/sudoku/HintButton'
import UndoRedoControls from '../../components/sudoku/UndoRedoControls'

import { generateSudokuPuzzle } from '../../utils/SudokuGenerator'
import { findConflicts, isBoardSolved } from '../../utils/SudokuValidator'
import { useGameSettings } from '../../contexts/GameSettingsContext'
import { useUser } from '../../contexts/UserContext'
import { useTheme } from '../../contexts/ThemeContext'
import { completeDailyChallenge, calculateDailyChallengeReward, getDailyStreak } from '../../services/DailyChallengeService'
import { useFeedback } from '../../contexts/FeedbackContext'
import { saveGame, loadGame } from '../../services/GameStorageService'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'

const { width } = Dimensions.get('window')
const boardSize = width * 0.9
const numberPadWidth = width * 0.85

export default function GameScreen({ route, navigation }) {
  const { selectedDifficulty, dailyChallengeId, setDailyChallengeId } = useGameSettings()
  const { colors } = useTheme()
  const {
    cellSelectFeedback,
    numberPlaceFeedback,
    numberRemoveFeedback,
    errorFeedback,
    successFeedback,
    gameCompleteFeedback,
    buttonPressFeedback,
    hintUsedFeedback,
    undoFeedback,
    pauseFeedback,
    resumeFeedback
  } = useFeedback()
  
  const isDaily = route.params?.isDailyChallenge === true
  const dailyChallengeData = route.params?.dailyChallengeData

  // Game state
  const [gameId, setGameId] = useState(null)
  const [initialBoard, setInitialBoard] = useState([])
  const [currentBoard, setCurrentBoard] = useState([])
  const [solutionBoard, setSolutionBoard] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [conflictingCells, setConflictingCells] = useState(new Set())
  const [hintsRemaining, setHintsRemaining] = useState(3)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isGameActive, setIsGameActive] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [history, setHistory] = useState([])
  const [historyPointer, setHistoryPointer] = useState(-1)
  const [filledCount, setFilledCount] = useState(0)

  const appState = useRef(AppState.currentState)
  const timerRef = useRef(null)

  // Format mm:ss
  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // Initialize or resume puzzle
  const initializeGame = useCallback(async () => {
    if (isDaily && dailyChallengeData) {
      // Use daily challenge data
      const puzzle = dailyChallengeData.puzzle
      const solution = dailyChallengeData.solution
      
      setGameId(dailyChallengeData.id)
      setInitialBoard(puzzle)
      setCurrentBoard(puzzle.map(r => [...r]))
      setSolutionBoard(solution)
      setHintsRemaining(3)
      setTimeElapsed(0)
      setMoveCount(0)
      setHistory([puzzle.map(r => [...r])])
      setHistoryPointer(0)
      setIsGameActive(true)
      return
    }

    if (isDaily && dailyChallengeId) {
      const loaded = await loadGame(dailyChallengeId)
      if (loaded) {
        setGameId(loaded.id)
        setInitialBoard(loaded.initialBoard)
        setCurrentBoard(loaded.currentBoard)
        setSolutionBoard(loaded.solutionBoard)
        setHintsRemaining(loaded.hintsRemaining ?? 3)
        setTimeElapsed(loaded.timeElapsed ?? 0)
        setMoveCount(loaded.moveCount ?? 0)
        setHistory(loaded.history || [])
        setHistoryPointer(loaded.historyPointer ?? -1)
        setIsGameActive(true)
        resumeFeedback()
        return
      }
    }

    const newId = isDaily
      ? (dailyChallengeId || uuidv4())
      : uuidv4()

    const { puzzle, solution } = generateSudokuPuzzle(
      selectedDifficulty.cellsToRemove
    )

    if (isDaily) {
      setDailyChallengeId(newId)
    }

    setGameId(newId)
    setInitialBoard(puzzle)
    setCurrentBoard(puzzle.map(r => [...r]))
    setSolutionBoard(solution)
    setHintsRemaining(3)
    setTimeElapsed(0)
    setMoveCount(0)
    setHistory([puzzle.map(r => [...r])])
    setHistoryPointer(0)
    setIsGameActive(true)
    successFeedback()
  }, [
    isDaily,
    dailyChallengeId,
    selectedDifficulty,
    setDailyChallengeId,
    resumeFeedback,
    successFeedback
  ])

  // Count filled cells
  useEffect(() => {
    let cnt = 0
    currentBoard.forEach(row => row.forEach(v => v && cnt++))
    setFilledCount(cnt)
  }, [currentBoard])

  // On screen focus, init or resume
  useFocusEffect(useCallback(() => {
    initializeGame()
    return () => {
      setIsGameActive(false)
      clearInterval(timerRef.current)
    }
  }, [initializeGame]))

  // Show interstitial on focus
  useFocusEffect(useCallback(() => {
    showInterstitial()
  }, []))

  // Timer tick
  useEffect(() => {
    if (isGameActive) {
      timerRef.current = setInterval(() => setTimeElapsed(t => t + 1), 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isGameActive])

  // Auto‐save
  useEffect(() => {
    if (gameId && currentBoard.length === 9) {
      saveGame({
        id: gameId,
        initialBoard,
        currentBoard,
        solutionBoard,
        selectedDifficulty,
        hintsRemaining,
        timeElapsed,
        history,
        historyPointer
      })
    }
  }, [
    gameId,
    initialBoard,
    currentBoard,
    solutionBoard,
    selectedDifficulty,
    hintsRemaining,
    timeElapsed,
    history,
    historyPointer
  ])

  // Pause/resume on background
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') {
        setIsGameActive(true)
        resumeFeedback()
      } else {
        setIsGameActive(false)
        pauseFeedback()
      }
      appState.current = next
    })
    return () => sub.remove()
  }, [pauseFeedback, resumeFeedback])

  // Conflict & win detection
  useEffect(() => {
    if (currentBoard.length === 9) {
      const conf = findConflicts(currentBoard)
      setConflictingCells(conf)

      if (conf.size > 0) {
        errorFeedback()
        return
      }

      if (isBoardSolved(currentBoard)) {
        setIsGameActive(false)
        gameCompleteFeedback()
        
        if (isDaily && dailyChallengeData) {
          // Handle daily challenge completion
          handleDailyChallengeCompletion(currentBoard)
        } else {
          // Regular game completion
          Alert.alert(
            'Congratulations!',
            `Solved in ${formatTime(timeElapsed)}!`,
            [
              { text: 'New Game', onPress: initializeGame },
              { text: 'OK' }
            ]
          )
        }
      }
    }
  }, [currentBoard, timeElapsed])

  // Handle daily challenge completion
  const handleDailyChallengeCompletion = async (finalBoard) => {
    try {
      const { addTokens } = useUser()
      
      // Complete the daily challenge
      await completeDailyChallenge(dailyChallengeData, finalBoard, moveCount, timeElapsed * 1000)
      
      // Calculate rewards
      const rewards = calculateDailyChallengeReward(
        dailyChallengeData.difficulty,
        timeElapsed * 1000,
        moveCount,
        await getDailyStreak()
      )
      
      // Add tokens to user account
      addTokens(rewards.totalReward)
      
      // Show completion dialog with rewards
      Alert.alert(
        '🎉 Daily Challenge Complete!',
        `Solved in ${formatTime(timeElapsed)}!\n\n` +
        `🏆 Base Reward: ${rewards.baseReward} tokens\n` +
        `⚡ Time Bonus: ${rewards.timeBonus} tokens\n` +
        `🎯 Efficiency Bonus: ${rewards.efficiencyBonus} tokens\n` +
        `🔥 Streak Bonus: ${rewards.streakBonus} tokens\n\n` +
        `💰 Total Earned: ${rewards.totalReward} tokens!`,
        [
          { text: 'Awesome!', onPress: () => navigation.goBack() }
        ]
      )
    } catch (error) {
      console.error('Error completing daily challenge:', error)
      Alert.alert(
        'Congratulations!',
        `Daily challenge solved in ${formatTime(timeElapsed)}!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      )
    }
  }

  // History management
  const updateBoard = newBoard => {
    const slice = history.slice(0, historyPointer + 1)
    slice.push(newBoard)
    setHistory(slice)
    setHistoryPointer(slice.length - 1)
    setCurrentBoard(newBoard)
  }

  // Number pad handlers
  const onNumber = num => {
    if (!selectedCell) return
    const { row, col } = selectedCell
    if (initialBoard[row][col] === 0) {
      const nb = currentBoard.map(r => [...r])
      nb[row][col] = num
      updateBoard(nb)
      setMoveCount(prev => prev + 1)
      numberPlaceFeedback()
    }
  }

  const onClear = () => {
    if (!selectedCell) return
    const { row, col } = selectedCell
    if (initialBoard[row][col] === 0 && currentBoard[row][col] !== 0) {
      const nb = currentBoard.map(r => [...r])
      nb[row][col] = 0
      updateBoard(nb)
      numberRemoveFeedback()
    }
  }

  // Solve (disabled on daily)
  const onSolve = () => {
    if (isDaily) return
    buttonPressFeedback()
    Alert.alert(
      'Solve Puzzle?',
      'This will fill in all answers.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setIsGameActive(true) },
        {
          text: 'Solve', onPress: () => {
            setCurrentBoard(solutionBoard.map(r => [...r]))
            setSelectedCell(null)
            setHistory([solutionBoard.map(r => [...r])])
            setHistoryPointer(0)
            gameCompleteFeedback()
          }
        }
      ]
    )
  }

  // Hint / undo / redo / select
  const onHint = () => {
    if (hintsRemaining <= 0) {
      errorFeedback()
      return Alert.alert('No Hints Left', 'Visit the store to get more!')
    }
    let empty = null
    for (let r = 0; r < 9 && !empty; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) {
          empty = { row: r, col: c }
          break
        }
      }
    }
    if (empty) {
      const { row, col } = empty
      const val = solutionBoard[row][col]
      const nb = currentBoard.map(r => [...r])
      nb[row][col] = val
      updateBoard(nb)
      setHintsRemaining(h => h - 1)
      setSelectedCell(null)
      hintUsedFeedback()
      Alert.alert('Hint Used', `Cell (${row+1},${col+1}) = ${val}`)
    } else {
      successFeedback()
      Alert.alert('Done', 'No empty cells remain.')
    }
  }

  const onUndo = () => {
    if (historyPointer > 0) {
      const p = historyPointer - 1
      setHistoryPointer(p)
      setCurrentBoard(history[p])
      undoFeedback()
    }
  }

  const onRedo = () => {
    if (historyPointer < history.length - 1) {
      const p = historyPointer + 1
      setHistoryPointer(p)
      setCurrentBoard(history[p])
      undoFeedback()
    }
  }

  const onSelect = (r, c) => {
    if (initialBoard[r][c] === 0) {
      setSelectedCell({ row: r, col: c })
      cellSelectFeedback()
    } else {
      setSelectedCell(null)
      errorFeedback()
    }
  }

  // Back button with interstitial
  const onBack = () => {
    buttonPressFeedback()
    showInterstitial()
    navigation.navigate('MainTabs', { screen: 'Home' })
  }

  // Store button handler
  const onStore = () => {
    buttonPressFeedback()
    navigation.navigate('MainTabs', { screen: 'Store' })
  }

  // Loading placeholder
  if (currentBoard.length < 9) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading…</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}> 
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color={colors.accent}/>
          <Text style={[styles.headerButtonText, { color: colors.accent }]}>Home</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Sudoku</Text>
        <TouchableOpacity onPress={onStore} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: colors.accent }]}>
            Store
          </Text>
          <Ionicons name="chevron-forward" size={24} color={colors.accent}/>
        </TouchableOpacity>
      </View>

      {/* Difficulty Label */}
      <Text style={[styles.title, { color: colors.text }]}>
        {selectedDifficulty.name}
      </Text>

      {/* Timer & Progress */}
      <View style={styles.statsContainer}>
        <Text style={[styles.timerText, { color: colors.text }]}>
          {formatTime(timeElapsed)}
        </Text>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {filledCount} / 81
        </Text>
      </View>

      {/* Board */}
      <Board
        boardData={currentBoard}
        initialBoard={initialBoard}
        selectedCell={selectedCell}
        onCellSelect={onSelect}
        conflictingCells={conflictingCells}
        boardSize={boardSize}
      />

      {/* Number Pad */}
      <NumberPad
        onNumberPress={onNumber}
        onClearPress={onClear}
        numberPadWidth={numberPadWidth}
      />

      {/* Bottom Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Solve"
            onPress={onSolve}
            color={colors.accent}
            disabled={isDaily}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <HintButton
            onPress={onHint}
            disabled={hintsRemaining <= 0}
            color={colors.accent}
          />
        </View>
      </View>

      {/* Undo/Redo */}
      <UndoRedoControls
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={historyPointer > 0}
        canRedo={historyPointer < history.length - 1}
        color={colors.accent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingHorizontal: 5, paddingTop: 70, paddingBottom: 30 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10
  },
  headerButton: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  headerButtonText: { fontSize: 16, marginHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  loadingText: { fontSize: 18, marginTop: 50 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginBottom: 15 },
  timerText: { fontSize: 18, fontWeight: '600' },
  progressText: { fontSize: 15 },
  bottomButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, marginBottom: 15, width: '95%' },
  buttonWrapper: { flex: 1, marginHorizontal: 5 }
})
