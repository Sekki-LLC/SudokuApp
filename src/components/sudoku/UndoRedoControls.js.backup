// File: src/components/sudoku/UndoRedoControls.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function UndoRedoControls({ onUndo, onRedo, canUndo = true, canRedo = true }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.disabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Text style={styles.text}>Undo</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, !canRedo && styles.disabled]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <Text style={styles.text}>Redo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    backgroundColor: COLORS.interactive,
    borderRadius: 5,
    alignItems: 'center',
  },
  disabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
