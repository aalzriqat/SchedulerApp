import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor'; // To style the fallback UI

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI - needs to be a functional component to use hooks, or pass theme colors as props
      return <ErrorFallbackUI error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

// Functional component for Fallback UI to use hooks
const ErrorFallbackUI = ({ error, errorInfo }: { error?: Error, errorInfo?: ErrorInfo }) => {
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedTextColor = useThemeColor({}, 'text');

  return (
    <ThemedView style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={[styles.title, { color: themedErrorTextColor }]}>Oops! Something went wrong.</ThemedText>
        <ThemedText style={[styles.subtitle, { color: themedTextColor }]}>
          We're sorry for the inconvenience. Please try restarting the app.
        </ThemedText>
        {__DEV__ && error && ( // Only show details in development
          <View style={styles.errorDetails}>
            <ThemedText style={[styles.errorText, { color: themedErrorTextColor }]}>{error.toString()}</ThemedText>
            {errorInfo && <ThemedText style={[styles.errorText, { color: themedTextColor }]}>{errorInfo.componentStack}</ThemedText>}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorDetails: {
    marginTop: 20,
    padding: 10,
    borderRadius: 5,
    // backgroundColor: 'rgba(0,0,0,0.05)', // Consider theme for this if desired
  },
  errorText: {
    fontSize: 12,
    marginBottom: 5,
  },
});

export default ErrorBoundary;