// File: src/contexts/FeedbackContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import audioService, { SOUND_TYPES } from '../services/AudioService';

const STORAGE = {
  SOUND:     '@sudokuapp:soundEnabled',
  VIBRATION: '@sudokuapp:vibrationEnabled',
  HAPTICS:   '@sudokuapp:hapticsEnabled',
};

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled]         = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled]     = useState(true);

  useEffect(() => {
    (async () => {
      const [[,s], [,v], [,h]] = await AsyncStorage.multiGet([
        STORAGE.SOUND, STORAGE.VIBRATION, STORAGE.HAPTICS
      ]);
      if (s!=null) setSoundEnabled(s==='true');
      if (v!=null) setVibrationEnabled(v==='true');
      if (h!=null) setHapticsEnabled(h==='true');
      await audioService.preloadGameSounds();
    })().catch(console.warn);
  }, []);

  const persist = async (key, value, setter) => {
    setter(value);
    try { await AsyncStorage.setItem(key, value.toString()); }
    catch(e){ console.warn(`Failed to save ${key}`, e); }
  };

  const playSound         = (type, vol=1) => soundEnabled && audioService.playSound(type, vol);
  const triggerVibration  = (pat=[100]) => vibrationEnabled && Vibration.vibrate(pat);
  const triggerHaptic     = style => hapticsEnabled && Haptics.impactAsync(style);
  const triggerNotifHapt  = type  => hapticsEnabled && Haptics.notificationAsync(type);

  // combined helpers
  const cellSelectFeedback   = () => { playSound(SOUND_TYPES.CELL_SELECT,0.3); triggerHaptic(Haptics.ImpactFeedbackStyle.Light); };
  const numberPlaceFeedback  = () => { playSound(SOUND_TYPES.NUMBER_PLACE,0.5); triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); };
  const numberRemoveFeedback = () => { playSound(SOUND_TYPES.NUMBER_REMOVE,0.4); triggerHaptic(Haptics.ImpactFeedbackStyle.Light); };
  const errorFeedback        = () => { playSound(SOUND_TYPES.ERROR,0.7); triggerVibration([200]); triggerNotifHapt(Haptics.NotificationFeedbackType.Error); };
  const successFeedback      = () => { playSound(SOUND_TYPES.SUCCESS,0.6); triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy); triggerNotifHapt(Haptics.NotificationFeedbackType.Success); };
  const gameCompleteFeedback = () => { playSound(SOUND_TYPES.GAME_COMPLETE,0.8); triggerVibration([100,50,100,50,200]); triggerNotifHapt(Haptics.NotificationFeedbackType.Success); };
  const buttonPressFeedback  = () => { playSound(SOUND_TYPES.BUTTON_PRESS,0.3); triggerHaptic(Haptics.ImpactFeedbackStyle.Light); };
  const hintUsedFeedback     = () => { playSound(SOUND_TYPES.HINT_USED,0.5); triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); };
  const undoFeedback         = () => { playSound(SOUND_TYPES.UNDO,0.4); triggerHaptic(Haptics.ImpactFeedbackStyle.Light); };
  const pauseFeedback        = () => { playSound(SOUND_TYPES.PAUSE,0.5); triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); };
  const resumeFeedback       = () => { playSound(SOUND_TYPES.RESUME,0.5); triggerHaptic(Haptics.ImpactFeedbackStyle.Medium); };

  return (
    <FeedbackContext.Provider value={{
      soundEnabled, vibrationEnabled, hapticsEnabled,
      setSoundEnabled: v => persist(STORAGE.SOUND, v, setSoundEnabled),
      setVibrationEnabled: v => persist(STORAGE.VIBRATION, v, setVibrationEnabled),
      setHapticsEnabled: v => persist(STORAGE.HAPTICS, v, setHapticsEnabled),
      playSound, triggerVibration, triggerHaptic, triggerNotifHapt,
      cellSelectFeedback, numberPlaceFeedback, numberRemoveFeedback,
      errorFeedback, successFeedback, gameCompleteFeedback,
      buttonPressFeedback, hintUsedFeedback, undoFeedback,
      pauseFeedback, resumeFeedback, SOUND_TYPES
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useFeedback must be inside FeedbackProvider');
  return ctx;
};
