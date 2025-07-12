// index.js
import React, { useEffect } from 'react';
import { registerRootComponent } from 'expo';
import { setTestDeviceIDAsync } from 'expo-ads-admob';
import App from './src/App';

function Root() {
  useEffect(() => {
    // for simulator; on a real device swap this for your device’s test-ID
    setTestDeviceIDAsync('SIMULATOR');
  }, []);
  return <App />;
}

registerRootComponent(Root);
