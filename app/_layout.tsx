// Removed DarkTheme, DefaultTheme, ThemeProvider, StatusBar, Provider, store imports as they are now in (app)/_layout.tsx
// Removed useColorScheme as it's used in (app)/_layout.tsx
// Removed most imports, will only need Provider and store here.
// Font loading, auth logic, and navigation will be in NavigationController.
import 'react-native-reanimated'; // Keep for side effects if needed by expo-router
import { Provider } from 'react-redux';
import store from '../src/store/store';
import NavigationController from './NavigationController'; // Import the new controller

export default function RootLayout() {
  console.log('RootLayout: Rendering Provider and NavigationController');
  
  // This component now only sets up the Redux Provider.
  // All conditional logic and navigation is delegated to NavigationController.
  return (
    <Provider store={store}>
      <NavigationController />
    </Provider>
  );
}
