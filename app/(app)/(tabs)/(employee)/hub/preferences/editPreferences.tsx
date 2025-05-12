import React, { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet, Button, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useThemeColor } from '@/hooks/useThemeColor'; // For themed input styles
import { useDispatch, useSelector } from 'react-redux'; // Import useDispatch and useSelector
import { AppDispatch, RootState } from '@/src/store/store'; // Assuming AppDispatch and RootState are exported
import { submitMyPreferences } from '@/src/store/slices/preferenceSlice'; // Corrected action name
import { User } from '@/src/store/slices/authSlice'; // For current user type

export default function EditPreferencesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const authLoading = useSelector((state: RootState) => state.auth.isLoading); // Assuming an isLoading state in authSlice
  const currentUser = useSelector((state: RootState) => state.auth.user as User | null);
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [preferredShift, setPreferredShift] = useState<string>('');
  const [firstOffDay, setFirstOffDay] = useState<string>('');
  const [secondOffDay, setSecondOffDay] = useState<string>('');

  // Theme colors for inputs
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const inputBorderColor = useThemeColor({}, 'inputBorder');

  const weekNumbers = Array.from({ length: 52 }, (_, i) => (i + 1).toString());
  const shiftTimings = ['09:00-17:00', '10:00-18:00', '08:00-16:00', 'Night Shift', 'Flexible']; // Example timings
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleSubmit = () => {
    if (!selectedWeek || !preferredShift || !firstOffDay || !secondOffDay) {
      Alert.alert('Missing Information', 'Please fill in all preference fields.');
      return;
    }
    if (firstOffDay === secondOffDay) {
      Alert.alert('Invalid Selection', 'First and second off-days cannot be the same.');
      return;
    }
    if (!currentUser || !currentUser.id) { // Changed from _id to id
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    const preferenceData = {
      preferredDaysOff: firstOffDay, // Expected to be a single string
      preferredShift: preferredShift, // Changed key to match backend requirement
      unavailability: '', // Expected to be a string, using empty string as placeholder
      notes: `Preferred week: ${selectedWeek}. Second preferred off-day: ${secondOffDay}.`, // Include week and second off-day in notes
      user: currentUser.id, // Added user ID as required by backend
      week: parseInt(selectedWeek, 10), // Added week number as required by backend
    };

    // Dispatch action to submit/update preferences
    dispatch(submitMyPreferences(preferenceData)); // Corrected action dispatch
    Alert.alert('Preferences Submitted', 'Your schedule preferences have been saved locally.'); // Update message if API call is made
    // Optionally clear form or navigate away
  };

  if (authLoading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" />
        <ThemedText>Loading user data...</ThemedText>
      </ThemedView>
    );
  }

  if (!currentUser) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>User not authenticated. Please log in.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Edit Schedule Preferences</ThemedText>

        <ThemedText style={styles.label}>Preferred Week Number:</ThemedText>
        <ThemedView style={[styles.pickerContainer, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor }]}>
          <Picker
            selectedValue={selectedWeek}
            onValueChange={(itemValue) => setSelectedWeek(itemValue)}
            style={{ color: textColor, height: Platform.OS === 'ios' ? undefined : 50 }}
            itemStyle={{ color: textColor }}
            dropdownIconColor={textColor}
          >
            <Picker.Item label="Select Week..." value="" />
            {weekNumbers.map(week => <Picker.Item key={week} label={`Week ${week}`} value={week} />)}
          </Picker>
        </ThemedView>

        <ThemedText style={styles.label}>Preferred Shift Timing:</ThemedText>
        <ThemedView style={[styles.pickerContainer, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor }]}>
          <Picker selectedValue={preferredShift} onValueChange={itemValue => setPreferredShift(itemValue)} style={{ color: textColor, height: Platform.OS === 'ios' ? undefined : 50 }} itemStyle={{color: textColor}} dropdownIconColor={textColor}>
            <Picker.Item label="Select Shift..." value="" />
            {shiftTimings.map(shift => <Picker.Item key={shift} label={shift} value={shift} />)}
          </Picker>
        </ThemedView>

        <ThemedText style={styles.label}>Preferred First Off-Day:</ThemedText>
        <ThemedView style={[styles.pickerContainer, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor }]}>
          <Picker selectedValue={firstOffDay} onValueChange={itemValue => setFirstOffDay(itemValue)} style={{ color: textColor, height: Platform.OS === 'ios' ? undefined : 50 }} itemStyle={{color: textColor}} dropdownIconColor={textColor}>
            <Picker.Item label="Select First Off-Day..." value="" />
            {dayNames.map(day => <Picker.Item key={day} label={day} value={day} />)}
          </Picker>
        </ThemedView>

        <ThemedText style={styles.label}>Preferred Second Off-Day:</ThemedText>
        <ThemedView style={[styles.pickerContainer, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor }]}>
          <Picker selectedValue={secondOffDay} onValueChange={itemValue => setSecondOffDay(itemValue)} style={{ color: textColor, height: Platform.OS === 'ios' ? undefined : 50 }} itemStyle={{color: textColor}} dropdownIconColor={textColor}>
            <Picker.Item label="Select Second Off-Day..." value="" />
            {dayNames.filter(day => day !== firstOffDay).map(day => <Picker.Item key={day} label={day} value={day} />)}
          </Picker>
        </ThemedView>

        <Button title="Submit Preferences" onPress={handleSubmit} disabled={!currentUser} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', // Center content if it's less than scroll height
  },
  centerContent: { // Added for loading/error states
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    // color will be inherited from ThemedText
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
    justifyContent: 'center', // For Android to center picker text
    // height: 50, // Explicit height might be needed for Android consistency
  },
});