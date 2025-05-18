import React from 'react';
import { TouchableOpacity, StyleSheet, TouchableOpacityProps } from 'react-native';
import { ThemedText, ThemedTextProps } from './ThemedText'; // Adjusted path
import { useThemeColor } from '../hooks/useThemeColor'; // Adjusted path
import { Colors } from '../constants/Colors'; // Adjusted path

export interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  type?: 'primary' | 'destructive' | 'secondary';
  lightColor?: string; // for text
  darkColor?: string; // for text
  lightBackgroundColor?: string;
  darkBackgroundColor?: string;
  textStyle?: ThemedTextProps['style'];
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  disabled,
  style,
  textStyle,
  type = 'primary',
  lightColor,
  darkColor,
  lightBackgroundColor,
  darkBackgroundColor,
  ...otherProps // Spread other TouchableOpacityProps
}) => {
  const themeKeyPrefix = disabled ? 'buttonDisabled' : `button${type.charAt(0).toUpperCase() + type.slice(1)}`;
  // Ensure the keys are valid for Colors.light
  const validBgKey = `${themeKeyPrefix}Background` as keyof typeof Colors.light;
  const validTextKey = `${themeKeyPrefix}Text` as keyof typeof Colors.light;

  const bgColor = useThemeColor({ light: lightBackgroundColor, dark: darkBackgroundColor }, validBgKey);
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, validTextKey);

  return (
    <TouchableOpacity
      style={[styles.themedButtonBase, { backgroundColor: bgColor }, style]}
      onPress={onPress}
      disabled={disabled}
      {...otherProps} // Apply other props
    >
      <ThemedText style={[styles.themedButtonTextBase, { color: textColor }, textStyle]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  themedButtonBase: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themedButtonTextBase: {
    fontSize: 16,
    fontWeight: '600',
  },
});