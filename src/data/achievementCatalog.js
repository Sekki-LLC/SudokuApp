// src/data/achievementCatalog.js
export const ACHIEVEMENT_CATALOG = [
  { id: 'first_win', title: 'First Victory', description: 'Complete your first puzzle', goal: 1, reward: '10 tokens' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Solve a puzzle in under 5 minutes', goal: 1, reward: '25 tokens', timeLimit: 300 },
  { id: 'streak_master', title: 'Streak Master', description: 'Play 7 days in a row', goal: 7, reward: '50 tokens' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Solve 10 puzzles without hints', goal: 10, reward: '100 tokens' },
  { id: 'master_solver', title: 'Master Solver', description: 'Complete 100 puzzles', goal: 100, reward: '200 tokens' }
]
