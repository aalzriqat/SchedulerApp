import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, RefreshControl as RNRefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchMyPreferences,
  submitMyPreferences,
  clearAllPreferenceErrors,
  EmployeePreferenceData, // This is for submission
  EmployeePreferenceRecord // This is the fetched record
} from '../../store/slices/preferenceSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const PreferenceScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    myPreferences,
    isLoadingMyPreferences,
    isSubmittingMyPreferences,
    myPreferencesError,
    submitMyPreferencesError
  } = useSelector((state: RootState) => state.preferences);

  const [preferredDaysOff, setPreferredDaysOff] = useState('');
  const [preferredShiftTimes, setPreferredShiftTimes] = useState('');
  const [unavailability, setUnavailability] = useState('');
  const [notes, setNotes] = useState('');

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedInputBg = useThemeColor({}, 'inputBackground');
  const themedInputBorder = useThemeColor({}, 'inputBorder');
  const themedInputText = useThemeColor({}, 'inputText');
  const themedInputPlaceholder = useThemeColor({}, 'inputPlaceholder');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedButtonDisabledBg = useThemeColor({}, 'buttonDisabledBackground'); // Added
  const themedButtonDisabledText = useThemeColor({}, 'buttonDisabledText'); // Added
  const currentUser = useSelector((state: RootState) => state.auth.user); // Get currentUser


  useEffect(() => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMyPreferences(currentUser.id));
    }
    return () => {
      dispatch(clearAllPreferenceErrors());
    }
  }, [dispatch, currentUser?.id]);

  useEffect(() => {
    if (myPreferences) {
      setPreferredDaysOff(myPreferences.preferredDaysOff || '');
      setPreferredShiftTimes(myPreferences.preferredShiftTimes || '');
      setUnavailability(myPreferences.unavailability || '');
      setNotes(myPreferences.notes || '');
    } else { // If no preferences fetched (e.g., new user), clear fields
      setPreferredDaysOff('');
      setPreferredShiftTimes('');
      setUnavailability('');
      setNotes('');
    }
  }, [myPreferences]);

  useEffect(() => {
    if (myPreferencesError) {
      Alert.alert('Error Fetching Preferences', myPreferencesError);
      dispatch(clearAllPreferenceErrors());
    }
    if (submitMyPreferencesError) {
      Alert.alert('Error Submitting Preferences', submitMyPreferencesError);
      dispatch(clearAllPreferenceErrors());
    }
  }, [myPreferencesError, submitMyPreferencesError, dispatch]);

  const handleSubmitPreferences = () => {
    if (!preferredDaysOff && !preferredShiftTimes && !unavailability && !notes) {
      Alert.alert('No Preferences Entered', 'Please enter at least one preference or note.');
      return;
    }
    const preferencesToSubmit: EmployeePreferenceData = {
      preferredDaysOff,
      preferredShiftTimes,
      unavailability,
      notes,
    };
    dispatch(submitMyPreferences(preferencesToSubmit))
      .unwrap()
      .then(() => {
        Alert.alert('Preferences Submitted', 'Your preferences have been successfully updated.');
      })
      .catch((err) => {
        // Error is already handled by the useEffect above
      });
  };
  
  const onRefresh = () => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMyPreferences(currentUser.id));
    }
  };

  if (isLoadingMyPreferences && !myPreferences) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading your preferences...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{backgroundColor: themedBackgroundColor}}
      refreshControl={<RNRefreshControl refreshing={isLoadingMyPreferences} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg} />}
    >
      <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText type="title" style={styles.title}>My Schedule Preferences</ThemedText>

        <ThemedText style={styles.label}>Preferred Days Off:</ThemedText>
        <TextInput
          style={[styles.input, {backgroundColor: themedInputBg, borderColor: themedInputBorder, color: themedInputText}]}
          placeholder="e.g., Mondays, Weekends"
          value={preferredDaysOff}
          onChangeText={setPreferredDaysOff}
          placeholderTextColor={themedInputPlaceholder}
        />

        <ThemedText style={styles.label}>Preferred Shift Times:</ThemedText>
        <TextInput
          style={[styles.input, {backgroundColor: themedInputBg, borderColor: themedInputBorder, color: themedInputText}]}
          placeholder="e.g., Mornings (08:00-16:00), No nights"
          value={preferredShiftTimes}
          onChangeText={setPreferredShiftTimes}
          placeholderTextColor={themedInputPlaceholder}
        />

        <ThemedText style={styles.label}>Unavailability:</ThemedText>
        <TextInput
          style={[styles.input, {backgroundColor: themedInputBg, borderColor: themedInputBorder, color: themedInputText}]}
          placeholder="e.g., Wednesdays after 17:00, Specific dates"
          value={unavailability}
          onChangeText={setUnavailability}
          multiline
          placeholderTextColor={themedInputPlaceholder}
        />

        <ThemedText style={styles.label}>Additional Notes:</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, {backgroundColor: themedInputBg, borderColor: themedInputBorder, color: themedInputText}]}
          placeholder="Any other requests or comments"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          placeholderTextColor={themedInputPlaceholder}
        />

        <TouchableOpacity
          style={[styles.button, {backgroundColor: isSubmittingMyPreferences ? themedButtonDisabledBg : themedPrimaryButtonBg}]}
          onPress={handleSubmitPreferences}
          disabled={isSubmittingMyPreferences}
        >
          <Text style={[styles.buttonText, {color: isSubmittingMyPreferences ? themedButtonDisabledText : themedPrimaryButtonText}]}>
            {isSubmittingMyPreferences ? 'Submitting...' : 'Submit Preferences'}
          </Text>
        </TouchableOpacity>
        {(myPreferencesError || submitMyPreferencesError) &&
            <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>
                Error: {myPreferencesError || submitMyPreferencesError}
            </ThemedText>
        }
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: { // bg applied inline
    flex: 1,
    padding: 20,
  },
  centered: { // bg applied inline
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { // color from ThemedText
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: { // color from ThemedText
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: { // bg, borderColor, color, placeholderTextColor applied inline
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
  button: { // bg applied inline
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { // color applied inline
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: { // color applied inline
    textAlign: 'center',
    marginTop: 10,
  }
});

export default PreferenceScreen;