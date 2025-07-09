import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadAllGames, deleteGame } from '../../services/GameStorageService';
import { format } from 'date-fns';
import { COLORS } from '../../constants/colors';

const MyPuzzlesScreen = ({ navigation }) => {
  const [savedGames, setSavedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    setLoading(true);
    const games = await loadAllGames();
    games.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setSavedGames(games);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGames();
      return () => {};
    }, [fetchGames])
  );

  const handleResumeGame = (gameId) => {
    navigation.navigate('HomeTab', { screen: 'Game', params: { gameId: gameId } });
  };

  const handleDeleteGame = (gameId) => {
    Alert.alert(
      "Delete Game",
      "Are you sure you want to delete this saved game?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteGame(gameId);
            fetchGames();
          }
        }
      ]
    );
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.gameItem}>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>Sudoku Puzzle ({item.selectedDifficulty?.name || 'Unknown Difficulty'})</Text>
        <Text style={styles.gameTimestamp}>
          Last Saved: {item.timestamp ? format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm') : 'N/A'}
        </Text>
        {item.hintsRemaining !== undefined && (
          <Text style={styles.gameHints}>Hints Left: {item.hintsRemaining}</Text>
        )}
        {item.timeElapsed !== undefined && (
          <Text style={styles.gameTime}>Time: {formatTime(item.timeElapsed)}</Text>
        )}
        {item.isWon && <Text style={styles.gameStatusWon}>Status: Won</Text>}
        {item.isAbandoned && <Text style={styles.gameStatusAbandoned}>Status: Abandoned</Text>}
        {!item.isWon && !item.isAbandoned && <Text style={styles.gameStatusInProgress}>Status: In Progress</Text>}
      </View>
      <View style={styles.gameActions}>
        <TouchableOpacity style={styles.resumeButton} onPress={() => handleResumeGame(item.id)}>
          <Text style={styles.buttonText}>Resume</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteGame(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading saved games...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Puzzles</Text>
      {savedGames.length === 0 ? (
        <Text style={styles.noGamesText}>No saved games found. Start a new game to save one!</Text>
      ) : (
        <FlatList
          data={savedGames}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textSecondary,
  },
  noGamesText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  gameItem: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameInfo: {
    flex: 1,
    marginRight: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  gameTimestamp: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  gameHints: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gameTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gameStatusWon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 5,
  },
  gameStatusAbandoned: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 5,
  },
  gameStatusInProgress: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffc107',
    marginTop: 5,
  },
  gameActions: {
    flexDirection: 'row',
  },
  resumeButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: COLORS.errorCellText,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MyPuzzlesScreen;

