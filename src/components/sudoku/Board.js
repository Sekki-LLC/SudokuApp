import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

const Board = ({ boardData, initialBoard, selectedCell, onCellSelect, conflictingCells, boardSize }) => {
  const cellSize = boardSize / 9;

  const renderCell = (value, rowIndex, colIndex) => {
    const isSelected = selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex;
    const isInitial = initialBoard[rowIndex][colIndex] !== 0;
    const isConflicting = conflictingCells.has(`${rowIndex}-${colIndex}`);

    const cellStyle = [
      styles.cell,
      { width: cellSize, height: cellSize },
      isConflicting ? { backgroundColor: COLORS.conflictingCell } : null,
      isSelected ? { backgroundColor: COLORS.selectedCell } : null,
      colIndex % 3 === 2 && colIndex !== 8 ? styles.rightBorder : null,
      rowIndex % 3 === 2 && rowIndex !== 8 ? styles.bottomBorder : null,
    ];

    const textStyle = [
      styles.cellText,
      isInitial ? styles.initialCellText : styles.userCellText,
      isConflicting ? styles.errorCellText : null,
      { fontSize: cellSize * 0.6 }
    ];

    return (
      <TouchableOpacity
        key={`${rowIndex}-${colIndex}`}
        style={cellStyle}
        onPress={() => onCellSelect(rowIndex, colIndex)}
        disabled={isInitial}
      >
        <Text style={textStyle}>{value !== 0 ? value : ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.board, { width: boardSize, height: boardSize }]}>
      {boardData.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((value, colIndex) => renderCell(value, rowIndex, colIndex))}
        </View>
      ))}
    </View>
  );
};

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
});

export default Board;

