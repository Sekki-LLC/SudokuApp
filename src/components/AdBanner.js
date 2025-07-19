// File: src/components/AdBanner.js

import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
  BannerAd,
  BannerAdSize,
  TestIds
} from 'react-native-google-mobile-ads'

const AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-7765897544369826/XXXXXXXXXX'  // ← your real unit ID (without the “~”)

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
    // optionally force a fixed height so layout doesn’t shift:
    height: BannerAdSize.FULL_BANNER.height
  }
})
