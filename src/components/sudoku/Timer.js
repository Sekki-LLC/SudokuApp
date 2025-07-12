// File: src/components/sudoku/Timer.js
import React from 'react'
import { Text, StyleSheet } from 'react-native'

/**
 * Props:
 *  - timeElapsed: number  // total seconds, e.g. 125
 */
export default function Timer({ timeElapsed = 0 }) {
  // Guard in case timeElapsed is undefined or non-numeric
  const total = Number.isFinite(timeElapsed) ? timeElapsed : 0

  const minutes = Math.floor(total / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (total % 60)
    .toString()
    .padStart(2, '0')

  return <Text style={styles.timer}>{minutes}:{seconds}</Text>
}

const styles = StyleSheet.create({
  timer: {
    fontSize: 18,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: 8,
  },
})
