import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Platform } from 'react-native';
import { withLayoutContext } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // For icons

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function HubTabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tint');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const tabBarBackgroundColor = useThemeColor({}, 'background');

  return (
    <MaterialTopTabs
      initialRouteName="swaps" // Default to swaps, or choose another
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          paddingTop: Platform.OS === 'ios' ? 30 : 0,
        },
        tabBarIndicatorStyle: { backgroundColor: tabBarActiveTintColor },
        tabBarLabelStyle: { fontSize: 14, textTransform: 'capitalize' },
        // tabBarShowIcon: true, // If you want icons in top tabs
      }}
    >
      <MaterialTopTabs.Screen
        name="swaps" // This will point to the (employee)/hub/swaps directory/group
        options={{ 
          title: 'Swaps',
          // tabBarIcon: ({ color, focused }) => <FontAwesome name="exchange" size={focused ? 22 : 20} color={color} />,
        }}
      />
      <MaterialTopTabs.Screen
        name="preferences" // This will point to the (employee)/hub/preferences directory/group
        options={{ 
          title: 'Preferences',
          // tabBarIcon: ({ color, focused }) => <FontAwesome name="sliders" size={focused ? 22 : 20} color={color} />,
        }}
      />
    </MaterialTopTabs>
  );
}