// SudokuApp/src/screens/Home/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView
import { COLORS } from '../../constants/colors';

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeAreaContainer}> {/* Use SafeAreaView */}
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Sudoku!</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Game')}>
          <Text style={styles.buttonText}>Start New Game</Text>
        </TouchableOpacity>
        {/* Add other buttons like "Resume Game" later if needed */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: { // New style for SafeAreaView
    flex: 1,
    backgroundColor: COLORS.background, // Apply background here
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
