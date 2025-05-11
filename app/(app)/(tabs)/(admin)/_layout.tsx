import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 

export default function AdminTabLayout() { // Renamed component for clarity
  console.log("--- AdminTabLayout (app/(app)/(tabs)/(admin)/_layout.tsx) rendering ACTUAL TABS ---");
  return (
    <Tabs 
      screenOptions={{ tabBarActiveTintColor: 'blue' }}
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
      {/* Add other admin tabs here: Preferences, Time Off, Analytics, News */}
    </Tabs>
  );
}