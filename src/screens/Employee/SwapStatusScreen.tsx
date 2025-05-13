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
import { useMemo } from 'react'; // Import useMemo

// Define styles inside the component or use a hook/function that has access to themed variables
const getStyles = (
  themedBackgroundColor: string,
  themedTextColor: string,
  themedBorderColor: string,
  themedCardBackgroundColor: string,
  themedSubtleTextColor: string,
  themedErrorTextColor: string,
  themedPrimaryButtonBg: string,
  themedPrimaryButtonText: string,
  themedErrorContainerBg: string, // Pass this in
  themedStatusApprovedBg: string,
  themedStatusApprovedText: string,
  themedStatusRejectedBg: string,
  themedStatusRejectedText: string,
  themedStatusPendingBg: string,
  themedStatusPendingText: string,
  themedStatusCancelledBg: string,
  themedStatusCancelledText: string,
  themedDefaultStatusBg: string,
  themedDefaultStatusText: string
) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: themedBackgroundColor, // Apply themed background
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: themedTextColor, // Apply themed text color
  },
  swapItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: themedCardBackgroundColor, // Apply themed card background
    borderColor: themedBorderColor, // Apply themed border color
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
    color: themedTextColor,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    // color is set dynamically by getStatusStyle
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    // backgroundColor is set dynamically by getStatusStyle
  },
  statusIcon: {
    marginRight: 5,
  },
  shiftDetailContainer: {
    marginTop: 10,
    paddingLeft: 12,
    borderLeftWidth: 3,
    marginBottom: 10,
    borderLeftColor: themedPrimaryButtonBg, // Apply themed color
  },
  shiftTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 5,
    color: themedTextColor,
  },
  shiftInfoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  shiftInfoLabel: {
    fontWeight: 'bold',
    marginRight: 5,
    fontSize: 14,
    minWidth: 70,
    color: themedTextColor,
  },
  shiftInfoValue: {
    fontSize: 14,
    flexShrink: 1,
    color: themedTextColor,
  },
  shiftInfoText: {
     fontSize: 14,
     marginBottom: 8,
     color: themedSubtleTextColor, // Apply themed subtle text color
     fontStyle: 'italic',
  },
  notes: {
    marginTop: 8,
    color: themedTextColor,
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
    color: themedSubtleTextColor,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    flexGrow: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themedErrorContainerBg, // THIS IS THE KEY CHANGE
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 5,
    marginHorizontal: 0,
  },
  errorText: {
    flex: 1,
    color: themedErrorTextColor, // Apply themed error text color
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    // backgroundColor is set dynamically
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    // color is set dynamically
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    marginTop: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    // backgroundColor and borderColor are set dynamically
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    // color is set dynamically
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: themedTextColor, // Assuming bold text should also be themed
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: themedPrimaryButtonBg,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonLeft: {},
  segmentButtonRight: {},
  segmentActive: {
    backgroundColor: themedPrimaryButtonBg,
  },
  segmentInactive: {
    backgroundColor: themedCardBackgroundColor, // Use a themed inactive background
  },
  segmentText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  segmentTextActive: {
    color: themedPrimaryButtonText,
  },
  segmentTextInactive: {
    color: themedPrimaryButtonBg, // Or themedTextColor for better contrast on themedCardBackground
  },
});

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
  const [activeFilter, setActiveFilter] = useState<SwapStatusFilter>('All');
 
  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedTextColor = useThemeColor({}, 'text');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');
  const themedPrimaryButtonText = useThemeColor({}, 'buttonPrimaryText');
  const themedErrorContainerBg = useThemeColor({ light: '#FFCDD2', dark: '#C62828' }, 'statusRejectedBackground');

  const themedStatusApprovedBg = useThemeColor({}, 'statusApprovedBackground');
  const themedStatusApprovedText = useThemeColor({}, 'statusApprovedText');
  const themedStatusRejectedBg = useThemeColor({}, 'statusRejectedBackground');
  const themedStatusRejectedText = useThemeColor({}, 'statusRejectedText');
  const themedStatusPendingBg = useThemeColor({}, 'statusPendingBackground');
  const themedStatusPendingText = useThemeColor({}, 'statusPendingText');
  const themedStatusCancelledBg = useThemeColor({}, 'statusCancelledBackground');
  const themedStatusCancelledText = useThemeColor({}, 'statusCancelledText');
  const themedDefaultStatusBg = useThemeColor({}, 'cardBackground');
  const themedDefaultStatusText = useThemeColor({}, 'text');

  // Memoize styles to prevent recreation on every render unless theme variables change
  const styles = useMemo(() => getStyles(
    themedBackgroundColor,
    themedTextColor,
    themedBorderColor,
    themedCardBackgroundColor,
    themedSubtleTextColor,
    themedErrorTextColor,
    themedPrimaryButtonBg,
    themedPrimaryButtonText,
    themedErrorContainerBg,
    themedStatusApprovedBg,
    themedStatusApprovedText,
    themedStatusRejectedBg,
    themedStatusRejectedText,
    themedStatusPendingBg,
    themedStatusPendingText,
    themedStatusCancelledBg,
    themedStatusCancelledText,
    themedDefaultStatusBg,
    themedDefaultStatusText
  ), [
    themedBackgroundColor, themedTextColor, themedBorderColor, themedCardBackgroundColor,
    themedSubtleTextColor, themedErrorTextColor, themedPrimaryButtonBg, themedPrimaryButtonText,
    themedErrorContainerBg, themedStatusApprovedBg, themedStatusApprovedText, themedStatusRejectedBg,
    themedStatusRejectedText, themedStatusPendingBg, themedStatusPendingText, themedStatusCancelledBg,
    themedStatusCancelledText, themedDefaultStatusBg, themedDefaultStatusText
  ]);

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

export default SwapStatusScreen;