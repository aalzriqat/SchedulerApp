import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
// import type { RootState, AppDispatch } from '../../../store/store';
import { 
  fetchUserSchedule, 
  updateShiftAvailabilityOptimistic,
  updateUserShiftAvailability, // Re-add this import
  Shift, 
  clearEmployeeScheduleError 
} from '../../store/slices/employeeScheduleSlice';
import { User } from '../../store/slices/authSlice';

const EmployeeScheduleScreen = () => {
  const dispatch = useDispatch<any>(); // Use AppDispatch for typed dispatch
  const { user }: { user: User | null } = useSelector((state: any) => state.auth);
  const { 
    shifts, 
    isLoading, 
    error 
  } = useSelector((state: any) => state.employeeSchedule);

  useEffect(() => {
    if (user && user.id) {
      console.log(`EmployeeScheduleScreen: Fetching schedule for employee ID: ${user.id}`);
      dispatch(fetchUserSchedule(user.id));
    } else {
      console.log('EmployeeScheduleScreen: User ID not available, cannot fetch schedule.');
    }
  }, [user?.id, dispatch]); // Changed dependency to user?.id

  useEffect(() => {
    if (error) {
      Alert.alert('Schedule Error', error);
      dispatch(clearEmployeeScheduleError());
    }
  }, [error, dispatch]);

  const toggleSwapAvailability = (shiftId: string) => {
    const shift = shifts.find((s: Shift) => s._id === shiftId);
    if (shift) {
      const newAvailability = !shift.isAvailableForSwap;
      // Optimistic update first
      dispatch(updateShiftAvailabilityOptimistic({ shiftId, isAvailableForSwap: newAvailability }));
      
      // Then dispatch thunk to update backend
      dispatch(updateUserShiftAvailability({ scheduleId: shiftId, isAvailableForSwap: newAvailability }))
        .unwrap()
        .then((updatedShift: Shift) => { 
          console.log(`Swap availability successfully updated on backend for shift ID: ${updatedShift._id} to ${updatedShift.isAvailableForSwap}`);
        })
        .catch((apiError: any) => { 
          console.error(`Failed to update swap availability on backend for shift ID: ${shiftId}`, apiError);
          // Revert optimistic update
          dispatch(updateShiftAvailabilityOptimistic({ shiftId, isAvailableForSwap: shift.isAvailableForSwap })); 
          Alert.alert('Update Failed', `Could not update swap availability. Error: ${apiError.message || 'Unknown error'}`);
        });
      console.log(`Dispatched toggle swap availability for shift ID: ${shiftId} to ${newAvailability}`);
    }
  };

  const renderItem = ({ item }: { item: Shift }) => (
    <View style={styles.shiftItem}>
      <Text style={styles.shiftDate}>Date: {new Date(item.date).toLocaleDateString()}</Text>
      <Text>Time: {item.startTime} - {item.endTime}</Text>
      <Text>Role: {item.role || 'N/A'}</Text>
      <Text>Location: {item.location || 'N/A'}</Text>
      <TouchableOpacity
        style={[
          styles.swapButton,
          item.isAvailableForSwap ? styles.swapButtonAvailable : styles.swapButtonNotAvailable,
        ]}
        onPress={() => toggleSwapAvailability(item._id)}
      >
        <Text style={styles.swapButtonText}>
          {item.isAvailableForSwap ? 'Available for Swap' : 'Make Available'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && shifts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading your schedule...</Text>
      </View>
    );
  }
  
  if (!isLoading && shifts.length === 0 && !error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>No upcoming shifts found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Schedule</Text>
      {isLoading && shifts.length > 0 && <ActivityIndicator style={styles.inlineLoader} size="small" color="#0000ff" />}
      <FlatList
        data={shifts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        ListEmptyComponent={!isLoading && !error ? (
            <View style={styles.centered}><Text>No shifts scheduled.</Text></View>
        ) : null}
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
    flex: 1, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  shiftItem: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shiftDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  swapButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  swapButtonAvailable: {
    backgroundColor: '#22c55e', 
  },
  swapButtonNotAvailable: {
    backgroundColor: '#3b82f6', 
  },
  swapButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: { 
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  inlineLoader: {
    marginVertical: 10,
    alignSelf: 'center', 
  }
});

export default EmployeeScheduleScreen;