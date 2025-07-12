import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

const NumberPad = ({ onNumberPress, onClearPress, numberPadWidth }) => {
  const buttonSize = numberPadWidth / 5; // 5 buttons per row (1-5, 6-9+Clear)

  const renderNumberButton = (number) => (
    <TouchableOpacity
      key={number}
      style={[styles.numberButton, { width: buttonSize, height: buttonSize }]}
      onPress={() => onNumberPress(number)}
    >
      <Text style={styles.numberButtonText}>{number}</Text>
    </TouchableOpacity>
  );

  const renderClearButton = () => (
    <TouchableOpacity
      style={[styles.clearButton, { width: buttonSize, height: buttonSize }]}
      onPress={onClearPress}
    >
      <Text style={styles.clearButtonText}>Clear</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.numberPad, { width: numberPadWidth }]}>
      <View style={styles.numberRow}>
        {[1, 2, 3, 4, 5].map(renderNumberButton)}
      </View>
      <View style={styles.numberRow}>
        {[6, 7, 8, 9].map(renderNumberButton)}
        {renderClearButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  numberPad: {
    alignItems: 'center',
    marginVertical: 10,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  numberButton: {
    backgroundColor: COLORS.buttonPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  numberButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
  backgroundColor: '#ff661e',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default NumberPad;

