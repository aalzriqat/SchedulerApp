import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText, ThemedTextProps } from './ThemedText'; // Adjusted path
import { useThemeColor } from '../hooks/useThemeColor'; // Adjusted path
import { Colors } from '../constants/Colors'; // Adjusted path

export interface ThemedCheckboxProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  style?: ViewStyle; // For the container
  textStyle?: ThemedTextProps['style']; // For the label text
  // Allow passing specific theme colors if needed, otherwise defaults will be used
  lightBorderColor?: string;
  darkBorderColor?: string;
  lightCheckedBackgroundColor?: string;
  darkCheckedBackgroundColor?: string;
  lightCheckmarkColor?: string;
  darkCheckmarkColor?: string;
}

export const ThemedCheckbox: React.FC<ThemedCheckboxProps> = ({
  label,
  checked,
  onPress,
  style,
  textStyle,
  lightBorderColor,
  darkBorderColor,
  lightCheckedBackgroundColor,
  darkCheckedBackgroundColor,
  lightCheckmarkColor,
  darkCheckmarkColor,
}) => {
  const checkboxBorder = useThemeColor({ light: lightBorderColor, dark: darkBorderColor }, 'inputBorder');
  const checkboxCheckedBg = useThemeColor({ light: lightCheckedBackgroundColor, dark: darkCheckedBackgroundColor }, 'tint');
  // Default checkmark color to contrast with the primary button text color, or allow override
  const defaultLightCheckmark = lightCheckmarkColor || Colors.light.buttonPrimaryText; // Text on primary button
  const defaultDarkCheckmark = darkCheckmarkColor || Colors.dark.buttonPrimaryText; // Text on dark primary button (often light)
  const checkmarkColor = useThemeColor({light: defaultLightCheckmark, dark: defaultDarkCheckmark}, 'text');


  return (
    <TouchableOpacity
      style={[styles.themedCheckboxContainerBase, style]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View
        style={[
          styles.themedCheckboxBoxBase,
          { borderColor: checkboxBorder },
          checked && { backgroundColor: checkboxCheckedBg, borderColor: checkboxCheckedBg }, // Use themed checked background
        ]}
      >
        {checked && <ThemedText style={[styles.themedCheckboxCheckmarkBase, { color: checkmarkColor }]}>✓</ThemedText>}
      </View>
      <ThemedText style={[styles.themedCheckboxLabelBase, textStyle]}>{label}</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themedCheckboxContainerBase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themedCheckboxBoxBase: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themedCheckboxCheckmarkBase: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 15, // Ensure checkmark is centered if font has extra space
  },
  themedCheckboxLabelBase: {
    fontSize: 16,
  },
});