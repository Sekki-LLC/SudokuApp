// File: src/services/HintService.js

import { isValidPlacement } from '../utils/SudokuValidator'

/**
 * Returns a hint for the current Sudoku board.
 * First, looks for any empty cell that has exactly one valid candidate.
 * If none are found, falls back to the solution for the first empty cell.
 *
 * @param {number[][]} board    - The current 9×9 board (0 = empty).
 * @param {number[][]} solution - The fully solved 9×9 board.
 * @returns {{ row: number, col: number, value: number, type: string } | null}
 *          An object with the hint cell coordinates, the value to fill, 
 *          and a hint type ("soleCandidate" or "direct"), or null if no empty cell.
 */
export function getHint(board, solution) {
  // Look for a cell with exactly one valid candidate
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const candidates = []
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(board, row, col, num)) {
            candidates.push(num)
          }
        }
        if (candidates.length === 1) {
          return { row, col, value: candidates[0], type: 'soleCandidate' }
        }
      }
    }
  }

  // Fallback: first empty cell, use solution value
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return { row, col, value: solution[row][col], type: 'direct' }
      }
    }
  }

  // No empty cells left
  return null
}
