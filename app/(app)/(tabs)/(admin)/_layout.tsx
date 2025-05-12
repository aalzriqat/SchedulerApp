import React from 'react';
import { Tabs, useRouter } from 'expo-router'; // Added useRouter
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, Platform } from 'react-native'; // Added TouchableOpacity and Platform

export default function AdminTabLayout() { // Renamed component for clarity
  console.log("--- AdminTabLayout (app/(app)/(tabs)/(admin)/_layout.tsx) rendering ACTUAL TABS ---");
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerShown: true, // Ensure header is shown to place the button
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/profileModal')}
            style={{ marginRight: 15 }}
          >
            <FontAwesome name="user-circle" size={26} color={Platform.OS === 'ios' ? 'blue' : 'black'} />
          </TouchableOpacity>
        ),
      }}
      initialRouteName="adminDashboard"
    >
      <Tabs.Screen
        name="adminDashboard" // Will correspond to file: adminDashboard.tsx in this directory
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="tachometer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminSchedules" // Will correspond to file: adminSchedules.tsx in this directory
        options={{
          title: 'Schedules',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminPostNews" // Corresponds to adminPostNews.tsx
        options={{
          title: 'Post News',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="bullhorn" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminLeaveManagement" // Corresponds to adminLeaveManagement.tsx
        options={{
          title: 'Manage Leaves',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-times-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminViewPreferences" // Corresponds to adminViewPreferences.tsx
        options={{
          title: 'View Preferences',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="check-square-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adminSwapManagement" // Corresponds to adminSwapManagement.tsx
        options={{
          title: 'Manage Swaps',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="retweet" color={color} />,
        }}
      />
      {/* Add other admin tabs here: Analytics */}
    </Tabs>
  );
}