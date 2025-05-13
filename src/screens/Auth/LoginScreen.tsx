import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { authProcessStart, authProcessSuccess, authProcessFailure, clearAuthError, User } from '../../store/slices/authSlice';
import * as SecureStore from 'expo-secure-store';
import { loginUser, getCurrentUserApi } from '../../api/apiService'; // Import loginUser and getCurrentUserApi
// ApiLoginResponse type is not directly used here anymore if we adopt Option B fully
// import type { LoginResponse as ApiLoginResponse } from '../../api/apiService';

const LoginScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: any) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);

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
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    if (error) {
      Alert.alert('Login Error', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email/username and password.');
      return;
    }
    dispatch(authProcessStart());
    console.log('Login attempt with:', email);

    // Option B: First, get the token from /users/login
    loginUser({ email, password }) // This API call expects { token } if backend is not changed
      .then(async (loginData) => { // loginData should be { token: string }
        const token = loginData.token;
        if (!token) {
          throw new Error('Login successful, but no token received.');
        }
        await SecureStore.setItemAsync('userToken', token);
        console.log('Token stored. Fetching user details...');

        // Second, use the token to get user details from /users/me
        const backendUser = await getCurrentUserApi(); // Interceptor adds the token
        
        const frontendUser: User = {
          id: backendUser._id, // Map _id to id
          name: backendUser.username, // Use username as name, or add name to BackendUser if available
          email: backendUser.email,
          role: backendUser.role,
        };

        await SecureStore.setItemAsync('userData', JSON.stringify(frontendUser));

        if (rememberEmail && email) {
          await SecureStore.setItemAsync('rememberedEmail', email);
          console.log('Email remembered.');
        } else {
          await SecureStore.deleteItemAsync('rememberedEmail');
          console.log('Remembered email cleared.');
        }
        
        console.log(`Full login successful for ${frontendUser.email}. User data and token stored.`);
        dispatch(authProcessSuccess({ user: frontendUser }));
      })
      .catch((err: Error) => {
        console.error('Login process failed:', err);
        dispatch(authProcessFailure(err.message || 'Login failed. Please check your credentials or server status.'));
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scheduler Login
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email or Username"
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
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.rememberContainer}
        onPress={() => setRememberEmail(!rememberEmail)}
      >
        <View style={[styles.checkbox, rememberEmail && styles.checkboxChecked]}>
          {rememberEmail && <Text style={styles.checkboxCheckmark}>✓</Text>}
        </View>
        <Text style={styles.rememberText}>Remember Email</Text>
      </TouchableOpacity>
      
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6', 
    padding: 16, 
  },
  title: {
    fontSize: 30, 
    fontWeight: 'bold',
    marginBottom: 32, 
    color: '#2563eb', 
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
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 6, 
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18, 
    fontWeight: '600',
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 16,
    marginBottom: 8, // Added margin below remember me
    // justifyContent: 'center', // Or 'flex-start' if you prefer left alignment
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#d1d5db', // border-gray-300
    borderRadius: 3,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb', // bg-blue-600
    borderColor: '#2563eb',
  },
  checkboxCheckmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 16,
    color: '#4b5563', // text-gray-600
  },
  signUpContainer: {
    marginTop: 16, // Adjusted margin
    flexDirection: 'row',
  },
  signUpText: {
    color: '#4b5563',
  },
  signUpLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
});

export default LoginScreen;