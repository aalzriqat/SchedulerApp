import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Button, Alert, Modal, TextInput, TouchableOpacity, Share, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchAllSwapRequestsForAdmin, updateSwapStatusByAdmin, APISwapRequest, clearAllSwapErrors } from '../../store/slices/swapSlice';
import { BackendShift, RecipientScheduleData } from '../../api/apiService'; // Corrected Import Path
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor

const AdminSwapManagementScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { allSwapRequestsAdmin, isLoadingAllSwapsAdmin, allSwapsAdminError, isUpdatingSwapAdmin, updateAdminError } = useSelector(
    (state: RootState) => state.swaps
  );

  // Theme colors
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedSecondaryButtonBg = useThemeColor({}, 'buttonSecondaryBackground');
  const themedSecondaryButtonText = useThemeColor({}, 'buttonSecondaryText');
  const themedInputBg = useThemeColor({}, 'inputBackground');
  const themedInputBorder = useThemeColor({}, 'inputBorder');
  const themedInputText = useThemeColor({}, 'inputText');
  const themedInputPlaceholder = useThemeColor({}, 'inputPlaceholder');
  
  const statusColors = {
    pending: { bg: useThemeColor({}, 'statusPendingBackground'), text: useThemeColor({}, 'statusPendingText') },
    approved: { bg: useThemeColor({}, 'statusApprovedBackground'), text: useThemeColor({}, 'statusApprovedText') },
    rejected: { bg: useThemeColor({}, 'statusRejectedBackground'), text: useThemeColor({}, 'statusRejectedText') },
    cancelled: { bg: useThemeColor({}, 'statusCancelledBackground'), text: useThemeColor({}, 'statusCancelledText') },
    'auto-approved': { bg: useThemeColor({}, 'statusAutoApprovedBackground'), text: useThemeColor({}, 'statusAutoApprovedText') },
  };


  const [selectedRequest, setSelectedRequest] = useState<APISwapRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAllSwapRequestsForAdmin());
    return () => {
      dispatch(clearAllSwapErrors());
    }
  }, [dispatch]);

  useEffect(() => {
    if (updateAdminError) {
      Alert.alert('Update Error', updateAdminError);
      dispatch(clearAllSwapErrors());
    }
  }, [updateAdminError, dispatch]);

  const onRefresh = () => {
    dispatch(fetchAllSwapRequestsForAdmin());
  };

  const handleOpenModal = (request: APISwapRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setModalVisible(true);
  };

  const handleUpdateRequestStatus = (status: 'approved' | 'rejected') => {
    if (selectedRequest) {
      dispatch(updateSwapStatusByAdmin({ swapId: selectedRequest._id, status, adminNotes }))
        .unwrap()
        .then(() => {
          Alert.alert('Success', `Swap request ${status} successfully.`);
          setModalVisible(false);
          setSelectedRequest(null);
          setAdminNotes('');
          // No need to manually re-fetch, slice should update the item in allSwapRequestsAdmin
        })
        .catch((err) => {
          // Error already handled by useEffect for updateAdminError
        });
    }
  };

  const getStatusStyle = (status: APISwapRequest['status']) => {
    const statusStyle = statusColors[status] || {};
    return { backgroundColor: statusStyle.bg, color: statusStyle.text };
  };
  
  const getEmployeeName = (employee: any): string => {
    if (!employee) return 'N/A';
    if (typeof employee === 'string') return `ID: ${employee}`;
    return employee.name || employee.username || 'Unknown Employee';
  };

  // Updated renderShiftInfo to handle BackendShift or RecipientScheduleData
  const renderShiftInfo = (shift: BackendShift | RecipientScheduleData | string | undefined | null, type: string, label?: string) => {
    if (!shift) return <ThemedText>{label || type}: Not specified</ThemedText>;
    if (typeof shift === 'string') {
      return <ThemedText><ThemedText style={styles.bold}>{label || type} Shift ID:</ThemedText> {shift}</ThemedText>;
    }
    // Now shift is BackendShift or RecipientScheduleData
    return (
      <View style={styles.shiftDetailBlock}>
        <ThemedText style={styles.bold}>{label || type} Shift Details:</ThemedText>
        <ThemedText>  User: {getEmployeeName(shift.user)}</ThemedText>
        <ThemedText>  Week: {shift.week}</ThemedText>
        <ThemedText>  Working Hours: {shift.workingHours}</ThemedText>
        <ThemedText>  Off Days: {Array.isArray(shift.offDays) ? shift.offDays.join(', ') : 'N/A'}</ThemedText>
        <ThemedText>  Open for Swap: {shift.isOpenForSwap ? 'Yes' : 'No'}</ThemedText>
      </View>
    );
  };

  const convertToCSV = (data: APISwapRequest[]) => {
    if (!data || data.length === 0) return '';
    // Updated CSV Header
    const header = 'SwapID,Requester,Recipient,RequesterScheduleID,RecipientScheduleWeek,RecipientScheduleHours,Status,AdminNotes,CreatedAt,SwapWeek\n';
    const rows = data.map(req => {
      const escapeCSV = (val: any) => `"${(val === undefined || val === null ? '' : String(val)).replace(/"/g, '""')}"`;
      
      const requesterScheduleId = typeof req.requesterSchedule === 'string' ? req.requesterSchedule : req.requesterSchedule?._id;
      const recipientScheduleDetails = req.recipientSchedule
        ? `Week ${req.recipientSchedule.week}, ${req.recipientSchedule.workingHours}`
        : 'N/A';
      const recipientScheduleWeek = req.recipientSchedule?.week || 'N/A';
      const recipientScheduleHours = req.recipientSchedule?.workingHours || 'N/A';

      return [
        escapeCSV(req._id),
        escapeCSV(getEmployeeName(req.requester)),
        escapeCSV(getEmployeeName(req.recipient)), // Changed from responder
        escapeCSV(requesterScheduleId),
        escapeCSV(recipientScheduleWeek),
        escapeCSV(recipientScheduleHours),
        escapeCSV(req.status),
        escapeCSV(req.adminNotes),
        escapeCSV(new Date(req.createdAt).toLocaleString()),
        escapeCSV(req.week) // Added top-level week
      ].join(',');
    }).join('\n');
    return header + rows;
  };

  const handleExport = async () => {
    if (allSwapRequestsAdmin.length === 0) {
      Alert.alert('No Data', 'There are no swap requests to export.');
      return;
    }
    const csvData = convertToCSV(allSwapRequestsAdmin);
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "swap_requests.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            await Clipboard.setStringAsync(csvData);
            Alert.alert('Copied to Clipboard', 'CSV data copied. Paste into a text file & save as .csv.');
        }
      } else {
        await Share.share({ message: csvData, title: 'Swap Requests CSV' }, { dialogTitle: 'Export Swaps as CSV' });
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export data. Copied to clipboard as fallback.');
      await Clipboard.setStringAsync(csvData);
    }
  };


  const renderSwapRequestItem = ({ item }: { item: APISwapRequest }) => (
    <ThemedView style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <ThemedText style={styles.requesterName}>Requester: {getEmployeeName(item.requester)}</ThemedText>
        <Text style={[styles.status, { backgroundColor: getStatusStyle(item.status).backgroundColor, color: getStatusStyle(item.status).color }]}>{item.status.toUpperCase()}</Text>
      </View>
      {item.recipient && <ThemedText><ThemedText style={styles.bold}>Intended Recipient:</ThemedText> {getEmployeeName(item.recipient)}</ThemedText>}
      
      {renderShiftInfo(item.requesterSchedule, 'Requester\'s Offered', 'Offered by Requester (Shift)')}
      {item.recipientSchedule && renderShiftInfo(item.recipientSchedule, 'Recipient\'s Matched', 'Matched with Recipient (Shift)')}
      {item.week && <ThemedText><ThemedText style={styles.bold}>Swap concerns Week:</ThemedText> {item.week}</ThemedText>}


      {item.notes && <ThemedText><ThemedText style={styles.bold}>Requester Notes:</ThemedText> {item.notes}</ThemedText>}
      {item.adminNotes && <ThemedText><ThemedText style={styles.bold}>Admin Notes:</ThemedText> {item.adminNotes}</ThemedText>}
      <ThemedText style={styles.submittedAt}>Created: {new Date(item.createdAt).toLocaleString()}</ThemedText>
      
      {item.status === 'pending' && !isUpdatingSwapAdmin && (
        <TouchableOpacity style={[styles.manageButton, {backgroundColor: themedPrimaryButtonBg}]} onPress={() => handleOpenModal(item)}>
          <Text style={[styles.manageButtonText, {color: themedPrimaryButtonText}]}>Manage</Text>
        </TouchableOpacity>
      )}
      {isUpdatingSwapAdmin && selectedRequest?._id === item._id && <ActivityIndicator style={{marginTop: 10}} size="small" color={themedPrimaryButtonBg} />}
    </ThemedView>
  );

  if (isLoadingAllSwapsAdmin && allSwapRequestsAdmin.length === 0) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading swap requests...</ThemedText>
      </ThemedView>
    );
  }

  if (allSwapsAdminError) {
    return (
      <ThemedView style={[styles.container, styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
        <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {allSwapsAdminError}</ThemedText>
        <Button title="Retry" onPress={onRefresh} color={themedPrimaryButtonBg} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <View style={[styles.topBar, {borderBottomColor: themedBorderColor}]}>
        <ThemedText type="title" style={styles.mainHeader}>Manage Swap Requests</ThemedText>
        <Button title="Export CSV" onPress={handleExport} disabled={isLoadingAllSwapsAdmin || allSwapRequestsAdmin.length === 0} color={themedPrimaryButtonBg} />
      </View>
      {allSwapRequestsAdmin.length === 0 && !isLoadingAllSwapsAdmin ? (
        <ThemedView style={[styles.centerContent, {backgroundColor: themedBackgroundColor}]}>
          <ThemedText>No swap requests found.</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={allSwapRequestsAdmin.slice().sort((a: APISwapRequest, b: APISwapRequest) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
          renderItem={renderSwapRequestItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContentContainer}
          refreshControl={
            <RefreshControl refreshing={isLoadingAllSwapsAdmin} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg} />
          }
        />
      )}

      {selectedRequest && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => { setModalVisible(false); setSelectedRequest(null); }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback accessible={false}>
                <ThemedView style={[styles.modalView, {backgroundColor: themedCardBackgroundColor}]}>
                  <ThemedText style={styles.modalTitle}>Manage Swap Request</ThemedText>
              <ThemedText>Requester: {getEmployeeName(selectedRequest.requester)}</ThemedText>
              {selectedRequest.recipient && <ThemedText>Intended Recipient: {getEmployeeName(selectedRequest.recipient)}</ThemedText>}
              {renderShiftInfo(selectedRequest.requesterSchedule, 'Requester\'s Offered', 'Offered by Requester (Shift)')}
              {selectedRequest.recipientSchedule && renderShiftInfo(selectedRequest.recipientSchedule, 'Recipient\'s Matched', 'Matched with Recipient (Shift)')}
              {selectedRequest.week && <ThemedText><ThemedText style={styles.bold}>Swap concerns Week:</ThemedText> {selectedRequest.week}</ThemedText>}
              
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
                    style={[styles.modalButton, {backgroundColor: statusColors.approved.bg }]}
                    onPress={() => handleUpdateRequestStatus('approved')}
                    disabled={isUpdatingSwapAdmin}
                >
                    <FontAwesome name="check" size={16} color={statusColors.approved.text} />
                    <Text style={[styles.modalButtonText, {color: statusColors.approved.text}]}> Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.modalButton, {backgroundColor: statusColors.rejected.bg}]}
                    onPress={() => handleUpdateRequestStatus('rejected')}
                    disabled={isUpdatingSwapAdmin}
                >
                    <FontAwesome name="times" size={16} color={statusColors.rejected.text} />
                    <Text style={[styles.modalButtonText, {color: statusColors.rejected.text}]}> Reject</Text>
                </TouchableOpacity>
              </View>
                  {isUpdatingSwapAdmin && <ActivityIndicator style={{marginTop:10}} size="small" color={themedPrimaryButtonBg} />}
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

// Styles are defined outside the component, so they don't have access to hooks directly.
// We pass themed colors as inline styles or props.
const styles = StyleSheet.create({
  container: { flex: 1 }, // Background color will be applied inline
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1 /* borderColor applied inline */ },
  mainHeader: { fontSize: 20, fontWeight: 'bold' }, // Text color from ThemedText
  listContentContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  itemContainer: { padding: 15, marginVertical: 8, borderRadius: 8, borderWidth: 1 /* borderColor applied inline */ }, // Background from ThemedView
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  requesterName: { fontWeight: 'bold', fontSize: 16 }, // Text color from ThemedText
  status: { fontSize: 12, fontWeight: 'bold', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, overflow: 'hidden' /* bg and text color applied inline */ },
  // Specific status background/text colors are now handled by getStatusStyle and applied inline
  // status_pending: {}, // No longer needed here
  // status_approved: {},
  // status_rejected: {},
  // status_cancelled: {},
  // status_auto_approved: {},
  bold: { fontWeight: 'bold' },
  shiftDetailBlock: { marginVertical: 5, paddingLeft: 10, borderLeftWidth: 1 /* borderColor applied inline from themedBorderColor */ },
  submittedAt: { fontSize: 12, marginTop: 8 /* color applied inline */ },
  manageButton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, alignSelf: 'flex-start' /* bgColor applied inline */ },
  manageButtonText: { fontWeight: 'bold' /* color applied inline */ },
  errorText: { fontSize: 16, marginBottom: 10, textAlign: 'center' /* color applied inline */ },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }, // Overlay can keep its color
  modalView: { margin: 20, borderRadius: 12, padding: 25, alignItems: 'stretch', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' /* bgColor from ThemedView */ },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }, // Text color from ThemedText
  notesInput: { borderWidth: 1, padding: 10, minHeight: 80, textAlignVertical: 'top', marginVertical: 15, fontSize: 15, borderRadius: 8 /* bgColor, borderColor, color, placeholderTextColor applied inline */ },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10, marginBottom: 20 },
  modalButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 5, minWidth: 100, justifyContent: 'center' /* bgColor applied inline */ },
  // approveButton: {}, // Specific bg applied inline
  // rejectButton: {}, // Specific bg applied inline
  modalButtonText: { fontWeight: 'bold', marginLeft: 5, fontSize: 15 /* color applied inline */ },
});

export default AdminSwapManagementScreen;