// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { Colors } from '@/constants/Colors'; // Corrected path to Colors using @ alias

type ColorThemeKeys = keyof typeof Colors.light; // Define type for valid color keys
type MaterialIconNameType = ComponentProps<typeof MaterialIcons>['name'];

// The MAPPING object will only contain the symbols we explicitly define.
// IconSymbolName will be derived from the keys of this MAPPING object.

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - SF Symbol names are on the left (e.g., 'house.fill').
 * - Material Icons names (values) must be valid MaterialIconNameType.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: Record<string, MaterialIconNameType> = { // Ensures values are valid MaterialIconNameType
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'gearshape.fill': 'settings',
  'calendar': 'event',
  'plus.circle.fill': 'add-circle',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'xmark': 'close',
  'checkmark': 'check',
  'exclamationmark.triangle.fill': 'warning',
  // Mappings for Admin Tabs
  'gauge': 'dashboard',
  'megaphone.fill': 'campaign',
  'calendar.badge.minus': 'event-busy', // Used by Admin 'Manage Leaves' & Employee 'Leave'
  'checklist': 'playlist-add-check',
  'arrow.2.squarepath': 'sync',
  // Mappings for Header Icons (re-used by Employee layout)
  'bell.fill': 'notifications',
  'person.circle.fill': 'account-circle',
  // Mappings for Employee Tabs
  'person.fill': 'person', // SF Symbol 'person.fill' for FA 'user' (Employee Dashboard)
  'calendar.badge.checkmark': 'event-available', // SF Symbol 'calendar.badge.checkmark' for FA 'calendar-check-o' (My Schedule)
  // 'calendar.badge.minus' (for Leave) is already mapped above
  // 'gearshape.fill' (for Hub, mapped to 'settings') is already mapped above
  'newspaper.fill': 'article', // SF Symbol 'newspaper.fill' for FA 'newspaper-o' (News)
};

// IconSymbolName is now correctly typed to only allow keys from our MAPPING object.
type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color: explicitColor, // Renamed to avoid conflict with themed color
  lightColor, // Allow passing specific light/dark colors for the icon
  darkColor,  // Allow passing specific light/dark colors for the icon
  themeColorKey = 'icon', // Default theme color key to use (e.g., 'icon', 'tint', 'text')
  style,
  weight, // weight is primarily for SF Symbols on iOS
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue; // Explicit color is optional
  lightColor?: string;
  darkColor?: string;
  themeColorKey?: ColorThemeKeys; // Use the defined ColorThemeKeys type
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const themedColor = useThemeColor({ light: lightColor, dark: darkColor }, themeColorKey);
  const finalColor = explicitColor || themedColor;

  // Ensure the name exists in MAPPING to prevent runtime errors
  const materialIconName = MAPPING[name];
  if (!materialIconName) {
    console.warn(`IconSymbol: No Material Icon mapping found for SF Symbol '${name}'. Rendering a fallback icon.`);
    // Fallback to a default icon like 'help' or 'error' if name is not in MAPPING
    return <MaterialIcons color={finalColor} size={size} name="help-outline" style={style} />;
  }

  return <MaterialIcons color={finalColor} size={size} name={materialIconName} style={style} />;
}
