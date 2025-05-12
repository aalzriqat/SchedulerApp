import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Button, Alert, Share, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllEmployeePreferencesAdmin, EmployeePreferenceRecord, clearAllPreferenceErrors } from '../../store/slices/preferenceSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as Clipboard from 'expo-clipboard'; // For copying to clipboard

const AdminViewPreferencesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allEmployeePreferences, isLoadingAllPreferences, allPreferencesError } = useSelector(
    (state: RootState) => state.preferences
  );

  useEffect(() => {
    dispatch(fetchAllEmployeePreferencesAdmin());
    return () => {
      dispatch(clearAllPreferenceErrors());
    }
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllEmployeePreferencesAdmin());
  };

  const convertToCSV = (data: EmployeePreferenceRecord[]) => {
    if (!data || data.length === 0) return '';
    const header = 'EmployeeID,EmployeeName,PreferredDaysOff,PreferredShiftTimes,Unavailability,Notes,LastUpdated\n';
    const rows = data.map(pref => {
      const empId = typeof pref.employee === 'object' ? pref.employee._id : pref.employee;
      const empName = typeof pref.employee === 'object' ? pref.employee.name || pref.employee.username : 'N/A';
      // Escape commas and newlines in string fields
      const escapeCSV = (str: string) => `"${(str || '').replace(/"/g, '""')}"`; 
      return [
        escapeCSV(empId),
        escapeCSV(empName),
        escapeCSV(pref.preferredDaysOff),
        escapeCSV(pref.preferredShiftTimes),
        escapeCSV(pref.unavailability),
        escapeCSV(pref.notes),
        escapeCSV(new Date(pref.lastUpdatedAt).toLocaleString())
      ].join(',');
    }).join('\n');
    return header + rows;
  };

  const handleExport = async () => {
    if (allEmployeePreferences.length === 0) {
      Alert.alert('No Data', 'There are no preferences to export.');
      return;
    }
    const csvData = convertToCSV(allEmployeePreferences);
    try {
      if (Platform.OS === 'web') {
        // Basic web download simulation
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "employee_preferences.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            await Clipboard.setStringAsync(csvData);
            Alert.alert('Copied to Clipboard', 'CSV data copied to clipboard. Paste it into a text file and save as .csv.');
        }
      } else {
        // Use Share API for mobile
        await Share.share({
          message: csvData,
          title: 'Employee Preferences CSV',
          // iOS specific:
          // subject: 'Employee Preferences Data', // For email
          // Android specific:
          // dialogTitle: 'Share Employee Preferences CSV' // For Android share dialog
        }, {
          // iOS specific:
          // excludedActivityTypes: [ 'com.apple.UIKit.activity.PostToTwitter' ]
          // Android specific:
          dialogTitle: 'Export Preferences as CSV'
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export or share the data.');
      // As a fallback, copy to clipboard
      await Clipboard.setStringAsync(csvData);
      Alert.alert('Copied to Clipboard', 'CSV data copied to clipboard as a fallback.');
    }
  };


  const renderPreferenceItem = ({ item }: { item: EmployeePreferenceRecord }) => (
    <ThemedView style={styles.itemContainer}>
      <ThemedText style={styles.employeeName}>
        Employee: {typeof item.employee === 'object' ? (item.employee.name || item.employee.username) : item.employee}
      </ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Preferred Days Off:</ThemedText> {item.preferredDaysOff || 'N/A'}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Preferred Shifts:</ThemedText> {item.preferredShiftTimes || 'N/A'}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Unavailability:</ThemedText> {item.unavailability || 'N/A'}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Notes:</ThemedText> {item.notes || 'N/A'}</ThemedText>
      <ThemedText style={styles.lastUpdated}>Last Updated: {new Date(item.lastUpdatedAt).toLocaleString()}</ThemedText>
    </ThemedView>
  );

  if (isLoadingAllPreferences && allEmployeePreferences.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText>Loading preferences...</ThemedText>
      </ThemedView>
    );
  }

  if (allPreferencesError) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Error: {allPreferencesError}</ThemedText>
        <Button title="Retry" onPress={onRefresh} color="#007bff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText type="title" style={styles.header}>All Employee Preferences</ThemedText>
        <Button title="Export as CSV" onPress={handleExport} disabled={isLoadingAllPreferences || allEmployeePreferences.length === 0} color="#007bff" />
      </View>
      {allEmployeePreferences.length === 0 && !isLoadingAllPreferences ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>No employee preferences found.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={allEmployeePreferences.slice().sort((a: EmployeePreferenceRecord, b: EmployeePreferenceRecord) =>
            (typeof a.employee === 'object' ? (a.employee.name || a.employee.username) : a.employee)
            .localeCompare(typeof b.employee === 'object' ? (b.employee.name || b.employee.username) : b.employee)
          )}
          renderItem={renderPreferenceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={isLoadingAllPreferences} onRefresh={onRefresh} colors={["#007bff"]} />
          }
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Consider theme
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemContainer: {
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0', // Consider theme
  },
  employeeName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  bold: { fontWeight: 'bold' },
  lastUpdated: {
    fontSize: 12,
    color: '#666', // Consider theme
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AdminViewPreferencesScreen;