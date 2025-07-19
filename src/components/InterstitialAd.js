// File: src/components/InterstitialAd.js

import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads'

// During development, use the test ID. In production, swap in your real interstitial unit:
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-7765897544369826/1234567890'  // ← your real interstitial unit ID

// 1) create the ad instance
const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
  requestNonPersonalizedAdsOnly: true,
})

let isLoaded = false

// 2) subscribe to each event type
interstitial.addAdEventListener(AdEventType.LOADED, () => {
  isLoaded = true
})
interstitial.addAdEventListener(AdEventType.ERROR, () => {
  isLoaded = false
})
interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  // when it's closed, immediately load the next one
  interstitial.load()
})

// 3) kick off the very first load
interstitial.load()

/**
 * Call this to show an interstitial if it's loaded.
 */
export function showInterstitial() {
  if (isLoaded) {
    interstitial.show()
  }
}
