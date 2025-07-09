// SudokuApp/src/utils/SudokuGenerator.js

// Helper function to shuffle an array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to check if a number is valid in a given cell
function isValid(board, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

// Recursive function to fill the board
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0; // Backtrack
          }
        }
        return false; // No number works for this cell, backtrack
      }
    }
  }
  return true; // Board is filled
}

/**
 * Generates a full, solved Sudoku board.
 * @returns {number[][]} A 9x9 array representing a solved Sudoku board.
 */
export function generateSolvedSudoku() {
  const board = Array(9).fill(0).map(() => Array(9).fill(0));
  // The fillBoard function modifies the board in place.
  // It should always return true for an empty 9x9 board.
  if (fillBoard(board)) {
    return board;
  } else {
    // This case should ideally not be reached for a standard Sudoku generator.
    // If it is, it indicates a deeper issue with the algorithm or environment.
    console.error("Failed to generate a complete solved Sudoku board.");
    // Return an empty board to prevent further errors, though the puzzle won't be playable.
    return Array(9).fill(0).map(() => Array(9).fill(0));
  }
}

/**
 * Creates a Sudoku puzzle by removing numbers from a solved board.
 * @param {number[][]} solvedBoard - A fully solved Sudoku board.
 * @param {number} difficulty - Number of cells to remove (higher = harder).
 * @returns {{puzzle: number[][], solution: number[][]}} An object containing the puzzle and its solution.
 */
export function generateSudokuPuzzle(difficulty = 40) {
  const solvedBoard = generateSolvedSudoku();
  // Ensure solvedBoard is a valid array before mapping
  if (!Array.isArray(solvedBoard) || solvedBoard.length !== 9 || !Array.isArray(solvedBoard[0])) {
    console.error("generateSolvedSudoku did not return a valid 9x9 array. Returning empty puzzle.");
    return { puzzle: Array(9).fill(0).map(() => Array(9).fill(0)), solution: Array(9).fill(0).map(() => Array(9).fill(0)) };
  }

  const puzzle = solvedBoard.map(row => [...row]); // Deep copy the solved board

  let cellsToRemove = difficulty;
  let attempts = 0; // Prevent infinite loops if difficulty is too high or board is too small

  while (cellsToRemove > 0 && attempts < 500) { // Limit attempts to prevent infinite loops
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);

    if (puzzle[row][col] !== 0) {
      const temp = puzzle[row][col]; // Store value temporarily
      puzzle[row][col] = 0; // Remove the number

      // A simple check for solvability (not uniqueness) is omitted here for MVP simplicity.
      // For a robust generator, you'd run a solver here and check for unique solutions.

      cellsToRemove--;
    }
    attempts++;
  }

  return { puzzle, solution: solvedBoard };
}
