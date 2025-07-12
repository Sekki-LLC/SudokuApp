// src/components/AdBanner.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdBanner() {
  // a no-op placeholder so your build doesn’t break
  return (
    <View style={styles.container}>
      <Text style={styles.text}>(banner placeholder)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 10 },
  text:      { fontSize: 12, color: '#999' },
});
