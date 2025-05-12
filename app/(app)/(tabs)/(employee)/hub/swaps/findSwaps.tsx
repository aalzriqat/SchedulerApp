import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, RefreshControl as RNRefreshControl, Button, Modal, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/src/store/store'; // Adjusted path for store
import { BackendShift } from '@/src/api/apiService'; // Adjusted path for apiService
import {
  fetchUserSchedule,
  clearEmployeeScheduleErrors,
  fetchFilteredAvailableShifts, 
} from '@/src/store/slices/employeeScheduleSlice'; // Adjusted path for slices
import { createNewSwapRequest, CreateSwapRequestPayload } from '@/src/store/slices/swapSlice'; // Adjusted path for slices
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { User } from '@/src/store/slices/authSlice'; // Adjusted path for slices
import { useRouter } from 'expo-router';

// Note: A dedicated backend endpoint GET /schedules/available-for-swap-filtered?week=X&excludeUserId=Y is implemented.

const FindSwapsScreen = () => { // Renamed component
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user as User | null);
  const {
    shifts: currentUserSchedule,
    isLoading: isLoadingCurrentUserSchedule,
    error: currentUserScheduleError,
    filteredSwappableShifts, 
    isLoadingFilteredSwappable, 
    errorFilteredSwappable,
  } = useSelector((state: RootState) => state.employeeSchedule);

  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('');
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTargetShift, setSelectedTargetShift] = useState<BackendShift | null>(null);
  const [selectedOwnShiftId, setSelectedOwnShiftId] = useState<string | null>(null);
  const [swapMessage, setSwapMessage] = useState('');
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);

  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedSelectedShiftBg = useThemeColor({}, 'tint');

  useEffect(() => {
    console.log("[FindSwapsScreen] Current User:", currentUser); // Updated log
    if (currentUser?.id) {
      dispatch(fetchUserSchedule(currentUser.id)); 
    }
    return () => {
      dispatch(clearEmployeeScheduleErrors()); 
    }
  }, [dispatch, currentUser?.id]);

  const handleFindShifts = () => { 
    if (!selectedWeekFilter || !currentUser?.id) {
      Alert.alert("Missing Information", "Please enter a week number.");
      return;
    }
    const week = parseInt(selectedWeekFilter, 10);
    if (isNaN(week) || week < 1 || week > 52) { 
        Alert.alert("Invalid Week", "Please enter a valid week number (1-52).");
        return;
    }
    
    console.log(`[FindSwapsScreen] Dispatching fetchFilteredAvailableShifts for week ${week}, excluding user ${currentUser.id}.`); // Updated log
    dispatch(fetchFilteredAvailableShifts({ week, excludeUserId: currentUser.id }));
  };

  const handleOpenSwapModal = (targetShift: BackendShift) => {
    if (!currentUserSchedule || !currentUser) {
      Alert.alert("Error", "Your schedule is not loaded yet. Please try again shortly.");
      return;
    }
    const ownShiftToOffer = currentUserSchedule.find(
      (s: BackendShift) => s.week === targetShift.week && s.isOpenForSwap
    );
    if (!ownShiftToOffer) {
      Alert.alert(
        "No Compatible Shift",
        `You do not have a shift open for swap in Week ${targetShift.week} to offer in exchange.`
      );
      return;
    }
    setSelectedTargetShift(targetShift);
    setSelectedOwnShiftId(ownShiftToOffer._id); 
    setSwapMessage(''); 
    setIsModalVisible(true);
  };

  const handleConfirmSwapRequest = async () => {
    if (!selectedTargetShift || !selectedOwnShiftId || !currentUser?.id) {
      Alert.alert("Error", "Missing information to create swap request.");
      return;
    }
    if (!selectedTargetShift._id) {
        Alert.alert("Error", "Target shift ID is missing.");
        return;
    }
    const payload: CreateSwapRequestPayload = {
      offeredShiftId: selectedOwnShiftId, 
      requestedShiftId: selectedTargetShift._id,
      notes: swapMessage,
    };
    setIsSubmittingSwap(true);
    try {
      await dispatch(createNewSwapRequest(payload)).unwrap();
      Alert.alert("Success", "Swap request submitted!");
      setIsModalVisible(false);
      handleFindShifts(); 
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit swap request.");
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  const getEmployeeName = (employee: any): string => {
    if (!employee) return 'N/A';
    if (typeof employee === 'string') return `User ID: ${employee}`; 
    return employee.name || employee.username || 'Unknown';
  };

  const renderItem = ({ item }: { item: BackendShift }) => {
    const isSelected = selectedTargetShift?._id === item._id;
    return (
      <TouchableOpacity onPress={() => setSelectedTargetShift(item)}>
        <ThemedView 
          style={[
            styles.shiftItem, 
            {backgroundColor: isSelected ? themedSelectedShiftBg : themedCardBackgroundColor, borderColor: themedBorderColor},
            isSelected && styles.selectedShiftItem 
          ]}
        >
          <ThemedText style={[styles.shiftDetailText, isSelected && {color: themedPrimaryButtonText}]}><ThemedText style={[styles.bold, isSelected && {color: themedPrimaryButtonText}]}>Owner:</ThemedText> {getEmployeeName(item.user)}</ThemedText>
          <ThemedText style={[styles.shiftDetailText, isSelected && {color: themedPrimaryButtonText}]}><ThemedText style={[styles.bold, isSelected && {color: themedPrimaryButtonText}]}>Week:</ThemedText> {item.week}</ThemedText>
          <ThemedText style={[styles.shiftDetailText, isSelected && {color: themedPrimaryButtonText}]}><ThemedText style={[styles.bold, isSelected && {color: themedPrimaryButtonText}]}>Hours:</ThemedText> {item.workingHours}</ThemedText>
          <ThemedText style={[styles.shiftDetailText, isSelected && {color: themedPrimaryButtonText}]}><ThemedText style={[styles.bold, isSelected && {color: themedPrimaryButtonText}]}>Off Days:</ThemedText> {item.offDays.join(', ')}</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (isLoadingCurrentUserSchedule && (!currentUserSchedule || currentUserSchedule.length === 0)) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading your schedule...</ThemedText>
      </ThemedView>
    );
  }
  
  if (currentUserScheduleError && !isLoadingCurrentUserSchedule) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error loading your schedule: {currentUserScheduleError}</ThemedText>
        <Button title="Retry" onPress={() => {
          if (currentUser?.id) dispatch(fetchUserSchedule(currentUser.id));
        }} color={themedPrimaryButtonBg} />
      </ThemedView>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText type="title" style={styles.title}>Find Available Swaps</ThemedText>
        
        <View style={{flex: 1}}>
          <View style={styles.filterContainer}>
            <TextInput
          style={[styles.weekInput, {borderColor: themedBorderColor, color: themedTextColor, backgroundColor: themedCardBackgroundColor}]}
          placeholder="Enter Week Number (1-52)"
          placeholderTextColor={themedTextColor}
          keyboardType="number-pad"
          value={selectedWeekFilter}
          onChangeText={setSelectedWeekFilter}
        />
        <TouchableOpacity 
            style={[styles.findButton, {backgroundColor: themedPrimaryButtonBg}]} 
            onPress={handleFindShifts}
            disabled={isLoadingFilteredSwappable} 
        >
          {isLoadingFilteredSwappable ? 
            <ActivityIndicator color={themedPrimaryButtonText} /> : 
            <ThemedText style={[styles.findButtonText, {color: themedPrimaryButtonText}]}>Find Shifts</ThemedText>
          }
        </TouchableOpacity>
      </View>

      {isLoadingFilteredSwappable && (
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} style={{marginTop: 20}}/>
      )}

      {errorFilteredSwappable && !isLoadingFilteredSwappable && (
         <ThemedView style={[styles.centerContent, {paddingVertical: 20}]}>
            <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error finding shifts: {errorFilteredSwappable}</ThemedText>
         </ThemedView>
      )}
      
      {!isLoadingFilteredSwappable && !errorFilteredSwappable && filteredSwappableShifts && filteredSwappableShifts.length === 0 && selectedWeekFilter !== '' && (
         <ThemedView style={[styles.centerContent, {paddingVertical: 20}]}>
            <ThemedText>No shifts found for Week {selectedWeekFilter} open for swap.</ThemedText>
         </ThemedView>
      )}
      
      {!isLoadingFilteredSwappable && !errorFilteredSwappable && filteredSwappableShifts && filteredSwappableShifts.length > 0 && (
        <FlatList
          data={filteredSwappableShifts} 
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          style={styles.list}
          refreshControl={
              <RNRefreshControl 
                refreshing={isLoadingFilteredSwappable} 
                onRefresh={handleFindShifts} 
                colors={[themedPrimaryButtonBg]} 
                tintColor={themedPrimaryButtonBg}
              />
          }
        />
      )}
      
      {selectedWeekFilter === '' && !isLoadingFilteredSwappable && !errorFilteredSwappable && (!filteredSwappableShifts || filteredSwappableShifts.length === 0) && (
        <ThemedView style={[styles.centerContent, {paddingVertical: 20}]}>
            <ThemedText>Please enter a week number to find available shifts.</ThemedText>
            </ThemedView>
          )}
        </View>

        {selectedTargetShift && isModalVisible && (
          <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={[styles.modalView, {backgroundColor: themedCardBackgroundColor}]}>
              <ThemedText style={styles.modalTitle}>Request Shift Swap</ThemedText>
              
              <ThemedText style={styles.modalSectionTitle}>You are requesting:</ThemedText>
              <ThemedView style={[styles.shiftItem, styles.modalShiftItem, {borderColor: themedBorderColor}]}>
                <ThemedText><ThemedText style={styles.bold}>Owner:</ThemedText> {getEmployeeName(selectedTargetShift.user)}</ThemedText>
                <ThemedText><ThemedText style={styles.bold}>Week:</ThemedText> {selectedTargetShift.week}</ThemedText>
                <ThemedText><ThemedText style={styles.bold}>Hours:</ThemedText> {selectedTargetShift.workingHours}</ThemedText>
              </ThemedView>

              <ThemedText style={styles.modalSectionTitle}>You are offering your shift from Week {selectedTargetShift?.week}:</ThemedText>
              {selectedOwnShiftId && currentUserSchedule ? (
                (() => {
                  const offeredShiftDetails = currentUserSchedule.find((s: BackendShift) => s._id === selectedOwnShiftId);
                  if (offeredShiftDetails) {
                    return (
                      <ThemedView style={[styles.shiftItem, styles.modalShiftItem, {borderColor: themedBorderColor, backgroundColor: themedCardBackgroundColor}]}>
                        <ThemedText><ThemedText style={styles.bold}>Week:</ThemedText> {offeredShiftDetails.week}</ThemedText>
                        <ThemedText><ThemedText style={styles.bold}>Hours:</ThemedText> {offeredShiftDetails.workingHours}</ThemedText>
                        <ThemedText><ThemedText style={styles.bold}>Off Days:</ThemedText> {offeredShiftDetails.offDays.join(', ')}</ThemedText>
                      </ThemedView>
                    );
                  }
                  return <ThemedText>Error: Could not find details for your offered shift.</ThemedText>;
                })()
              ) : (
                <ThemedText>Could not automatically find your shift to offer for this week.</ThemedText>
              )}
              
              <TextInput
                style={[styles.textInput, {borderColor: themedBorderColor, color: themedTextColor, backgroundColor: themedBackgroundColor}]}
                placeholder="Optional message..."
                placeholderTextColor={themedTextColor}
                value={swapMessage}
                onChangeText={setSwapMessage}
                multiline
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: themedPrimaryButtonText }]} 
                  onPress={() => setIsModalVisible(false)}
                  disabled={isSubmittingSwap}
                >
                  <ThemedText style={{color: themedPrimaryButtonBg}}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: themedPrimaryButtonBg}]}
                  onPress={handleConfirmSwapRequest}
                  disabled={!selectedOwnShiftId || isSubmittingSwap}
                >
                  {isSubmittingSwap ? <ActivityIndicator color={themedPrimaryButtonText} /> : <ThemedText style={[styles.requestButtonText, {color: themedPrimaryButtonText}]}>Confirm Request</ThemedText>}
                </TouchableOpacity>
              </View>

            </ThemedView>
          </View>
        </Modal>
      )}
      </ThemedView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    width: '100%',
    marginTop: 10, 
  },
  shiftItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  shiftDetailText: { 
    fontSize: 15, 
    marginBottom: 5, 
  },
  bold: { fontWeight: 'bold' },
  requestButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 6, 
    marginTop: 12, 
    alignItems: 'center',
  },
  requestButtonText: { 
    fontWeight: 'bold',
    fontSize: 16, 
  },
  errorText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  weekInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
  },
  findButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  modalShiftItem: { 
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 10,
  },
  ownShiftItem: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 6,
  },
  ownShiftItemSelected: {
  },
  selectedShiftItem: { 
  },
  modalList: {
    maxHeight: 150, 
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginTop: 10,
    marginBottom: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginTop: 10,
  },
  modalButton: {
    flex: 1, 
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5, 
  },
});

export default FindSwapsScreen; // Renamed export