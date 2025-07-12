// File: src/components/sudoku/HintButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function HintButton({ onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>Hint</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.interactive,
    borderRadius: 5,
  },
  disabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  text: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

