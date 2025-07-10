// File: src/contexts/ThemeContext.js

import React, { createContext, useState, useContext } from 'react'
import { COLORS } from '../constants/colors'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('classic')

  const palettes = {
    classic: {
      background:    COLORS.boardBackground,
      text:          COLORS.textPrimary,
      textSecondary: COLORS.initialCellText,
      accent:        COLORS.selectedCell,
      error:         COLORS.conflictingCell
    },
    dark: {
      background:    '#000000',
      text:          '#ffffff',
      textSecondary: '#cccccc',
      accent:        '#555555',
      error:         '#ff4444'
    },
    ocean: {
      background:    '#0077be',
      text:          '#ffffff',
      textSecondary: '#cceeff',
      accent:        '#00aaff',
      error:         '#ff4444'
    },
    forest: {
      background:    '#228b22',
      text:          '#ffffff',
      textSecondary: '#bbddbb',
      accent:        '#66bb6a',
      error:         '#ff4444'
    },
    sunset: {
      background:    '#ff4500',
      text:          '#ffffff',
      textSecondary: '#ffbb88',
      accent:        '#ff8c00',
      error:         '#ff4444'
    },
    cherry: {
      background:    '#ff007f',
      text:          '#ffffff',
      textSecondary: '#ff66a3',
      accent:        '#ff3385',
      error:         '#ff4444'
    },
    midnight: {
      background:    '#000022',
      text:          '#00ff00',
      textSecondary: '#88ff88',
      accent:        '#00aa00',
      error:         '#ff4444'
    },
    pastel: {
      background:    '#ffd1dc',
      text:          '#000000',
      textSecondary: '#555555',
      accent:        '#ff99c8',
      error:         '#ff4444'
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
