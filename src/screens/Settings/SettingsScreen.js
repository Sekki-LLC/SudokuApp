import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useGameSettings } from '../../contexts/GameSettingsContext';
import { COLORS } from '../../constants/colors';

const SettingsScreen = () => {
  const { selectedDifficulty, setSelectedDifficulty } = useGameSettings();
  const [userLevel, setUserLevel] = useState(3);
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Achievements data
  const achievements = [
    {
      id: 'first_win',
      title: 'First Victory',
      description: 'Complete your first puzzle',
      progress: 100,
      unlocked: true,
      reward: '10 coins'
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Solve a puzzle in under 5 minutes',
      progress: 75,
      unlocked: false,
      reward: '25 coins'
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Play 7 days in a row',
      progress: 42,
      unlocked: false,
      reward: '50 coins'
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Solve 10 puzzles without hints',
      progress: 30,
      unlocked: false,
      reward: '100 coins'
    },
    {
      id: 'master_solver',
      title: 'Master Solver',
      description: 'Complete 100 puzzles',
      progress: 67,
      unlocked: false,
      reward: '200 coins'
    }
  ];

  const difficulties = [
    { name: 'Easy', cellsToRemove: 40, description: 'Perfect for beginners' },
    { name: 'Medium', cellsToRemove: 50, description: 'A good challenge' },
    { name: 'Hard', cellsToRemove: 60, description: 'For experienced players' },
    { name: 'Expert', cellsToRemove: 70, description: 'Ultimate challenge' }
  ];

  const handleDailyChallenge = () => {
    if (dailyChallengeCompleted) {
      Alert.alert('Already Completed', 'Come back tomorrow for a new challenge!');
    } else {
      Alert.alert('Daily Challenge', 'Starting today\'s special puzzle...', [
        { text: 'Cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // Navigate to daily challenge puzzle
            setDailyChallengeCompleted(true);
          }
        }
      ]);
    }
  };

  const handleClearAllGames = () => {
    Alert.alert(
      'Clear All Saved Games',
      'Are you sure you want to delete all saved games? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All saved games have been deleted.');
          }
        }
      ]
    );
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
    Alert.alert('Difficulty Updated', `New games will be set to ${difficulty.name} difficulty.`);
  };

  const renderAchievement = (achievement) => (
    <View key={achievement.id} style={styles.achievementCard}>
      <View style={styles.achievementHeader}>
        <Ionicons 
          name={achievement.unlocked ? 'trophy' : 'trophy-outline'} 
          size={24} 
          color={achievement.unlocked ? '#fd6b02' : COLORS.textSecondary} 
        />
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDescription}>{achievement.description}</Text>
        </View>
        <Text style={styles.achievementReward}>{achievement.reward}</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${achievement.progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{achievement.progress}%</Text>
      </View>
    </View>
  );

  const renderDifficulty = (difficulty) => (
    <TouchableOpacity
      key={difficulty.name}
      style={[
        styles.difficultyCard,
        selectedDifficulty.name === difficulty.name && styles.selectedDifficulty
      ]}
      onPress={() => handleDifficultySelect(difficulty)}
    >
      <View style={styles.difficultyInfo}>
        <Text style={styles.difficultyName}>{difficulty.name}</Text>
        <Text style={styles.difficultyDescription}>{difficulty.description}</Text>
      </View>
      {selectedDifficulty.name === difficulty.name && (
        <Ionicons name="checkmark-circle" size={24} color={COLORS.interactive} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Daily Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Challenge</Text>
          <TouchableOpacity 
            style={[
              styles.dailyChallengeCard,
              dailyChallengeCompleted && styles.completedChallenge
            ]}
            onPress={handleDailyChallenge}
          >
            <View style={styles.challengeHeader}>
              <Ionicons 
                name={dailyChallengeCompleted ? 'checkmark-circle' : 'calendar'} 
                size={32} 
                color={dailyChallengeCompleted ? '#28a745' : COLORS.interactive} 
              />
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>
                  {dailyChallengeCompleted ? 'Challenge Complete!' : 'Daily Challenge'}
                </Text>
                <Text style={styles.challengeDescription}>
                  {dailyChallengeCompleted ? 
                    'Come back tomorrow for a new challenge!' : 
                    'Complete today\'s special puzzle for bonus coins!'
                  }
                </Text>
              </View>
              <Text style={styles.challengeReward}>+30 coins</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Your Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.skillCard}>
            <View style={styles.skillHeader}>
              <Ionicons name="trending-up" size={24} color={COLORS.interactive} />
              <Text style={styles.skillTitle}>Skill Level {userLevel}</Text>
            </View>
            <Text style={styles.skillDescription}>
              Keep playing to unlock harder difficulties and earn more rewards!
            </Text>
            <View style={styles.skillProgress}>
              <View style={styles.skillProgressBar}>
                <View style={[styles.skillProgressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.skillProgressText}>65% to Level {userLevel + 1}</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSubtitle}>Track your Sudoku mastery</Text>
          {achievements.map(renderAchievement)}
        </View>

        {/* Game Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Preferences</Text>
          
          {/* Sound Settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sound Effects</Text>
              <Text style={styles.settingDescription}>Play sounds for game actions</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#767577', true: COLORS.selectedCell }}
              thumbColor={soundEnabled ? COLORS.interactive : '#f4f3f4'}
            />
          </View>

          {/* Vibration Settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate on game actions</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#767577', true: COLORS.selectedCell }}
              thumbColor={vibrationEnabled ? COLORS.interactive : '#f4f3f4'}
            />
          </View>

          {/* Auto-save Settings */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Auto-Save</Text>
              <Text style={styles.settingDescription}>Automatically save game progress</Text>
            </View>
            <Switch
              value={autoSaveEnabled}
              onValueChange={setAutoSaveEnabled}
              trackColor={{ false: '#767577', true: COLORS.selectedCell }}
              thumbColor={autoSaveEnabled ? COLORS.interactive : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred challenge level</Text>
          {difficulties.map(renderDifficulty)}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleClearAllGames}>
            <Ionicons name="trash" size={20} color="#dc3545" />
            <Text style={styles.dangerButtonText}>Clear All Saved Games</Text>
          </TouchableOpacity>
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cellBorder,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  dailyChallengeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedChallenge: {
    backgroundColor: '#f8f9fa',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeInfo: {
    flex: 1,
    marginLeft: 15,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  challengeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  challengeReward: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fd6b02',
  },
  skillCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  skillDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  skillProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginRight: 10,
  },
  skillProgressFill: {
    height: '100%',
    backgroundColor: COLORS.interactive,
    borderRadius: 4,
  },
  skillProgressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 15,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  achievementDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  achievementReward: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fd6b02',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.interactive,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    minWidth: 35,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  difficultyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDifficulty: {
    borderWidth: 2,
    borderColor: COLORS.interactive,
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  difficultyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  dangerButtonText: {
    fontSize: 16,
    color: '#dc3545',
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    height: 20,
  },
});

export default SettingsScreen;

