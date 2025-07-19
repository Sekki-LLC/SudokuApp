import React from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Contexts
import { GameSettingsProvider } from './contexts/GameSettingsContext';
import { ThemeProvider }        from './contexts/ThemeContext';
import { UserProvider }         from './contexts/UserContext';
import { FeedbackProvider }     from './contexts/FeedbackContext';

// Navigation
import MainTabNavigator from './navigation/MainTabNavigator';
import GameScreen       from './screens/Game/GameScreen';

// Error Boundary
import ErrorBoundary from './components/ErrorBoundary';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef  = React.useRef();

  return (
    <GameSettingsProvider>
      <ThemeProvider>
        <UserProvider>
          <FeedbackProvider>
            <SafeAreaProvider>
              <ErrorBoundary>
                <NavigationContainer
                  ref={navigationRef}
                  onReady={() => {
                    routeNameRef.current = navigationRef.getCurrentRoute().name;
                  }}
                  onStateChange={() => {
                    const prev = routeNameRef.current;
                    const curr = navigationRef.getCurrentRoute().name;
                    if (prev !== curr) {
                      routeNameRef.current = curr;
                    }
                  }}
                >
                  <Stack.Navigator
                    initialRouteName="MainTabs"
                    screenOptions={{ headerShown: false }}
                  >
                    <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                    <Stack.Screen
                      name="Game"
                      component={GameScreen}
                      options={{ gestureEnabled: true }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </ErrorBoundary>
            </SafeAreaProvider>
          </FeedbackProvider>
        </UserProvider>
      </ThemeProvider>
    </GameSettingsProvider>
  );
}

