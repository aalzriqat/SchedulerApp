import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInputProps, TouchableOpacityProps, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { registerRequest, registerSuccessNoAuth, registerFailure, clearAuthError } from '../../store/slices/authSlice';
import { registerUserApi } from '../../api/apiService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText, ThemedTextProps } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';
import { ThemedButton } from '@/components/ThemedButton'; // Import ThemedButton
import { ThemedInput } from '@/components/ThemedInput'; // Import ThemedInput

// --- Re-using Placeholder Themed Components (Ideally imported from separate files) ---
// Placeholder for ThemedInput removed as it's now imported
// --- End of Placeholder Themed Components ---


const RegisterScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Employee');

  const titleColor = useThemeColor({}, 'tint'); // For the main title

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleRegister = async () => {
    // Proactively clear any existing Redux error state before a new registration attempt
    if (error) {
      dispatch(clearAuthError());
    }

    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Validation Error','Please fill in all fields.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error',"Passwords don't match!"); return;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error','Please enter a valid email address.'); return;
    }
    
    dispatch(registerRequest());
    try {
      const response = await registerUserApi({ username, email, password, role });
      dispatch(registerSuccessNoAuth());
      Alert.alert('Registration Successful', response.message || 'Please login with your new account.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (apiError: any) {
      dispatch(registerFailure(apiError.message || 'An unexpected error occurred during registration.'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.title, {color: titleColor}]}>Create Account</ThemedText>

        <ThemedInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <ThemedInput
          style={styles.input}
          placeholder="Email"
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

        <ThemedInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        {/* TODO: Consider a ThemedPicker for Role selection if it becomes user-configurable */}

        <ThemedButton
          title={isLoading ? 'Registering...' : 'Register'}
          onPress={handleRegister}
          disabled={isLoading}
          style={styles.button}
        />

        <View style={styles.signInContainer}>
          <ThemedText>Already have an account? </ThemedText>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <ThemedText type="link">Sign In</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: { // Uses ThemedView
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Increased padding
  },
  title: { // ThemedText handles base style
    fontSize: 28,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: { // For spacing, width. ThemedInput handles visuals.
    width: '100%',
    marginBottom: 18,
  },
  button: { // For spacing, width. ThemedButton handles visuals.
    width: '100%',
    marginTop: 12, // Adjusted margin
  },
  signInContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Base styles for placeholder themed components (would be in their own files)
  themedInputBase: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
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

export default RegisterScreen;