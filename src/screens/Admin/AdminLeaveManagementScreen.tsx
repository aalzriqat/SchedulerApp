import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Button, Alert, Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllLeaveRequestsAdmin, updateLeaveStatusAdmin, LeaveRequest, clearLeaveErrors } from '../../store/slices/leaveSlice';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

const AdminLeaveManagementScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaveRequests, isLoading, error, isUpdating, updateError } = useSelector((state: RootState) => state.leaves);

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedInputBg = useThemeColor({}, 'inputBackground');
  const themedInputBorder = useThemeColor({}, 'inputBorder');
  const themedInputText = useThemeColor({}, 'inputText');
  const themedInputPlaceholder = useThemeColor({}, 'inputPlaceholder');

  const statusColors = {
    pending: { bg: useThemeColor({}, 'statusPendingBackground'), text: useThemeColor({}, 'statusPendingText') },
    approved: { bg: useThemeColor({}, 'statusApprovedBackground'), text: useThemeColor({}, 'statusApprovedText') },
    rejected: { bg: useThemeColor({}, 'statusRejectedBackground'), text: useThemeColor({}, 'statusRejectedText') },
    cancelled: { bg: useThemeColor({}, 'statusCancelledBackground'), text: useThemeColor({}, 'statusCancelledText') },
  };

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAllLeaveRequestsAdmin());
    return () => {
      dispatch(clearLeaveErrors());
    }
  }, [dispatch]);

  useEffect(() => {
    if (updateError) {
      Alert.alert('Update Error', updateError);
      dispatch(clearLeaveErrors());
    }
  }, [updateError, dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllLeaveRequestsAdmin());
  };

  const handleOpenModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setModalVisible(true);
  };

  const handleUpdateRequestStatus = (status: 'approved' | 'rejected') => {
    if (selectedRequest) {
      dispatch(updateLeaveStatusAdmin({ leaveId: selectedRequest._id, status, adminNotes }))
        .unwrap()
        .then(() => {
          Alert.alert('Success', `Request ${status} successfully.`);
          setModalVisible(false);
          setSelectedRequest(null);
          setAdminNotes('');
          dispatch(fetchAllLeaveRequestsAdmin()); // Re-fetch to get the latest list
        })
        .catch((err) => {
          // Error already handled by useEffect for updateError, but can add specific logic here if needed
        });
    }
  };

  const renderLeaveRequestItem = ({ item }: { item: LeaveRequest }) => {
    const currentStatusColors = statusColors[item.status] || {};
    return (
    <ThemedView style={[styles.itemContainer, {borderColor: themedBorderColor, backgroundColor: themedCardBackgroundColor}]}>
      <View style={styles.itemHeader}>
        <ThemedText style={styles.employeeName}>Employee: {typeof item.user === 'object' ? item.user.name || item.user.username : item.user}</ThemedText>
        <Text style={[styles.status, {backgroundColor: currentStatusColors.bg, color: currentStatusColors.text}]}>{item.status.toUpperCase()}</Text>
      </View>
      <ThemedText><ThemedText style={styles.bold}>Type:</ThemedText> {item.leaveType}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Date:</ThemedText> {new Date(item.fromDate).toLocaleDateString()}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Duration:</ThemedText> {Array.isArray(item.toDate) ? item.toDate.join(', ') : item.toDate}</ThemedText>
      <ThemedText><ThemedText style={styles.bold}>Reason:</ThemedText> {item.reason}</ThemedText>
      {item.adminNotes && <ThemedText><ThemedText style={styles.bold}>Admin Notes:</ThemedText> {item.adminNotes}</ThemedText>}
      <ThemedText style={[styles.submittedAt, {color: themedSubtleTextColor}]}>Created: {new Date(item.createdAt).toLocaleString()}</ThemedText>
      {item.status === 'pending' && !isUpdating && (
        <TouchableOpacity style={[styles.manageButton, {backgroundColor: themedPrimaryButtonBg}]} onPress={() => handleOpenModal(item)}>
          <Text style={[styles.manageButtonText, {color: themedPrimaryButtonText}]}>Manage</Text>
        </TouchableOpacity>
      )}
      {isUpdating && selectedRequest?._id === item._id && <ActivityIndicator style={{marginTop: 10}} size="small" color={themedPrimaryButtonBg} />}
    </ThemedView>
    );
  };

  if (isLoading && leaveRequests.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading leave requests...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {error}</ThemedText>
        <Button title="Retry" onPress={onRefresh} color={themedPrimaryButtonBg} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <ThemedText type="title" style={styles.header}>Manage Leave Requests</ThemedText>
      {leaveRequests.length === 0 && !isLoading ? (
        <ThemedView style={[styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
          <ThemedText>No pending leave requests found.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={leaveRequests.slice().sort((a: LeaveRequest, b: LeaveRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())} // Use createdAt for sorting
          renderItem={renderLeaveRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg} />
          }
        />
      )}

      {selectedRequest && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
            setSelectedRequest(null);
          }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback accessible={false}>
                <ThemedView style={[styles.modalView, {backgroundColor: themedCardBackgroundColor}]}>
                  <ThemedText style={styles.modalTitle}>Manage Request</ThemedText>
              <ThemedText>Employee: {typeof selectedRequest.user === 'object' ? selectedRequest.user.name || selectedRequest.user.username : selectedRequest.user}</ThemedText>
              <ThemedText>Type: {selectedRequest.leaveType}</ThemedText>
              <ThemedText>Date: {new Date(selectedRequest.fromDate).toLocaleDateString()}</ThemedText>
              <ThemedText>Duration: {Array.isArray(selectedRequest.toDate) ? selectedRequest.toDate.join(', ') : selectedRequest.toDate}</ThemedText>
              <ThemedText>Reason: {selectedRequest.reason}</ThemedText>
              
              <TextInput
                style={[styles.notesInput, {backgroundColor: themedInputBg, borderColor: themedInputBorder, color: themedInputText}]}
                placeholder="Admin Notes (Optional)"
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
                placeholderTextColor={themedInputPlaceholder}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                    style={[styles.modalButton, {backgroundColor: statusColors.approved.bg}]}
                    onPress={() => handleUpdateRequestStatus('approved')}
                    disabled={isUpdating}
                >
                    <FontAwesome name="check" size={16} color={statusColors.approved.text} />
                    <Text style={[styles.modalButtonText, {color: statusColors.approved.text}]}> Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, {backgroundColor: statusColors.rejected.bg}]}
                    onPress={() => handleUpdateRequestStatus('rejected')}
                    disabled={isUpdating}
                >
                    <FontAwesome name="times" size={16} color={statusColors.rejected.text} />
                    <Text style={[styles.modalButtonText, {color: statusColors.rejected.text}]}> Reject</Text>
                </TouchableOpacity>
              </View>
              {isUpdating && <ActivityIndicator style={{marginTop:10}} size="small" color={themedPrimaryButtonBg} />}
                  <Button title="Cancel" onPress={() => { setModalVisible(false); setSelectedRequest(null); }} color={themedSubtleTextColor} />
                </ThemedView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { // bg applied inline
    flex: 1,
  },
  centerContent: { // bg applied inline
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: { // color from ThemedText
    fontSize: 22,
    fontWeight: 'bold',
    paddingVertical: 15,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemContainer: { // bg and borderColor applied inline
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  employeeName: { // color from ThemedText
    fontWeight: 'bold',
    fontSize: 16,
  },
  status: { // bg and color applied inline
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  // status_pending, approved, etc. removed as they are dynamically applied
  bold: { fontWeight: 'bold' }, // color from ThemedText
  submittedAt: { // color applied inline
    fontSize: 12,
    marginTop: 8,
  },
  manageButton: { // bg applied inline
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  manageButtonText: { // color applied inline
    fontWeight: 'bold',
  },
  errorText: { // color applied inline
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Overlay can keep its color
  },
  modalView: { // bg applied inline
    margin: 20,
    borderRadius: 12,
    padding: 25,
    alignItems: 'stretch',
    shadowColor: '#000', // Shadow might need theme adjustment if problematic
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: { // color from ThemedText
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  notesInput: { // bg, borderColor, color, placeholderTextColor applied inline
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginVertical: 15,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 20,
  },
  modalButton: { // bg applied inline
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 100,
    justifyContent: 'center',
  },
  // approveButton & rejectButton specific styles removed as bg applied inline
  modalButtonText: { // color applied inline
    fontWeight: 'bold',
    marginLeft: 5,
    fontSize: 15,
  },
});

export default AdminLeaveManagementScreen;