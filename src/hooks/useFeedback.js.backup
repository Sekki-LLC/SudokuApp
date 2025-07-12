// File: src/hooks/useFeedback.js
import { useRef } from 'react'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'

export function useFeedback() {
  const sounds = useRef({})

  // preload—call once in App startup or first use
  async function loadSounds() {
    const load = async (key, module) => {
      const { sound } = await Audio.Sound.createAsync(module)
      sounds.current[key] = sound
    }
    await Promise.all([
      load('place',   require('../../assets/sounds/place.mp3')),
      load('clear',   require('../../assets/sounds/clear.mp3')),
      load('error',   require('../../assets/sounds/error.mp3')),
      load('win',     require('../../assets/sounds/win.mp3')),
    ])
  }

  const play = async key => {
    const s = sounds.current[key]
    if (s) {
      await s.replayAsync()
    }
  }

  const haptic = style => {
    Haptics.impactAsync(style || Haptics.ImpactFeedbackStyle.Light)
  }

  return { loadSounds, play, haptic }
}
