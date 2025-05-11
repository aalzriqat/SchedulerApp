import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
// No longer need useSelector, AdminTabs, EmployeeTabs, View, Text here
// as this layout just defines the (app) group structure.
// Role-based logic is in app/(app)/(tabs)/_layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
// Provider is in root _layout.tsx
// ThemeProvider will wrap the content rendered by the (tabs) group's layout.

export default function AppLayout() {
  console.log('AppLayout ((app)/_layout.tsx): Rendering');
  const colorScheme = useColorScheme();

  // This layout simply provides the ThemeProvider and the Stack container for the (app) group.
  // The actual content (AdminTabs or EmployeeTabs) is determined by app/(app)/(tabs)/_layout.tsx
  // when NavigationController navigates to the '/(tabs)' route within this (app) group.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* A global app/+not-found.tsx will handle unmatched routes within (app) */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}