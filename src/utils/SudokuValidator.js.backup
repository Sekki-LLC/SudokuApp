// SudokuApp/src/utils/SudokuValidator.js

/**
 * Checks if a given number is valid at a specific position on the board.
 * This function is used by the generator, but also useful for real-time validation.
 * @param {number[][]} board - The current Sudoku board.
 * @param {number} row - The row index (0-8).
 * @param {number} col - The column index (0-8).
 * @param {number} num - The number to check (1-9).
 * @returns {boolean} True if the number is valid, false otherwise.
 */
export function isValidPlacement(board, row, col, num) {
  // Check row
  for (let x = 0; x < 9; x++) {
    if (x !== col && board[row][x] === num) { // Exclude the cell itself
      return false;
    }
  }

  // Check column
  for (let x = 0; x < 9; x++) {
    if (x !== row && board[x][col] === num) { // Exclude the cell itself
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((i + startRow !== row || j + startCol !== col) && board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Finds all conflicting cells on the board for the current state.
 * @param {number[][]} board - The current Sudoku board.
 * @returns {Set<string>} A Set of strings in "row-col" format for all conflicting cells.
 */
export function findConflicts(board) {
  const conflicts = new Set();

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const num = board[r][c];
      if (num === 0) continue; // Skip empty cells

      // Check row for duplicates
      for (let col = 0; col < 9; col++) {
        if (col !== c && board[r][col] === num) {
          conflicts.add(`${r}-${c}`);
          conflicts.add(`${r}-${col}`);
        }
      }

      // Check column for duplicates
      for (let row = 0; row < 9; row++) {
        if (row !== r && board[row][c] === num) {
          conflicts.add(`${r}-${c}`);
          conflicts.add(`${row}-${c}`);
        }
      }

      // Check 3x3 box for duplicates
      const startRow = r - (r % 3);
      const startCol = c - (c % 3);
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if ((i + startRow !== r || j + startCol !== c) && board[i + startRow][j + startCol] === num) {
            conflicts.add(`${r}-${c}`);
            conflicts.add(`${i + startRow}-${j + startCol}`);
          }
        }
      }
    }
  }
  return conflicts;
}

/**
 * Checks if the entire Sudoku board is correctly solved.
 * @param {number[][]} board - The current Sudoku board.
 * @returns {boolean} True if the board is solved and valid, false otherwise.
 */
export function isBoardSolved(board) {
  // First, check if all cells are filled
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        return false; // Board is not full
      }
    }
  }

  // Then, check for any conflicts
  return findConflicts(board).size === 0;
}
