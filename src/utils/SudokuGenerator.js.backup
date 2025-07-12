// File: src/utils/SudokuGenerator.js

// Helper: shuffle an array in place
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

// Check if num is valid at board[row][col]
function isValid(board, row, col, num) {
  // row & col
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false
  }
  // 3×3 box
  const boxRow = row - (row % 3)
  const boxCol = col - (col % 3)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[boxRow + r][boxCol + c] === num) return false
    }
  }
  return true
}

// Recursively fill an empty board
function fillBoard(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const n of nums) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n
            if (fillBoard(board)) return true
            board[r][c] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

/**
 * @returns {number[][]} a fully solved 9×9 Sudoku
 */
export function generateSolvedSudoku() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0))
  if (fillBoard(board)) return board
  console.error('Failed to generate solved board')
  return board
}

/**
 * @param {number} difficulty  how many cells to remove (e.g. 40–60)
 * @returns {{ puzzle: number[][], solution: number[][] }}
 */
export function generateSudokuPuzzle(difficulty = 40) {
  const solution = generateSolvedSudoku()
  const puzzle = solution.map(row => row.slice())
  let toRemove = difficulty
  let attempts = 0

  while (toRemove > 0 && attempts < 500) {
    const r = Math.floor(Math.random() * 9)
    const c = Math.floor(Math.random() * 9)
    if (puzzle[r][c] !== 0) {
      puzzle[r][c] = 0
      toRemove--
    }
    attempts++
  }

  return { puzzle, solution }
}
