// File: src/screens/Store/StoreScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import AdBanner from '../../components/AdBanner';
import * as InAppPurchases from 'expo-in-app-purchases';

const { width } = Dimensions.get('window');
const productIds = ['com.myapp.remove_ads'];

export default function StoreScreen() {
  const { tokens, addTokens, purchasedItems, setPurchasedItems } = useUser();
  const [iapProducts, setIapProducts] = useState([]);
  const { themeId: selectedTheme, setThemeId, colors } = useTheme();

  useEffect(() => {
    async function initIAP() {
      await InAppPurchases.connectAsync();
      const { responseCode, results } = await InAppPurchases.getProductsAsync(productIds);
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        setIapProducts(results);
      }
    }
    initIAP();

    const listener = InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach(async (purchase) => {
          if (!purchase.acknowledged && purchase.productId === productIds[0]) {
            setPurchasedItems([...purchasedItems, 'ad_free']);
            await InAppPurchases.finishTransactionAsync(purchase, true);
            Alert.alert('Purchase Successful', 'Ads have been removed!');
          }
        });
      } else if (responseCode !== InAppPurchases.IAPResponseCode.USER_CANCELED) {
        Alert.alert('Purchase Error', `Code: ${errorCode}`);
      }
    });

    return () => {
      listener.remove();
      InAppPurchases.disconnectAsync();
    };
  }, [purchasedItems]);

  const premiumItems = [
    { id:'unlimited_hints', title:'Unlimited Hints', description:'Never get stuck again', tokenCost:300, icon:'bulb', popular:true },
    { id:'ad_free',         title:'Remove Ads',      description:'Enjoy uninterrupted gameplay', tokenCost:200, icon:'close-circle', popular:false },
    { id:'premium_themes',  title:'Premium Themes',  description:'Unlock 10+ beautiful themes', tokenCost:100, icon:'color-palette', popular:false },
    { id:'power_ups',       title:'Power-Up Pack',   description:'Auto-fill, smart hints', tokenCost:400, icon:'flash', popular:true },
    { id:'premium_bundle',  title:'Premium Bundle',  description:'Everything included – Best Value!', tokenCost:600, icon:'star', popular:true }
  ];

  const themes = [
    { id:'classic',  name:'Classic Mode',   free:true  },
    { id:'dark',     name:'Dark Mode',      free:false },
    { id:'ocean',    name:'Ocean Blue',     free:false },
    { id:'forest',   name:'Forest Green',   free:false },
    { id:'sunset',   name:'Sunset Orange',  free:false },
    { id:'cherry',   name:'Cherry Blossom', free:false },
    { id:'midnight', name:'Midnight Black', free:false },
    { id:'pastel',   name:'Pastel Dreams',  free:false }
  ];

  function handlePurchase(item) {
    if (item.id === 'ad_free') {
      const product = iapProducts.find(p => p.productId === 'com.myapp.remove_ads');
      if (product) {
        InAppPurchases.purchaseItemAsync(product.productId);
      } else {
        Alert.alert('Purchase Unavailable', 'Please try again later.');
      }
      return;
    }
    if (tokens < item.tokenCost) {
      return Alert.alert('Not Enough Tokens', `Costs ${item.tokenCost}, you have ${tokens}.`);
    }
    Alert.alert(
      'Confirm Purchase',
      `Spend ${item.tokenCost} tokens on ${item.title}?`,
      [
        { text:'Cancel', style:'cancel' },
        { text:'Yes', onPress:() => {
            addTokens(-item.tokenCost);
            setPurchasedItems(prev => [...prev, item.id]);
          }
        }
      ]
    );
  }

  function handleRestorePurchases() {
    Alert.alert('Restore Purchases', 'Your previous unlocks have been restored.');
  }

  function handleAddMore() {
    Alert.alert('Add More Tokens', 'Navigate to token purchase screen.');
  }

  function renderPremium(item) {
    const unlocked = purchasedItems.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: colors.background },
          item.popular && { borderColor: colors.accent, borderWidth: 1 }
        ]}
        onPress={() => unlocked ? null : handlePurchase(item)}
      >
        {item.popular && (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>POPULAR</Text>
          </View>
        )}
        <View style={styles.row}>
          <Ionicons name={item.icon} size={24} color={colors.accent} />
          <View style={styles.info}>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{item.description}</Text>
          </View>
          <View style={styles.cost}>
            <Text style={[styles.costText, { color: colors.accent }]}>
              {unlocked ? '✔' : item.tokenCost}
            </Text>
            <Ionicons name="diamond" size={16} color="#fd6b02" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderTheme(theme) {
    const unlocked = theme.free || purchasedItems.includes('premium_themes');
    return (
      <TouchableOpacity
        key={theme.id}
        style={[
          styles.themeCard,
          { backgroundColor: colors.background },
          !unlocked && styles.lockedTheme,
          selectedTheme === theme.id && { borderColor: colors.accent, borderWidth: 2 }
        ]}
        onPress={() =>
          unlocked
            ? setThemeId(theme.id)
            : Alert.alert('Premium Theme', 'Purchase Premium Themes to unlock.')
        }
      >
        <Text style={[styles.themeName, { color: colors.text }]}>{theme.name}</Text>
        {!theme.free && !unlocked && (
          <Ionicons name="lock-closed" size={16} color={colors.textSecondary} />
        )}
        {selectedTheme === theme.id && (
          <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <AdBanner />
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: colors.text }]}>Store</Text>
          <View style={styles.tokensRow}>
            <Ionicons name="diamond" size={20} color="#fd6b02" />
            <Text style={[styles.tokenCount, { color: colors.text }]}>{tokens}</Text>
            <TouchableOpacity onPress={handleAddMore} style={styles.addMoreBtn}>
              <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
              <Text style={[styles.addMoreText, { color: colors.accent }]}>Add More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {premiumItems.map(renderPremium)}

        <TouchableOpacity onPress={handleRestorePurchases} style={styles.restoreBtn}>
          <Ionicons name="refresh" size={20} color={colors.accent} />
          <Text style={[styles.restoreText, { color: colors.accent }]}>Restore Purchases</Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Themes</Text>
          <View style={styles.themesGrid}>{themes.map(renderTheme)}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  scrollView:    { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 20 },
  headerRow:     { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  header:        { fontSize:24, fontWeight:'bold' },
  tokensRow:     { flexDirection:'row', alignItems:'center' },
  tokenCount:    { marginLeft:5, fontSize:16, fontWeight:'bold' },
  addMoreBtn:    { flexDirection:'row', alignItems:'center', marginLeft:12 },
  addMoreText:   { marginLeft:4, fontSize:14, fontWeight:'600' },
  card:          { borderRadius:10, padding:15, marginBottom:15, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2, elevation:2 },
  badge:         { position:'absolute', top:-8, right:-8, paddingHorizontal:6, paddingVertical:3, borderRadius:5 },
  badgeText:     { fontSize:10, fontWeight:'600' },
  row:           { flexDirection:'row', alignItems:'center' },
  info:          { flex:1, marginLeft:15 },
  title:         { fontSize:16, fontWeight:'bold' },
  desc:          { fontSize:14, marginTop:2 },
  cost:          { flexDirection:'row', alignItems:'center' },
  costText:      { fontSize:16, fontWeight:'bold', marginRight:4 },
  restoreBtn:    { flexDirection:'row', alignItems:'center', justifyContent:'center', marginVertical:10 },
  restoreText:   { marginLeft:8, fontSize:14, fontWeight:'600' },
  section:       { marginTop:20 },
  sectionTitle:  { fontSize:18, fontWeight:'bold', marginBottom:10 },
  themesGrid:    { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  themeCard:     { width:(width-60)/2, borderRadius:8, padding:15, marginBottom:10, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2, elevation:2, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  lockedTheme:   { opacity:0.5 },
});
