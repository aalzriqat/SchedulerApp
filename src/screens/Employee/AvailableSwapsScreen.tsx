import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
// import type { RootState } from '../../../store/store';

// Re-using Shift interface, adding employeeId/name for context
interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
  isAvailableForSwap?: boolean;
  employeeId?: string; // ID of the employee whose shift it is
  employeeName?: string; // Name of the employee
}

// Mock data for other employees' available shifts
const MOCK_AVAILABLE_SHIFTS: Shift[] = [
  { id: '101', date: '2025-05-12', startTime: '09:00', endTime: '17:00', role: 'CSA', location: 'Main Branch', employeeId: 'emp002', employeeName: 'Jane Doe', isAvailableForSwap: true },
  { id: '102', date: '2025-05-13', startTime: '14:00', endTime: '22:00', role: 'CSA', location: 'West Wing', employeeId: 'emp003', employeeName: 'John Smith', isAvailableForSwap: true },
  { id: '103', date: '2025-05-15', startTime: '08:00', endTime: '16:00', role: 'CSA', location: 'Support Desk', employeeId: 'emp004', employeeName: 'Alice Brown', isAvailableForSwap: true },
];

const AvailableSwapsScreen = () => {
  // const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUser = useSelector((state: any) => state.auth.user);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AvailableSwapsScreen: Fetching available shifts for swap...');
    setTimeout(() => {
      // Filter out shifts belonging to the current user (if any were included in mock)
      const otherEmployeeShifts = MOCK_AVAILABLE_SHIFTS.filter(
        shift => shift.employeeId !== currentUser?.id // Assuming user object has an 'id'
      );
      setAvailableShifts(otherEmployeeShifts);
      setLoading(false);
    }, 1000);
  }, [currentUser]);

  const handleRequestSwap = (targetShift: Shift) => {
    // This is where the user would select one of THEIR shifts to offer in exchange.
    // For now, just log the intent.
    Alert.alert(
      'Request Swap',
      `Request to swap for ${targetShift.employeeName}'s shift on ${targetShift.date} (${targetShift.startTime}-${targetShift.endTime})? You'll need to select one of your shifts to offer.`,
      [{ text: 'OK' }]
    );
    console.log('Attempting to request swap for shift ID:', targetShift.id, 'owned by', targetShift.employeeName);
    // TODO: Implement UI to select own shift and then dispatch swap request action
  };

  const renderItem = ({ item }: { item: Shift }) => (
    <View style={styles.shiftItem}>
      <Text style={styles.shiftDate}>Date: {item.date} (Owned by: {item.employeeName || 'N/A'})</Text>
      <Text>Time: {item.startTime} - {item.endTime}</Text>
      <Text>Role: {item.role}</Text>
      <Text>Location: {item.location}</Text>
      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => handleRequestSwap(item)}
      >
        <Text style={styles.requestButtonText}>Request This Shift</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading available shifts...</Text>
      </View>
    );
  }
  
  if (availableShifts.length === 0) {
     return (
      <View style={[styles.container, styles.centered]}>
        <Text>No shifts currently available for swap from other employees.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Shifts for Swap</Text>
      <FlatList
        data={availableShifts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  shiftItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestButton: {
    backgroundColor: '#10b981', // emerald-500
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  requestButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AvailableSwapsScreen;