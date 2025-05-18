import React, { useState } from 'react'; // Added useState for focus example
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor'; // Adjusted path
import { Colors } from '../constants/Colors'; // Adjusted path

export interface ThemedInputProps extends TextInputProps {
  lightColor?: string;
  darkColor?: string;
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightPlaceholderTextColor?: string;
  darkPlaceholderTextColor?: string;
  // For focus state, if we want to pass themed focus border color
  lightFocusBorderColor?: string;
  darkFocusBorderColor?: string;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  lightPlaceholderTextColor,
  darkPlaceholderTextColor,
  placeholderTextColor: explicitPlaceholderTextColor,
  lightFocusBorderColor,
  darkFocusBorderColor,
  onFocus, // Capture onFocus from props
  onBlur,  // Capture onBlur from props
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'inputText');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const unfocusedBorderColor = useThemeColor({ light: lightBorderColor, dark: darkBorderColor }, 'inputBorder');
  // Default focus border to theme's tint color if specific focus colors aren't provided
  const defaultFocusLightBorder = lightFocusBorderColor || Colors.light.tint;
  const defaultFocusDarkBorder = darkFocusBorderColor || Colors.dark.tint;
  const focusedBorderColor = useThemeColor({ light: defaultFocusLightBorder, dark: defaultFocusDarkBorder }, 'tint'); 
  
  const placeholderColor = explicitPlaceholderTextColor || useThemeColor({ light: lightPlaceholderTextColor, dark: darkPlaceholderTextColor }, 'inputPlaceholder');

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const currentBorderColor = isFocused ? focusedBorderColor : unfocusedBorderColor;

  return (
    <TextInput
      style={[
        styles.themedInputBase,
        { color, backgroundColor, borderColor: currentBorderColor },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  themedInputBase: {
    borderWidth: 1.5, // Made border slightly thicker for better focus visibility
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
});