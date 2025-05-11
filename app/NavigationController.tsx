import React, { useEffect, useState } from 'react'; // Added useState
import { Stack, SplashScreen, useRouter, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { useSelector, useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { tokenRestorationAttempt, tokenRestored, tokenRestoreFailed, User } from '../src/store/slices/authSlice';
// import type { RootState } from '../src/store/store'; 

export default function NavigationController() {
  console.log('NavigationController: Evaluating...');
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname(); 

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isAuthenticated, user, isLoading: isLoadingAuthFromSlice, isRestoringToken } = useSelector((state: any) => state.auth);
  const isAuthLoading = isLoadingAuthFromSlice || isRestoringToken;
  const [initialNavigationComplete, setInitialNavigationComplete] = useState(false); // Declared state

  useEffect(() => {
    const bootstrapAsync = async () => {
      // SecureStore clearing was temporary for testing, removing it now.
      dispatch(tokenRestorationAttempt());
      let userToken;
      let storedUserData;
      try {
        userToken = await SecureStore.getItemAsync('userToken');
        storedUserData = await SecureStore.getItemAsync('userData');
        
        if (userToken && storedUserData) {
          const userObj: User = JSON.parse(storedUserData);
          console.log('NavigationController: Token and user data found, restoring session.');
          dispatch(tokenRestored({ user: userObj }));
        } else {
          console.log('NavigationController: No token or user data found.');
          dispatch(tokenRestoreFailed());
        }
      } catch (e) {
        console.error('NavigationController: Error restoring token/user data', e);
        dispatch(tokenRestoreFailed());
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const currentPath = pathname; 

    if ((!fontsLoaded && !fontError) || isAuthLoading) {
      console.log(`NavigationController: Still loading - Fonts loaded: ${!!fontsLoaded}, Font error: ${!!fontError}, Auth loading: ${isAuthLoading}`);
      return;
    }

    console.log(`NavigationController: Ready to navigate. Authenticated: ${isAuthenticated}, Role: ${user?.role}, Current Path: ${currentPath}, InitialNavComplete: ${initialNavigationComplete}`);

    if (!isAuthenticated) {
      const loginPath = '/login';
      if (currentPath !== loginPath && !currentPath.startsWith('/(auth)')) { 
        console.log('NavigationController: Not authenticated, navigating to /login');
        router.replace(loginPath);
      } else {
         console.log(`NavigationController: Not authenticated, but already on auth path or login: ${currentPath}. No navigation.`);
      }
      setInitialNavigationComplete(false); // Reset on logout/session expiry
    } else { // User is authenticated
      if (!initialNavigationComplete) {
        let targetPath = '';
        console.log(`NavigationController: Checking role for initial nav. Raw user.role: "${user?.role}"`);
        const isAdmin = user && user.role === 'admin'; // Changed to lowercase 'admin'
        const isEmployee = user && user.role === 'employee'; // Changed to lowercase 'employee'
        console.log(`NavigationController: isAdmin check: ${isAdmin}, isEmployee check: ${isEmployee}`);

        if (isAdmin) {
          targetPath = '/adminDashboard';
          console.log(`NavigationController: Initial nav for Admin, target: ${targetPath}`);
        } else if (isEmployee) {
          targetPath = '/employeeDashboard';
          console.log(`NavigationController: Initial nav for Employee, target: ${targetPath}`);
        } else {
          console.error(`NavigationController: User authenticated but role "${user?.role}" is unknown/missing for initial nav. Fallback to /login.`, user);
          if (currentPath !== '/login') router.replace('/login');
          return;
        }

        if (targetPath && currentPath !== targetPath) {
          console.log(`NavigationController: Current path "${currentPath}", performing initial navigation to role dashboard: ${targetPath}`);
          router.replace(targetPath as any); 
          setInitialNavigationComplete(true);
        } else if (targetPath && currentPath === targetPath) {
           console.log(`NavigationController: Already at target role dashboard for initial nav: ${targetPath}. Marking complete.`);
           setInitialNavigationComplete(true);
        }
      } else {
        console.log(`NavigationController: Initial navigation already complete. Current path: ${currentPath}`);
      }
    }
  }, [isAuthenticated, user, fontsLoaded, fontError, isAuthLoading, router, pathname, initialNavigationComplete, setInitialNavigationComplete]); // Added setInitialNavigationComplete to deps

  if (fontError) {
    console.error('NavigationController: Font loading error:', fontError);
    return null; 
  }

  if ((!fontsLoaded && !fontError) || (isAuthLoading && !initialNavigationComplete) ) { // Ensure initial nav can happen if auth is loading but not yet complete
    console.log(`NavigationController: Initial load/Auth check in progress. Fonts loaded: ${!!fontsLoaded}, Auth loading: ${isAuthLoading}, InitialNavComplete: ${initialNavigationComplete}. Returning null (Splash visible)`);
    return null; 
  }
  
  console.log('NavigationController: Rendering Stacks for groups');
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}