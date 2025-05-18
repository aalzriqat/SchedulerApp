import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps, Children, isValidElement } from 'react';
import { Platform } from 'react-native';
import { ThemedText } from './ThemedText'; // Import ThemedText

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string; children?: React.ReactNode };

export function ExternalLink({ href, children, ...rest }: Props) {
  const content = Children.map(children, child => {
    if (typeof child === 'string') {
      return <ThemedText type="link">{child}</ThemedText>;
    }
    // If child is already a ThemedText or some other element, render as is.
    // This allows for icons or other custom content within the link.
    return child;
  });
  
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    >
      {content}
    </Link>
  );
}
