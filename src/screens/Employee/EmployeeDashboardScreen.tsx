import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux'; // Keep useSelector if still needed for user name
// import type { RootState } from '../../store/store';
import { User } from '../../store/slices/authSlice'; // Keep User type if needed

const EmployeeDashboardScreen = () => {
  // const user = useSelector((state: RootState) => state.auth.user);
  const { user }: { user: User | null } = useSelector((state: any) => state.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Dashboard</Text>
      <Text>Welcome, {user?.name || 'Employee User'}!</Text>
      {/* Placeholder for employee-specific content */}
      {/* Removed Open for Swaps toggle UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Re-center content
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Removed swapToggleContainer and swapToggleLabel styles
});

export default EmployeeDashboardScreen;