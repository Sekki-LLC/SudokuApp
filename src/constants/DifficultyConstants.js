// SudokuApp/src/constants/DifficultyConstants.js
import { COLORS } from './colors';

export const DIFFICULTY_LEVELS = {
  VERY_EASY: {
    name: 'Very Easy',
    cellsToRemove: 35,
    color: COLORS.interactive, // Dark Purple
  },
  EASY: {
    name: 'Easy',
    cellsToRemove: 45,
    color: COLORS.interactive, // Dark Purple
  },
  MEDIUM: {
    name: 'Medium',
    cellsToRemove: 50,
    color: COLORS.interactive, // Dark Purple
  },
  HARD: {
    name: 'Hard',
    cellsToRemove: 55,
    color: COLORS.interactive, // Dark Purple
  },
  VERY_HARD: {
    name: 'Very Hard',
    cellsToRemove: 60,
    color: COLORS.interactive, // Dark Purple
  },
};

export const DIFFICULTY_LEVELS_ARRAY = [
  DIFFICULTY_LEVELS.VERY_EASY,
  DIFFICULTY_LEVELS.EASY,
  DIFFICULTY_LEVELS.MEDIUM,
  DIFFICULTY_LEVELS.HARD,
  DIFFICULTY_LEVELS.VERY_HARD,
];

export const DEFAULT_DIFFICULTY = DIFFICULTY_LEVELS.MEDIUM;
