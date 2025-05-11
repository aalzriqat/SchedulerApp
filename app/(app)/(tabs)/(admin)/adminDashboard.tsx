import React from 'react';
import AdminDashboardScreen from '../../../../src/screens/Admin/AdminDashboardScreen'; // Adjusted path
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { logoutAction } from '../../../../src/store/slices/authSlice'; // Adjusted path

export default function AdminDashboardPage() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    console.log('AdminDashboardPage: Logging out...');
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      dispatch(logoutAction());
    } catch (e) {
      console.error('AdminDashboardPage: Error during logout', e);
    }
  };

  return (
    <View style={{flex: 1}}>
      <AdminDashboardScreen />
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout (Admin)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: 'red',
    padding: 10,
    margin: 10,
    alignItems: 'center',
    borderRadius: 5,
    position: 'absolute', 
    bottom: 20,
    left: 20,
    right: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});