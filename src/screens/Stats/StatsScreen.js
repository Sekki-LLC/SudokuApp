// File: src/screens/Stats/StatsScreen.js

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { loadAllGames } from '../../services/GameStorageService'
import { format } from 'date-fns'
import { useTheme } from '../../contexts/ThemeContext'

export default function StatsScreen() {
  const { colors } = useTheme()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  // Helper to format seconds -> MM:SS
  const formatTime = totalSeconds => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  // Your existing calculation, extracted so it can be invoked inside an inner async
  const calculateStats = useCallback(async () => {
    const allGames = await loadAllGames()

    // Initialize counters
    let totalGamesPlayed = 0
    let gamesWon         = 0
    let gamesAbandoned   = 0
    let totalTimePlayed  = 0
    let totalHintsUsed   = 0
    const winsByDifficulty     = {}
    const avgTimeByDifficulty  = {}
    const bestTimeByDifficulty = {}

    // Determine difficulty buckets
    const defaultDiffs = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']
    const extraDiffs   = Array.from(
      new Set(
        allGames.map(g => g.selectedDifficulty?.name).filter(Boolean)
      )
    )
    const diffs = Array.from(new Set([...defaultDiffs, ...extraDiffs]))

    // Initialize per-difficulty stats
    diffs.forEach(d => {
      winsByDifficulty[d]     = 0
      avgTimeByDifficulty[d]  = { total: 0, count: 0 }
      bestTimeByDifficulty[d] = Infinity
    })

    // Accumulate
    allGames.forEach(game => {
      totalGamesPlayed++
      const t = game.timeElapsed || 0
      const hintsUsed = game.hintsRemaining != null
        ? 3 - game.hintsRemaining
        : 0

      totalTimePlayed += t
      totalHintsUsed   += hintsUsed

      if (game.isWon) {
        gamesWon++
        const d = game.selectedDifficulty?.name || 'Unknown'
        winsByDifficulty[d]++
        avgTimeByDifficulty[d].total += t
        avgTimeByDifficulty[d].count++
        if (t < bestTimeByDifficulty[d]) bestTimeByDifficulty[d] = t
      } else if (game.isAbandoned) {
        gamesAbandoned++
      }
    })

    // Compute averages & best times
    const finalAvg  = {}
    const finalBest = {}
    diffs.forEach(d => {
      finalAvg[d]  = avgTimeByDifficulty[d].count
        ? formatTime(
            Math.round(avgTimeByDifficulty[d].total / avgTimeByDifficulty[d].count)
          )
        : 'N/A'
      finalBest[d] = bestTimeByDifficulty[d] < Infinity
        ? formatTime(bestTimeByDifficulty[d])
        : 'N/A'
    })

    // Update state
    setStats({
      totalGamesPlayed,
      gamesWon,
      gamesAbandoned,
      winRate: totalGamesPlayed
        ? ((gamesWon / totalGamesPlayed) * 100).toFixed(1)
        : '0.0',
      totalTimePlayed: formatTime(totalTimePlayed),
      totalHintsUsed,
      winsByDifficulty,
      avgTimeByDifficulty: finalAvg,
      bestTimeByDifficulty: finalBest,
      difficulties: diffs
    })
  }, [])

  // Wrap the async call in a sync callback for useFocusEffect
  useFocusEffect(
    useCallback(() => {
      let isActive = true

      setLoading(true)
      // Inner async runner
      const run = async () => {
        await calculateStats()
        if (isActive) setLoading(false)
      }

      run()

      // Cleanup toggles `isActive` to cancel any pending setState
      return () => { isActive = false }
    }, [calculateStats])
  )

  if (loading || !stats) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Calculating stats...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={[styles.header, { color: colors.text }]}>
          Your Sudoku Stats
        </Text>

        {/* Overall Performance */}
        <View style={[styles.card, { backgroundColor: colors.white }]}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.text, borderBottomColor: colors.accent }
            ]}
          >
            Overall Performance
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Games Played: <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalGamesPlayed}</Text>
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Games Won: <Text style={[styles.statValue, { color: colors.text }]}>{stats.gamesWon}</Text>
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Games Abandoned: <Text style={[styles.statValue, { color: colors.text }]}>{stats.gamesAbandoned}</Text>
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Win Rate: <Text style={[styles.statValue, { color: colors.text }]}>{stats.winRate}%</Text>
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Total Time Played: <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalTimePlayed}</Text>
          </Text>
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            Total Hints Used: <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalHintsUsed}</Text>
          </Text>
        </View>

        {/* Performance by Difficulty */}
        <View style={[styles.card, { backgroundColor: colors.white }]}>
          <Text
            style={[
              styles.cardTitle,
              { color: colors.text, borderBottomColor: colors.accent }
            ]}
          >
            Performance by Difficulty
          </Text>
          {stats.difficulties.map(diff => (
            <View
              key={diff}
              style={[styles.diffRow, { borderLeftColor: colors.accent }]}
            >
              <Text style={[styles.diffName, { color: colors.text }]}>{diff}:</Text>
              <View style={styles.diffValues}>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  Wins: <Text style={[styles.statValue, { color: colors.text }]}>{stats.winsByDifficulty[diff]}</Text>
                </Text>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  Avg Time: <Text style={[styles.statValue, { color: colors.text }]}>{stats.avgTimeByDifficulty[diff]}</Text>
                </Text>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  Best Time: <Text style={[styles.statValue, { color: colors.text }]}>{stats.bestTimeByDifficulty[diff]}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {stats.totalGamesPlayed === 0 && (
          <Text style={[styles.noStats, { color: colors.textSecondary }]}>
            Play some games to see your stats here!
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center'
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5
  },
  statText: {
    fontSize: 16,
    marginBottom: 5
  },
  statValue: {
    fontWeight: 'bold'
  },
  diffRow: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2
  },
  diffName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  diffValues: {
    paddingLeft: 10
  },
  noStats: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50
  }
})
