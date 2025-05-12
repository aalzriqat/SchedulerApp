import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, RefreshControl as RNRefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchMySwapRequests, cancelMyPendingSwap, respondToReceivedSwap, APISwapRequest, clearAllSwapErrors } from '../../store/slices/swapSlice';
import { BackendShift, RecipientScheduleData } from '../../api/apiService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';

const SwapStatusScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    mySentRequests, 
    myReceivedRequests, 
    isLoadingMySwaps, 
    mySwapsError,
    isRespondingToSwap,
    isCancellingSwap, 
  } = useSelector((state: RootState) => state.swaps);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedSuccessButtonBg = useThemeColor({}, 'statusApprovedBackground');
  const themedSuccessButtonText = useThemeColor({}, 'statusApprovedText');
  const themedDangerButtonBg = useThemeColor({}, 'statusRejectedBackground');
  const themedDangerButtonText = useThemeColor({}, 'statusRejectedText');

  useEffect(() => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMySwapRequests(currentUser.id));
    }
    return () => {
      dispatch(clearAllSwapErrors());
    };
  }, [dispatch, currentUser?.id]);

  const onRefresh = () => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMySwapRequests(currentUser.id));
    }
  };

  const handleCancelRequest = (swapId: string) => {
    Alert.alert(
      "Cancel Swap Request",
      "Are you sure you want to cancel this pending swap request?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", onPress: () => dispatch(cancelMyPendingSwap(swapId)) }
      ]
    );
  };

  const handleRespondRequest = (swapId: string, response: 'accepted' | 'declined') => {
    Alert.alert(
      `Respond to Swap Request`,
      `Are you sure you want to ${response} this swap request?`,
      [
        { text: "No", style: "cancel" },
        { text: `Yes, ${response.charAt(0).toUpperCase() + response.slice(1)}`, onPress: () => dispatch(respondToReceivedSwap({ swapId, responseStatus: response })) }
      ]
    );
  };
  
  const getEmployeeNameFromUserObject = (userObject: any): string => {
    if (!userObject) return 'N/A';
    if (typeof userObject === 'string') return `User ID: ${userObject}`; 
    return userObject.name || userObject.username || 'Unknown User';
  };

  const renderShiftInfo = (shift: BackendShift | RecipientScheduleData | string | undefined | null, shiftLabel: string) => {
    if (!shift) return <ThemedText style={{color: themedSubtleTextColor, fontStyle: 'italic'}}>{shiftLabel}: Not specified</ThemedText>;
    if (typeof shift === 'string') { 
      return <ThemedText style={{color: themedSubtleTextColor, fontStyle: 'italic'}}>{shiftLabel} (ID: {shift} - Details not populated)</ThemedText>;
    }
    return (
      <View style={[styles.shiftDetail, {borderLeftColor: themedPrimaryButtonBg}]}>
        <ThemedText style={styles.shiftTitle}>{shiftLabel}:</ThemedText>
        <ThemedText>  Week: {shift.week}</ThemedText>
        <ThemedText>  Hours: {shift.workingHours}</ThemedText>
        <ThemedText>  Off Days: {Array.isArray(shift.offDays) ? shift.offDays.join(', ') : 'N/A'}</ThemedText>
      </View>
    );
  };

  const renderSwapItem = ({ item, type }: { item: APISwapRequest, type: 'sent' | 'received' }) => {
    let myShift, theirShift, myShiftLabel, theirShiftLabel;

    if (type === 'sent') {
      myShift = item.requesterSchedule; 
      theirShift = item.recipientSchedule;
      myShiftLabel = "Your Offered Shift";
      theirShiftLabel = `Requested Shift (with ${getEmployeeNameFromUserObject(item.recipient)})`;
    } else { 
      myShift = item.recipientSchedule; 
      theirShift = item.requesterSchedule; 
      myShiftLabel = "Your Shift (involved in request)";
      theirShiftLabel = `Offered Shift (from ${getEmployeeNameFromUserObject(item.requester)})`;
    }

    return (
    <ThemedView style={[styles.swapItem, {backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor}]}>
      <View style={styles.swapItemHeader}>
        <ThemedText style={styles.swapHeader}>
          {/* Removed To/From user names as per request to not show names/IDs */}
          {type === 'sent' ? `Sent Request` : `Received Request`}
        </ThemedText>
        <ThemedText style={[styles.statusText, { color: themedSubtleTextColor /* TODO: Add dynamic status color */ }]}>
          Status: {item.status}
        </ThemedText>
      </View>
      <ThemedText style={{color: themedSubtleTextColor, fontSize: 12, marginBottom: 5}}>Created: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
      
      {renderShiftInfo(myShift, myShiftLabel)}
      {renderShiftInfo(theirShift, theirShiftLabel)}
      
      {item.notes && <ThemedText style={styles.notes}><ThemedText style={styles.bold}>Notes:</ThemedText> {item.notes}</ThemedText>}
      {item.adminNotes && <ThemedText style={styles.notes}><ThemedText style={styles.bold}>Admin Notes:</ThemedText> {item.adminNotes}</ThemedText>}

      {type === 'sent' && item.status === 'pending' && (
        <TouchableOpacity 
          style={[styles.actionButton, {backgroundColor: themedDangerButtonBg}]} 
          onPress={() => handleCancelRequest(item._id)}
          disabled={isCancellingSwap}
        >
          <FontAwesome name="times-circle" size={16} color={themedDangerButtonText} />
          <Text style={[styles.actionButtonText, {color: themedDangerButtonText}]}> Cancel Request</Text>
        </TouchableOpacity>
      )}
      {type === 'received' && item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: themedSuccessButtonBg, marginRight: 10}]} 
            onPress={() => handleRespondRequest(item._id, 'accepted')}
            disabled={isRespondingToSwap}
          >
            <FontAwesome name="check-circle" size={16} color={themedSuccessButtonText} />
            <Text style={[styles.actionButtonText, {color: themedSuccessButtonText}]}> Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: themedDangerButtonBg}]} 
            onPress={() => handleRespondRequest(item._id, 'declined')}
            disabled={isRespondingToSwap}
          >
            <FontAwesome name="times-circle" size={16} color={themedDangerButtonText} />
            <Text style={[styles.actionButtonText, {color: themedDangerButtonText}]}> Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      {(isCancellingSwap && item._id === (mySentRequests.find((req: APISwapRequest) => req._id === item._id)?._id)) && <ActivityIndicator style={{marginTop: 10}} color={themedPrimaryButtonBg}/>}
      {(isRespondingToSwap && item._id === (myReceivedRequests.find((req: APISwapRequest) => req._id === item._id)?._id)) && <ActivityIndicator style={{marginTop: 10}} color={themedPrimaryButtonBg}/>}
    </ThemedView>
  );
  };

  if (isLoadingMySwaps && (!mySentRequests || mySentRequests.length === 0) && (!myReceivedRequests || myReceivedRequests.length === 0)) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading swap requests...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: themedBackgroundColor}]}
      refreshControl={<RNRefreshControl refreshing={isLoadingMySwaps} onRefresh={onRefresh} colors={[themedPrimaryButtonBg]} tintColor={themedPrimaryButtonBg}/>}
    >
      <ThemedText type="title" style={styles.title}>My Swap Requests</ThemedText>

      <ThemedText style={styles.sectionTitle}>Sent Requests</ThemedText>
      {(!mySentRequests || mySentRequests.length === 0) && !isLoadingMySwaps && (
        <ThemedText style={[styles.noRequestsText, {color: themedSubtleTextColor}]}>You haven't sent any swap requests.</ThemedText>
      )}
      <FlatList
        data={mySentRequests || []} 
        renderItem={(props) => renderSwapItem({...props, type: 'sent'})}
        keyExtractor={(item) => `sent-${item._id}`}
        scrollEnabled={false} 
      />

      <ThemedText style={styles.sectionTitle}>Received Requests</ThemedText>
      {(!myReceivedRequests || myReceivedRequests.length === 0) && !isLoadingMySwaps && (
        <ThemedText style={[styles.noRequestsText, {color: themedSubtleTextColor}]}>You haven't received any swap requests.</ThemedText>
      )}
      <FlatList
        data={myReceivedRequests || []} 
        renderItem={(props) => renderSwapItem({...props, type: 'received'})}
        keyExtractor={(item) => `received-${item._id}`}
        scrollEnabled={false}
      />
       {mySwapsError && <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>Error: {mySwapsError}</ThemedText>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16,
  },
  centered: { 
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Ensure centered content takes full available space if container is flex:1
  },
  title: { 
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: { 
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
    // borderColor will be set by ThemedView or inline
  },
  swapItem: { 
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  swapItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  swapHeader: { 
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  shiftDetail: { 
    marginTop: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    marginBottom: 5,
  },
  shiftTitle: { 
    fontWeight: 'bold',
    fontSize: 14,
  },
  notes: {
    marginTop: 5,
  },
  noRequestsText: { 
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: { 
    textAlign: 'center',
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  actionButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  actionButtonText: { 
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bold: { fontWeight: 'bold' }
});

export default SwapStatusScreen;