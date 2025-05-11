import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
// import type { RootState } from '../../../store/store';
import { fetchLeaveRequestsStart, LeaveRequest } from '../../store/slices/leaveSlice'; // Import LeaveRequest from slice

// Mock data is now initial state in leaveSlice.ts, so no need for MOCK_LEAVE_REQUESTS here.

const LeaveStatusScreen = () => {
  const dispatch = useDispatch();
  // const { leaveRequests, isLoading, error } = useSelector((state: RootState) => state.leaves);
  const { leaveRequests, isLoading, error } = useSelector((state: any) => state.leaves); // Get from actual slice state

  useEffect(() => {
    // dispatch(fetchLeaveRequestsStart()); // Dispatch if you want to simulate a fetch on screen load
    // For now, data is preloaded in slice's initial state.
    console.log('LeaveStatusScreen: Using leave request data from Redux slice.');
    if (leaveRequests.length === 0 && !isLoading) { // Example: if initial state was empty and we wanted to fetch
        // dispatch(fetchLeaveRequestsStart());
        // setTimeout(() => dispatch(fetchLeaveRequestsSuccess(MOCK_LEAVE_REQUESTS_INITIAL_FROM_SLICE_OR_API)), 1000)
    }
  }, [dispatch, leaveRequests.length, isLoading]); // Added dependencies

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.leaveItem}>
      <Text style={styles.leaveHeader}>Type: {item.leaveType} (Status: {item.status})</Text>
      <Text>Dates: {item.startDate} to {item.endDate}</Text>
      <Text>Reason: {item.reason}</Text>
      <Text>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</Text>
      {/* TODO: Add button to cancel pending requests */}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading leave requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Leave Requests</Text>
      {leaveRequests.length === 0 && !isLoading ? (
        <Text style={styles.noRequestsText}>You haven't submitted any leave requests.</Text>
      ) : (
        <FlatList
          data={leaveRequests}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} 
        />
      )}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
    </ScrollView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  leaveItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  leaveHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noRequestsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default LeaveStatusScreen;