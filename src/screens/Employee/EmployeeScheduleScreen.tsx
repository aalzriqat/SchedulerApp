import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl as RNRefreshControl } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store'; // Corrected import for RootState and AppDispatch
import {
  fetchUserSchedule,
  updateShiftAvailabilityOptimistic,
  updateUserShiftAvailability,
  Shift,
  clearEmployeeScheduleErrors // Corrected action name
} from '../../store/slices/employeeScheduleSlice';
import { User } from '../../store/slices/authSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const EmployeeScheduleScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth); // User type inferred from RootState
  const {
    shifts,
    isLoading,
    error
  } = useSelector((state: RootState) => state.employeeSchedule);

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedSuccessButtonBg = useThemeColor({}, 'statusApprovedBackground'); // For 'Available'
  const themedSuccessButtonText = useThemeColor({}, 'statusApprovedText');


  useEffect(() => {
    if (user && user.id) {
      console.log(`EmployeeScheduleScreen: Fetching schedule for employee ID: ${user.id}`);
      dispatch(fetchUserSchedule(user.id));
    } else {
      console.log('EmployeeScheduleScreen: User ID not available, cannot fetch schedule.');
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Schedule Error', error);
      dispatch(clearEmployeeScheduleErrors()); // Corrected action name
    }
  }, [error, dispatch]);
  
  const onRefresh = () => {
    if (user && user.id) {
      dispatch(fetchUserSchedule(user.id));
    }
  };

  const toggleSwapAvailability = (shiftId: string) => {
    const shift = shifts.find((s: Shift) => s._id === shiftId);
    if (shift) {
      const newAvailability = !shift.isOpenForSwap; // Corrected field name
      // Optimistic update first
      dispatch(updateShiftAvailabilityOptimistic({ shiftId, isAvailableForSwap: newAvailability }));
      
      // Then dispatch thunk to update backend
      // Note: updateUserShiftAvailability in apiService.ts expects isAvailableForSwap,
      // ensure backend route for PATCH /schedules/:scheduleId/availability is added and handles this field name.
      // For now, the thunk passes it as isAvailableForSwap.
      dispatch(updateUserShiftAvailability({ scheduleId: shiftId, isAvailableForSwap: newAvailability }))
        .unwrap()
        .then((updatedShift: Shift) => {
          console.log(`Swap availability successfully updated on backend for shift ID: ${updatedShift._id} to ${updatedShift.isOpenForSwap}`); // Corrected field name
        })
        .catch((apiError: any) => {
          console.error(`Failed to update swap availability on backend for shift ID: ${shiftId}`, apiError);
          // Revert optimistic update
          dispatch(updateShiftAvailabilityOptimistic({ shiftId, isAvailableForSwap: shift.isOpenForSwap })); // Corrected field name
          Alert.alert('Update Failed', `Could not update swap availability. Error: ${apiError.message || 'Unknown error'}`);
        });
      console.log(`Dispatched toggle swap availability for shift ID: ${shiftId} to ${newAvailability}`);
    }
  };

  const renderItem = ({ item }: { item: Shift }) => (
    <ThemedView style={[styles.shiftItem, {backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor}]}>
      <ThemedText style={styles.shiftDate}>Week: {item.week}</ThemedText>
      <ThemedText>Working Hours: {item.workingHours}</ThemedText>
      <ThemedText>Off Days: {item.offDays.join(', ')}</ThemedText>
      <ThemedText>Created At: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
      {/* Role and Location are not in the current BackendShift structure from the logs */}
      {/* <ThemedText>Role: {item.role || 'N/A'}</ThemedText> */}
      {/* <ThemedText>Location: {item.location || 'N/A'}</ThemedText> */}
      <TouchableOpacity
        style={[
          styles.swapButton,
          item.isOpenForSwap // Corrected field name
            ? {backgroundColor: themedSuccessButtonBg}
            : {backgroundColor: themedPrimaryButtonBg},
        ]}
        onPress={() => toggleSwapAvailability(item._id)}
      >
        <Text style={[styles.swapButtonText, {
            color: item.isOpenForSwap ? themedSuccessButtonText : themedPrimaryButtonText // Corrected field name
        }]}>
          {item.isOpenForSwap ? 'Available for Swap' : 'Make Available'} {/* Corrected field name */}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );

  if (isLoading && shifts.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading your schedule...</ThemedText>
      </ThemedView>
    );
  }
  
  if (!isLoading && shifts.length === 0 && !error) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText>No upcoming shifts found.</ThemedText>
      </ThemedView>
    );
  }
   if (error && shifts.length === 0) { // Show error prominently if no shifts and error
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {error}</ThemedText>
        <TouchableOpacity onPress={onRefresh} style={[styles.swapButton, {backgroundColor: themedPrimaryButtonBg, paddingHorizontal: 20}]}>
            <Text style={[styles.swapButtonText, {color: themedPrimaryButtonText}]}>Retry</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <ThemedText type="title" style={styles.title}>My Schedule</ThemedText>
      {isLoading && shifts.length > 0 && <ActivityIndicator style={styles.inlineLoader} size="small" color={themedPrimaryButtonBg} />}
      <FlatList
        data={shifts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        ListEmptyComponent={!isLoading && !error ? (
            <ThemedView style={[styles.centered, {backgroundColor: themedBackgroundColor}]}><ThemedText>No shifts scheduled.</ThemedText></ThemedView>
        ) : null}
        refreshControl={<RNRefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg}/>}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { // bg applied inline
    flex: 1,
    padding: 16,
  },
  centered: { // bg applied inline
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: { // color from ThemedText
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    width: '100%',
  },
  shiftItem: { // bg and borderColor applied inline
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  shiftDate: { // color from ThemedText
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  swapButton: { // bg applied inline
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  // swapButtonAvailable & NotAvailable removed as bg applied dynamically
  swapButtonText: { // color applied inline
    fontWeight: 'bold',
  },
  errorText: { // color applied inline
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  inlineLoader: {
    marginVertical: 10,
    alignSelf: 'center',
  }
});

export default EmployeeScheduleScreen;