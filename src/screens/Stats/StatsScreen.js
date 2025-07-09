import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadAllGames } from '../../services/GameStorageService';
import { COLORS } from '../../constants/colors';

const StatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const calculateStats = useCallback(async () => {
    setLoading(true);
    const allGames = await loadAllGames();

    let totalGamesPlayed = 0;
    let gamesWon = 0;
    let gamesAbandoned = 0;
    let totalTimePlayed = 0;
    let totalHintsUsed = 0;
    const winsByDifficulty = {};
    const avgTimeByDifficulty = {};
    const bestTimeByDifficulty = {};

    const allDifficultyNames = Array.from(new Set(allGames.map(game => game.selectedDifficulty?.name).filter(Boolean)));
    const defaultDifficultyNames = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    const difficultiesToProcess = Array.from(new Set([...defaultDifficultyNames, ...allDifficultyNames]));

    difficultiesToProcess.forEach(diff => {
      winsByDifficulty[diff] = 0;
      avgTimeByDifficulty[diff] = { total: 0, count: 0 };
      bestTimeByDifficulty[diff] = Infinity;
    });

    allGames.forEach(game => {
      const isWon = game.isWon === true;
      const isAbandoned = game.isAbandoned === true;
      const timeElapsed = game.timeElapsed || 0;
      const hintsUsed = game.hintsRemaining !== undefined ? (3 - game.hintsRemaining) : 0;

      totalGamesPlayed++;
      totalTimePlayed += timeElapsed;

      if (isWon) {
        gamesWon++;
        const diffName = game.selectedDifficulty?.name || 'Unknown';
        if (winsByDifficulty[diffName] !== undefined) {
          winsByDifficulty[diffName]++;
        }

        if (avgTimeByDifficulty[diffName]) {
          avgTimeByDifficulty[diffName].total += timeElapsed;
          avgTimeByDifficulty[diffName].count++;
        }

        if (timeElapsed < bestTimeByDifficulty[diffName]) {
          bestTimeByDifficulty[diffName] = timeElapsed;
        }
      } else if (isAbandoned) {
        gamesAbandoned++;
      }
      totalHintsUsed += hintsUsed;
    });

    const finalAvgTimeByDifficulty = {};
    const finalBestTimeByDifficulty = {};

    difficultiesToProcess.forEach(diff => {
      if (avgTimeByDifficulty[diff].count > 0) {
        finalAvgTimeByDifficulty[diff] = formatTime(Math.round(avgTimeByDifficulty[diff].total / avgTimeByDifficulty[diff].count));
      } else {
        finalAvgTimeByDifficulty[diff] = 'N/A';
      }
      finalBestTimeByDifficulty[diff] = bestTimeByDifficulty[diff] === Infinity ? 'N/A' : formatTime(bestTimeByDifficulty[diff]);
    });

    setStats({
      totalGamesPlayed,
      gamesWon,
      gamesAbandoned,
      winRate: totalGamesPlayed > 0 ? ((gamesWon / totalGamesPlayed) * 100).toFixed(1) : 0,
      totalTimePlayed: formatTime(totalTimePlayed),
      totalHintsUsed,
      winsByDifficulty,
      avgTimeByDifficulty: finalAvgTimeByDifficulty,
      bestTimeByDifficulty: finalBestTimeByDifficulty,
      difficultiesToProcess,
    });
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      calculateStats();
      return () => {};
    }, [calculateStats])
  );

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.interactive} />
          <Text style={styles.loadingText}>Calculating stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Your Sudoku Stats</Text>

        <View style={styles.statCard}>
          <Text style={styles.cardTitle}>Overall Performance</Text>
          <Text style={styles.statText}>Games Played: <Text style={styles.statValue}>{stats.totalGamesPlayed}</Text></Text>
          <Text style={styles.statText}>Games Won: <Text style={styles.statValue}>{stats.gamesWon}</Text></Text>
          <Text style={styles.statText}>Games Abandoned: <Text style={styles.statValue}>{stats.gamesAbandoned}</Text></Text>
          <Text style={styles.statText}>Win Rate: <Text style={styles.statValue}>{stats.winRate}%</Text></Text>
          <Text style={styles.statText}>Total Time Played: <Text style={styles.statValue}>{stats.totalTimePlayed}</Text></Text>
          <Text style={styles.statText}>Total Hints Used: <Text style={styles.statValue}>{stats.totalHintsUsed}</Text></Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.cardTitle}>Performance by Difficulty</Text>
          {stats.difficultiesToProcess.map(diff => (
            <View key={diff} style={styles.difficultyStatRow}>
              <Text style={styles.difficultyName}>{diff}:</Text>
              <View style={styles.difficultyValues}>
                <Text style={styles.statText}>Wins: <Text style={styles.statValue}>{stats.winsByDifficulty[diff]}</Text></Text>
                <Text style={styles.statText}>Avg Time: <Text style={styles.statValue}>{stats.avgTimeByDifficulty[diff]}</Text></Text>
                <Text style={styles.statText}>Best Time: <Text style={styles.statValue}>{stats.bestTimeByDifficulty[diff]}</Text></Text>
              </View>
            </View>
          ))}
        </View>

        {stats.totalGamesPlayed === 0 && (
          <Text style={styles.noStatsText}>Play some games to see your stats here!</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cellBorder,
    paddingBottom: 5,
  },
  statText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  statValue: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  difficultyStatRow: {
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.interactive,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  difficultyValues: {
    paddingLeft: 10,
  },
  noStatsText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default StatsScreen;

