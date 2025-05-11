import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
// import type { RootState } from '../../../store/store';
import { fetchSwapsStart, fetchSwapsSuccess, fetchSwapsFailure, SwapRequest } from '../../store/slices/swapSlice'; // Assuming mock data is in slice

const SwapStatusScreen = () => {
  const dispatch = useDispatch();
  // const { sentRequests, receivedRequests, isLoading, error } = useSelector((state: RootState) => state.swaps);
  const { sentRequests, receivedRequests, isLoading, error } = useSelector((state: any) => state.swaps);
  const currentUser = useSelector((state: any) => state.auth.user);


  useEffect(() => {
    // Simulate fetching swaps. In a real app, this would be an API call.
    // For now, the mock data is loaded as initial state in swapSlice.
    // If we wanted to simulate a fetch:
    // dispatch(fetchSwapsStart());
    // setTimeout(() => {
    //   // dispatch(fetchSwapsSuccess({ sent: MOCK_SENT_SWAPS, received: MOCK_RECEIVED_SWAPS }));
    // }, 1000);
    console.log('SwapStatusScreen: Using initial mock data from swapSlice.');
  }, [dispatch]);

  const renderSwapItem = ({ item }: { item: SwapRequest }) => (
    <View style={styles.swapItem}>
      <Text style={styles.swapHeader}>Request ID: {item.id} (Status: {item.status})</Text>
      <Text>Created: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <View style={styles.shiftDetail}>
        <Text style={styles.shiftTitle}>Your Offered Shift:</Text>
        <Text>Date: {item.offeredShift.date} ({item.offeredShift.startTime} - {item.offeredShift.endTime})</Text>
        <Text>Location: {item.offeredShift.location}</Text>
      </View>
      {item.requestedShift && (
        <View style={styles.shiftDetail}>
          <Text style={styles.shiftTitle}>Requested Shift (from {item.requestedShift.employeeName || 'N/A'}):</Text>
          <Text>Date: {item.requestedShift.date} ({item.requestedShift.startTime} - {item.requestedShift.endTime})</Text>
          <Text>Location: {item.requestedShift.location}</Text>
        </View>
      )}
      {/* TODO: Add buttons for actions like Cancel (for sent) or Accept/Reject (for received) */}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading swap requests...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Swap Requests</Text>

      <Text style={styles.sectionTitle}>Sent Requests</Text>
      {sentRequests.length === 0 ? (
        <Text style={styles.noRequestsText}>You haven't sent any swap requests.</Text>
      ) : (
        <FlatList
          data={sentRequests}
          renderItem={renderSwapItem}
          keyExtractor={(item) => `sent-${item.id}`}
          scrollEnabled={false} // Disable scrolling for inner FlatList if outer is ScrollView
        />
      )}

      <Text style={styles.sectionTitle}>Received Requests</Text>
      {receivedRequests.length === 0 ? (
        <Text style={styles.noRequestsText}>You haven't received any swap requests.</Text>
      ) : (
        <FlatList
          data={receivedRequests}
          renderItem={renderSwapItem}
          keyExtractor={(item) => `received-${item.id}`}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  swapItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  swapHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shiftDetail: {
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
  },
  shiftTitle: {
    fontWeight: 'bold',
    fontSize: 14,
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

export default SwapStatusScreen;