// File: src/components/ErrorBoundary.js

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You can log the error to an error reporting service here
    console.log('ErrorBoundary caught an error:', error, info)
  }

  handleReset = () => {
    // Clear the error and try rendering children again
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Oops! Something went wrong.</Text>
          <Text style={styles.message}>
            {this.state.error?.toString() || 'Unknown error'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex:           1,
    justifyContent: 'center',
    alignItems:     'center',
    padding:        20
  },
  title: {
    fontSize:   20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  message: {
    fontSize:  16,
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#fd6b02',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  buttonText: {
    color:      '#fff',
    fontWeight: '600'
  }
})
