// File: src/contexts/UserContext.js

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const USER_TOKENS_KEY = '@sudokuapp:userTokens'

// Create context with a null default so we can error on missing provider
const UserContext = createContext(null)

/**
 * Wrap your app in <UserProvider> so any screen can call useUser()
 */
export function UserProvider({ children }) {
  const [tokens, setTokens] = useState(150)  // new players start with 150

  // Load saved token count on mount
  useEffect(() => {
    AsyncStorage.getItem(USER_TOKENS_KEY)
      .then(saved => {
        if (saved != null && !isNaN(Number(saved))) {
          setTokens(Number(saved))
        }
      })
      .catch(console.warn)
  }, [])

  // Persist any changes to tokens
  useEffect(() => {
    AsyncStorage.setItem(USER_TOKENS_KEY, String(tokens)).catch(console.warn)
  }, [tokens])

  // Add (or subtract) tokens; never let it go below 0
  const addTokens = delta => {
    setTokens(prev => Math.max(0, prev + delta))
  }

  // Memoize the context value to avoid unnecessary re-renders
  const value = useMemo(() => ({ tokens, addTokens }), [tokens])

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

/**
 * Call this hook from any screen to read/add tokens:
 *   const { tokens, addTokens } = useUser()
 */
export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return ctx
}
