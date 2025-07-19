// File: src/services/AudioService.js

import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sounds = {};
    this.isInitialized = false;
    this.initializeAudio();
  }

  async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: true,
      });
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async loadSound(soundName, soundFile) {
    try {
      if (!this.isInitialized) await this.initializeAudio();
      const { sound } = await Audio.Sound.createAsync(soundFile);
      this.sounds[soundName] = sound;
      return sound;
    } catch (error) {
      console.warn(`Failed to load sound ${soundName}:`, error);
      return null;
    }
  }

  async playSound(soundName, volume = 1.0) {
    try {
      const sound = this.sounds[soundName];
      if (!sound) {
        console.warn(`Sound ${soundName} not loaded`);
        return;
      }
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
    }
  }

  async unloadAllSounds() {
    try {
      for (const key in this.sounds) {
        await this.sounds[key]?.unloadAsync();
      }
      this.sounds = {};
    } catch (error) {
      console.warn('Failed to unload sounds:', error);
    }
  }

  async preloadGameSounds() {
    // adjust relative path to your assets folder
    await this.loadSound('cellSelect',   require('../../assets/sounds/cellSelect.mp3'));
    await this.loadSound('numberPlace',  require('../../assets/sounds/numberPlace.mp3'));
    await this.loadSound('numberRemove', require('../../assets/sounds/numberRemove.mp3'));
    await this.loadSound('error',        require('../../assets/sounds/error.mp3'));
    await this.loadSound('success',      require('../../assets/sounds/success.mp3'));
    await this.loadSound('gameComplete', require('../../assets/sounds/gameComplete.mp3'));
    await this.loadSound('buttonPress',  require('../../assets/sounds/buttonPress.mp3'));
    await this.loadSound('hintUsed',     require('../../assets/sounds/hintUsed.mp3'));
    await this.loadSound('undo',         require('../../assets/sounds/undo.mp3'));
    await this.loadSound('pause',        require('../../assets/sounds/pause.mp3'));
    await this.loadSound('resume',       require('../../assets/sounds/resume.mp3'));
  }
}

const audioService = new AudioService();
export default audioService;

// Sound effect types for the game
export const SOUND_TYPES = {
  CELL_SELECT:   'cellSelect',
  NUMBER_PLACE:  'numberPlace',
  NUMBER_REMOVE: 'numberRemove',
  ERROR:         'error',
  SUCCESS:       'success',
  GAME_COMPLETE: 'gameComplete',
  BUTTON_PRESS:  'buttonPress',
  HINT_USED:     'hintUsed',
  UNDO:          'undo',
  PAUSE:         'pause',
  RESUME:        'resume',
};
