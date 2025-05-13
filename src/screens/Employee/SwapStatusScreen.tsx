import React, { useEffect, useState } from 'react';
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
  const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
  type SwapStatusFilter = 'All' | 'Pending' | 'Accepted' | 'Declined' | 'Cancelled';
  const filterOptions: SwapStatusFilter[] = ['All', 'Pending', 'Accepted', 'Declined', 'Cancelled'];
  type ActiveView = 'sent' | 'received';
  const [currentView, setCurrentView] = useState<ActiveView>('sent');
  const [activeFilter, setActiveFilter] = useState<SwapStatusFilter>('All'); // Single filter state
 
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText'); // Moved from renderFilterButtons
  const themedErrorContainerBg = useThemeColor({ light: '#FFCDD2', dark: '#C62828' }, 'statusRejectedBackground'); // Moved from styles

  // Status colors
  const themedStatusApprovedBg = useThemeColor({}, 'statusApprovedBackground');
  const themedStatusApprovedText = useThemeColor({}, 'statusApprovedText');
  const themedStatusRejectedBg = useThemeColor({}, 'statusRejectedBackground');
  const themedStatusRejectedText = useThemeColor({}, 'statusRejectedText');
  const themedStatusPendingBg = useThemeColor({}, 'statusPendingBackground'); // Assuming this will be added to Colors.ts
  const themedStatusPendingText = useThemeColor({}, 'statusPendingText');   // Assuming this will be added to Colors.ts
  const themedStatusCancelledBg = useThemeColor({}, 'statusCancelledBackground'); // Assuming this will be added to Colors.ts
  const themedStatusCancelledText = useThemeColor({}, 'statusCancelledText'); // Assuming this will be added to Colors.ts
  const themedDefaultStatusBg = useThemeColor({}, 'cardBackground'); // Fallback
  const themedDefaultStatusText = useThemeColor({}, 'text'); // Fallback

  useEffect(() => {
    if (currentUser && currentUser.id) {
      dispatch(fetchMySwapRequests(currentUser.id));
    }
    return () => {
      dispatch(clearAllSwapErrors());
    };
  }, [dispatch, currentUser?.id]);

  // Effect to clear activeSwapId when loading states change from true to false
  useEffect(() => {
    if (!isCancellingSwap && activeSwapId && mySentRequests.find((req: APISwapRequest) => req._id === activeSwapId)) {
      // Check if the request that was being cancelled is no longer pending
      const cancelledRequest = mySentRequests.find((req: APISwapRequest) => req._id === activeSwapId);
      if (cancelledRequest && cancelledRequest.status !== 'pending') {
        setActiveSwapId(null);
      } else if (!cancelledRequest) { // Request removed
        setActiveSwapId(null);
      }
    }
  }, [isCancellingSwap, mySentRequests, activeSwapId]);

  useEffect(() => {
    if (!isRespondingToSwap && activeSwapId && myReceivedRequests.find((req: APISwapRequest) => req._id === activeSwapId)) {
       // Check if the request that was being responded to is no longer pending
      const respondedRequest = myReceivedRequests.find((req: APISwapRequest) => req._id === activeSwapId);
      if (respondedRequest && respondedRequest.status !== 'pending') {
        setActiveSwapId(null);
      } else if (!respondedRequest) { // Request removed or modified significantly
         setActiveSwapId(null);
      }
    }
  }, [isRespondingToSwap, myReceivedRequests, activeSwapId]);
 
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
        { text: "Yes, Cancel", onPress: () => {
            setActiveSwapId(swapId);
            dispatch(cancelMyPendingSwap(swapId));
          }
        }
      ]
    );
  };
 
  const handleRespondRequest = (swapId: string, response: 'accepted' | 'declined') => {
    Alert.alert(
      `Respond to Swap Request`,
      `Are you sure you want to ${response} this swap request?`,
      [
        { text: "No", style: "cancel" },
        { text: `Yes, ${response.charAt(0).toUpperCase() + response.slice(1)}`, onPress: () => {
            setActiveSwapId(swapId);
            dispatch(respondToReceivedSwap({ swapId, responseStatus: response }));
          }
        }
      ]
    );
  };
  
  const getEmployeeNameFromUserObject = (userObject: any): string => {
    if (!userObject) return 'N/A';
    if (typeof userObject === 'string') return `User ID: ${userObject}`; 
    return userObject.name || userObject.username || 'Unknown User';
  };

  const renderShiftInfo = (shift: BackendShift | RecipientScheduleData | string | undefined | null, shiftLabel: string) => {
    if (!shift) return <ThemedText style={[styles.shiftInfoText, {color: themedSubtleTextColor, fontStyle: 'italic'}]}>{shiftLabel}: Not specified</ThemedText>;
    if (typeof shift === 'string') {
      return <ThemedText style={[styles.shiftInfoText, {color: themedSubtleTextColor, fontStyle: 'italic'}]}>{shiftLabel} (ID: {shift} - Details not populated)</ThemedText>;
    }
    return (
      <View style={[styles.shiftDetailContainer, {borderLeftColor: themedPrimaryButtonBg}]}>
        <ThemedText style={styles.shiftTitle}>{shiftLabel}</ThemedText>
        <View style={styles.shiftInfoRow}>
          <ThemedText style={styles.shiftInfoLabel}>Week:</ThemedText>
          <ThemedText style={styles.shiftInfoValue}>{shift.week}</ThemedText>
        </View>
        <View style={styles.shiftInfoRow}>
          <ThemedText style={styles.shiftInfoLabel}>Hours:</ThemedText>
          <ThemedText style={styles.shiftInfoValue}>{shift.workingHours}</ThemedText>
        </View>
        <View style={styles.shiftInfoRow}>
          <ThemedText style={styles.shiftInfoLabel}>Off Days:</ThemedText>
          <ThemedText style={styles.shiftInfoValue}>{Array.isArray(shift.offDays) ? shift.offDays.join(', ') : 'N/A'}</ThemedText>
        </View>
      </View>
    );
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'approved': // Assuming 'approved' might be a status from admin actions
        return { backgroundColor: themedStatusApprovedBg, textColor: themedStatusApprovedText, icon: 'check-circle' as const, iconColor: themedStatusApprovedText };
      case 'declined':
      case 'rejected': // Assuming 'rejected' might be a status from admin actions
        return { backgroundColor: themedStatusRejectedBg, textColor: themedStatusRejectedText, icon: 'times-circle' as const, iconColor: themedStatusRejectedText };
      case 'pending':
        return { backgroundColor: themedStatusPendingBg, textColor: themedStatusPendingText, icon: 'hourglass-half' as const, iconColor: themedStatusPendingText };
      case 'cancelled':
        return { backgroundColor: themedStatusCancelledBg, textColor: themedStatusCancelledText, icon: 'ban' as const, iconColor: themedStatusCancelledText };
      default:
        return { backgroundColor: themedDefaultStatusBg, textColor: themedDefaultStatusText, icon: 'question-circle' as const, iconColor: themedDefaultStatusText };
    }
  };
 
  const renderSwapItem = ({ item, type }: { item: APISwapRequest, type: 'sent' | 'received' }) => {
    let myShift, theirShift, myShiftLabel, theirShiftLabel;
    const statusStyle = getStatusStyle(item.status);
 
    if (type === 'sent') {
      myShift = item.requesterSchedule;
      theirShift = item.recipientSchedule;
      myShiftLabel = "Your Offered Shift";
      theirShiftLabel = `Requested Shift `;
    } else {
      myShift = item.recipientSchedule;
      theirShift = item.requesterSchedule;
      myShiftLabel = "Your Shift (involved in request)";
      theirShiftLabel = `Offered Shift (from ${getEmployeeNameFromUserObject(item.requester)})`;
    }
 
    const isActionable = type === 'received' && item.status === 'pending';
    const cardStyle = [
      styles.swapItem,
      { backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor },
      isActionable && { borderColor: themedStatusPendingText, borderWidth: 1.5 } // Highlight actionable items with border
      // Alternatively, use a background tint:
      // isActionable && { backgroundColor: themedStatusPendingBg }
    ];

    return (
    <ThemedView style={cardStyle}>
      <View style={styles.swapItemHeader}>
        <ThemedText style={styles.swapHeader}>
          {type === 'sent' ? `Sent Request` : `Received Request`}
        </ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <FontAwesome name={statusStyle.icon} size={14} color={statusStyle.iconColor} style={styles.statusIcon} />
          <ThemedText style={[styles.statusText, { color: statusStyle.textColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={{color: themedSubtleTextColor, fontSize: 12, marginBottom: 5}}>Created: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
      {item.status !== 'pending' && item.updatedAt && (
        <ThemedText style={{color: themedSubtleTextColor, fontSize: 12, marginBottom: 8}}>
          Last Updated: {new Date(item.updatedAt).toLocaleString()} ({item.status.charAt(0).toUpperCase() + item.status.slice(1)})
        </ThemedText>
      )}
      
      {renderShiftInfo(myShift, myShiftLabel)}
      {renderShiftInfo(theirShift, theirShiftLabel)}
      
      {item.notes && <ThemedText style={styles.notes}><ThemedText style={styles.bold}>Notes:</ThemedText> {item.notes}</ThemedText>}
      {item.adminNotes && <ThemedText style={styles.notes}><ThemedText style={styles.bold}>Admin Notes:</ThemedText> {item.adminNotes}</ThemedText>}
 
      {type === 'sent' && item.status === 'pending' && (
        <TouchableOpacity
          style={[styles.actionButton, {backgroundColor: themedStatusRejectedBg}]}
          onPress={() => handleCancelRequest(item._id)}
          disabled={isCancellingSwap}
        >
          <FontAwesome name="times-circle" size={16} color={themedStatusRejectedText} />
          <Text style={[styles.actionButtonText, {color: themedStatusRejectedText}]}> Cancel Request</Text>
        </TouchableOpacity>
      )}
      {type === 'received' && item.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: themedStatusApprovedBg, marginRight: 10}]}
            onPress={() => handleRespondRequest(item._id, 'accepted')}
            disabled={isRespondingToSwap}
          >
            <FontAwesome name="check-circle" size={16} color={themedStatusApprovedText} />
            <Text style={[styles.actionButtonText, {color: themedStatusApprovedText}]}> Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, {backgroundColor: themedStatusRejectedBg}]}
            onPress={() => handleRespondRequest(item._id, 'declined')}
            disabled={isRespondingToSwap}
          >
            <FontAwesome name="times-circle" size={16} color={themedStatusRejectedText} />
            <Text style={[styles.actionButtonText, {color: themedStatusRejectedText}]}> Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeSwapId === item._id && (isCancellingSwap || isRespondingToSwap) && (
        <ActivityIndicator style={{marginTop: 10}} color={themedPrimaryButtonBg}/>
      )}
    </ThemedView>
  );
  };

  // Filter buttons now use the single activeFilter state
  const renderFilterButtons = () => {
    return (
      <View style={styles.filterContainer}>
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.filterButton,
              { backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor },
              activeFilter === option && { backgroundColor: themedPrimaryButtonBg, borderColor: themedPrimaryButtonBg }
            ]}
            onPress={() => setActiveFilter(option)} // Update single filter state
          >
            <Text style={[
              styles.filterButtonText,
              { color: themedTextColor },
              activeFilter === option && { color: themedPrimaryButtonText } // Use variable
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
 
  // Empty component now uses currentView
  const ListEmptyComponent = () => (
    <View style={styles.emptyListContainer}>
      <FontAwesome name="inbox" size={30} color={themedSubtleTextColor} />
      <ThemedText style={[styles.noRequestsText, {color: themedSubtleTextColor, marginTop: 8}]}>
        {activeFilter === 'All'
          ? `You haven't ${currentView === 'sent' ? 'sent' : 'received'} any swap requests.`
          : `No ${currentView} requests found with status "${activeFilter}".`}
      </ThemedText>
    </View>
  );
 
  // Initial loading state check
  if (isLoadingMySwaps && (!mySentRequests || mySentRequests.length === 0) && (!myReceivedRequests || myReceivedRequests.length === 0)) {
    return (
      <ThemedView style={[styles.container, styles.centered, {backgroundColor: themedBackgroundColor}]}>
        <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
        <ThemedText>Loading swap requests...</ThemedText>
      </ThemedView>
    );
  }

  // Determine data source and filter it
  const activeDataSource = currentView === 'sent' ? mySentRequests : myReceivedRequests;
  const filteredDataSource = (activeDataSource || []).filter((req: APISwapRequest) =>
    activeFilter === 'All' || req.status.toLowerCase() === activeFilter.toLowerCase()
  );

  const handleViewChange = (view: ActiveView) => {
    setCurrentView(view);
    setActiveFilter('All'); // Reset filter when switching views
  };
 
  return (
    // Use ThemedView as the main container, remove ScrollView
    <ThemedView style={[styles.container, {backgroundColor: themedBackgroundColor}]}>
      <ThemedText type="title" style={styles.title}>My Swap Requests</ThemedText>

      {/* Segmented Control */}
      <View style={styles.segmentedControlContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            styles.segmentButtonLeft,
            currentView === 'sent' ? styles.segmentActive : styles.segmentInactive,
            currentView === 'sent' && { backgroundColor: themedPrimaryButtonBg, borderColor: themedPrimaryButtonBg }
          ]}
          onPress={() => handleViewChange('sent')}
        >
          <Text style={[styles.segmentText, currentView === 'sent' ? styles.segmentTextActive : styles.segmentTextInactive]}>
            Sent ({mySentRequests?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            styles.segmentButtonRight,
            currentView === 'received' ? styles.segmentActive : styles.segmentInactive,
            currentView === 'received' && { backgroundColor: themedPrimaryButtonBg, borderColor: themedPrimaryButtonBg }
          ]}
          onPress={() => handleViewChange('received')}
        >
          <Text style={[styles.segmentText, currentView === 'received' ? styles.segmentTextActive : styles.segmentTextInactive]}>
            Received ({myReceivedRequests?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Improved Error Display */}
      {mySwapsError && (
        <View style={styles.errorContainer}>
           <FontAwesome name="exclamation-triangle" size={16} color={themedErrorTextColor} style={{marginRight: 8}}/>
           <ThemedText style={[styles.errorText, {color: themedErrorTextColor}]}>
             Error loading requests: {mySwapsError}
           </ThemedText>
        </View>
      )}
 
      {/* Filter Buttons */}
      {renderFilterButtons()}

      {/* Single FlatList */}
      <FlatList
        data={filteredDataSource}
        renderItem={(props) => renderSwapItem({...props, type: currentView})}
        keyExtractor={(item) => `${currentView}-${item._id}`}
        ListEmptyComponent={<ListEmptyComponent />}
        contentContainerStyle={styles.listContentContainer} // Add padding for list content if needed
        refreshControl={ // Apply RefreshControl directly to FlatList
          <RNRefreshControl
            refreshing={isLoadingMySwaps}
            onRefresh={onRefresh}
            colors={[themedPrimaryButtonBg]}
            tintColor={themedPrimaryButtonBg}
          />
        }
      />
    </ThemedView>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1, // Make container take full height
    // Remove padding here, apply to list container if needed or keep horizontal
    paddingHorizontal: 16,
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
  // Removed sectionTitle style as it's no longer used
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
    fontSize: 12, // Adjusted for badge
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12, // More rounded for a badge
  },
  statusIcon: {
    marginRight: 5,
  },
  shiftDetailContainer: { // Renamed from shiftDetail
    marginTop: 10, // Increased top margin
    paddingLeft: 12, // Increased padding
    borderLeftWidth: 3,
    marginBottom: 10, // Increased bottom margin
  },
  shiftTitle: {
    fontWeight: '600',
    fontSize: 15, // Slightly larger title
    marginBottom: 5, // Add space below title
  },
  shiftInfoRow: {
    flexDirection: 'row',
    marginBottom: 3, // Space between rows
  },
  shiftInfoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 14,
    minWidth: 70, // Align values
  },
  shiftInfoValue: {
    fontSize: 14,
    flexShrink: 1, // Allow text to wrap if needed
  },
  shiftInfoText: { // Style for the fallback texts
     fontSize: 14,
     marginBottom: 8,
  },
  notes: {
    marginTop: 8, // Increased spacing before notes
  },
  noRequestsText: { 
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40, // Increased padding
    flexGrow: 1, // Allow it to take space if list is short
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themedErrorContainerBg, // Use variable
    padding: 10,
    borderRadius: 5,
    marginBottom: 10, // Reduced space below error
    marginTop: 5, // Added space above error
    marginHorizontal: 0, // Remove horizontal margin if container has padding
  },
  errorText: {
    flex: 1, // Allow text to wrap
    // textAlign: 'center', // Removed center alignment
    // marginTop: 10, // Removed top margin as it's handled by container
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, // Increased vertical padding
    paddingHorizontal: 15, // Increased horizontal padding
    borderRadius: 6, // Slightly larger radius
  },
  actionButtonText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  bold: { fontWeight: 'bold' },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    marginTop: 5, // Add some top margin
  },
  segmentButton: {
    flex: 1, // Each button takes half the width
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: useThemeColor({}, 'buttonPrimaryBackground'), // Use primary color for border
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    marginRight: -1, // Overlap borders slightly
  },
  segmentButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  segmentActive: {
    // Active background color is set inline using themedPrimaryButtonBg
  },
  segmentInactive: {
    backgroundColor: useThemeColor({}, 'cardBackground'), // Use card background for inactive
  },
  segmentText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: useThemeColor({}, 'buttonPrimaryText'), // White text on active
  },
  segmentTextInactive: {
    color: useThemeColor({}, 'buttonPrimaryBackground'), // Primary color text on inactive
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Keep space-around or use flex-wrap
    flexWrap: 'wrap', // Allow filters to wrap on smaller screens
    marginBottom: 10, // Reduced margin
    // Removed marginTop as segmented control provides top spacing
  },
  filterButton: {
    paddingVertical: 6, // Slightly smaller padding
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3, // Add small margin for wrapped items
  },
  filterButtonText: {
    fontSize: 12, // Slightly smaller text
    fontWeight: '600',
  },
  listContentContainer: {
     paddingBottom: 20, // Ensure last item isn't hidden
  }
});
 
export default SwapStatusScreen;