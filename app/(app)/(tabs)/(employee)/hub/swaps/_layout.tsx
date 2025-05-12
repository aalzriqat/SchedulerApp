import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Platform } from 'react-native';
import { withLayoutContext } from 'expo-router';

// Import screen components from this directory
import FindSwapsScreen from './findSwaps'; // Was AvailableSwapsScreen
import SwapStatusScreen from './swapStatus';

const { Navigator } = createMaterialTopTabNavigator();
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function SwapsTabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tint');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const tabBarBackgroundColor = useThemeColor({}, 'background');

  return (
    <MaterialTopTabs
      initialRouteName="findSwaps" // Set initial route
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
        name="findSwaps"
        options={{ title: 'Find Swaps' }}
      />
      <MaterialTopTabs.Screen
        name="swapStatus"
        options={{ title: 'My Swap Status' }}
      />
      {/* This screen is to handle the index route and hide it from tabs */}
      <MaterialTopTabs.Screen
        name="index"
        options={{ tabBarButton: () => null }}
      />
    </MaterialTopTabs>
  );
}