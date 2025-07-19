// src/services/StatsService.js
import AsyncStorage from '@react-native-async-storage/async-storage'

const STATS_KEY = '@sudokuapp:userStats'

export async function loadStats() {
  const json = await AsyncStorage.getItem(STATS_KEY)
  return json ? JSON.parse(json) : { completed: 0, fastCompletes: 0, streak: 0, noHintCount: 0 }
}

export async function saveStats(stats) {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

// call saveStats whenever a puzzle finishes, updating completed++, maybe fastCompletes++ if time under threshold, etc.
