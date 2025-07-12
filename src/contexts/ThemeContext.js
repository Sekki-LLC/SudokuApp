// File: src/contexts/ThemeContext.js

import React, { createContext, useState, useContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { COLORS as baseCOLORS } from '../constants/colors'

const ThemeContext = createContext()
const THEME_KEY = '@sudokuapp_theme'

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdRaw] = useState('classic')

  // Load saved theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then(saved => {
        if (saved && palettes[saved]) {
          setThemeIdRaw(saved)
        }
      })
      .catch(console.warn)
  }, [])

  // Persisted setter
  const setThemeId = id => {
    setThemeIdRaw(id)
    AsyncStorage.setItem(THEME_KEY, id).catch(console.warn)
  }

  const palettes = {
    classic: {
      background:    baseCOLORS.background,      // white screen bg
      text:          baseCOLORS.textPrimary,     // dark purple text
      textSecondary: baseCOLORS.textSecondary,   // grey
      accent:        baseCOLORS.interactive,     // dark purple buttons/links
      error:         baseCOLORS.errorCellText,    // red for errors
      white:         baseCOLORS.white       // ← add this

    },
    dark: {
      background:    '#000000',
      text:          '#ffffff',
      textSecondary: '#cccccc',
      accent:        '#555555',
      error:         '#ff4444',
      white:         '#ffffff' // add white for dark theme
    },
    ocean: {
      background:    '#0077be',
      text:          '#ffffff',
      textSecondary: '#cceeff',
      accent:        '#00aaff',
      error:         '#ff4444',
      white:         '#ffffff' // add white for ocean theme
    },
    forest: {
      background:    '#228b22',
      text:          '#ffffff',
      textSecondary: '#bbddbb',
      accent:        '#66bb6a',
      error:         '#ff4444',
      white:         '#ffffff' // add white for forest theme
    },
    sunset: {
      background:    '#ff4500',
      text:          '#ffffff',
      textSecondary: '#ffbb88',
      accent:        '#ff8c00',
      error:         '#ff4444',
      white:         '#ffffff' // add white for sunset theme
    },
    cherry: {
      background:    '#ff007f',
      text:          '#ffffff',
      textSecondary: '#ff66a3',
      accent:        '#ff3385',
      error:         '#ff4444',
      white:         '#ffffff' // add white for cherry theme
    },
    midnight: {
      background:    '#000022',
      text:          '#00ff00',
      textSecondary: '#88ff88',
      accent:        '#00aa00',
      error:         '#ff4444',
      white:         '#ffffff' // add white for midnight theme
    },
    pastel: {
      background:    '#ffd1dc',
      text:          '#000000',
      textSecondary: '#555555',
      accent:        '#ff99c8',
      error:         '#ff4444',
      white:         '#ffffff' // add white for pastel theme
    }
  }

  const colors = palettes[themeId] || palettes.classic

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
