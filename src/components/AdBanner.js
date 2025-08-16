// File: src/components/AdBanner.js

import React from 'react'
import { View, StyleSheet } from 'react-native'
import {
  BannerAd,
  BannerAdSize,
  TestIds
} from 'react-native-google-mobile-ads'

// FIXED: Use TestIds for both development and production since we're using test AdMob IDs
const AD_UNIT_ID = TestIds.BANNER

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
    // optionally force a fixed height so layout doesn't shift:
    height: BannerAdSize.FULL_BANNER.height
  }
})
