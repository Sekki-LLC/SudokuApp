// SudokuApp/src/services/GameStorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values'; // Required for uuid on some platforms
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const GAME_STORAGE_KEY = '@sudoku_saved_games';

/**
 * Saves a single game state to AsyncStorage.
 * @param {object} gameState - The state of the game to save.
 * @returns {string} The unique ID of the saved game.
 */
export const saveGame = async (gameState) => {
  try {
    const gameId = gameState.id || uuidv4(); // Use existing ID or generate new one
    const timestamp = Date.now(); // Record save time

    const newGameState = {
      ...gameState,
      id: gameId,
      timestamp: timestamp,
    };

    // Load all existing games
    const existingGamesJson = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    let allGames = existingGamesJson ? JSON.parse(existingGamesJson) : {};

    // Update or add the new game
    allGames[gameId] = newGameState;

    await AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(allGames));
    console.log(`Game ${gameId} saved successfully.`);
    return gameId;
  } catch (error) {
    console.error('Error saving game:', error);
    throw error;
  }
};

/**
 * Loads all saved games from AsyncStorage.
 * @returns {Array<object>} An array of all saved game states.
 */
export const loadAllGames = async () => {
  try {
    const allGamesJson = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    if (allGamesJson) {
      const allGamesObject = JSON.parse(allGamesJson);
      // Convert object of games to an array, sorting by timestamp (most recent first)
      return Object.values(allGamesObject).sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('Error loading all games:', error);
    return [];
  }
};

/**
 * Loads a specific game by its ID.
 * @param {string} gameId - The ID of the game to load.
 * @returns {object|null} The game state if found, otherwise null.
 */
export const loadGame = async (gameId) => {
  try {
    const allGamesJson = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    if (allGamesJson) {
      const allGamesObject = JSON.parse(allGamesJson);
      return allGamesObject[gameId] || null;
    }
    return null;
  } catch (error) {
    console.error(`Error loading game ${gameId}:`, error);
    return null;
  }
};

/**
 * Deletes a specific game by its ID.
 * @param {string} gameId - The ID of the game to delete.
 */
export const deleteGame = async (gameId) => {
  try {
    const existingGamesJson = await AsyncStorage.getItem(GAME_STORAGE_KEY);
    let allGames = existingGamesJson ? JSON.parse(existingGamesJson) : {};

    if (allGames[gameId]) {
      delete allGames[gameId];
      await AsyncStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(allGames));
      console.log(`Game ${gameId} deleted successfully.`);
    }
  } catch (error) {
    console.error(`Error deleting game ${gameId}:`, error);
  }
};

// Optional: Clear all saved games (useful for development/testing)
export const clearAllGames = async () => {
  try {
    await AsyncStorage.removeItem(GAME_STORAGE_KEY);
    console.log('All saved games cleared.');
  } catch (error) {
    console.error('Error clearing all games:', error);
  }
};

