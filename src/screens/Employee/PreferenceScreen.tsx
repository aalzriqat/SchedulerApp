import React, { useState, useEffect } from 'react'; // Added useEffect
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  submitPreferencesStart,
  // submitPreferencesSuccess, // Success will be handled by API response later
  // submitPreferencesFailure, // Failure will be handled by API response later
  fetchPreferencesStart, // To load existing preferences
  fetchPreferencesSuccess,
  fetchPreferencesFailure,
  clearPreferenceError,
  EmployeePreferences // Import type
} from '../../store/slices/preferenceSlice';
// import type { RootState } from '../../store/store';


const PreferenceScreen = () => {
  const dispatch = useDispatch();
  // const { isLoading, error, currentPreferences } = useSelector((state: RootState) => state.preferences);
  const { isLoading, error, currentPreferences } = useSelector((state: any) => state.preferences);


  const [preferredDaysOff, setPreferredDaysOff] = useState('');
  const [preferredShiftTimes, setPreferredShiftTimes] = useState(''); // e.g., "Mornings (8am-4pm)"
  const [unavailability, setUnavailability] = useState(''); // e.g., "Wednesdays after 5pm"
  const [notes, setNotes] = useState('');

  const handleSubmitPreferences = () => {
    if (!preferredDaysOff && !preferredShiftTimes && !unavailability && !notes) {
      Alert.alert('No Preferences Entered', 'Please enter at least one preference or note.');
      return;
    }
    const preferences = {
      preferredDaysOff,
      preferredShiftTimes,
      unavailability,
      notes,
    };
    console.log('Submitting preferences:', preferences);
    dispatch(submitPreferencesStart(preferences));
    // Simulate API call
    setTimeout(() => {
      // Assuming success for now
      // In a real app, API would respond, then dispatch success/failure
      dispatch(fetchPreferencesSuccess(preferences)); // Simulate fetch success with submitted data
      Alert.alert('Preferences Submitted', 'Your preferences have been recorded.');
    }, 1000);
  };

  useEffect(() => {
    // Simulate fetching existing preferences when the screen loads
    dispatch(fetchPreferencesStart());
    setTimeout(() => {
      // Simulate finding existing preferences (or null if none)
      const existingPrefs: EmployeePreferences | null = null; // or some mock EmployeePreferences object
      if (existingPrefs) {
        dispatch(fetchPreferencesSuccess(existingPrefs));
      } else {
        console.log('No existing preferences found (simulated). Dispatching fetchPreferencesSuccess(null).');
        dispatch(fetchPreferencesSuccess(null)); // Dispatch success with null payload
      }
    }, 500); // Shorter delay for initial fetch
  }, [dispatch]);

  useEffect(() => {
    // Load existing preferences into the form if they are fetched
    if (currentPreferences) {
      setPreferredDaysOff(currentPreferences.preferredDaysOff || '');
      setPreferredShiftTimes(currentPreferences.preferredShiftTimes || '');
      setUnavailability(currentPreferences.unavailability || '');
      setNotes(currentPreferences.notes || '');
    }
  }, [currentPreferences]);

  useEffect(() => {
    if (error) {
      Alert.alert('Preference Error', error);
      dispatch(clearPreferenceError());
    }
  }, [error, dispatch]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>My Schedule Preferences</Text>

        <Text style={styles.label}>Preferred Days Off:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Mondays, Weekends"
          value={preferredDaysOff}
          onChangeText={setPreferredDaysOff}
        />

        <Text style={styles.label}>Preferred Shift Times:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Mornings (08:00-16:00), No nights"
          value={preferredShiftTimes}
          onChangeText={setPreferredShiftTimes}
        />

        <Text style={styles.label}>Unavailability:</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Wednesdays after 17:00, Specific dates"
          value={unavailability}
          onChangeText={setUnavailability}
          multiline
        />

        <Text style={styles.label}>Additional Notes:</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any other requests or comments"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmitPreferences} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Submitting...' : 'Submit Preferences'}</Text>
        </TouchableOpacity>
        {/* Error display can be more sophisticated later */}
      </View>
    </ScrollView>
  );
};

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
    backgroundColor: '#007bff', // Primary blue
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

export default PreferenceScreen;