// SudokuApp/src/contexts/GameSettingsContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Define difficulty levels
export const difficultyLevels = [
  { name: 'Very Easy', cellsToRemove: 30, color: '#4CAF50' }, // Green
  { name: 'Easy', cellsToRemove: 40, color: '#8BC34A' },    // Light Green
  { name: 'Medium', cellsToRemove: 50, color: '#FFC107' },   // Amber
  { name: 'Hard', cellsToRemove: 60, color: '#FF9800' },    // Orange
  { name: 'Very Hard', cellsToRemove: 70, color: '#F44336' }, // Red
];

// Key for AsyncStorage
const DIFFICULTY_STORAGE_KEY = '@sudoku_difficulty';

// Create the context
const GameSettingsContext = createContext();

// Create a provider component
export const GameSettingsProvider = ({ children }) => {
  // State to hold the selected difficulty, default to Medium
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    difficultyLevels.find(level => level.name === 'Medium')
  );

  // Effect to load saved difficulty from AsyncStorage on app start
  useEffect(() => {
    const loadSavedDifficulty = async () => {
      try {
        const savedDifficultyName = await AsyncStorage.getItem(DIFFICULTY_STORAGE_KEY);
        if (savedDifficultyName) {
          const foundDifficulty = difficultyLevels.find(level => level.name === savedDifficultyName);
          if (foundDifficulty) {
            setSelectedDifficulty(foundDifficulty);
            console.log(`[GameSettingsContext] Loaded saved difficulty: ${foundDifficulty.name}`);
          }
        }
      } catch (error) {
        console.error("Failed to load difficulty from storage:", error);
      }
    };

    loadSavedDifficulty();
  }, []); // Run only once on mount

  // Function to update difficulty and save it to AsyncStorage
  const updateDifficulty = async (difficulty) => {
    try {
      setSelectedDifficulty(difficulty);
      await AsyncStorage.setItem(DIFFICULTY_STORAGE_KEY, difficulty.name);
      console.log(`[GameSettingsContext] Saved new difficulty: ${difficulty.name}`);
    } catch (error) {
      console.error("Failed to save difficulty to storage:", error);
    }
  };

  return (
    <GameSettingsContext.Provider value={{ selectedDifficulty, setSelectedDifficulty: updateDifficulty }}>
      {children}
    </GameSettingsContext.Provider>
  );
};

// Custom hook to use the game settings
export const useGameSettings = () => {
  return useContext(GameSettingsContext);
};
