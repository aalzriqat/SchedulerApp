import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { registerRequest, registerSuccessNoAuth, registerFailure, clearAuthError } from '../../store/slices/authSlice'; // Adjusted path
// import type { RootState } from '../../store/store';

const RegisterScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  // const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { isLoading, error } = useSelector((state: any) => state.auth);


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleRegister = () => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Validation Error','Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Validation Error',"Passwords don't match!");
      return;
    }
    if (!email.includes('@')) { // Basic email validation
      Alert.alert('Validation Error','Please enter a valid email address.');
      return;
    }
    
    dispatch(registerRequest()); // Indicates start of registration process
    console.log('Register attempt with:', username, email, password);

    // Simulate API call
    setTimeout(() => {
      try {
        // Simulate a successful registration
        console.log('Simulated registration success for:', email);
        dispatch(registerSuccessNoAuth()); // Dispatch success that doesn't auto-login
        Alert.alert('Registration Successful', 'Please login with your new account.', [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]);
        // If auto-login after registration was desired, you would dispatch authProcessSuccess here
        // with the new user data and a token from the backend.
      } catch (e) {
        console.error('Registration simulation error', e);
        dispatch(registerFailure('An unexpected error occurred during registration.'));
      }
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  title: {
    fontSize: 28, // Slightly smaller than login
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1e40af', // Darker blue
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 18,
  },
  button: {
    width: '100%',
    backgroundColor: '#1e40af', // Darker blue
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signInContainer: {
    marginTop: 24,
    flexDirection: 'row',
  },
  signInText: {
    color: '#4b5563',
  },
  signInLink: {
    color: '#1e40af', // Darker blue
    fontWeight: '600',
  },
});

export default RegisterScreen;