/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight, // Primary interactive color
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Extended semantic colors
    border: '#e0e0e0', // General border color
    cardBackground: '#ffffff', // Background for card-like elements
    subtleText: '#666666', // For less important text
    errorText: '#D32F2F', // Red for errors
    successText: '#388E3C', // Green for success
    warningText: '#F57C00', // Orange for warnings
    // Status colors
    statusPendingBackground: '#FFF9C4', // Light Yellow
    statusPendingText: '#795548',       // Brownish
    statusApprovedBackground: '#C8E6C9', // Light Green
    statusApprovedText: '#2E7D32',      // Dark Green
    statusRejectedBackground: '#FFCDD2',  // Light Red
    statusRejectedText: '#C62828',       // Dark Red
    statusCancelledBackground: '#E0E0E0', // Light Grey
    statusCancelledText: '#424242',      // Dark Grey
    statusAutoApprovedBackground: '#BBDEFB', // Light Blue
    statusAutoApprovedText: '#0D47A1',    // Dark Blue
    // Button colors
    buttonPrimaryBackground: tintColorLight,
    buttonPrimaryText: '#fff',
    buttonSecondaryBackground: '#E0E0E0',
    buttonSecondaryText: '#000',
    buttonDisabledBackground: '#BDBDBD',
    buttonDisabledText: '#757575',
    // Input fields
    inputBackground: '#fff',
    inputBorder: '#ccc',
    inputText: '#11181C',
    inputPlaceholder: '#999',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark, // Primary interactive color
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Extended semantic colors
    border: '#424242', // Darker border
    cardBackground: '#212121', // Dark card background
    subtleText: '#9E9E9E',
    errorText: '#EF9A9A', // Lighter Red for dark mode
    successText: '#A5D6A7', // Lighter Green
    warningText: '#FFCC80', // Lighter Orange
    // Status colors
    statusPendingBackground: '#424242', // Darker Yellow/Brown
    statusPendingText: '#FFF9C4',
    statusApprovedBackground: '#2E7D32', // Dark Green
    statusApprovedText: '#C8E6C9',
    statusRejectedBackground: '#C62828',   // Dark Red
    statusRejectedText: '#FFCDD2',
    statusCancelledBackground: '#616161', // Medium Grey
    statusCancelledText: '#E0E0E0',
    statusAutoApprovedBackground: '#0D47A1', // Dark Blue
    statusAutoApprovedText: '#BBDEFB',
    // Button colors
    buttonPrimaryBackground: tintColorDark,
    buttonPrimaryText: '#151718', // Dark text on light button
    buttonSecondaryBackground: '#424242',
    buttonSecondaryText: '#ECEDEE',
    buttonDisabledBackground: '#616161',
    buttonDisabledText: '#9E9E9E',
    // Input fields
    inputBackground: '#212121',
    inputBorder: '#616161',
    inputText: '#ECEDEE',
    inputPlaceholder: '#757575',
  },
};
