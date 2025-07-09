import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import StoreScreen from '../screens/Store/StoreScreen';
import MyPuzzlesScreen from '../screens/MyPuzzles/MyPuzzlesScreen';
import StatsScreen from '../screens/Stats/StatsScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'My Puzzles') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === 'Store') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.interactive,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.cellBorder,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen}
        options={{ title: 'Stats' }}
      />
      <Tab.Screen 
        name="My Puzzles" 
        component={MyPuzzlesScreen}
        options={{ title: 'My Puzzles' }}
      />
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Tab.Screen 
        name="Store" 
        component={StoreScreen}
        options={{ title: 'Store' }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;

