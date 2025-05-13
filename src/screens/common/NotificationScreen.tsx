import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl as RNRefreshControl } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store'; // Adjust path if needed
import { fetchNotifications, Notification } from '../../store/slices/notificationSlice'; // Import fetch action and type
import { FontAwesome } from '@expo/vector-icons'; // For error/empty icons
import { useThemeColor } from '@/hooks/useThemeColor'; // For themed colors

// Mock data removed, will fetch from Redux store

type NotificationItemProps = {
  item: Notification; // Use imported Notification type
};

const NotificationItem: React.FC<NotificationItemProps> = ({ item }) => {
  const router = useRouter();
  // TODO: Add theme colors if needed for item styling
  const themedCardBackgroundColor = useThemeColor({}, 'cardBackground');
  const themedBorderColor = useThemeColor({}, 'border');
  const themedPrimaryText = useThemeColor({}, 'text');
  const themedSecondaryText = useThemeColor({}, 'subtleText');
  const themedUnreadBorder = useThemeColor({}, 'tint'); // Example: Use tint color for unread border

  const handlePress = () => {
    // TODO: Mark notification as read locally/on server

    switch (item.type) {
      case 'swap':
        // Safely access params.swapId
        if (item.params?.swapId) {
          console.log(`Navigating to swap details for ID: ${item.params.swapId}`);
          // Duplicate logs removed for clarity during fix
          router.push({ pathname: '/(app)/(tabs)/(employee)/swapStatus', params: { swapId: item.params.swapId } });
        } else {
          console.warn(`Swap notification clicked but missing swapId in params. Navigating to general swap status.`);
          router.push('/(app)/(tabs)/(employee)/swapStatus'); // Fallback navigation
        }
        break;
      case 'schedule':
        console.log('Navigating to schedule screen');
        router.push('/(app)/(tabs)/(employee)/employeeSchedule'); // Use full path
        break;
      case 'leave':
        // Safely access params.leaveId
        if (item.params?.leaveId) {
          console.log(`Navigating to leave details for ID: ${item.params.leaveId}`);
          router.push({ pathname: '/(app)/(tabs)/(employee)/leave/leaveStatus', params: { leaveId: item.params.leaveId } });
        } else {
           console.warn(`Leave notification clicked but missing leaveId in params. Navigating to general leave status.`);
           router.push('/(app)/(tabs)/(employee)/leave/leaveStatus'); // Fallback navigation
        }
        break;
      case 'news':
         // Safely access params.newsId
         if (item.params?.newsId) {
           console.log(`Navigating to news item ID: ${item.params.newsId}`);
           router.push({ pathname: '/(app)/(tabs)/(employee)/employeeNews', params: { newsId: item.params.newsId } });
         } else {
            console.warn(`News notification clicked but missing newsId in params. Navigating to general news screen.`);
            router.push('/(app)/(tabs)/(employee)/employeeNews'); // Fallback navigation
         }
         break;
      case 'general':
      default:
        console.log('General notification clicked, no navigation.');
        // Optionally mark as read here too
        break;
    }
  };

  // Format timestamp for display
  const formattedTimestamp = item.createdAt
    ? new Date(item.createdAt).toLocaleString()
    : item.timestamp; // Fallback to original timestamp if createdAt is missing

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.itemContainer,
        { backgroundColor: themedCardBackgroundColor, borderColor: themedBorderColor },
        !item.read && { borderLeftColor: themedUnreadBorder, borderLeftWidth: 4 } // Highlight unread
      ]}
    >
      <Text style={[styles.itemTitle, { color: themedPrimaryText }]}>{item.title}</Text>
      <Text style={[styles.itemMessage, { color: themedSecondaryText }]}>{item.message}</Text>
      <Text style={[styles.itemTimestamp, { color: themedSecondaryText }]}>{formattedTimestamp}</Text>
    </TouchableOpacity>
  );
};

export default function NotificationScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, isLoading, error } = useSelector((state: RootState) => state.notifications);
  const userId = useSelector((state: RootState) => state.auth.user?.id); // Get current user ID

  const themedBackgroundColor = useThemeColor({}, 'background');
  const themedErrorTextColor = useThemeColor({}, 'errorText');
  const themedSubtleTextColor = useThemeColor({}, 'subtleText');
  const themedPrimaryButtonBg = useThemeColor({}, 'buttonPrimaryBackground');

  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications());
    }
    // Consider if refetching is needed under other circumstances
  }, [dispatch, userId]);

  const onRefresh = () => {
    if (userId) {
      dispatch(fetchNotifications());
    }
  };

  // TODO: Implement mark as read functionality (e.g., dispatch markNotificationAsRead on handlePress)

  if (isLoading && notifications.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centered, { backgroundColor: themedBackgroundColor }]}>
         <Stack.Screen options={{ title: 'Notifications' }} />
         <ActivityIndicator size="large" color={themedPrimaryButtonBg} />
         <Text style={{ color: themedSubtleTextColor, marginTop: 10 }}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  const renderListEmptyComponent = () => (
    <View style={styles.emptyListContainer}>
      {error ? (
        <>
          <FontAwesome name="exclamation-triangle" size={30} color={themedErrorTextColor} />
          <Text style={[styles.emptyText, { color: themedErrorTextColor, marginTop: 10 }]}>
            Error loading notifications: {error}
          </Text>
        </>
      ) : (
        <>
          <FontAwesome name="bell-slash-o" size={30} color={themedSubtleTextColor} />
          <Text style={[styles.emptyText, { color: themedSubtleTextColor, marginTop: 10 }]}>
            You have no notifications.
          </Text>
        </>
      )}
    </View>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themedBackgroundColor }]}>
      <Stack.Screen options={{ title: 'Notifications' }} />
      <FlatList
        data={notifications}
        renderItem={({ item }) => <NotificationItem item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderListEmptyComponent}
        contentContainerStyle={notifications.length === 0 ? styles.emptyListContentContainer : styles.listContentContainer}
        refreshControl={
          <RNRefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={[themedPrimaryButtonBg]} // Android
            tintColor={themedPrimaryButtonBg} // iOS
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1, // Use border instead of just left border for consistency
    // borderLeftWidth: 4, // Removed, handled conditionally
    // borderLeftColor: '#cccccc', // Removed, handled conditionally
  },
  // unreadItem style removed, handled inline with theme color
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemMessage: {
    fontSize: 14,
    marginBottom: 6, // Increased space
  },
  itemTimestamp: {
    fontSize: 12,
    textAlign: 'right',
  },
  emptyListContainer: {
    flex: 1, // Ensure it takes space
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListContentContainer: { // Style for FlatList when empty
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  listContentContainer: { // Style for FlatList when populated
      paddingBottom: 10, // Add some padding at the bottom
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10, // Adjusted margin
    fontSize: 16,
  },
});