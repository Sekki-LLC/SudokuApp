// File: src/screens/Store/StoreScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { showInterstitial } from '../../components/InterstitialAd';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import * as InAppPurchases from 'expo-in-app-purchases';

const { width } = Dimensions.get('window');
const productIds = [
  'com.myapp.remove_ads',
  'com.myapp.tokens_100',
  'com.myapp.tokens_500',
  'com.myapp.tokens_1200'
];

export default function StoreScreen() {
  const { tokens, addTokens, purchasedItems, addPurchasedItem } = useUser();
  const { themeId: selectedTheme, setThemeId, colors } = useTheme();
  const [iapProducts, setIapProducts] = useState([]);
  const scrollRef = useRef(null);

  const goBuyTokens = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleWatchAd = async () => {
    try {
      await showInterstitial();
      addTokens(5);
      Alert.alert('Thanks!', 'You earned 5 tokens!');
    } catch {
      Alert.alert('Ad Unavailable', 'Please try again later.');
    }
  };

  useEffect(() => {
    InAppPurchases.connectAsync()
      .then(() => InAppPurchases.getProductsAsync(productIds))
      .then(({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          setIapProducts(results);
        }
      });

    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results.forEach(async purchase => {
          if (!purchase.acknowledged) {
            switch (purchase.productId) {
              case 'com.myapp.tokens_100':
                addTokens(100); Alert.alert('Success', '100 tokens added!'); break;
              case 'com.myapp.tokens_500':
                addTokens(500); Alert.alert('Success', '500 tokens added!'); break;
              case 'com.myapp.tokens_1200':
                addTokens(1200); Alert.alert('Success', '1200 tokens added!'); break;
              case 'com.myapp.remove_ads':
                addPurchasedItem('ad_free'); Alert.alert('Success', 'Ads removed!'); break;
            }
            await InAppPurchases.finishTransactionAsync(purchase, true);
          }
        });
      } else if (responseCode !== InAppPurchases.IAPResponseCode.USER_CANCELED) {
        Alert.alert('Purchase Error', `Code: ${errorCode}`);
      }
    });

    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const renderTokenPack = product => (
    <TouchableOpacity
      key={product.productId}
      style={[styles.card, { backgroundColor: colors.background }]}
      onPress={() => InAppPurchases.purchaseItemAsync(product.productId)}
    >
      <View style={styles.row}>
        <Ionicons name="diamond" size={24} color="#fd6b02" />
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>{product.description}</Text>
        </View>
        <Text style={[styles.costText, { color: colors.accent }]}>{product.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const premiumItems = [
    { id:'unlimited_hints', title:'Unlimited Hints', description:'Never get stuck again', tokenCost:300, icon:'bulb', popular:true },
    { id:'ad_free',         title:'Remove Ads',      description:'Enjoy uninterrupted gameplay', tokenCost:200, icon:'close-circle', popular:false },
    { id:'premium_themes',  title:'Premium Themes',  description:'Unlock 10+ beautiful themes', tokenCost:100, icon:'color-palette', popular:false },
    { id:'power_ups',       title:'Power-Up Pack',   description:'Auto-fill, smart hints', tokenCost:400, icon:'flash', popular:true },
    { id:'premium_bundle',  title:'Premium Bundle',  description:'Everything included – Best Value!', tokenCost:600, icon:'star', popular:true }
  ];

  const renderPremium = item => {
    const unlocked = purchasedItems.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: colors.background },
          item.popular && { borderColor: colors.accent, borderWidth: 1 }
        ]}
        onPress={() => {
          if (item.id === 'ad_free') {
            const prod = iapProducts.find(p => p.productId === 'com.myapp.remove_ads');
            return prod
              ? InAppPurchases.purchaseItemAsync(prod.productId)
              : Alert.alert('Unavailable', 'Try again later.');
          }
          if (!unlocked && tokens < item.tokenCost) {
            return Alert.alert(
              'Not Enough Tokens',
              `You need ${item.tokenCost}, you have ${tokens}.`,
              [{ text:'Cancel', style:'cancel' }, { text:'Buy Tokens', onPress:goBuyTokens }]
            );
          }
          if (!unlocked) {
            return Alert.alert(
              'Confirm Purchase',
              `Spend ${item.tokenCost} tokens on "${item.title}"?`,
              [
                { text:'Cancel', style:'cancel' },
                {
                  text:'Yes',
                  onPress:() => {
                    addTokens(-item.tokenCost);
                    addPurchasedItem(item.id);
                  }
                }
              ]
            );
          }
        }}
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
  };

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

  const renderTheme = theme => {
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
            : Alert.alert('Premium Themes', 'Purchase Premium Themes to unlock.')
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
  };

  const handleRestorePurchases = () =>
    Alert.alert('Restored', 'Your previous purchases are back.');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ==== Your Tokens ==== */}
        <View style={styles.tokenHeaderRow}>
          <Text style={[styles.tokenLabel, { color: colors.text }]}>Your Tokens:</Text>
          <View style={styles.tokensRow}>
            <Ionicons name="diamond" size={20} color="#fd6b02" />
            <Text style={[styles.tokenCount, { color: colors.text }]}>{tokens}</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />

        {/* Buy More Tokens */}
        {iapProducts.some(p => p.productId.startsWith('com.myapp.tokens_')) && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Buy More Tokens</Text>
            {iapProducts
              .filter(p => p.productId.startsWith('com.myapp.tokens_'))
              .map(renderTokenPack)}
          </>
        )}

        {/* Watch Ad */}
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.background }]} onPress={handleWatchAd}>
          <View style={styles.row}>
            <Ionicons name="play-circle-outline" size={24} color={colors.accent} />
            <Text style={[styles.title, { color: colors.accent, marginLeft:12 }]}>
              Watch Ad to Earn 5 Tokens
            </Text>
          </View>
        </TouchableOpacity>

        {/* Store Header */}
        <View style={styles.headerRow}>
          <Text style={[styles.header, { color: colors.text }]}>Store</Text>
        </View>

        {/* Premium Items */}
        {premiumItems.map(renderPremium)}

        {/* Restore Purchases */}
        <TouchableOpacity onPress={handleRestorePurchases} style={styles.restoreBtn}>
          <Ionicons name="refresh" size={20} color={colors.accent} />
          <Text style={[styles.restoreText, { color: colors.accent }]}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Themes */}
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
  scrollContent: { padding: 20 },

  /* TOKEN HEADER */
  tokenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tokenLabel:   { fontSize: 18, fontWeight: '600' },
  tokensRow:    { flexDirection:'row', alignItems:'center' },
  tokenCount:   { marginLeft: 6, fontSize: 18, fontWeight: 'bold' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card:         { borderRadius:10, padding:15, marginBottom:15, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2 },
  row:          { flexDirection:'row', alignItems:'center' },
  info:         { flex:1, marginLeft:15 },
  title:        { fontSize:16, fontWeight:'bold' },
  desc:         { fontSize:14, marginTop:2 },
  cost:         { flexDirection:'row', alignItems:'center' },
  costText:     { fontSize:16, fontWeight:'bold', marginRight:4 },
  badge:        { position:'absolute', top:-8, right:-8, paddingHorizontal:6, paddingVertical:3, borderRadius:5 },
  badgeText:    { fontSize:10, fontWeight:'600' },
  headerRow:    { marginTop:20, marginBottom:10 },
  header:       { fontSize:24, fontWeight:'bold' },
  restoreBtn:   { flexDirection:'row', alignItems:'center', justifyContent:'center', marginVertical:10 },
  restoreText:  { marginLeft:8, fontSize:14, fontWeight:'600' },
  section:      { marginTop:20 },
  themesGrid:   { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  themeCard:    { width:(width-60)/2, borderRadius:8, padding:15, marginBottom:10, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  lockedTheme:  { opacity:0.5 },
  themeName:    { fontSize:14 },
});
