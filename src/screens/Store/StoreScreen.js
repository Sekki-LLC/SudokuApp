import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const StoreScreen = () => {
  const [userCoins, setUserCoins] = useState(150); // Virtual currency
  const [selectedTheme, setSelectedTheme] = useState('classic');

  // Premium items data
  const premiumItems = [
    {
      id: 'unlimited_hints',
      title: 'Unlimited Hints',
      description: 'Never get stuck again with unlimited hints',
      price: '$2.99',
      icon: 'bulb',
      popular: true
    },
    {
      id: 'ad_free',
      title: 'Remove Ads',
      description: 'Enjoy uninterrupted gameplay',
      price: '$1.99',
      icon: 'close-circle',
      popular: false
    },
    {
      id: 'premium_themes',
      title: 'Premium Themes',
      description: 'Unlock 10+ beautiful themes',
      price: '$0.99',
      icon: 'color-palette',
      popular: false
    },
    {
      id: 'power_ups',
      title: 'Power-Up Pack',
      description: 'Auto-fill, reveal conflicts, smart hints',
      price: '$3.99',
      icon: 'flash',
      popular: true
    },
    {
      id: 'premium_bundle',
      title: 'Premium Bundle',
      description: 'Everything included - Best Value!',
      price: '$6.99',
      icon: 'star',
      popular: true,
      savings: 'Save 30%'
    }
  ];

  // Themes data
  const themes = [
    { id: 'classic', name: 'Classic Purple', free: true },
    { id: 'dark', name: 'Dark Mode', free: false },
    { id: 'ocean', name: 'Ocean Blue', free: false },
    { id: 'forest', name: 'Forest Green', free: false },
    { id: 'sunset', name: 'Sunset Orange', free: false },
    { id: 'cherry', name: 'Cherry Blossom', free: false },
    { id: 'midnight', name: 'Midnight Black', free: false },
    { id: 'pastel', name: 'Pastel Dreams', free: false }
  ];

  const handlePurchase = (item) => {
    Alert.alert(
      'Purchase Confirmation',
      `Would you like to purchase ${item.title} for ${item.price}?${item.savings ? `\n\n${item.savings}` : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Purchase', 
          onPress: () => {
            Alert.alert('Success!', `${item.title} has been added to your account!`);
            // Add coins for purchase simulation
            setUserCoins(prev => prev + 50);
          }
        }
      ]
    );
  };

  const handleThemeSelect = (themeId) => {
    if (themes.find(t => t.id === themeId)?.free) {
      setSelectedTheme(themeId);
      Alert.alert('Theme Applied', 'Your new theme has been applied!');
    } else {
      Alert.alert('Premium Theme', 'Purchase Premium Themes to unlock this theme!');
    }
  };

  const handleRestorePurchases = () => {
    Alert.alert('Restore Purchases', 'Checking for previous purchases...', [
      { text: 'OK', onPress: () => Alert.alert('Complete', 'No previous purchases found.') }
    ]);
  };

  const renderPremiumItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.premiumCard, item.popular && styles.popularCard]}
      onPress={() => handlePurchase(item)}
    >
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      )}
      {item.savings && (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>{item.savings}</Text>
        </View>
      )}
      <View style={styles.premiumHeader}>
        <Ionicons name={item.icon} size={32} color={COLORS.interactive} />
        <View style={styles.premiumInfo}>
          <Text style={styles.premiumTitle}>{item.title}</Text>
          <Text style={styles.premiumDescription}>{item.description}</Text>
        </View>
        <Text style={styles.premiumPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTheme = (theme) => (
    <TouchableOpacity 
      key={theme.id}
      style={[
        styles.themeCard,
        selectedTheme === theme.id && styles.selectedTheme,
        !theme.free && styles.premiumTheme
      ]}
      onPress={() => handleThemeSelect(theme.id)}
    >
      <Text style={styles.themeName}>{theme.name}</Text>
      {!theme.free && (
        <Ionicons name="lock-closed" size={16} color={COLORS.textSecondary} />
      )}
      {selectedTheme === theme.id && (
        <Ionicons name="checkmark-circle" size={20} color={COLORS.interactive} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Store</Text>
          <View style={styles.coinsContainer}>
            <Ionicons name="diamond" size={20} color="#fd6b02" />
            <Text style={styles.coinsText}>{userCoins}</Text>
          </View>
        </View>

        {/* Store Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            Enhance your Sudoku experience with premium features and beautiful themes!
          </Text>
        </View>

        {/* Premium Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          <Text style={styles.sectionSubtitle}>Unlock the full potential of your Sudoku experience</Text>
          {premiumItems.map(renderPremiumItem)}
        </View>

        {/* Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes</Text>
          <Text style={styles.sectionSubtitle}>Personalize your game with beautiful themes</Text>
          <View style={styles.themesGrid}>
            {themes.map(renderTheme)}
          </View>
        </View>

        {/* Restore Purchases */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
            <Ionicons name="refresh" size={20} color={COLORS.interactive} />
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All purchases are one-time only and will be restored across devices when you sign in.
          </Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.selectedCell,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 5,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.selectedCell,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 22,
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
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: '#fd6b02',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 15,
    backgroundColor: '#fd6b02',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    left: 15,
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumInfo: {
    flex: 1,
    marginLeft: 15,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  premiumDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  premiumPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.interactive,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: COLORS.interactive,
  },
  premiumTheme: {
    opacity: 0.7,
  },
  themeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.cellBorder,
  },
  restoreButtonText: {
    fontSize: 16,
    color: COLORS.interactive,
    marginLeft: 8,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default StoreScreen;

