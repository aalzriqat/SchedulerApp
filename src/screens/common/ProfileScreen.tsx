import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ScrollView, ActivityIndicator, Switch, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { updateUserProfile, updateUserOpenForSwap, clearProfileStatus } from '../../store/slices/profileSlice';
import { logoutAction, User } from '../../store/slices/authSlice'; // Correctly import logoutAction
import { clearNotifications } from '../../store/slices/notificationSlice'; // Import clearNotifications
import * as SecureStore from 'expo-secure-store';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { loading, error, successMessage } = useSelector((state: RootState) => state.profile);
  const initialIsOpenForSwap = currentUser?.isOpenForSwap ?? false;

  const [name, setName] = useState(currentUser?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isOpenForSwap, setIsOpenForSwap] = useState(initialIsOpenForSwap);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setIsOpenForSwap(initialIsOpenForSwap);
    }
  }, [currentUser, initialIsOpenForSwap]);

  useEffect(() => {
    if (successMessage) {
      Alert.alert('Success', successMessage);
      dispatch(clearProfileStatus());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearProfileStatus());
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  }, [successMessage, error, dispatch]);

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Validation Error', 'All password fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Validation Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters long.');
      return;
    }
    dispatch(updateUserProfile({ currentPassword, newPassword }));
  };

  const handleToggleSwapAvailability = (value: boolean) => {
    setIsOpenForSwap(value);
    dispatch(updateUserOpenForSwap(value));
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      dispatch(logoutAction());
      dispatch(clearNotifications()); // Clear notifications on logout
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };

  if (!currentUser) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>Loading user profile...</ThemedText>
        <ActivityIndicator size="large" color="#007bff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText type="title" style={styles.header}>My Profile</ThemedText>

        {/* Account Info */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Account Information</ThemedText>
          <ThemedText style={styles.infoText}><ThemedText style={styles.infoLabel}>Email:</ThemedText> {currentUser.email}</ThemedText>
          <ThemedText style={styles.infoText}><ThemedText style={styles.infoLabel}>Role:</ThemedText> {currentUser.role}</ThemedText>
        </View>

        {/* Swap Availability */}
        {currentUser.role === 'Employee' && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Swap Availability</ThemedText>
            <View style={styles.switchContainer}>
              <ThemedText>Open for Swaps:</ThemedText>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isOpenForSwap ? "#007bff" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleToggleSwapAvailability}
                value={isOpenForSwap}
                disabled={loading}
              />
            </View>
          </View>
        )}

        {/* Preferences Button */}
        {currentUser.role === 'Employee' && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>My Preferences</ThemedText>
            <Button
              title="Go to Preferences"
              onPress={() => router.push('/(app)/(tabs)/(employee)/hub/preferences/viewPreferences')}
              color="#007bff"
            />
          </View>
        )}

        {/* Password Change */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Change Password</ThemedText>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current Password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New Password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            value={confirmNewPassword}
            onChangeText={setConfirmNewPassword}
            placeholder="Confirm New Password"
            placeholderTextColor="#999"
            secureTextEntry
          />
          <Button title={loading ? "Updating..." : "Change Password"} onPress={handleUpdatePassword} disabled={loading} color="#007bff" />
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={[styles.section, { backgroundColor: '#ff4d4d', padding: 15, borderRadius: 8 }]}>
          <ThemedText style={{ color: '#fff', textAlign: 'center' }}>Logout</ThemedText>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  loader: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default ProfileScreen;
