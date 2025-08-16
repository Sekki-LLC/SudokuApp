// File: src/components/InterstitialAd.js

import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads'

// FIXED: Use TestIds for both development and production since we're using test AdMob IDs
const AD_UNIT_ID = TestIds.INTERSTITIAL

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
 * FIXED: Return a Promise that resolves when the ad is completed or dismissed
 */
export function showInterstitial() {
  return new Promise((resolve, reject) => {
    if (!isLoaded) {
      reject(new Error('Ad not loaded'))
      return
    }

    // Set up one-time listeners for this ad show
    const onClosed = () => {
      interstitial.removeAdEventListener(AdEventType.CLOSED, onClosed)
      interstitial.removeAdEventListener(AdEventType.ERROR, onError)
      resolve() // Ad was watched and closed
    }

    const onError = (error) => {
      interstitial.removeAdEventListener(AdEventType.CLOSED, onClosed)
      interstitial.removeAdEventListener(AdEventType.ERROR, onError)
      reject(error) // Ad failed to show
    }

    // Add temporary listeners
    interstitial.addAdEventListener(AdEventType.CLOSED, onClosed)
    interstitial.addAdEventListener(AdEventType.ERROR, onError)

    // Show the ad
    interstitial.show()
  })
}
