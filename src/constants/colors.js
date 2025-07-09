export const COLORS = {
  // Core Palette - STRICTLY as per your instructions
  background: '#FFFFFF', // White background for all screens
  interactive: '#25006b', // Dark Purple for ALL buttons, links, nav icons, labels, and main text

  // Supporting Colors (derived from core or for specific functional purposes)
  textPrimary: '#25006b', // Main text color (same as interactive)
  textSecondary: '#666666', // Softer grey for less prominent text (e.g., timer, progress) - FUNCTIONAL EXCEPTION
  white: '#FFFFFF', // Pure white (for text on dark buttons)
  black: '#000000', // Pure black (for shadows, etc.)

  // Game-specific colors (strictly adhering where possible)
  boardBackground: '#FFFFFF', // White for the Sudoku board cells
  cellBorder: '#25006b', // Dark Purple for cell borders (as per "labels" instruction)
  selectedCell: '#E0E0FF', // Very light purple for selected cell background (subtle highlight for UX) - FUNCTIONAL EXCEPTION
  conflictingCell: '#FFB6C1', // Light red for conflicts background (error indicator) - FUNCTIONAL EXCEPTION
  initialCellText: '#25006b', // Dark Purple for pre-filled numbers (part of "labels")
  userCellText: '#25006b', // Dark Purple for user-entered numbers
  errorCellText: '#FF0000', // Red for conflicting text (error indicator) - FUNCTIONAL EXCEPTION

  // Button colors (all map to interactive color, except functional ones)
  buttonPrimary: '#25006b', // Dark Purple for primary actions
  buttonSecondary: '#25006b', // Dark Purple for secondary actions (e.g., Clear button)
  buttonDanger: '#dc3545', // Red for destructive actions (e.g., Clear All Games) - FUNCTIONAL EXCEPTION
  buttonDisabled: '#cccccc', // Light grey for disabled buttons - FUNCTIONAL EXCEPTION
};

