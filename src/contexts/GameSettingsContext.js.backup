// File: src/contexts/GameSettingsContext.js

import React, { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Difficulty levels
export const difficultyLevels = [
  { name: 'Very Easy', cellsToRemove: 30, color: '#4CAF50' },
  { name: 'Easy',      cellsToRemove: 40, color: '#8BC34A' },
  { name: 'Medium',    cellsToRemove: 50, color: '#FFC107' },
  { name: 'Hard',      cellsToRemove: 60, color: '#FF9800' },
  { name: 'Very Hard', cellsToRemove: 70, color: '#F44336' },
]

// Storage keys
const DIFFICULTY_STORAGE_KEY         = '@sudokuapp:selectedDifficulty'
const DAILY_CHALLENGE_ID_STORAGE_KEY = '@sudokuapp:dailyChallengeId'
const DAILY_CHALLENGE_COMPLETE_KEY   = '@sudokuapp:dailyChallengeComplete'

const GameSettingsContext = createContext({
  selectedDifficulty: difficultyLevels[2],       // Medium by default
  setSelectedDifficulty: () => {},

  dailyChallengeId: null,
  setDailyChallengeId: () => {},

  isDailyChallengeComplete: false,
  setDailyChallengeComplete: () => {}
})

export function GameSettingsProvider({ children }) {
  const [selectedDifficulty, setSelectedDifficultyState] = useState(
    difficultyLevels.find(d => d.name === 'Medium')
  )
  const [dailyChallengeId,   setDailyChallengeIdState]  = useState(null)
  const [isDailyChallengeComplete, setDailyCompleteState] = useState(false)

  // Load persisted settings on mount
  useEffect(() => {
    async function loadAll() {
      try {
        const [
          savedDiffName,
          savedDailyId,
          savedComplete
        ] = await Promise.all([
          AsyncStorage.getItem(DIFFICULTY_STORAGE_KEY),
          AsyncStorage.getItem(DAILY_CHALLENGE_ID_STORAGE_KEY),
          AsyncStorage.getItem(DAILY_CHALLENGE_COMPLETE_KEY)
        ])

        if (savedDiffName) {
          const match = difficultyLevels.find(d => d.name === savedDiffName)
          if (match) setSelectedDifficultyState(match)
        }
        if (savedDailyId) {
          setDailyChallengeIdState(savedDailyId)
        }
        if (savedComplete !== null) {
          setDailyCompleteState(savedComplete === 'true')
        }
      } catch (err) {
        console.warn('GameSettingsContext loadAll error', err)
      }
    }
    loadAll()
  }, [])

  // Persist difficulty
  const setSelectedDifficulty = async diff => {
    try {
      setSelectedDifficultyState(diff)
      await AsyncStorage.setItem(DIFFICULTY_STORAGE_KEY, diff.name)
    } catch (err) {
      console.warn('Failed saving difficulty', err)
    }
  }

  // Persist challenge ID
  const setDailyChallengeId = async id => {
    try {
      setDailyChallengeIdState(id)
      if (id === null) {
        await AsyncStorage.removeItem(DAILY_CHALLENGE_ID_STORAGE_KEY)
      } else {
        await AsyncStorage.setItem(DAILY_CHALLENGE_ID_STORAGE_KEY, id)
      }
    } catch (err) {
      console.warn('Failed saving dailyChallengeId', err)
    }
  }

  // Persist completion flag
  const setDailyChallengeComplete = async flag => {
    try {
      setDailyCompleteState(flag)
      await AsyncStorage.setItem(DAILY_CHALLENGE_COMPLETE_KEY, flag ? 'true' : 'false')
    } catch (err) {
      console.warn('Failed saving dailyChallengeComplete', err)
    }
  }

  return (
    <GameSettingsContext.Provider
      value={{
        selectedDifficulty,
        setSelectedDifficulty,
        dailyChallengeId,
        setDailyChallengeId,
        isDailyChallengeComplete,
        setDailyChallengeComplete
      }}
    >
      {children}
    </GameSettingsContext.Provider>
  )
}

export function useGameSettings() {
  const ctx = useContext(GameSettingsContext)
  if (!ctx) {
    throw new Error('useGameSettings must be used within a GameSettingsProvider')
  }
  return ctx
}
