import React from 'react';
import AdminDashboardScreen from '../../../../src/screens/Admin/AdminDashboardScreen'; // Adjusted path
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { logoutAction } from '../../../../src/store/slices/authSlice'; // Adjusted path
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText for button text
import { Colors } from '@/constants/Colors'; // Import Colors

// Placeholder for a ThemedButton - ideally, this would be a shared component
const ThemedButtonPlaceholder = ({ title, onPress, style, textStyle, type }: { title: string, onPress: () => void, style?: any, textStyle?: any, type?: 'primary' | 'destructive' }) => {
  const defaultButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const defaultButtonText = useThemeColor({}, 'buttonPrimaryText');
  const errorColor = useThemeColor({}, 'errorText'); // For destructive button text
  const errorBgLight = useThemeColor({light: Colors.light.errorText, dark: Colors.dark.errorText}, 'errorText'); // For destructive button background (using errorText as base)


  let backgroundColor = defaultButtonBg;
  let textColor = defaultButtonText;

  if (type === 'destructive') {
    backgroundColor = errorBgLight; // Or a specific destructiveBackground from Colors.ts
    textColor = useThemeColor({light: '#FFFFFF', dark: Colors.dark.text}, 'text'); // Ensure good contrast for destructive button text
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.themedButtonBase, { backgroundColor }, style]}>
      <ThemedText style={[{ color: textColor, fontWeight: 'bold' }, textStyle]}>{title}</ThemedText>
    </TouchableOpacity>
  );
};


export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    console.log('AdminDashboardPage: Logging out...');
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      dispatch(logoutAction());
      // Typically, navigation would occur here to redirect to login screen
      // This is handled by the NavigationController based on auth state.
    } catch (e) {
      console.error('AdminDashboardPage: Error during logout', e);
    }
  };

  return (
    <View style={{flex: 1}}>
      <AdminDashboardScreen />
      <ThemedButtonPlaceholder
        title="Logout (Admin)"
        onPress={handleLogout}
        style={styles.logoutButton}
        type="destructive"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    // backgroundColor is now handled by ThemedButtonPlaceholder
    padding: 12, // Increased padding for better touch target
    marginHorizontal: 20, // Centered with horizontal margin
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 8, // Consistent with other dashboard elements
    position: 'absolute',
    bottom: 20, // Keep it accessible at the bottom
    left: 0, // Span full width available within margins
    right: 0,
  },
  // logoutButtonText is now handled by ThemedButtonPlaceholder's ThemedText
  themedButtonBase: { // Base style for the placeholder
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  }
});