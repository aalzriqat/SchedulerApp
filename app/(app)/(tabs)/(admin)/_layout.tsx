import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Import IconSymbol
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

export default function AdminTabLayout() {
  console.log("--- AdminTabLayout (app/(app)/(tabs)/(admin)/_layout.tsx) rendering ACTUAL TABS ---");
  const router = useRouter();
  const activeTintColor = useThemeColor({}, 'tint'); // Use theme's tint color for active tabs
  const headerIconColor = useThemeColor({}, 'icon'); // Use theme's icon color for header icons

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        headerShown: true,
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')} // Ensure full path for modal
              style={styles.iconButton}
            >
              <IconSymbol name="bell.fill" size={24} color={headerIconColor} />
              {/* TODO: Add badge for unread notifications */}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profileModal')} // This is a modal, path is likely correct
              style={styles.iconButton}
            >
              <IconSymbol name="person.circle.fill" size={26} color={headerIconColor} />
            </TouchableOpacity>
          </View>
        ),
      }}
      initialRouteName="adminDashboard"
    >
      <Tabs.Screen
        name="adminDashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="gauge"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminSchedules"
        options={{
          title: 'Schedules',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="calendar"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminPostNews"
        options={{
          title: 'Post News',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="megaphone.fill"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminLeaveManagement"
        options={{
          title: 'Manage Leaves',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="calendar.badge.minus"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminViewPreferences"
        options={{
          title: 'View Preferences',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="checklist"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="adminSwapManagement"
        options={{
          title: 'Manage Swaps',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="arrow.2.squarepath"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
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
    marginLeft: 15,
  },
});