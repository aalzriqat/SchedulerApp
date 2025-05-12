import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store'; // Use AppDispatch and RootState
import { registerRequest, registerSuccessNoAuth, registerFailure, clearAuthError } from '../../store/slices/authSlice'; // Adjusted path
import { registerUserApi } from '../../api/apiService'; // Import the new API function

const RegisterScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch
  const { isLoading, error } = useSelector((state: RootState) => state.auth); // Use RootState


  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Employee'); // Default role, or add a picker

  React.useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error);
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  const handleRegister = async () => { // Make async
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
    
    dispatch(registerRequest());
    console.log('Register attempt with:', username, email, password, role);

    try {
      // Actual API call
      const response = await registerUserApi({ username, email, password, role });
      console.log('Registration API success:', response.message);
      dispatch(registerSuccessNoAuth());
      Alert.alert('Registration Successful', response.message || 'Please login with your new account.', [
        { text: 'OK', onPress: () => router.replace('/login') }
      ]);
    } catch (apiError: any) {
      console.error('Registration API error', apiError);
      dispatch(registerFailure(apiError.message || 'An unexpected error occurred during registration.'));
      // Alert is handled by useEffect for error state
    }
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
        
        {/* Optional: Role Picker if you want to allow role selection during registration
            Otherwise, 'Employee' is default or set by backend.
        <Text style={styles.label}>Role:</Text>
        <Picker selectedValue={role} style={styles.input} onValueChange={(itemValue) => setRole(itemValue)}>
          <Picker.Item label="Employee" value="Employee" />
          <Picker.Item label="Admin" value="Admin" />
        </Picker>
        */}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Registering...' : 'Register'}</Text>
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