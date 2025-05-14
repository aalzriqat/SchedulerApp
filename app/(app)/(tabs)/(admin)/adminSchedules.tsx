import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Alert, TextInput, ScrollView, Share, Platform, TouchableOpacity, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../src/store/store'; // Adjusted path
import {
  fetchAllSchedulesForAdmin,
  uploadScheduleByAdmin,
  Shift, // Shift is from employeeScheduleSlice
  clearEmployeeScheduleErrors,
  resetUploadStatusAdmin
} from '../../../../src/store/slices/employeeScheduleSlice'; // Adjusted path
import { PopulatedScheduleEntry } from '../../../../src/api/apiService'; // Changed from AdminScheduleView to PopulatedScheduleEntry
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as Clipboard from 'expo-clipboard';
import { FontAwesome } from '@expo/vector-icons';

const AdminSchedulesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    allEmployeeSchedules,
    isLoadingAllAdmin,
    errorAllAdmin,
    isUploadingAdmin,
    errorUploadingAdmin,
    uploadSuccessMessageAdmin
  } = useSelector((state: RootState) => state.employeeSchedule);

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [scheduleDataInput, setScheduleDataInput] = useState('');

  useEffect(() => {
    dispatch(fetchAllSchedulesForAdmin());
    return () => {
      dispatch(clearEmployeeScheduleErrors());
    }
  }, [dispatch]);

  useEffect(() => {
    if (uploadSuccessMessageAdmin) {
      Alert.alert('Upload Success', uploadSuccessMessageAdmin);
      setUploadModalVisible(false);
      setScheduleDataInput('');
      dispatch(resetUploadStatusAdmin());
      dispatch(fetchAllSchedulesForAdmin()); // Refresh data
    }
    if (errorUploadingAdmin) {
      Alert.alert('Upload Error', errorUploadingAdmin);
      dispatch(resetUploadStatusAdmin());
    }
  }, [uploadSuccessMessageAdmin, errorUploadingAdmin, dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllSchedulesForAdmin());
  };

  const handleUploadSchedule = () => {
    if (!scheduleDataInput.trim()) {
      Alert.alert('Input Error', 'Schedule data cannot be empty.');
      return;
    }
    // Here, scheduleDataInput could be CSV text or JSON string
    // The backend and apiService.uploadScheduleDataAdmin should be set up to handle this format
    dispatch(uploadScheduleByAdmin(scheduleDataInput));
  };

  const convertSchedulesToCSV = (data: PopulatedScheduleEntry[]) => {
    if (!data || data.length === 0) return '';
    const header = 'EmployeeID,EmployeeUsername,ScheduleID,Week,WorkingHours,OffDays,IsOpenForSwap,Skill,MarketPlace,CreatedAt\n';
    let rows = '';
    data.forEach(schedule => {
      const escapeCSV = (val: string | number | boolean | string[] | undefined) => {
        if (val === undefined || val === null) return '""';
        if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      };
      rows += [
        escapeCSV(schedule.user?._id),
        escapeCSV(schedule.user?.username),
        escapeCSV(schedule._id),
        escapeCSV(schedule.week),
        escapeCSV(schedule.workingHours),
        escapeCSV(schedule.offDays),
        escapeCSV(schedule.isOpenForSwap),
        escapeCSV(schedule.skill),
        escapeCSV(schedule.marketPlace),
        escapeCSV(new Date(schedule.createdAt).toISOString())
      ].join(',') + '\n';
    });
    return header + rows;
  };

  const handleExportSchedules = async () => {
    if (allEmployeeSchedules.length === 0) {
      Alert.alert('No Data', 'There are no schedules to export.');
      return;
    }
    const csvData = convertSchedulesToCSV(allEmployeeSchedules);
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "all_employee_schedules.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            await Clipboard.setStringAsync(csvData);
            Alert.alert('Copied to Clipboard', 'CSV data copied. Paste & save as .csv.');
        }
      } else {
        await Share.share({ message: csvData, title: 'All Employee Schedules CSV' }, { dialogTitle: 'Export Schedules as CSV' });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export. Copied to clipboard as fallback.');
      await Clipboard.setStringAsync(csvData);
    }
  };

  const renderShiftItem = (shift: Shift) => (
    <View key={shift._id} style={styles.shiftItem}>
      <ThemedText>Week: {shift.week}</ThemedText>
      <ThemedText>Working Hours: {shift.workingHours}</ThemedText>
      <ThemedText>Off Days: {shift.offDays.join(', ')}</ThemedText>
      <ThemedText>Is Open For Swap: {shift.isOpenForSwap ? 'Yes' : 'No'}</ThemedText>
      <ThemedText style={styles.smallText}>Created: {new Date(shift.createdAt).toLocaleDateString()}</ThemedText>
      {/* Old fields commented out:
      <ThemedText>Date: {new Date(shift.date).toLocaleDateString()}</ThemedText>
      <ThemedText>Time: {shift.startTime} - {shift.endTime}</ThemedText>
      {shift.role && <ThemedText>Role: {shift.role}</ThemedText>}
      {shift.location && <ThemedText>Location: {shift.location}</ThemedText>}
      {shift.notes && <ThemedText>Notes: {shift.notes}</ThemedText>}
      */}
    </View>
  );

  // renderEmployeeScheduleItem now processes a single PopulatedScheduleEntry
  const renderEmployeeScheduleItem = ({ item }: { item: PopulatedScheduleEntry }) => (
    <ThemedView style={styles.employeeScheduleContainer}>
      <ThemedText style={styles.employeeName}>
        {item.user ? `${item.user.name || item.user.username || 'Unnamed User'} (ID: ${item.user._id})` : 'Unknown Employee'}
      </ThemedText>
      {/* Display shift details directly from 'item' as it's a single schedule entry */}
      <View style={styles.shiftItem}>
        <ThemedText>Week: {item.week}</ThemedText>
        <ThemedText>Working Hours: {item.workingHours}</ThemedText>
        <ThemedText>Off Days: {Array.isArray(item.offDays) ? item.offDays.join(', ') : item.offDays}</ThemedText>
        <ThemedText>Is Open For Swap: {item.isOpenForSwap ? 'Yes' : 'No'}</ThemedText>
        {item.skill && <ThemedText>Skill: {item.skill}</ThemedText>}
        {item.marketPlace && <ThemedText>Market Place: {item.marketPlace}</ThemedText>}
        <ThemedText style={styles.smallText}>Created: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
        <ThemedText style={styles.smallText}>Schedule ID: {item._id}</ThemedText>
      </View>
    </ThemedView>
  );

  if (isLoadingAllAdmin && allEmployeeSchedules.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText>Loading all schedules...</ThemedText>
      </ThemedView>
    );
  }

  if (errorAllAdmin) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Error: {errorAllAdmin}</ThemedText>
        <Button title="Retry" onPress={onRefresh} color="#007bff" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.topBar}>
        <ThemedText type="title" style={styles.mainHeader}>All Employee Schedules</ThemedText>
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity style={[styles.topButton, styles.uploadButton]} onPress={() => setUploadModalVisible(true)}>
            <FontAwesome name="upload" size={18} color="white" />
            <Text style={styles.topButtonText}> Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topButton, styles.exportButton]} onPress={handleExportSchedules} disabled={isLoadingAllAdmin || allEmployeeSchedules.length === 0}>
            <FontAwesome name="share-square-o" size={18} color="white" />
            <Text style={styles.topButtonText}> Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {allEmployeeSchedules.length === 0 && !isLoadingAllAdmin ? (
        <ThemedView style={styles.centerContent}>
          <ThemedText>No schedules found for any employee.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={allEmployeeSchedules.slice().sort((a: PopulatedScheduleEntry, b: PopulatedScheduleEntry) =>
            (a.user?.name || a.user?.username || '').localeCompare(b.user?.name || b.user?.username || '')
          )}
          renderItem={renderEmployeeScheduleItem}
          keyExtractor={(item) => item._id || Math.random().toString()}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={ // RefreshControl needs to be imported from react-native
            <RNRefreshControl refreshing={isLoadingAllAdmin} onRefresh={onRefresh} colors={["#007bff"]} />
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={uploadModalVisible}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.modalOverlay}>
            {/* Wrap inner content to prevent touch from propagating if needed, or ensure modalView itself doesn't handle touch */}
            <TouchableWithoutFeedback accessible={false}>
              <ThemedView style={styles.modalView}>
                <ThemedText style={styles.modalTitle}>Upload Schedule Data</ThemedText>
            <ThemedText style={styles.modalInfo}>
              Paste schedule data below (e.g., CSV or JSON format as expected by the backend).
              This is a simplified upload for Expo Go.
            </ThemedText>
            <TextInput
              style={styles.uploadInput}
              value={scheduleDataInput}
              onChangeText={setScheduleDataInput}
              placeholder="Paste schedule data here..."
              multiline
              numberOfLines={10}
              placeholderTextColor="#999"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" onPress={() => setUploadModalVisible(false)} color="#aaa" />
              <Button title="Upload Data" onPress={handleUploadSchedule} disabled={isUploadingAdmin} color="#007bff" />
            </View>
                {isUploadingAdmin && <ActivityIndicator size="large" color="#007bff" style={{marginTop: 15}} />}
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </ThemedView>
  );
};

// Import RefreshControl as RNRefreshControl to avoid naming conflict if any
import { RefreshControl as RNRefreshControl } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBar: { paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  mainHeader: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  topButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  topButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  uploadButton: { backgroundColor: '#5cb85c' /* Green */ },
  exportButton: { backgroundColor: '#337ab7' /* Blue */ },
  topButtonText: { color: 'white', fontWeight: 'bold', marginLeft: 5 },
  listContentContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  employeeScheduleContainer: { padding: 15, marginVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  employeeName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' /* Consider theme */ },
  shiftItem: { marginLeft: 10, marginBottom: 8, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: '#007bff' /* Consider theme */ },
  italicText: { fontStyle: 'italic', color: '#666' /* Consider theme */ },
  smallText: { fontSize: 12, color: '#888' /* Consider theme */, marginTop: 4 },
  errorText: { color: 'red', fontSize: 16, marginBottom: 10, textAlign: 'center' },
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { margin: 20, borderRadius: 12, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInfo: { fontSize: 14, color: '#555', marginBottom: 15, textAlign: 'center' },
  uploadInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 150, textAlignVertical: 'top', marginBottom: 20, fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 },
});

export default AdminSchedulesScreen;