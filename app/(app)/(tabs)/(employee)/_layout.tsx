import React from 'react';
import { Tabs, useRouter } from 'expo-router'; // Added useRouter
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, Platform, View, StyleSheet } from 'react-native'; // Added View, StyleSheet

export default function EmployeeTabLayout() { // Renamed component for clarity
  console.log("--- EmployeeTabLayout (app/(app)/(tabs)/(employee)/_layout.tsx) rendering ACTUAL TABS ---");
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'green',
        headerShown: true, // Ensure header is shown to place the button
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            {/* Notification Bell */}
            <TouchableOpacity
              onPress={() => router.push('/notifications')} // Navigate to the notifications screen
              style={styles.iconButton}
            >
              <FontAwesome name="bell-o" size={24} color={Platform.OS === 'ios' ? 'green' : 'black'} />
              {/* TODO: Add badge for unread notifications */}
            </TouchableOpacity>

            {/* Profile Icon */}
            <TouchableOpacity
              onPress={() => router.push('/profileModal')}
              style={styles.iconButton}
            >
              <FontAwesome name="user-circle" size={26} color={Platform.OS === 'ios' ? 'green' : 'black'} />
            </TouchableOpacity>
          </View>
        ),
      }}
      initialRouteName="employeeDashboard"
    >
      <Tabs.Screen
        name="employeeDashboard"
        options={{
          title: 'Dashboard',
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
      {/* Combined Leave Tab */}
      <Tabs.Screen
        name="leave" // NEW: Corresponds to leave.tsx (needs creation)
        options={{
          title: 'Leave',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-times-o" color={color} />, // Using calendar-times-o icon
        }}
      />
      {/* New Hub Tab for Swaps & Preferences */}
      <Tabs.Screen
        name="hub" // Corresponds to hub/_layout.tsx (directory)
        options={{
          title: 'Hub', // Or "Settings & Swaps", "More", etc.
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cogs" color={color} />, // Example icon
        }}
      />
      <Tabs.Screen
        name="employeeNews" // Corresponds to employeeNews.tsx
        options={{
          title: 'News',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="newspaper-o" color={color} />,
        }}
      />
      {/* Screen to handle the route but hide the tab */}
      <Tabs.Screen
        name="swapStatus"
        options={{ href: null }} // Hides this tab
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  iconButton: {
    marginLeft: 15, // Add some space between icons
  },
});