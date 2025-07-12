// File: src/components/AdMobInterstitial.js
import React, { useEffect, useRef } from 'react'
import { Button, View } from 'react-native'
import {
  InterstitialAd,
  AdEventType,
  TestIds
} from 'expo-ads-admob'

const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/your-interstitial-id'

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
})

export default function AdMobInterstitialButton() {
  const isLoaded = useRef(false)

  useEffect(() => {
    const sub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded.current = true
    })
    interstitial.loadAsync()
    return () => sub.remove()
  }, [])

  const showAd = () => {
    if (isLoaded.current) {
      interstitial.showAsync()
    } else {
      console.log('Interstitial ad not loaded yet')
    }
  }

  return (
    <View style={{ margin: 16 }}>
      <Button title="Show Interstitial" onPress={showAd} />
    </View>
  )
}
