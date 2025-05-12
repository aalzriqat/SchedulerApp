import React from 'react';
import ProfileScreen from '../src/screens/common/ProfileScreen'; // Adjusted path
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Platform, StyleSheet, Text } from 'react-native'; // Replaced Button with TouchableOpacity, Added Text
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { FontAwesome } from '@expo/vector-icons'; // Import FontAwesome

export default function ProfileModal() {
  const router = useRouter();
  const themedHeaderTextColor = useThemeColor({}, 'headerText');
  const themedHeaderBackgroundColor = useThemeColor({}, 'headerBackground');

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true, // Explicitly show the header for this modal
          presentation: 'card',
          title: 'My Profile',
          headerStyle: { backgroundColor: themedHeaderBackgroundColor },
          headerTitleStyle: { color: themedHeaderTextColor },
          headerLargeTitle: false,
          // headerBackTitleVisible: false, // Removed, not a valid option for NativeStack
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <FontAwesome name="arrow-left" size={22} color={themedHeaderTextColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ProfileScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    marginLeft: Platform.OS === 'ios' ? 10 : 15,
    padding: 5,
  }
});