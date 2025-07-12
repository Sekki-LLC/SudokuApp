import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  AdMobBanner,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';

export default function AdBanner({ adUnitID }) {
  React.useEffect(() => {
    // Register this device for test ads
    setTestDeviceIDAsync("EMULATOR"); // or use your own device ID
  }, []);

  // Fallback to Google sample ID if none provided
  const bannerAdUnitID = adUnitID
    ? adUnitID
    : 'ca-app-pub-3940256099942544/2934735716';

  return (
    <View style={styles.container}>
      <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={bannerAdUnitID}
        servePersonalizedAds={false}
        onDidFailToReceiveAdWithError={(error) => console.error(error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});
