// File: src/screens/Settings/SettingsScreen.js

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useGameSettings } from '../../contexts/GameSettingsContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useFeedback } from '../../contexts/FeedbackContext'
import * as Haptics from 'expo-haptics'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { clearAllGames } from '../../services/GameStorageService'
import { loadStats } from '../../services/StatsService'  // new
// static catalog of your achievements
const ACHIEVEMENT_CATALOG = [
  { id: 'first_win', title: 'First Victory', description: 'Complete your first puzzle', goal: 1, reward: '10 tokens' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Solve a puzzle in under 5 minutes', goal: 1, timeLimit: 300, reward: '25 tokens' },
  { id: 'streak_master', title: 'Streak Master', description: 'Play 7 days in a row', goal: 7, reward: '50 tokens' },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Solve 10 puzzles without hints', goal: 10, reward: '100 tokens' },
  { id: 'master_solver', title: 'Master Solver', description: 'Complete 100 puzzles', goal: 100, reward: '200 tokens' }
]

const { width } = Dimensions.get('window')
const DAILY_GAME_KEY = '@sudokuapp:dailyGameId'
const DAILY_DONE_KEY = '@sudokuapp:dailyChallengeCompleted'

export default function SettingsScreen({ navigation }) {
  const { selectedDifficulty, setSelectedDifficulty } = useGameSettings()
  const { colors } = useTheme()
  const {
    soundEnabled,
    vibrationEnabled,
    hapticsEnabled,
    setSoundEnabled,
    setVibrationEnabled,
    setHapticsEnabled,
    buttonPressFeedback,
    successFeedback
  } = useFeedback()

  const [dailyGameId, setDailyGameId] = useState(null)
  const [dailyCompleted, setDailyCompleted] = useState(false)
  const [achievements, setAchievements] = useState([])  // dynamic

  // load daily IDs
  useEffect(() => {
    AsyncStorage.multiGet([DAILY_GAME_KEY, DAILY_DONE_KEY])
      .then(entries => {
        const savedId = entries[0][1]
        const savedDone = entries[1][1]
        if (savedId) setDailyGameId(savedId)
        if (savedDone === 'true') setDailyCompleted(true)
      })
      .catch(console.warn)
  }, [])

  // compute achievements from persisted stats
  useEffect(() => {
    async function compute() {
      const stats = await loadStats()
      const computed = ACHIEVEMENT_CATALOG.map(a => {
        let progress = 0
        switch (a.id) {
          case 'first_win':
          case 'master_solver':
            progress = (stats.completed / a.goal) * 100
            break
          case 'speed_demon':
            progress = stats.fastCompletes >= 1 ? 100 : 0
            break
          case 'streak_master':
            progress = (stats.streak / a.goal) * 100
            break
          case 'perfectionist':
            progress = (stats.noHintCount / a.goal) * 100
            break
        }
        const pr = Math.min(100, Math.round(progress))
        return {
          ...a,
          progress: pr,
          unlocked: pr >= 100
        }
      })
      setAchievements(computed)
    }
    compute()
  }, [])

  const startOrResumeDaily = async () => {
    if (dailyCompleted) {
      return Alert.alert('Already Completed', 'Come back tomorrow for a new challenge!')
    }
    let id = dailyGameId
    if (!id) {
      id = uuidv4()
      setDailyGameId(id)
      await AsyncStorage.setItem(DAILY_GAME_KEY, id)
    }
    navigation.navigate('Game', {
      isDailyChallenge: true,
      gameId: id
    })
    buttonPressFeedback()
  }

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Saved Games',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllGames()
              await AsyncStorage.multiRemove([DAILY_GAME_KEY, DAILY_DONE_KEY])
              setDailyGameId(null)
              setDailyCompleted(false)
              Alert.alert('Success', 'All saved games have been deleted.')
              successFeedback()
              navigation.navigate('MainTabs', { screen: 'MyPuzzles' })
            } catch (err) {
              console.warn(err)
              Alert.alert('Error', 'Could not clear saved games.')
            }
          }
        }
      ]
    )
  }

  const updateDifficulty = diff => {
    setSelectedDifficulty(diff)
    Alert.alert('Difficulty Updated', `New games will be ${diff.name}.`)
    buttonPressFeedback()
  }

  const handleSoundToggle = (value) => {
    setSoundEnabled(value)
    if (value) buttonPressFeedback()
  }

  const handleVibrationToggle = (value) => {
    setVibrationEnabled(value)
    if (value) Haptics.selectionAsync()
  }

  const handleHapticsToggle = (value) => {
    setHapticsEnabled(value)
    if (value) Haptics.selectionAsync()
  }

  const renderAchievement = ach => (
    <View key={ach.id} style={[styles.achievementCard, { backgroundColor: colors.white }]}>
      <View style={styles.achievementHeader}>
        <Ionicons
          name={ach.unlocked ? 'trophy' : 'trophy-outline'}
          size={24}
          color={ach.unlocked ? '#fd6b02' : colors.textSecondary}
        />
        <View style={styles.achievementInfo}>
          <Text style={[styles.achievementTitle, { color: colors.text }]}>{ach.title}</Text>
          <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{ach.description}</Text>
        </View>
        <Text style={[styles.achievementReward, { color: '#fd6b02' }]}>{ach.reward}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${ach.progress}%`, backgroundColor: colors.accent }]} />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>{ach.progress}%</Text>
      </View>
    </View>
  )

  const difficulties = [
    { name: 'Easy', cellsToRemove: 40, description: 'Perfect for beginners' },
    { name: 'Medium', cellsToRemove: 50, description: 'A good challenge' },
    { name: 'Hard', cellsToRemove: 60, description: 'For experienced players' },
    { name: 'Expert', cellsToRemove: 70, description: 'Ultimate challenge' }
  ]

  const renderDifficulty = diff => (
    <TouchableOpacity
      key={diff.name}
      style={[
        styles.difficultyCard,
        { backgroundColor: colors.white },
        selectedDifficulty.name === diff.name && { borderColor: colors.accent, borderWidth: 2 }
      ]}
      onPress={() => updateDifficulty(diff)}
    >
      <View style={styles.difficultyInfo}>
        <Text style={[styles.difficultyName, { color: colors.text }]}>{diff.name}</Text>
        <Text style={[styles.difficultyDescription, { color: colors.textSecondary }]}>{diff.description}</Text>
      </View>
      {selectedDifficulty.name === diff.name && (
        <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
      )}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cellBorder }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Challenge</Text>
          <TouchableOpacity
            style={[
              styles.dailyCard,
              { backgroundColor: colors.white },
              dailyCompleted && styles.completedCard
            ]}
            onPress={startOrResumeDaily}
          >
            <View style={styles.challengeHeader}>
              <Ionicons
                name={dailyCompleted ? 'checkmark-circle' : (dailyGameId ? 'play-circle' : 'calendar')}
                size={32}
                color={dailyCompleted ? '#28a745' : colors.accent}
              />
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, { color: colors.text }]}>
                  {dailyCompleted
                    ? 'Challenge Complete!'
                    : (dailyGameId ? 'Resume Challenge' : 'Daily Challenge')}
                </Text>
                <Text style={[styles.challengeDescription, { color: colors.textSecondary }]}>
                  {dailyCompleted
                    ? 'Come back tomorrow for a new one'
                    : (dailyGameId ? 'Tap to continue today\'s puzzle' : 'Complete today\'s puzzle for')}
                </Text>
                {!dailyCompleted && (
                  <Text style={[styles.tokenBadge, { color: '#fd6b02' }]}>
                    +30 tokens
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Track your Sudoku mastery
          </Text>
          {achievements.map(renderAchievement)}
        </View>

        {/* Game Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Game Preferences</Text>
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Play sounds for game actions
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={soundEnabled ? colors.interactive : '#f4f3f4'}
            />
          </View>
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Vibrate on game actions
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={vibrationEnabled ? colors.interactive : '#f4f3f4'}
            />
          </View>
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Light tap on errors and presses
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={hapticsEnabled ? colors.interactive : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty Level</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Choose your preferred challenge level
          </Text>
          {difficulties.map(renderDifficulty)}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearAll}>
            <Ionicons name="trash" size={20} color="#dc3545" />
            <Text style={styles.dangerText}>Clear All Saved Games</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  section: { paddingHorizontal: 20, paddingVertical: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, marginBottom: 15 },
  dailyCard: { borderRadius: 12, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  completedCard: { backgroundColor: '#f8f9fa' },
  challengeHeader: { flexDirection: 'row', alignItems: 'center' },
  challengeInfo: { flex: 1, marginLeft: 15 },
  challengeTitle: { fontSize: 16, fontWeight: 'bold' },
  challengeDescription: { fontSize: 14, marginTop: 2 },
  tokenBadge: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
  achievementCard: { borderRadius: 12, padding: 15, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  achievementHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  achievementInfo: { flex: 1, marginLeft: 15 },
  achievementTitle: { fontSize: 16, fontWeight: 'bold' },
  achievementDescription: { fontSize: 14, marginTop: 2 },
  achievementReward: { fontSize: 12, fontWeight: 'bold' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 6, backgroundColor: '#e9ecef', borderRadius: 3, marginRight: 10 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, minWidth: 35 },
  settingRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 15, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: 'bold' },
  settingDescription: { fontSize: 14, marginTop: 2 },
  difficultyCard: { borderRadius: 10, padding: 15, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, flexDirection: 'row', alignItems: 'center' },
  difficultyInfo: { flex: 1 },
  difficultyName: { fontSize: 16, fontWeight: 'bold' },
  difficultyDescription: { fontSize: 14, marginTop: 2 },
  dangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, padding: 15, borderWidth: 1 },
  dangerText: { fontSize: 16, marginLeft: 8, fontWeight: '600', color: '#dc3545' },
  footer: { height: 20 }
})
