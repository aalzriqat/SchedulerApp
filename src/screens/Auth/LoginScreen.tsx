import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, TextProps, TextInputProps, TouchableOpacityProps, ViewStyle } from 'react-native'; // Added TouchableOpacityProps, ViewStyle
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { authProcessStart, authProcessSuccess, authProcessFailure, clearAuthError, User } from '../../store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import { loginUser, getCurrentUserApi } from '../../api/apiService';
import { ThemedView } from '@/components/ThemedView'; // Import ThemedView
import { ThemedText, ThemedTextProps } from '@/components/ThemedText'; // Import ThemedText and its props
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { Colors } from '@/constants/Colors'; // Import Colors for direct use if needed for placeholders
import { ThemedButton } from '@/components/ThemedButton'; // Import ThemedButton
import { ThemedInput } from '@/components/ThemedInput'; // Import ThemedInput
import { ThemedCheckbox } from '@/components/ThemedCheckbox'; // Import ThemedCheckbox


const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state: any) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);

  const titleColor = useThemeColor({}, 'tint'); // For the main title

  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const remembered = await SecureStore.getItemAsync('rememberedEmail');
        if (remembered) {
          setEmail(remembered);
          setRememberEmail(true);
        }
      } catch (e) {
        console.error('Failed to load remembered email', e);
      }
    };
    loadRememberedEmail();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error); // Keep Alert for critical errors like login failure
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    // Proactively clear any existing Redux error state before a new login attempt
    if (error) {
      dispatch(clearAuthError());
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email/username and password.');
      return;
    }
    dispatch(authProcessStart());
    loginUser({ email, password })
      .then(async (loginData) => {
        const token = loginData.token;
        if (!token) throw new Error('Login successful, but no token received.');
        await SecureStore.setItemAsync('userToken', token);
        const backendUser = await getCurrentUserApi();
        const frontendUser: User = {
          id: backendUser._id, name: backendUser.username,
          email: backendUser.email, role: backendUser.role,
        };
        await SecureStore.setItemAsync('userData', JSON.stringify(frontendUser));
        if (rememberEmail && email) await SecureStore.setItemAsync('rememberedEmail', email);
        else await SecureStore.deleteItemAsync('rememberedEmail');
        dispatch(authProcessSuccess({ user: frontendUser }));
        // NavigationController will handle redirect
      })
      .catch((err: Error) => {
        dispatch(authProcessFailure(err.message || 'Login failed. Please check your credentials or server status.'));
      });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.title, { color: titleColor }]}>
        Scheduler Login
      </ThemedText>
      
      <ThemedInput
        style={styles.input}
        placeholder="Email or Username"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <ThemedInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <ThemedButton
        title={isLoading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={isLoading}
        style={styles.button}
      />

      <ThemedCheckbox
        label="Remember Email"
        checked={rememberEmail}
        onPress={() => setRememberEmail(!rememberEmail)}
        style={styles.rememberContainer}
      />
      
      <View style={styles.signUpContainer}>
        <ThemedText>Don't have an account? </ThemedText>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <ThemedText type="link">Sign Up</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

// Original styles will be mostly replaced or adapted by themed component styles
// Keeping container and layout-specific styles
const styles = StyleSheet.create({
  container: { // Uses ThemedView, so background is handled
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Increased padding
  },
  title: { // ThemedText handles base style, this is for layout
    marginBottom: 32,
    textAlign: 'center',
  },
  input: { // For spacing, width. ThemedInput handles visual styling.
    width: '100%',
    marginBottom: 18, // Adjusted spacing
  },
  button: { // For spacing, width. ThemedButton handles visual styling.
    width: '100%',
    marginTop: 8, // Added margin top
  },
  rememberContainer: { // For layout. ThemedCheckbox handles visuals.
    width: '100%',
    marginTop: 20, // Adjusted spacing
    marginBottom: 12,
  },
  signUpContainer: {
    marginTop: 24, // Adjusted spacing
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Base styles for placeholder themed components (would be in their own files)
  themedInputBase: {
    borderWidth: 1,
    borderRadius: 8, // Softer radius
    paddingHorizontal: 15, // More padding
    paddingVertical: 12,
    fontSize: 16, // Slightly smaller
  },
  themedButtonBase: {
    paddingVertical: 14, // More padding
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themedButtonTextBase: {
    fontSize: 16,
    fontWeight: '600',
  },
  themedCheckboxContainerBase: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themedCheckboxBoxBase: {
    width: 22, // Slightly larger
    height: 22,
    borderWidth: 2, // Thicker border
    borderRadius: 4,
    marginRight: 10, // More spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
  themedCheckboxBoxCheckedBase: {
    // backgroundColor and borderColor applied dynamically
  },
  themedCheckboxCheckmarkBase: {
    fontSize: 14, // Adjusted size
    fontWeight: 'bold',
  },
  themedCheckboxLabelBase: {
    fontSize: 16,
  }
});

export default LoginScreen;