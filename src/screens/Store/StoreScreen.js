// File: src/screens/Store/StoreScreen.js

import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants/colors'
import { useTheme } from '../../contexts/ThemeContext'

const { width } = Dimensions.get('window')

export default function StoreScreen() {
  const [userTokens, setUserTokens] = useState(150)
  const [purchasedItems, setPurchasedItems] = useState([])
  const { themeId: selectedTheme, setThemeId } = useTheme()

  const premiumItems = [
    {
      id: 'unlimited_hints',
      title: 'Unlimited Hints',
      description: 'Never get stuck again',
      tokenCost: 300,
      icon: 'bulb',
      popular: true
    },
    {
      id: 'ad_free',
      title: 'Remove Ads',
      description: 'Enjoy uninterrupted gameplay',
      tokenCost: 200,
      icon: 'close-circle',
      popular: false
    },
    {
      id: 'premium_themes',
      title: 'Premium Themes',
      description: 'Unlock 10+ beautiful themes',
      tokenCost: 100,
      icon: 'color-palette',
      popular: false
    },
    {
      id: 'power_ups',
      title: 'Power-Up Pack',
      description: 'Auto-fill, smart hints',
      tokenCost: 400,
      icon: 'flash',
      popular: true
    },
    {
      id: 'premium_bundle',
      title: 'Premium Bundle',
      description: 'Everything included – Best Value!',
      tokenCost: 600,
      icon: 'star',
      popular: true
    }
  ]

  const themes = [
    { id: 'classic',  name: 'Classic Purple', free: true  },
    { id: 'dark',     name: 'Dark Mode',      free: false },
    { id: 'ocean',    name: 'Ocean Blue',     free: false },
    { id: 'forest',   name: 'Forest Green',   free: false },
    { id: 'sunset',   name: 'Sunset Orange',  free: false },
    { id: 'cherry',   name: 'Cherry Blossom', free: false },
    { id: 'midnight', name: 'Midnight Black', free: false },
    { id: 'pastel',   name: 'Pastel Dreams',  free: false }
  ]

  function handlePurchase(item) {
    if (userTokens < item.tokenCost) {
      return Alert.alert(
        'Not Enough Tokens',
        `Costs ${item.tokenCost}, you have ${userTokens}.`
      )
    }
    Alert.alert(
      'Confirm Purchase',
      `Spend ${item.tokenCost} tokens on ${item.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setUserTokens(prev => prev - item.tokenCost)
            setPurchasedItems(prev => [...prev, item.id])
          }
        }
      ]
    )
  }

  function handleRestorePurchases() {
    Alert.alert('Restore Purchases', 'Your previous unlocks have been restored.')
    setPurchasedItems(prev => [...prev])
  }

  function handleAddMore() {
    Alert.alert('Add More Tokens', 'Navigate to token purchase screen.')
    // TODO: integrate your purchase flow
  }

  function renderPremium(item) {
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, item.popular && styles.popularCard]}
        onPress={() => handlePurchase(item)}
      >
        {item.popular && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>POPULAR</Text>
          </View>
        )}
        <View style={styles.row}>
          <Ionicons name={item.icon} size={24} color={COLORS.interactive} />
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </View>
          <View style={styles.cost}>
            <Text style={styles.costText}>{item.tokenCost}</Text>
            <Ionicons name="diamond" size={16} color="#fd6b02" />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  function renderTheme(theme) {
    const unlocked = theme.free || purchasedItems.includes('premium_themes')
    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.themeCard,
          !unlocked && styles.lockedTheme,
          selectedTheme === theme.id && styles.selectedTheme
        ]}
        onPress={() =>
          unlocked
            ? setThemeId(theme.id)
            : Alert.alert('Premium Theme', 'Purchase Premium Themes to unlock.')
        }
      >
        <Text style={styles.themeName}>{theme.name}</Text>
        {!theme.free && !unlocked && (
          <Ionicons name="lock-closed" size={16} color={COLORS.textSecondary} />
        )}
        {selectedTheme === theme.id && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.interactive} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Store</Text>
          <View style={styles.tokensRow}>
            <Ionicons name="diamond" size={20} color="#fd6b02" />
            <Text style={styles.tokenCount}>{userTokens}</Text>
            <TouchableOpacity onPress={handleAddMore} style={styles.addMoreBtn}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.interactive} />
              <Text style={styles.addMoreText}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {premiumItems.map(renderPremium)}

        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestorePurchases}>
          <Ionicons name="refresh" size={20} color={COLORS.interactive} />
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Themes</Text>
          <View style={styles.themesGrid}>{themes.map(renderTheme)}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  tokensRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tokenCount: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  addMoreText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.interactive
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  popularCard: {
    borderWidth: 1,
    borderColor: COLORS.interactive
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.interactive,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 15
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  cost: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.interactive,
    marginRight: 4
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  restoreText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.interactive
  },
  section: {
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  themeCard: {
    width: (width - 60) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: COLORS.interactive
  },
  lockedTheme: {
    opacity: 0.5
  },
  themeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1
  }
})
