import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function EmployeeTabLayout() { // Renamed component for clarity
  console.log("--- EmployeeTabLayout (app/(app)/(tabs)/(employee)/_layout.tsx) rendering ACTUAL TABS ---");
  return (
    <Tabs
      screenOptions={{ tabBarActiveTintColor: 'green' }}
      initialRouteName="employeeDashboard"
    >
      <Tabs.Screen
        name="employeeDashboard" // Will correspond to file: employeeDashboard.tsx in this directory
        options={{
          title: 'My Dashboard',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="employeeSchedule" // Will correspond to file: employeeSchedule.tsx in this directory
        options={{
          title: 'My Schedule',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-check-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="availableSwaps" // Will correspond to file: availableSwaps.tsx in this directory
        options={{
          title: 'Find Swaps',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="exchange" color={color} />,
        }}
      />
      <Tabs.Screen
        name="swapStatus" // Will correspond to file: swapStatus.tsx in this directory
        options={{
          title: 'Swap Status',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="history" color={color} />,
        }}
      />
      <Tabs.Screen
        name="preferences" // Will correspond to file: preferences.tsx in this directory
        options={{
          title: 'Preferences',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="sliders" color={color} />,
        }}
      />
      <Tabs.Screen
        name="submitLeave" // Will correspond to file: submitLeave.tsx in this directory
        options={{
          title: 'Submit Leave',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="paper-plane" color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaveStatus" // Will correspond to file: leaveStatus.tsx in this directory
        options={{
          title: 'Leave Status',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="list-alt" color={color} />,
        }}
      />
    </Tabs>
  );
}