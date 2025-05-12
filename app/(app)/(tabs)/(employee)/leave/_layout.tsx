import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Platform } from 'react-native';
import { withLayoutContext } from 'expo-router'; // Import for layout context


const { Navigator } = createMaterialTopTabNavigator();

// Export the layout component using withLayoutContext
export const MaterialTopTabs = withLayoutContext(Navigator);

export default function LeaveTabLayout() {
  const tabBarActiveTintColor = useThemeColor({}, 'tint');
  const tabBarInactiveTintColor = useThemeColor({}, 'tabIconDefault');
  const tabBarBackgroundColor = useThemeColor({}, 'background');

  return (
    <MaterialTopTabs // Use the context-wrapped navigator
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        tabBarStyle: {
          backgroundColor: tabBarBackgroundColor,
          // Add top padding for iOS status bar/notch
          paddingTop: Platform.OS === 'ios' ? 30 : 0,
        },
        tabBarIndicatorStyle: { backgroundColor: tabBarActiveTintColor },
        tabBarLabelStyle: { fontSize: 14, textTransform: 'capitalize' }, // Adjust styling as needed
      }}
      initialRouteName="submitLeave" // Set initial route for the top tabs
    >
      <MaterialTopTabs.Screen // Use MaterialTopTabs.Screen
        name="submitLeave" // Corresponds to submitLeave.tsx
        options={{ title: 'Submit Leave Request' }}
      />
      <MaterialTopTabs.Screen // Use MaterialTopTabs.Screen
        name="leaveStatus" // Corresponds to leaveStatus.tsx
        options={{ title: 'My Leave Status' }}
      />
      {/* This screen is to handle the index route and hide it from tabs */}
      <MaterialTopTabs.Screen
        name="index"
        options={{ tabBarButton: () => null }} // Use tabBarButton to hide the tab
      />
    </MaterialTopTabs>
  );
}