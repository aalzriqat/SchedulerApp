import React from 'react';
import { Stack } from 'expo-router';
// Removed View import as it's no longer used here for wrapping

export default function AuthLayout() {
  console.log('AuthLayout: Rendering');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* login route is defined at the top level (app/login.tsx), not within this group */}
      <Stack.Screen name="register" />
    </Stack>
  );
}