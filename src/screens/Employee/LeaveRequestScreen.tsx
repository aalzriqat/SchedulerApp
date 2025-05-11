import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native'; // Corrected TouchableOpacity
import { useDispatch, useSelector } from 'react-redux';
import {
  submitLeaveRequestStart,
  submitLeaveRequestSuccess,
  submitLeaveRequestFailure,
  clearLeaveError,
  LeaveRequest // This type is now correctly exported from leaveSlice
} from '../../store/slices/leaveSlice';
// import type { RootState } from '../../store/store';

const LeaveRequestScreen = () => {
  const dispatch = useDispatch();
  // const { isLoading, error } = useSelector((state: RootState) => state.leaves);
  const { isLoading, error } = useSelector((state: any) => state.leaves);

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (error) {
      Alert.alert('Leave Request Error', error);
      dispatch(clearLeaveError());
    }
  }, [error, dispatch]);

  const handleSubmitLeaveRequest = () => {
    if (!leaveType.trim() || !startDate.trim() || !endDate.trim() || !reason.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields for the leave request.');
      return;
    }
    // Basic date validation could be added here
    const newLeaveRequestData = {
      leaveType,
      startDate,
      endDate,
      reason,
    };
    console.log('Submitting leave request:', newLeaveRequestData);
    dispatch(submitLeaveRequestStart(newLeaveRequestData));
    
    // Simulate API call
    setTimeout(() => {
      try { // Added try block
        // Assuming success for now
        const submittedRequest: LeaveRequest = { 
          ...newLeaveRequestData, 
          id: `leave${Math.random().toString(36).substr(2, 9)}`, // Generate mock ID
          status: 'pending' as 'pending', 
          submittedAt: new Date().toISOString() 
        };
        dispatch(submitLeaveRequestSuccess(submittedRequest));
        Alert.alert('Leave Request Submitted', 'Your leave request has been submitted for review.');
        // Clear form
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
      } catch (e) { // Added catch block
        console.error("Error in submit simulation", e);
        dispatch(submitLeaveRequestFailure("Simulated submission error."));
      }
    }, 1000); // Closing parenthesis for setTimeout
  }; // Closing brace for handleSubmitLeaveRequest

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Submit Leave Request</Text>

        <Text style={styles.label}>Leave Type:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Vacation, Sick Leave, Personal"
          value={leaveType}
          onChangeText={setLeaveType}
        />

        <Text style={styles.label}>Start Date:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
        />

        <Text style={styles.label}>End Date:</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
        />

        <Text style={styles.label}>Reason:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief reason for leave"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmitLeaveRequest} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </View>
    </ScrollView>
  );
}; // Closing brace for LeaveRequestScreen component

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});

export default LeaveRequestScreen;