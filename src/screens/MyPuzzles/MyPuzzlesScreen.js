// File: src/screens/MyPuzzles/MyPuzzlesScreen.js

import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { loadAllGames, deleteGame } from '../../services/GameStorageService'
import { format } from 'date-fns'
import { useTheme } from '../../contexts/ThemeContext'

export default function MyPuzzlesScreen({ navigation }) {
  const { colors } = useTheme()
  const [savedGames, setSavedGames] = useState([])
  const [loading, setLoading]     = useState(true)

  const fetchGames = useCallback(async () => {
    setLoading(true)
    const games = await loadAllGames()
    games.sort((a, b) => b.timestamp - a.timestamp)
    setSavedGames(games)
    setLoading(false)
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchGames()
    }, [fetchGames])
  )

  const handleResumeGame = game => {
    navigation.navigate('Game', {
      gameId: game.id,
      isDailyChallenge: game.isDailyChallenge === true
    })
  }

  const handleDeleteGame = gameId => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this saved game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGame(gameId)
            fetchGames()
          }
        }
      ]
    )
  }

  const formatTime = totalSeconds => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
  }

  const renderItem = ({ item }) => {
    const title = item.isDailyChallenge
      ? '📅   Daily Challenge'
      : `Sudoku Puzzle (${item.selectedDifficulty?.name || 'Unknown'})`

    let statusText = 'In Progress'
    if (item.isWon)        statusText = 'Won'
    else if (item.isAbandoned) statusText = 'Abandoned'

    return (
      <View style={[styles.gameItem, { backgroundColor: colors.background }]}>
        <View style={styles.gameInfo}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[styles.gameTimestamp, { color: colors.textSecondary }]}>
            Last Saved:{' '}
            {item.timestamp
              ? format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')
              : 'N/A'}
          </Text>
          {item.hintsRemaining != null && (
            <Text style={[styles.gameHints, { color: colors.textSecondary }]}>
              Hints Left: {item.hintsRemaining}
            </Text>
          )}
          {item.timeElapsed != null && (
            <Text style={[styles.gameTime, { color: colors.textSecondary }]}>
              Time: {formatTime(item.timeElapsed)}
            </Text>
          )}
          <Text
            style={[
              styles.gameStatus,
              statusText === 'Won'
                ? styles.gameStatusWon
                : statusText === 'Abandoned'
                ? styles.gameStatusAbandoned
                : styles.gameStatusInProgress
            ]}
          >
            Status: {statusText}
          </Text>
        </View>
        <View style={styles.gameActions}>
          <TouchableOpacity
            style={[styles.resumeButton, { backgroundColor: colors.accent }]}
            onPress={() => handleResumeGame(item)}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Resume
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={() => handleDeleteGame(item.id)}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>My Puzzles</Text>
      {savedGames.length === 0 ? (
        <Text style={[styles.noGamesText, { color: colors.textSecondary }]}>
          No saved games found. Start a new game to save one!
        </Text>
      ) : (
        <FlatList
          data={savedGames}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:           { flex: 1, padding: 20 },
  header:              { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  noGamesText:         { fontSize: 18, textAlign: 'center', marginTop: 50 },
  listContent:         { paddingBottom: 20 },
  gameItem:            {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  gameInfo:            { flex: 1, marginRight: 10 },
  gameTitle:           { fontSize: 18, fontWeight: 'bold' },
  gameTimestamp:       { fontSize: 14, marginTop: 5 },
  gameHints:           { fontSize: 14, marginTop: 2 },
  gameTime:            { fontSize: 14, marginTop: 2 },
  gameStatus:          { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  gameStatusWon:       { color: '#28a745' },
  gameStatusAbandoned: { color: '#dc3545' },
  gameStatusInProgress:{ color: '#ffc107' },
  gameActions:         { flexDirection: 'row' },
  resumeButton:        { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  deleteButton:        { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, marginLeft: 10 },
  buttonText:          { fontWeight: 'bold', fontSize: 14 }
})
