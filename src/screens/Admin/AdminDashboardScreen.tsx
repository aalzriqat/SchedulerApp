import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text>Welcome, Admin User!</Text>
      {/* Placeholder for admin-specific content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default AdminDashboardScreen;