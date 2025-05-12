import React from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux'; // Import useSelector
import { RootState } from '@/src/store/store'; // Assuming RootState is exported from your store
import { EmployeePreferenceRecord } from '@/src/api/apiService'; // Corrected: Import from apiService, and use EmployeePreferenceRecord

export default function ViewPreferencesScreen() {
  // Select preferences from Redux store
  // Assuming your preferenceSlice stores the current user's preference under a specific key, e.g., 'currentUserPreference'
  // Or if it's an array of preferences, you might need to find the relevant one.
  // For this example, let's assume it's a single object or null.
  const preferences = useSelector((state: RootState) => state.preferences.currentUserPreference as EmployeePreferenceRecord | null);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">View Schedule Preferences</ThemedText>
      {preferences ? (
        <View style={styles.preferenceDetails}>
          <ThemedText style={styles.detailItem}>
            <ThemedText style={styles.label}>Preferred Week: </ThemedText>
            {/* Assuming 'notes' contains the week, or you adjust your state to store week directly */}
            {preferences.notes?.includes('Preferred week:') ? preferences.notes.split('Preferred week:')[1].split('.')[0].trim() : 'Not Set'}
          </ThemedText>
          <ThemedText style={styles.detailItem}><ThemedText style={styles.label}>Preferred Shift: </ThemedText>{preferences.preferredShift || 'Not Set'}</ThemedText>
          <ThemedText style={styles.detailItem}><ThemedText style={styles.label}>Preferred Off-Day 1: </ThemedText>{preferences.preferredDaysOff || 'Not Set'}</ThemedText>
          {/* Assuming second off-day is in notes, or adjust state */}
          <ThemedText style={styles.detailItem}>
            <ThemedText style={styles.label}>Preferred Off-Day 2: </ThemedText>
            {preferences.notes?.includes('Second preferred off-day:') ? preferences.notes.split('Second preferred off-day:')[1].split('.')[0].trim() : 'Not Set'}
          </ThemedText>
          <ThemedText style={styles.detailItem}><ThemedText style={styles.label}>Unavailability: </ThemedText>{preferences.unavailability || 'Not Set'}</ThemedText>
          <ThemedText style={styles.detailItem}><ThemedText style={styles.label}>Additional Notes: </ThemedText>{preferences.notes || 'None'}</ThemedText>
        </View>
      ) : (
        <ThemedText>No preferences submitted yet.</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  preferenceDetails: {
    marginTop: 20,
    alignSelf: 'stretch', // Make the view take available width
  },
  detailItem: {
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
  }
});