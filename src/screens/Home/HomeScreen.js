// File: src/screens/Home/ImprovedHomeScreen.js
// MERGED VERSION – COMPLETE GREETING SUITE + FALLING SQUARES ANIMATION

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');
const NUM_BLOCKS = 8;

// —— SET THIS TO 1–5 TO CHOOSE YOUR GREETING ——  
const GREETING_OPTION = 5;

export default function ImprovedHomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { addTokens } = useUser();

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const tmw = new Date(now);
      tmw.setDate(now.getDate() + 1);
      tmw.setHours(0, 0, 0, 0);
      setSecondsLeft(Math.floor((tmw - now) / 1000));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);
  const hours   = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  // Mock rank
  const [userRank] = useState(0);

  // Falling blocks setup
  const blocks = useRef(
    Array.from({ length: NUM_BLOCKS }).map(() => ({
      anim: new Animated.Value(-50),
      rotation: new Animated.Value(0),
      x: Math.random() * (width - 40),
      type: Math.random() > 0.5 ? 'number' : 'shape',
      number: Math.ceil(Math.random() * 99),
      shape: ['puzzle','grid','square'][Math.floor(Math.random() * 3)],
    }))
  ).current;

  // Shared animated values
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;

  // Typewriter
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Hey Grid Genius!';
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Bouncing letters
  const letterAnimations = useRef(
    fullText.split('').map(() => ({
      translateY: new Animated.Value(50),
      scale: new Animated.Value(0.5),
    }))
  ).current;

  // Shimmer
  const shimmerTranslateX = useRef(new Animated.Value(-300)).current;

  // Particle Burst
  const particleAnims = useRef(
    Array.from({ length: 12 }).map(() => ({
      scale: new Animated.Value(0),
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  // Glitch
  const glitchOpacity = useRef(new Animated.Value(0)).current;
  const glitchOffset1 = useRef(new Animated.Value(0)).current;
  const glitchOffset2 = useRef(new Animated.Value(0)).current;

  // Greeting starters
  const starters = {
    1: () => {
      Animated.parallel([
        Animated.timing(titleOpacity,    { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
      let idx = 0;
      const ti = setInterval(() => {
        if (idx <= fullText.length) {
          setDisplayedText(fullText.substring(0, idx++));
        } else {
          clearInterval(ti);
          setTimeout(() => {
            cursorOpacity.stopAnimation();
            Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
          }, 1000);
        }
      }, 120);
    },
    2: () => {
      const anims = letterAnimations.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.parallel([
            Animated.spring(anim.translateY, { toValue: 0, tension: 100, friction: 3, useNativeDriver: true }),
            Animated.spring(anim.scale,      { toValue: 1, tension: 100, friction: 3, useNativeDriver: true }),
          ]),
        ])
      );
      Animated.parallel(anims).start();
    },
    3: () => {
      Animated.parallel([
        Animated.timing(titleOpacity,    { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        Animated.loop(
          Animated.timing(shimmerTranslateX, { toValue: 300, duration: 2000, useNativeDriver: true }),
          { iterations: 3 }
        ).start();
      });
    },
    4: () => {
      Animated.parallel([
        Animated.timing(titleOpacity,    { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        const parts = particleAnims.map((p, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const distance = 100;
          return Animated.parallel([
            Animated.timing(p.scale,      { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(p.translateX, { toValue: Math.cos(angle) * distance, duration: 1000, useNativeDriver: true }),
            Animated.timing(p.translateY, { toValue: Math.sin(angle) * distance, duration: 1000, useNativeDriver: true }),
            Animated.sequence([
              Animated.delay(500),
              Animated.timing(p.opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
            ]),
          ]);
        });
        Animated.parallel(parts).start();
      });
    },
    5: () => {
      Animated.parallel([
        Animated.timing(titleOpacity,    { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(titleTranslateY, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start(() => {
        const seq = Animated.sequence([
          Animated.parallel([
            Animated.timing(glitchOpacity, { toValue: 0.8, duration: 100, useNativeDriver: true }),
            Animated.timing(glitchOffset1, { toValue: 3,   duration: 100, useNativeDriver: true }),
            Animated.timing(glitchOffset2, { toValue: -2,  duration: 100, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(glitchOpacity, { toValue: 0,   duration: 100, useNativeDriver: true }),
            Animated.timing(glitchOffset1, { toValue: 0,   duration: 100, useNativeDriver: true }),
            Animated.timing(glitchOffset2, { toValue: 0,   duration: 100, useNativeDriver: true }),
          ]),
          Animated.delay(1000),
        ]);
        Animated.loop(seq, { iterations: 3 }).start();
      });
    },
  };

  useEffect(() => {
    // 1) start greeting
    starters[GREETING_OPTION]();

    // 2) falling blocks animation
    blocks.forEach(({ anim, rotation }, i) => {
      const delay = i * 200;
      Animated.parallel([
        Animated.timing(anim, {
          toValue: height + 50,
          duration: 4000 + Math.random() * 2000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4000 + Math.random() * 2000,
          delay,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          // reset and loop
          anim.setValue(-50);
          rotation.setValue(0);
          Animated.parallel([
            Animated.timing(anim, {
              toValue: height + 50,
              duration: 4000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(rotation, {
              toValue: 1,
              duration: 4000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]).start();
        }
      });
    });

    // 3) fade in main content
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 600,
      delay: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  // Rewarded Ad Setup
  const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-7765897544369826/your_rewarded_unit';
  const [adLoaded, setAdLoaded]   = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const rewardedRef = useRef(null);

  useEffect(() => {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
      keywords: ['games','puzzle'],
    });
    rewardedRef.current = rewarded;
    const unsubscribe = rewarded.addAdEventsListener(({ type, payload }) => {
      switch (type) {
        case RewardedAdEventType.LOADED:
          setAdLoaded(true);
          setAdLoading(false);
          break;
        case RewardedAdEventType.ERROR:
          setAdLoaded(false);
          setAdLoading(false);
          setTimeout(() => { setAdLoading(true); rewarded.load(); }, 5000);
          break;
        case RewardedAdEventType.CLOSED:
          setAdLoaded(false);
          setTimeout(() => { setAdLoading(true); rewarded.load(); }, 1000);
          break;
        case RewardedAdEventType.EARNED_REWARD:
          const amount = payload?.amount || 10;
          addTokens(amount);
          Alert.alert('Reward Earned!', `You earned ${amount} tokens!`, [{ text:'Awesome!' }]);
          break;
      }
    });
    setAdLoading(true);
    rewarded.load();
    return () => unsubscribe();
  }, [addTokens]);

  const watchAd = async () => {
    if (adLoading) {
      return Alert.alert('Loading Ad','Please wait…',[{ text:'OK' }]);
    }
    if (!adLoaded || !rewardedRef.current) {
      return Alert.alert('Ad Not Ready','Try again later.',[
        { text:'Cancel', style:'cancel' },
        { text:'Retry', onPress:() => { setAdLoading(true); rewardedRef.current?.load(); } }
      ]);
    }
    try {
      await rewardedRef.current.show();
    } catch {
      setAdLoaded(false);
      setTimeout(() => rewardedRef.current?.load(), 2000);
      Alert.alert('Ad Error','Unable to show ad right now.',[{ text:'OK' }]);
    }
  };

  // Navigation
  const goGame     = () => navigation.navigate('Game');
  const goPuzzles  = () => navigation.navigate('MainTabs',{ screen:'My Puzzles' });
  const goStats    = () => navigation.navigate('MainTabs',{ screen:'Stats' });
  const goStore    = () => navigation.navigate('MainTabs',{ screen:'Store' });
  const goSettings = () => navigation.navigate('MainTabs',{ screen:'Settings' });

  // MenuButton
  const MenuButton = ({ title, icon, onPress, isPrimary = false, style }) => {
    const scale = useRef(new Animated.Value(1)).current;
    return (
      <Animated.View style={[{ transform:[{ scale }] }, style]}>
        <Pressable
          style={[
            styles.menuButton,
            isPrimary ? styles.primaryButton : styles.secondaryButton,
            { backgroundColor: colors.accent },
          ]}
          onPressIn={() => Animated.spring(scale,{ toValue:0.95, useNativeDriver:true }).start()}
          onPressOut={() => Animated.spring(scale,{ toValue:1,    useNativeDriver:true }).start()}
          onPress={onPress}
        >
          <View style={styles.buttonContent}>
            <Ionicons name={icon} size={isPrimary?28:24} color={colors.white} />
            <Text style={[ isPrimary? styles.primaryText:styles.secondaryText, { color:colors.white } ]}>
              {title}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  // StatCard
  const StatCard = ({ topLabel, value, bottomLabel }) => (
    <Animated.View style={[
      styles.statCard,
      { opacity: fadeAnimation, borderWidth:1, borderColor:colors.accent }
    ]}>
      {topLabel && <Text style={[styles.smallLabel,{ color:colors.textSecondary }]}>{topLabel}</Text>}
      <Text style={[styles.statValue,{ color:colors.text }]}>{value}</Text>
      {bottomLabel && <Text style={[styles.statLabel,{ color:colors.textSecondary }]}>{bottomLabel}</Text>}
    </Animated.View>
  );

  // ActionCard
  const ActionCard = ({ icon, topLabel, bottomLabel, onPress }) => {
    const isDisabled = onPress === watchAd && (!adLoaded || adLoading);
    const getAdStatus = () =>
      adLoading ? 'Loading Ad...' : (adLoaded ? bottomLabel : 'Ad Unavailable');

    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.statCard,
          {
            backgroundColor: colors.background,
            borderWidth:1, borderColor:colors.accent,
            opacity: isDisabled?0.5:1
          }
        ]}
      >
        {topLabel && <Text style={[styles.smallLabel,{ color:colors.accent }]}>{topLabel}</Text>}
        <Ionicons name={icon} size={28} color={colors.accent} style={{ marginVertical:6 }} />
        <Text style={[styles.statLabel,{ color:colors.accent }]}>
          { onPress === watchAd ? getAdStatus() : bottomLabel }
        </Text>
      </Pressable>
    );
  };

  // Greeting renderers
  const renderers = {
    1: () => (
      <Animated.View style={{ opacity:titleOpacity, transform:[{ translateY:titleTranslateY }] }}>
        <View style={styles.typewriterContainer}>
          <Text style={[styles.title,{ color:colors.text }]}>
            {displayedText}
            <Animated.Text style={[styles.cursor,{ opacity:cursorOpacity, color:colors.text }]}>|</Animated.Text>
          </Text>
        </View>
      </Animated.View>
    ),
    2: () => (
      <View style={styles.bouncingContainer}>
        {fullText.split('').map((c,i) => (
          <Animated.Text
            key={i}
            style={[
              styles.title,
              { color:colors.text },
              { transform:[
                  { translateY: letterAnimations[i].translateY },
                  { scale:     letterAnimations[i].scale },
                ]
              }
            ]}
          >
            {c===' ' ? '\u00A0' : c}
          </Animated.Text>
        ))}
      </View>
    ),
    3: () => (
      <Animated.View style={{ opacity:titleOpacity, transform:[{ translateY:titleTranslateY }] }}>
        <View style={styles.shimmerContainer}>
          <Text style={[styles.title,{ color:colors.text }]}>{fullText}</Text>
          <Animated.View style={[styles.shimmerOverlay,{ transform:[{ translateX:shimmerTranslateX }] }]} />
        </View>
      </Animated.View>
    ),
    4: () => (
      <Animated.View style={{ opacity:titleOpacity, transform:[{ translateY:titleTranslateY }] }}>
        <View style={styles.particleContainer}>
          <Text style={[styles.title,{ color:colors.text }]}>{fullText}</Text>
          {particleAnims.map((p,i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: colors.accent,
                  transform: [
                    { translateX: p.translateX },
                    { translateY: p.translateY },
                    { scale:      p.scale },
                  ],
                  opacity: p.opacity,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    ),
    5: () => (
      <Animated.View style={{ opacity:titleOpacity, transform:[{ translateY:titleTranslateY }] }}>
        <View style={styles.glitchContainer}>
          <Text style={[styles.title,{ color:colors.text }]}>{fullText}</Text>
          <Animated.Text style={[styles.title,styles.glitchLayer1,{ opacity:glitchOpacity, transform:[{ translateX:glitchOffset1 }] }]}>
            {fullText}
          </Animated.Text>
          <Animated.Text style={[styles.title,styles.glitchLayer2,{ opacity:glitchOpacity, transform:[{ translateX:glitchOffset2 }] }]}>
            {fullText}
          </Animated.Text>
        </View>
      </Animated.View>
    ),
  };

  return (
    <SafeAreaView style={[styles.safeArea,{ backgroundColor:colors.background }]}>
      {/* Settings */}
      <TouchableOpacity onPress={goSettings} style={[styles.settingsButton,{ backgroundColor:colors.cardBackground }]}>
        <Ionicons name="settings-outline" size={24} color={colors.accent} />
      </TouchableOpacity>

      {/* Falling blocks */}
      {blocks.map(({ anim, rotation, x, type, number, shape }, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.block,
            {
              left: x,
              backgroundColor: colors.accent,
              transform: [
                { translateY: anim },
                { rotate: rotation.interpolate({ inputRange:[0,1], outputRange:['0deg','360deg'] }) },
              ],
            },
          ]}
        >
          {type==='number'
            ? <Text style={styles.blockText}>{number}</Text>
            : <Ionicons name={shape==='puzzle'?'extension-puzzle':'grid'} size={20} color="white" />
          }
        </Animated.View>
      ))}

      {/* Greeting */}
      <View style={styles.titleContainer}>
        {renderers[GREETING_OPTION]()}
      </View>

      {/* Main content */}
      <View style={styles.contentContainer}>
        {/* Reset timer */}
        <Animated.View style={[styles.resetContainer,{ opacity:fadeAnimation, backgroundColor:colors.cardBackground }]}>
          <Text style={[styles.resetText,{ color:colors.textSecondary }]}>Daily Puzzle Reset In</Text>
          <Text style={[styles.resetTimer,{ color:colors.text }]}>{hours}:{minutes}:{seconds}</Text>
        </Animated.View>

        {/* Stats & Ads */}
        <Animated.View style={[styles.statsContainer,{ opacity:fadeAnimation }]}>
          <StatCard topLabel="You Are" value={`Top ${userRank}%`} bottomLabel="Rank" />
          <ActionCard icon="play-circle" topLabel="Watch Ads" bottomLabel="Earn Tokens" onPress={watchAd} />
        </Animated.View>

        {/* Menu */}
        <Animated.View style={[styles.menuGrid,{ opacity:fadeAnimation }]}>
          <MenuButton title="Start New Game" icon="play" onPress={goGame} isPrimary style={styles.primaryButtonContainer} />
          <View style={styles.secondaryGrid}>
            <MenuButton title="My Puzzles" icon="extension-puzzle" onPress={goPuzzles} style={styles.secondaryButtonContainer} />
            <MenuButton title="Stats"       icon="bar-chart"      onPress={goStats}    style={styles.secondaryButtonContainer} />
          </View>
          <MenuButton title="Store" icon="storefront" onPress={goStore} style={styles.storeButtonContainer} />
        </Animated.View>

        {/* Footer */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex:1 },
  settingsButton: {
    position:'absolute', top:60, right:20,
    width:44, height:44, borderRadius:22,
    justifyContent:'center', alignItems:'center',
    zIndex:2, shadowColor:'#000',
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.1, shadowRadius:4, elevation:3,
  },
  block: {
    position:'absolute', width:40, height:40,
    borderRadius:8, justifyContent:'center', alignItems:'center',
    shadowColor:'#000', shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.2, shadowRadius:4, elevation:3,
  },
  blockText: { color:'white', fontSize:16, fontWeight:'bold' },
  titleContainer: {
    position:'absolute', top:100, left:0, right:0,
    alignItems:'center', zIndex:1, paddingHorizontal:20,
  },
  contentContainer: {
    flex:1, alignItems:'center', paddingHorizontal:20, paddingTop:180, zIndex:1,
  },
  resetContainer: { width:'100%', paddingVertical:16, borderRadius:12, alignItems:'center', marginBottom:24 },
  resetText:      { fontSize:14 },
  resetTimer:     { fontSize:20, fontWeight:'bold', marginTop:4 },
  title:          { fontSize:32, fontWeight:'bold', textAlign:'center' },
  footerText:     { marginTop:40, fontSize:14, color:'#000', textAlign:'center' },

  menuGrid:                { width:'100%', gap:16 },
  primaryButtonContainer:   { width:'100%' },
  secondaryGrid:            { flexDirection:'row', gap:16 },
  secondaryButtonContainer: { flex:1 },
  storeButtonContainer:     { width:'100%' },
  menuButton: {
    borderRadius:16,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.2,
    shadowRadius:8,
    elevation:5,
  },
  primaryButton:   { paddingVertical:20, paddingHorizontal:24 },
  secondaryButton: { paddingVertical:16, paddingHorizontal:20 },
  buttonContent:   { flexDirection:'row', alignItems:'center', justifyContent:'center' },
  primaryText:     { fontSize:20, fontWeight:'bold', marginLeft:8 },
  secondaryText:   { fontSize:16, fontWeight:'600', marginLeft:6 },

  statsContainer: { flexDirection:'row', justifyContent:'space-around', width:'100%', marginBottom:30 },
  statCard:       { backgroundColor:'rgba(255,255,255,0.9)', paddingVertical:12, paddingHorizontal:16, borderRadius:12, alignItems:'center', minWidth:100, shadowColor:'#000', shadowOffset:{ width:0, height:1 }, shadowOpacity:0.1, shadowRadius:2, elevation:2 },
  smallLabel:     { fontSize:12 },
  statValue:      { fontSize:18, fontWeight:'bold', marginTop:4 },
  statLabel:      { fontSize:12, marginTop:2 },

  // Typewriter
  typewriterContainer: { alignItems:'center' },
  cursor:             { fontSize:32, fontWeight:'bold' },

  // Bouncing
  bouncingContainer:  { flexDirection:'row', flexWrap:'wrap', justifyContent:'center', alignItems:'center' },

  // Shimmer
  shimmerContainer: { position:'relative', overflow:'hidden' },
  shimmerOverlay:  { position:'absolute', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(255,255,255,0.3)', width:100, transform:[{ skewX:'-20deg' }] },

  // Particle
  particleContainer: { position:'relative', alignItems:'center' },
  particle:          { position:'absolute', width:8, height:8, borderRadius:4, top:'50%', left:'50%' },

  // Glitch
  glitchContainer: { position:'relative', alignItems:'center' },
  glitchLayer1:    { position:'absolute', color:'#ff0000', top:0, left:0, right:0 },
  glitchLayer2:    { position:'absolute', color:'#00ffff', top:0, left:0, right:0 },
});
