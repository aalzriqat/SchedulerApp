import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Platform } from 'react-native';
import { withLayoutContext } from 'expo-router';

// Assuming viewPreferences.tsx is the first sub-tab screen
// If you add more screens like editPreferences.tsx, import them here.

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function PreferencesTabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tint');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const tabBarBackgroundColor = useThemeColor({}, 'background');

  return (
    <MaterialTopTabs
      initialRouteName="viewPreferences" // Default sub-tab
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          paddingTop: Platform.OS === 'ios' ? 30 : 0,
        },
        tabBarIndicatorStyle: { backgroundColor: tabBarActiveTintColor },
        tabBarLabelStyle: { fontSize: 14, textTransform: 'capitalize' },
      }}
    >
      <MaterialTopTabs.Screen
        name="viewPreferences" // Corresponds to viewPreferences.tsx
        options={{ title: 'View Preferences' }}
      />
      <MaterialTopTabs.Screen
        name="editPreferences"
        options={{ title: 'Edit Preferences' }} // Corresponds to editPreferences.tsx
      />
    </MaterialTopTabs>
  );
}