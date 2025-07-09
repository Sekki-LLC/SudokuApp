import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNavigationContainerRef } from '@react-navigation/native';

// Import your MainTabNavigator and GameScreen
import MainTabNavigator from './navigation/MainTabNavigator';
import GameScreen from './screens/Game/GameScreen';

// Import your contexts
import { GameSettingsProvider } from './contexts/GameSettingsContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = React.useRef();

  return (
    <GameSettingsProvider>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            routeNameRef.current = navigationRef.getCurrentRoute().name;
          }}
          onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.getCurrentRoute().name;

            if (previousRouteName !== currentRouteName) {
              routeNameRef.current = currentRouteName;
            }
          }}
        >
          <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName="MainTabs"
          >
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator} 
            />
            <Stack.Screen 
              name="Game" 
              component={GameScreen}
              options={{ 
                headerShown: false,
                gestureEnabled: true 
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GameSettingsProvider>
  );
}

