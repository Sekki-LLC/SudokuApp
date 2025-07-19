// src/screens/LoadingScreen.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function LoadingScreen() {
  const navigation = useNavigation();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const gridAnimation = useRef(new Animated.Value(0)).current;
  const loadingProgress = useRef(new Animated.Value(0)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;
  
  // Floating elements
  const [floatingElements] = useState(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      anim: new Animated.Value(-100),
      x: Math.random() * (width - 60) + 30,
      y: Math.random() * height,
      type: ['number', 'puzzle', 'grid'][Math.floor(Math.random() * 3)],
      value: Math.floor(Math.random() * 9) + 1,
      rotation: new Animated.Value(0),
      scale: new Animated.Value(0.5 + Math.random() * 0.5),
    }))
  );

  // Loading progress state
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    startAnimationSequence();
    return () => {
      // Cleanup animations
      floatingElements.forEach(element => {
        element.anim.stopAnimation();
        element.rotation.stopAnimation();
        element.scale.stopAnimation();
      });
    };
  }, []);

  const startAnimationSequence = async () => {
    try {
      await SplashScreen.preventAutoHideAsync();

      // Start floating elements animation
      animateFloatingElements();

      // Start main animation sequence
      Animated.sequence([
        // Background gradient animation
        Animated.timing(backgroundAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        }),
        
        // Logo entrance
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        
        // Title entrance
        Animated.parallel([
          Animated.spring(titleTranslateY, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        
        // Grid animation
        Animated.timing(gridAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();

      // Simulate loading progress
      simulateLoading();

    } catch (e) {
      console.warn('Error during loading screen animation:', e);
      navigateToMain();
    }
  };

  const animateFloatingElements = () => {
    floatingElements.forEach((element, index) => {
      const delay = index * 150;
      
      // Floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(element.anim, {
            toValue: height + 100,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
          }),
          Animated.timing(element.anim, {
            toValue: -100,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(element.rotation, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        })
      ).start();

      // Scale pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(element.scale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(element.scale, {
            toValue: 0.5,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const simulateLoading = () => {
    const interval = setInterval(() => {
      setLoadingPercentage(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(navigateToMain, 500);
          return 100;
        }
        return next;
      });
    }, 100);

    // Animate loading bar
    Animated.timing(loadingProgress, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  };

  const navigateToMain = async () => {
    try {
      await SplashScreen.hideAsync();
      navigation.replace('MainTabs');
    } catch (error) {
      console.warn('Error hiding loading screen:', error);
    }
  };

  const renderFloatingElement = (element) => {
    const rotateInterpolate = element.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        key={element.id}
        style={[
          styles.floatingElement,
          {
            left: element.x,
            transform: [
              { translateY: element.anim },
              { rotate: rotateInterpolate },
              { scale: element.scale },
            ],
          },
        ]}
      >
        {element.type === 'number' ? (
          <Text style={styles.floatingNumber}>{element.value}</Text>
        ) : element.type === 'puzzle' ? (
          <Ionicons name="extension-puzzle" size={24} color="rgba(255,255,255,0.7)" />
        ) : (
          <Ionicons name="grid" size={24} color="rgba(255,255,255,0.7)" />
        )}
      </Animated.View>
    );
  };

  const renderAnimatedGrid = () => {
    const gridSize = 3;
    const cellSize = 30;
    const gridCells = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const delay = (row * gridSize + col) * 100;
        const cellAnimation = gridAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        });

        gridCells.push(
          <Animated.View
            key={`${row}-${col}`}
            style={[
              styles.gridCell,
              {
                width: cellSize,
                height: cellSize,
                left: col * (cellSize + 4),
                top: row * (cellSize + 4),
                opacity: cellAnimation,
                transform: [
                  {
                    scale: cellAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      }
    }

    return (
      <View style={styles.gridContainer}>
        {gridCells}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />
      
      {/* Animated Background Gradient */}
      <Animated.View style={styles.gradientContainer}>
        <LinearGradient
          colors={['#eff9fc', '#8B5CF6', '#6B46C1']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Floating Elements */}
      {floatingElements.map(renderFloatingElement)}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Grid Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          {renderAnimatedGrid()}
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>GRID</Text>
          <Text style={styles.title}>GENIUS</Text>
        </Animated.View>

        {/* Loading Section */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBarContainer}>
            <Animated.View
              style={[
                styles.loadingBar,
                {
                  width: loadingProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>
            {Math.round(loadingPercentage)}%
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6B46C1',
  },
  gradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    width: 102, // 3 * 30 + 2 * 4
    height: 102,
    position: 'relative',
  },
  gridCell: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  loadingBarContainer: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  loadingBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
  },
  floatingElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

