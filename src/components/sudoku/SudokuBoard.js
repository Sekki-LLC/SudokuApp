// File: src/components/sudoku/SudokuBoard.js

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

/**
 * Props:
 * - boardData: number[][]
 * - initialBoard: number[][]
 * - selectedCell: { row: number, col: number } | null
 * - conflictingCells: Set<string>
 * - hintCell: { row: number, col: number } | null
 * - pencilMarks: Record<string, number[]>  // key = "r-c"
 * - boardSize: number
 * - onCellSelect: (row: number, col: number) => void
 */
export default function SudokuBoard({
  boardData,
  initialBoard,
  selectedCell,
  conflictingCells,
  hintCell = null,
  pencilMarks = {},
  boardSize,
  onCellSelect
}) {
  const cellSize = boardSize / 9;

  const renderCell = (value, row, col) => {
    const key = `${row}-${col}`;
    const isInitial     = initialBoard[row][col] !== 0;
    const isSelected    = selectedCell?.row === row && selectedCell?.col === col;
    const isConflicting = conflictingCells.has(key);
    const isHint        = hintCell?.row === row && hintCell?.col === col;
    const pm            = pencilMarks[key] || [];

    const cellStyles = [
      styles.cell,
      { width: cellSize, height: cellSize },
      isConflicting && { backgroundColor: COLORS.conflictingCell },
      isSelected    && { backgroundColor: COLORS.selectedCell },
      isHint        && { borderColor: COLORS.accent, borderWidth: 2 },
      (col % 3 === 2 && col !== 8) && styles.rightBorder,
      (row % 3 === 2 && row !== 8) && styles.bottomBorder,
    ];

    const textStyles = [
      styles.cellText,
      isInitial ? styles.initialCellText : styles.userCellText,
      isConflicting && styles.errorCellText,
      { fontSize: cellSize * 0.6 }
    ];

    return (
      <TouchableOpacity
        key={key}
        testID={`cell-${row}-${col}`}
        style={cellStyles}
        onPress={() => onCellSelect(row, col)}
        disabled={isInitial}
      >
        {value !== 0 ? (
          <Text style={textStyles}>{value}</Text>
        ) : pm.length > 0 ? (
          <View style={styles.pencilContainer}>
            {Array.from({ length: 9 }, (_, i) => {
              const n = i + 1;
              return (
                <Text
                  key={n}
                  testID={`pencil-${row}-${col}`}
                  style={[
                    styles.pencilText,
                    { fontSize: cellSize * 0.25 },
                    pm.includes(n) ? null : styles.hiddenPencil
                  ]}
                >
                  {n}
                </Text>
              );
            })}
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {boardData.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((val, c) => renderCell(val, r, c))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderWidth: 2,
    borderColor: COLORS.interactive,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.cellBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.boardBackground,
  },
  cellText: {
    fontWeight: 'bold',
  },
  initialCellText: {
    color: COLORS.initialCellText,
  },
  userCellText: {
    color: COLORS.userCellText,
  },
  errorCellText: {
    color: COLORS.errorCellText,
  },
  rightBorder: {
    borderRightWidth: 2,
    borderColor: COLORS.interactive,
  },
  bottomBorder: {
    borderBottomWidth: 2,
    borderColor: COLORS.interactive,
  },
  // Pencil-mark support
  pencilContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
  },
  pencilText: {
    width: '33.3333%',
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  hiddenPencil: {
    color: 'transparent',
  },
});
