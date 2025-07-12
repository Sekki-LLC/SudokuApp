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
import * as Haptics from 'expo-haptics'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useGameSettings } from '../../contexts/GameSettingsContext'
import { useTheme } from '../../contexts/ThemeContext'
import 'react-native-get-random-values'
import { v4 as uuidv4 } from 'uuid'
import { loadAllGames, deleteGame } from '../../services/GameStorageService'

const { width } = Dimensions.get('window')
const DAILY_GAME_KEY = '@sudokuapp:dailyGameId'
const DAILY_DONE_KEY = '@sudokuapp:dailyChallengeCompleted'

export default function SettingsScreen({ navigation }) {
  const { selectedDifficulty, setSelectedDifficulty } = useGameSettings()
  const { colors } = useTheme()

  const [dailyGameId, setDailyGameId]         = useState(null)
  const [dailyCompleted, setDailyCompleted]   = useState(false)
  const [soundEnabled, setSoundEnabled]       = useState(true)
  const [vibrationEnabled, setVibrationEnabled] = useState(true)
  const [hapticsEnabled, setHapticsEnabled]     = useState(true)

  // load persisted daily state
  useEffect(() => {
    AsyncStorage.multiGet([DAILY_GAME_KEY, DAILY_DONE_KEY])
      .then(entries => {
        const savedId   = entries[0][1]
        const savedDone = entries[1][1]
        if (savedId)         setDailyGameId(savedId)
        if (savedDone === 'true') setDailyCompleted(true)
      })
      .catch(console.warn)
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
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  // Clear everything: all saved games + daily challenge
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
              // delete each saved game
              const all = await loadAllGames()
              await Promise.all(all.map(g => deleteGame(g.id)))
              // clear daily challenge keys
              await AsyncStorage.multiRemove([DAILY_GAME_KEY, DAILY_DONE_KEY])
              setDailyGameId(null)
              setDailyCompleted(false)

              Alert.alert('Success', 'All saved games have been deleted.')
              if (hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              }
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
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  // Achievements data
  const achievements = [
    { id: 'first_win', title: 'First Victory', description: 'Complete your first puzzle', progress: 100, unlocked: true, reward: '10 tokens' },
    { id: 'speed_demon', title: 'Speed Demon', description: 'Solve a puzzle in under 5 minutes', progress: 75, unlocked: false, reward: '25 tokens' },
    { id: 'streak_master', title: 'Streak Master', description: 'Play 7 days in a row', progress: 42, unlocked: false, reward: '50 tokens' },
    { id: 'perfectionist', title: 'Perfectionist', description: 'Solve 10 puzzles without hints', progress: 30, unlocked: false, reward: '100 tokens' },
    { id: 'master_solver', title: 'Master Solver', description: 'Complete 100 puzzles', progress: 67, unlocked: false, reward: '200 tokens' }
  ]

  // Difficulty options
  const difficulties = [
    { name: 'Easy',   cellsToRemove: 40, description: 'Perfect for beginners' },
    { name: 'Medium', cellsToRemove: 50, description: 'A good challenge'       },
    { name: 'Hard',   cellsToRemove: 60, description: 'For experienced players' },
    { name: 'Expert', cellsToRemove: 70, description: 'Ultimate challenge'    }
  ]

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
                    : (dailyGameId ? 'Tap to continue today’s puzzle' : "Complete today's puzzle for")}
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
          {/* Sound Effects */}
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Play sounds for game actions</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={v => {
                setSoundEnabled(v)
                if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
              }}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={soundEnabled ? colors.interactive : '#f4f3f4'}
            />
          </View>
          {/* Vibration */}
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Vibration</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Vibrate on game actions</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#767577', true: colors.accent }}
              thumbColor={vibrationEnabled ? colors.interactive : '#f4f3f4'}
            />
          </View>
          {/* Haptic Feedback */}
          <View style={[styles.settingRow, { backgroundColor: colors.white }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>Light tap on errors and presses</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
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
  container:            { flex: 1 },
  header:               { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
  headerTitle:          { fontSize: 28, fontWeight: 'bold' },
  section:              { paddingHorizontal: 20, paddingVertical: 15 },
  sectionTitle:         { fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
  sectionSubtitle:      { fontSize: 14, marginBottom: 15 },

  dailyCard:            { borderRadius: 12, padding: 15, elevation: 2, shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity:0.1, shadowRadius:4 },
  completedCard:        { backgroundColor: '#f8f9fa' },
  challengeHeader:      { flexDirection: 'row', alignItems: 'center' },
  challengeInfo:        { flex:1, marginLeft:15 },
  challengeTitle:       { fontSize:16, fontWeight:'bold' },
  challengeDescription: { fontSize:14, marginTop:2 },
  tokenBadge:           { fontSize:14, fontWeight:'bold', marginTop:4 },

  achievementCard:      { borderRadius:12, padding:15, marginBottom:10, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4 },
  achievementHeader:    { flexDirection:'row', alignItems:'center', marginBottom:10 },
  achievementInfo:      { flex:1, marginLeft:15 },
  achievementTitle:     { fontSize:16, fontWeight:'bold' },
  achievementDescription:{ fontSize:14, marginTop:2 },
  achievementReward:    { fontSize:12, fontWeight:'bold' },
  progressContainer:    { flexDirection:'row', alignItems:'center' },
  progressBar:          { flex:1, height:6, backgroundColor:'#e9ecef', borderRadius:3, marginRight:10 },
  progressFill:         { height:'100%', borderRadius:3 },
  progressText:         { fontSize:12, minWidth:35 },

  settingRow:           { flexDirection:'row', alignItems:'center', borderRadius:10, padding:15, marginBottom:10, elevation:1, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2 },
  settingInfo:          { flex:1 },
  settingTitle:         { fontSize:16, fontWeight:'bold' },
  settingDescription:   { fontSize:14, marginTop:2 },

  difficultyCard:       { borderRadius:10, padding:15, marginBottom:10, elevation:1, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2, flexDirection:'row', alignItems:'center' },
  difficultyInfo:       { flex:1 },
  difficultyName:       { fontSize:16, fontWeight:'bold' },
  difficultyDescription:{ fontSize:14, marginTop:2 },

  dangerBtn:            { flexDirection:'row', alignItems:'center', justifyContent:'center', borderRadius:10, padding:15, borderWidth:1 },
  dangerText:           { fontSize:16, marginLeft:8, fontWeight:'600', color:'#dc3545' },

  footer:               { height:20 }
})
