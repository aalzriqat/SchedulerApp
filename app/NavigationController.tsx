import React, { useEffect, useState } from 'react'; // Added useState
import { Stack, SplashScreen, useRouter, usePathname } from 'expo-router';
import { useFonts } from 'expo-font';
import { useSelector, useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { tokenRestorationAttempt, tokenRestored, tokenRestoreFailed, User } from '../src/store/slices/authSlice';
// import type { RootState } from '../src/store/store'; 

export default function NavigationController() {
  // console.log('NavigationController: Evaluating...'); // DEV ONLY
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const { isAuthenticated, user, isLoading: isLoadingAuthFromSlice, isRestoringToken } = useSelector((state: any) => state.auth);
  const isAuthLoading = isLoadingAuthFromSlice || isRestoringToken;
  const [initialNavigationComplete, setInitialNavigationComplete] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      dispatch(tokenRestorationAttempt());
      let userToken;
      let storedUserData;
      try {
        userToken = await SecureStore.getItemAsync('userToken');
        storedUserData = await SecureStore.getItemAsync('userData');
        
        if (userToken && storedUserData) {
          const userObj: User = JSON.parse(storedUserData);
          // console.log('NavigationController: Token and user data found, restoring session.'); // DEV ONLY
          dispatch(tokenRestored({ user: userObj }));
        } else {
          // console.log('NavigationController: No token or user data found.'); // DEV ONLY
          dispatch(tokenRestoreFailed());
        }
      } catch (e) {
        console.error('NavigationController: Error restoring token/user data', e); // Keep critical errors
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
      // console.log(`NavigationController: Still loading - Fonts loaded: ${!!fontsLoaded}, Font error: ${!!fontError}, Auth loading: ${isAuthLoading}`); // DEV ONLY
      return;
    }

    // console.log(`NavigationController: Ready to navigate. Authenticated: ${isAuthenticated}, Role: ${user?.role}, Current Path: ${currentPath}, InitialNavComplete: ${initialNavigationComplete}`); // DEV ONLY

    if (!isAuthenticated) {
      const loginPath = '/login';
      const registerPath = '/register';

      if (currentPath !== loginPath && currentPath !== registerPath) {
        // console.log(`NavigationController: Not authenticated and not on a public auth path (${currentPath}). Navigating to ${loginPath}`); // DEV ONLY
        router.replace(loginPath);
      } else {
        //  console.log(`NavigationController: Not authenticated, but on an allowed public path (${currentPath}). No automatic navigation.`); // DEV ONLY
      }
      setInitialNavigationComplete(false);
    } else {
      if (!initialNavigationComplete) {
        let targetPath = '';
        // console.log(`NavigationController: Checking role for initial nav. Raw user.role: "${user?.role}"`); // DEV ONLY
        const isAdmin = user && user.role === 'admin';
        const isEmployee = user && user.role === 'employee';
        // console.log(`NavigationController: isAdmin check: ${isAdmin}, isEmployee check: ${isEmployee}`); // DEV ONLY

        if (isAdmin) {
          targetPath = '/adminDashboard';
          // console.log(`NavigationController: Initial nav for Admin, target: ${targetPath}`); // DEV ONLY
        } else if (isEmployee) {
          targetPath = '/employeeDashboard';
          // console.log(`NavigationController: Initial nav for Employee, target: ${targetPath}`); // DEV ONLY
        } else {
          console.error(`NavigationController: User authenticated but role "${user?.role}" is unknown/missing for initial nav. Fallback to /login.`, user); // Keep critical errors
          if (currentPath !== '/login') router.replace('/login');
          return;
        }

        if (targetPath && currentPath !== targetPath) {
          // console.log(`NavigationController: Current path "${currentPath}", performing initial navigation to role dashboard: ${targetPath}`); // DEV ONLY
          router.replace(targetPath as any);
          setInitialNavigationComplete(true);
        } else if (targetPath && currentPath === targetPath) {
          //  console.log(`NavigationController: Already at target role dashboard for initial nav: ${targetPath}. Marking complete.`); // DEV ONLY
           setInitialNavigationComplete(true);
        }
      } else {
        // console.log(`NavigationController: Initial navigation already complete. Current path: ${currentPath}`); // DEV ONLY
      }
    }
  }, [isAuthenticated, user, fontsLoaded, fontError, isAuthLoading, router, pathname, initialNavigationComplete, setInitialNavigationComplete]);

  if (fontError) {
    console.error('NavigationController: Font loading error:', fontError); // Keep critical errors
    return null;
  }

  if ((!fontsLoaded && !fontError) || (isAuthLoading && !initialNavigationComplete) ) {
    // console.log(`NavigationController: Initial load/Auth check in progress. Fonts loaded: ${!!fontsLoaded}, Auth loading: ${isAuthLoading}, InitialNavComplete: ${initialNavigationComplete}. Returning null (Splash visible)`); // DEV ONLY
    return null;
  }
  
  // console.log('NavigationController: Rendering Stacks for groups'); // DEV ONLY
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}