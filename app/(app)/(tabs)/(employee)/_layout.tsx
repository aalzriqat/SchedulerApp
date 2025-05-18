import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol'; // Import IconSymbol
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

export default function EmployeeTabLayout() {
  console.log("--- EmployeeTabLayout (app/(app)/(tabs)/(employee)/_layout.tsx) rendering ACTUAL TABS ---");
  const router = useRouter();
  const activeTintColor = useThemeColor({}, 'tint');
  const headerIconColor = useThemeColor({}, 'icon');

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
              onPress={() => router.push('/profileModal')}
              style={styles.iconButton}
            >
              <IconSymbol name="person.circle.fill" size={26} color={headerIconColor} />
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
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="person.fill"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="employeeSchedule"
        options={{
          title: 'My Schedule',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="calendar.badge.checkmark"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="leave"
        options={{
          title: 'Leave',
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
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="gearshape.fill"  // Using 'gearshape.fill' which maps to 'settings'
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="employeeNews"
        options={{
          title: 'News',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              name="newspaper.fill"
              size={focused ? 28 : 26}
              color={color}
              themeColorKey={focused ? 'tabIconSelected' : 'tabIconDefault'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="swapStatus"
        options={{ href: null }}
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