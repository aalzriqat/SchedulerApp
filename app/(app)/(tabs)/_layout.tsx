import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Stack, useRouter, SplashScreen, usePathname } from 'expo-router'; // Using Stack, added usePathname
import { View, Text, StyleSheet } from 'react-native';

export default function AppTabsControllerLayout() {
  console.log('AppTabsControllerLayout: Evaluating...');
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname
  const user = useSelector((state: any) => state.auth.user);
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated); // Ensure user is still auth

  // Hide splash screen if it was shown by root layout
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!user || !user.role || !isAuthenticated) {
    console.log('AppTabsControllerLayout: User/role not found or not authenticated, rendering error/loading.');
    // This should ideally be caught by NavigationController, but as a fallback:
    if (isAuthenticated === false) { // Explicitly check if auth is known to be false
        router.replace('/login'); // Should be handled by NavigationController, but defensive
        return null;
    }
    return (
      <View style={styles.container}>
        <Text>Loading user data for tabs or not authenticated...</Text>
      </View>
    );
  }

  console.log(`AppTabsControllerLayout: User role is "${user.role}", preparing to render role-specific tab group.`);

  // This layout now uses a Stack to define the available tab groups.
  // The useEffect will navigate to the correct one.
  // The actual Tab navigators will be the _layout.tsx files in (admin) and (employee) groups.
  
  // This useEffect was causing the navigation loop.
  // NavigationController already navigates to '/(tabs)' which loads this layout.
  // This layout then renders the Stack for (admin) or (employee) groups.
  // The _layout.tsx within those groups (AdminTabLayout/EmployeeTabLayout) will render
  // their respective Tabs navigators, and their `initialRouteName` prop will handle the default tab.
  // useEffect(() => {
  //   if (user && user.role) {
  //     const targetAdminRoute = '/adminDashboard';
  //     const targetEmployeeRoute = '/employeeDashboard';

  //     if (user.role === 'Admin') {
  //       if (pathname !== targetAdminRoute) {
  //         console.log(`AppTabsControllerLayout: Current path "${pathname}", Navigating to Admin initial screen ${targetAdminRoute}`);
  //         router.replace(targetAdminRoute);
  //       } else {
  //         console.log(`AppTabsControllerLayout: Already at Admin target route ${targetAdminRoute}. No navigation needed.`);
  //       }
  //     } else if (user.role === 'Employee') {
  //       if (pathname !== targetEmployeeRoute) {
  //         console.log(`AppTabsControllerLayout: Current path "${pathname}", Navigating to Employee initial screen ${targetEmployeeRoute}`);
  //         router.replace(targetEmployeeRoute);
  //       } else {
  //         console.log(`AppTabsControllerLayout: Already at Employee target route ${targetEmployeeRoute}. No navigation needed.`);
  //       }
  //     } else {
  //       console.log(`AppTabsControllerLayout: Unknown role "${user.role}", redirecting to login.`);
  //       if (pathname !== '/login') {
  //         router.replace('/login');
  //       }
  //     }
  //   }
  // }, [user?.role, router, pathname]);

  // Render a Stack that defines the groups. The useEffect above will navigate.
  // The screens here point to the layouts of the sub-groups.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(employee)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});