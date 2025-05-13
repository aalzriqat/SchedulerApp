import React from 'react';
import EmployeeDashboardScreen from '../../../../src/screens/Employee/EmployeeDashboardScreen'; // Adjusted path
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';
import { logoutAction } from '../../../../src/store/slices/authSlice'; // Adjusted path

export default function EmployeeDashboardPage() {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    console.log('EmployeeDashboardPage: Logging out...');
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('userData');
      dispatch(logoutAction());
    } catch (e) {
      console.error('EmployeeDashboardPage: Error during logout', e);
    }
  };

  return (
    <View style={{flex: 1}}>
      <EmployeeDashboardScreen />
      {/* <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout (Employee)</Text>
      </TouchableOpacity> */}
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