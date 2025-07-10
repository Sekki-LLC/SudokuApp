// File: src/components/ErrorBoundary.js
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.reset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container:    { flex:1, justifyContent:'center', alignItems:'center', padding:20 },
  title:        { fontSize:20, fontWeight:'bold', marginBottom:10 },
  message:      { fontSize:14, color:'grey', textAlign:'center', marginBottom:20 },
  button:       { paddingHorizontal:20, paddingVertical:10, backgroundColor:'#007AFF', borderRadius:5 },
  buttonText:   { color:'white', fontWeight:'600' }
})
