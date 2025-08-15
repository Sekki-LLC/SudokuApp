// File: src/services/DailyChallengeService.js

import AsyncStorage from '@react-native-async-storage/async-storage'
import { generateSudokuPuzzle } from '../utils/SudokuGenerator'
import { difficultyLevels } from '../contexts/GameSettingsContext'

const DAILY_CHALLENGE_DATA_KEY = '@sudokuapp:dailyChallengeData'
const DAILY_STREAK_KEY = '@sudokuapp:dailyStreak'
const LAST_COMPLETED_DATE_KEY = '@sudokuapp:lastCompletedDate'

// Generate a deterministic puzzle based on date
export function generateDailyPuzzle(date = new Date()) {
  // Create a seed based on the date (YYYY-MM-DD format)
  const dateString = date.toISOString().split('T')[0]
  const seed = dateString.split('-').join('')
  
  // Use date as seed for consistent daily puzzles
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
  const difficultyIndex = dayOfYear % difficultyLevels.length
  const difficulty = difficultyLevels[difficultyIndex]
  
  // Generate puzzle with deterministic seed
const puzzle = generateSudokuPuzzle(difficulty.cellsToRemove)
  
  return {
    id: `daily-${dateString}`,
    date: dateString,
    puzzle: puzzle.puzzle,
    solution: puzzle.solution,
    difficulty: difficulty,
    completed: false,
    startTime: null,
    endTime: null,
    moves: 0
  }
}

// Get today's daily challenge
export async function getTodaysDailyChallenge() {
  try {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    // Check if we have today's challenge stored
    const storedData = await AsyncStorage.getItem(DAILY_CHALLENGE_DATA_KEY)
    let dailyData = storedData ? JSON.parse(storedData) : {}
    
    // If we don't have today's challenge or it's from a different day, generate new one
    if (!dailyData[todayString]) {
      dailyData[todayString] = generateDailyPuzzle(today)
      await AsyncStorage.setItem(DAILY_CHALLENGE_DATA_KEY, JSON.stringify(dailyData))
    }
    
    return dailyData[todayString]
  } catch (error) {
    console.error('Error getting daily challenge:', error)
    // Fallback to generating a new puzzle
    return generateDailyPuzzle()
  }
}

// Mark daily challenge as completed
export async function completeDailyChallenge(challengeData, finalBoard, moves, timeElapsed) {
  try {
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    // Update challenge data
    const updatedChallenge = {
      ...challengeData,
      completed: true,
      endTime: Date.now(),
      moves: moves,
      timeElapsed: timeElapsed,
      finalBoard: finalBoard
    }
    
    // Store updated challenge
    const storedData = await AsyncStorage.getItem(DAILY_CHALLENGE_DATA_KEY)
    let dailyData = storedData ? JSON.parse(storedData) : {}
    dailyData[todayString] = updatedChallenge
    await AsyncStorage.setItem(DAILY_CHALLENGE_DATA_KEY, JSON.stringify(dailyData))
    
    // Update streak
    await updateDailyStreak(todayString)
    
    return updatedChallenge
  } catch (error) {
    console.error('Error completing daily challenge:', error)
    throw error
  }
}

// Update daily streak
async function updateDailyStreak(completedDate) {
  try {
    const lastCompletedDate = await AsyncStorage.getItem(LAST_COMPLETED_DATE_KEY)
    const currentStreak = await getDailyStreak()
    
    let newStreak = 1
    
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate)
      const currentDate = new Date(completedDate)
      const daysDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = currentStreak + 1
      } else if (daysDiff === 0) {
        // Same day (shouldn't happen, but handle it)
        newStreak = currentStreak
      } else {
        // Streak broken
        newStreak = 1
      }
    }
    
    await AsyncStorage.setItem(DAILY_STREAK_KEY, newStreak.toString())
    await AsyncStorage.setItem(LAST_COMPLETED_DATE_KEY, completedDate)
    
    return newStreak
  } catch (error) {
    console.error('Error updating daily streak:', error)
    return 1
  }
}

// Get current daily streak
export async function getDailyStreak() {
  try {
    const streak = await AsyncStorage.getItem(DAILY_STREAK_KEY)
    return streak ? parseInt(streak, 10) : 0
  } catch (error) {
    console.error('Error getting daily streak:', error)
    return 0
  }
}

// Check if daily challenge is available (not completed today)
export async function isDailyChallengeAvailable() {
  try {
    const todayChallenge = await getTodaysDailyChallenge()
    return !todayChallenge.completed
  } catch (error) {
    console.error('Error checking daily challenge availability:', error)
    return true
  }
}

// Get time until next daily challenge (midnight)
export function getTimeUntilNextChallenge() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  
  const timeUntilMidnight = tomorrow.getTime() - now.getTime()
  
  const hours = Math.floor(timeUntilMidnight / (1000 * 60 * 60))
  const minutes = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeUntilMidnight % (1000 * 60)) / 1000)
  
  return {
    hours,
    minutes,
    seconds,
    totalMs: timeUntilMidnight
  }
}

// Calculate daily challenge rewards
export function calculateDailyChallengeReward(difficulty, timeElapsed, moves, streak) {
  let baseReward = 50 // Base tokens for completing daily challenge
  
  // Difficulty bonus
  const difficultyMultiplier = {
    'Very Easy': 1.0,
    'Easy': 1.2,
    'Medium': 1.5,
    'Hard': 2.0,
    'Very Hard': 2.5
  }
  
  baseReward *= (difficultyMultiplier[difficulty.name] || 1.0)
  
  // Time bonus (faster completion = more tokens)
  const timeBonus = Math.max(0, 300 - Math.floor(timeElapsed / 1000)) // Up to 5 minutes for max bonus
  
  // Efficiency bonus (fewer moves = more tokens)
  const efficiencyBonus = Math.max(0, 200 - moves)
  
  // Streak bonus
  const streakBonus = Math.min(streak * 10, 100) // Up to 100 bonus tokens for 10+ day streak
  
  const totalReward = Math.floor(baseReward + timeBonus + efficiencyBonus + streakBonus)
  
  return {
    baseReward: Math.floor(baseReward),
    timeBonus,
    efficiencyBonus,
    streakBonus,
    totalReward
  }
}

// Clean up old daily challenge data (keep last 30 days)
export async function cleanupOldChallenges() {
  try {
    const storedData = await AsyncStorage.getItem(DAILY_CHALLENGE_DATA_KEY)
    if (!storedData) return
    
    const dailyData = JSON.parse(storedData)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const cleanedData = {}
    Object.keys(dailyData).forEach(dateString => {
      const challengeDate = new Date(dateString)
      if (challengeDate >= thirtyDaysAgo) {
        cleanedData[dateString] = dailyData[dateString]
      }
    })
    
    await AsyncStorage.setItem(DAILY_CHALLENGE_DATA_KEY, JSON.stringify(cleanedData))
  } catch (error) {
    console.error('Error cleaning up old challenges:', error)
  }
}
