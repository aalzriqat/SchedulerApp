import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native'; // Removed View, Text
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { Picker } from '@react-native-picker/picker'; // Import Picker
import type { AppDispatch } from '../../store/store'; // Import AppDispatch type
import { ThemedView } from '@/components/ThemedView'; // Import ThemedView
import { ThemedText } from '@/components/ThemedText'; // Import ThemedText
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor hook
import {
  submitNewLeaveRequest, // Corrected import name
  // Assuming success/failure are handled within submitNewLeaveRequest or via status updates
  clearLeaveErrors, // Corrected import name
  LeaveRequest // This type is now correctly exported from leaveSlice
} from '../../store/slices/leaveSlice';
// import type { RootState } from '../../store/store';

const LeaveRequestScreen = () => {
  const dispatch = useDispatch<AppDispatch>(); // Use typed dispatch
  // const { isLoading, error } = useSelector((state: RootState) => state.leaves);
  const { isLoading, error } = useSelector((state: any) => state.leaves);

  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground'); // Assuming you have this defined in Colors.ts
  const inputBorderColor = useThemeColor({}, 'inputBorder'); // Assuming you have this defined in Colors.ts
  const placeholderTextColor = useThemeColor({}, 'tabIconDefault'); // Use a subtle color for placeholder
  const buttonBackgroundColor = useThemeColor({}, 'tint'); // Button background color
  // const buttonTextColor = useThemeColor({}, 'buttonText'); // Removed invalid theme color key
  const errorColor = useThemeColor({}, 'errorText'); // Assuming you have this defined

  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // State for Date Pickers
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Define leave type options
  const leaveTypeOptions = [
    { label: 'Select Leave Type...', value: '' },
    { label: 'Annual Leave', value: 'Annual Leave' },
    { label: 'Sick Leave', value: 'Sick Leave' },
    { label: 'Public Holiday', value: 'Public Holiday' },
    { label: 'Unpaid Leave', value: 'Unpaid Leave' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    if (error) {
      Alert.alert('Leave Request Error', error);
      dispatch(clearLeaveErrors()); // Corrected action name
    }
  }, [error, dispatch]);

  // Date formatting function
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date Picker onChange handlers
  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false); // Hide picker first
    if (selectedDate) {
      setStartDateObj(selectedDate);
      setStartDate(formatDate(selectedDate)); // Update string state
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false); // Hide picker first
    if (selectedDate) {
      setEndDateObj(selectedDate);
      setEndDate(formatDate(selectedDate)); // Update string state
    }
  };

  const handleSubmitLeaveRequest = () => {
    if (!leaveType || !startDate.trim() || !endDate.trim() || !reason.trim()) { // Check if leaveType is selected
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
    dispatch(submitNewLeaveRequest(newLeaveRequestData)); // Corrected action name

    // Simulate API call
    setTimeout(() => {
      try { // Added try block
        // Assuming success for now
        const submittedRequest: LeaveRequest = {
          ...newLeaveRequestData,
          _id: `mock_leave_${Date.now()}`, // Add mock _id
          user: 'mock_user_id', // Add mock user ID (replace with actual user ID if available)
          fromDate: startDate, // Should be string according to type definition
          toDate: [endDate], // Wrap in array to match type string[]
          status: 'pending' as 'pending',
          // submittedAt: new Date().toISOString() // Removed incorrect 'submittedAt' property
          createdAt: new Date().toISOString(), // Add createdAt
        };
        // dispatch(submitLeaveRequestSuccess(submittedRequest)); // Removed old action dispatch
        Alert.alert('Leave Request Submitted', 'Your leave request has been submitted for review.');
        // Clear form
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setReason('');
      } catch (e) { // Added catch block
        console.error("Error in submit simulation", e);
        // dispatch(submitLeaveRequestFailure("Simulated submission error.")); // Removed old action dispatch
      }
    }, 1000); // Closing parenthesis for setTimeout
  }; // Closing brace for handleSubmitLeaveRequest

  return (
    // Use ThemedView for ScrollView's container to handle background
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor }]}>
      {/* Use ThemedView for the main container */}
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Submit Leave Request</ThemedText>

        <ThemedText style={styles.label}>Leave Type:</ThemedText>
        {/* Wrap Picker in a View for styling */}
        <ThemedView style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, paddingHorizontal: 0, paddingVertical: 0 }]}>
          <Picker
            selectedValue={leaveType}
            onValueChange={(itemValue: string) => setLeaveType(itemValue)} // Explicitly type itemValue
            style={{ color: textColor, height: Platform.OS === 'ios' ? undefined : 50 }} // Basic styling, adjust as needed
            itemStyle={{ color: textColor }} // Style for iOS items
            dropdownIconColor={textColor} // Color for the dropdown arrow
          >
            {leaveTypeOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </ThemedView>

        <ThemedText style={styles.label}>Start Date:</ThemedText>
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, justifyContent: 'center' }]}>
          <ThemedText style={!startDate ? { color: placeholderTextColor, fontSize: 16 } : { color: textColor, fontSize: 16 }}>
            {startDate || 'YYYY-MM-DD'}
          </ThemedText>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onStartDateChange}
          />
        )}

        <ThemedText style={styles.label}>End Date:</ThemedText>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, justifyContent: 'center' }]}>
          <ThemedText style={!endDate ? { color: placeholderTextColor, fontSize: 16 } : { color: textColor, fontSize: 16 }}>
            {endDate || 'YYYY-MM-DD'}
          </ThemedText>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={endDateObj}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onEndDateChange}
            minimumDate={startDateObj} // Prevent selecting end date before start date
          />
        )}

        <ThemedText style={styles.label}>Reason:</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
          placeholder="Brief reason for leave"
          placeholderTextColor={placeholderTextColor}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: buttonBackgroundColor }]} onPress={handleSubmitLeaveRequest} disabled={isLoading}>
          {/* Use ThemedText for button text if needed, or style directly */}
          <ThemedText style={styles.buttonText}>{isLoading ? 'Submitting...' : 'Submit Request'}</ThemedText>
        </TouchableOpacity>
        {error && <ThemedText style={[styles.errorText, { color: errorColor }]}>Error: {error}</ThemedText>}
      </ThemedView>
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
    // backgroundColor removed, handled by ThemedView
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    // color removed, handled by ThemedText
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    // color removed, handled by ThemedText
  },
  input: {
    // backgroundColor removed, handled dynamically
    // borderColor removed, handled dynamically
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    // color removed, handled dynamically
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    // backgroundColor removed, handled dynamically
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white', // Reverted to hardcoded white for button text
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    // color removed, handled dynamically
    textAlign: 'center',
    marginTop: 10,
  }
});

export default LeaveRequestScreen;