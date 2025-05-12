import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, RefreshControl as RNRefreshControl, Button, TouchableOpacity, Alert } from 'react-native'; // Added Alert
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchMyLeaveRequests, cancelMyLeaveRequest, LeaveRequest, clearLeaveErrors } from '../../store/slices/leaveSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';

const LeaveStatusScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaveRequests, isLoading, error, isUpdating, updateError } = useSelector((state: RootState) => state.leaves);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedDangerButtonBg = useThemeColor({}, 'statusRejectedBackground'); // For cancel button
  const themedDangerButtonText = useThemeColor({}, 'statusRejectedText');
  
  const statusColors = { // For displaying status text
    pending: useThemeColor({}, 'statusPendingText'),
    approved: useThemeColor({}, 'statusApprovedText'),
    rejected: useThemeColor({}, 'statusRejectedText'),
    cancelled: useThemeColor({}, 'statusCancelledText'),
  };


  useEffect(() => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMyLeaveRequests(currentUser.id));
    }
    return () => {
      dispatch(clearLeaveErrors());
    }
  }, [dispatch, currentUser?.id]);
  
  useEffect(() => {
    if (error || updateError) {
      Alert.alert('Leave Request Error', error || updateError || 'An unknown error occurred.');
      dispatch(clearLeaveErrors());
    }
  }, [error, updateError, dispatch]);


  const onRefresh = () => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMyLeaveRequests(currentUser.id));
    }
  };

  const handleCancelRequest = (leaveId: string) => {
    Alert.alert(
      "Cancel Leave Request",
      "Are you sure you want to cancel this leave request?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", onPress: () => dispatch(cancelMyLeaveRequest(leaveId)), style: 'destructive' }
      ]
    );
  };

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => (
    <ThemedView style={[styles.leaveItem, {backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor}]}>
      <ThemedText style={styles.leaveHeader}>Type: {item.leaveType}
        (<ThemedText style={{color: statusColors[item.status] || themedTextColor, fontWeight: 'bold'}}>{item.status.toUpperCase()}</ThemedText>)
      </ThemedText>
      {/* Backend provides fromDate and toDate (which is a duration string array) */}
      <ThemedText>Date: {new Date(item.fromDate).toLocaleDateString()}</ThemedText>
      <ThemedText>Duration: {Array.isArray(item.toDate) ? item.toDate.join(', ') : item.toDate}</ThemedText>
      <ThemedText>Reason: {item.reason}</ThemedText>
      <ThemedText style={{color: themedSubtleTextColor, fontSize: 12, marginTop: 4}}>Created: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
      {item.adminNotes && <ThemedText style={{marginTop: 4}}><ThemedText style={styles.bold}>Admin Notes:</ThemedText> {item.adminNotes}</ThemedText>}
      {item.status === 'pending' && (
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: themedDangerButtonBg}]}
          onPress={() => handleCancelRequest(item._id)}
          disabled={isUpdating}
        >
          <FontAwesome name="times-circle" size={14} color={themedDangerButtonText} />
          <Text style={[styles.actionButtonText, {color: themedDangerButtonText}]}> Cancel Request</Text>
        </TouchableOpacity>
      )}
      {isUpdating && <ActivityIndicator size="small" color={themedPrimaryButtonBg} style={{marginTop: 5}}/>}
    </ThemedView>
  );

  if (isLoading && leaveRequests.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading leave requests...</ThemedText>
      </ThemedView>
    );
  }
  
  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themedBackgroundColor}]}
      refreshControl={<RNRefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg}/>}
    >
      <ThemedText type="title" style={styles.title}>My Leave Requests</ThemedText>
      {(leaveRequests.length === 0 && !isLoading && !error) ? (
        <ThemedView style={[styles.centered, {paddingVertical: 30, backgroundColor: themedBackgroundColor}]}>
            <ThemedText style={{color: themedSubtleTextColor}}>You haven't submitted any leave requests.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={leaveRequests.slice().sort((a: LeaveRequest, b: LeaveRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} // Use createdAt for sorting
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
        />
      )}
      {error && !isLoading && (
         <ThemedView style={[styles.centered, {paddingVertical: 30, backgroundColor: themedBackgroundColor}]}>
            <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {error}</ThemedText>
            <Button title="Retry" onPress={onRefresh} color={themedPrimaryButtonBg} />
        </ThemedView>
      )}
    </ScrollView>
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
  },
  title: { // color from ThemedText
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  leaveItem: { // bg and borderColor applied inline
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  leaveHeader: { // color from ThemedText
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noRequestsText: { // color applied inline
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: { // color applied inline
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  actionButton: { // bg applied inline
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: { // color applied inline
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 14,
  },
  bold: { fontWeight: 'bold' }
});

export default LeaveStatusScreen;