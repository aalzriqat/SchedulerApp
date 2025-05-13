import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getNotificationsApi } from '../../api/apiService'; // Assuming an API function exists
import { RootState } from '../store'; // Import RootState for thunk getState

// Define the structure of a single notification
// Match the structure used in NotificationScreen, including routing info
export interface Notification {
  id: string; // Use _id from backend if applicable
  type: 'swap' | 'schedule' | 'leave' | 'news' | 'general' | string; // Allow other types
  title: string;
  message: string;
  timestamp: string; // Or Date object if preferred
  read: boolean;
  params?: Record<string, any>; // For navigation parameters
  createdAt?: string; // Optional: from backend
  updatedAt?: string; // Optional: from backend
}

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isLoading: false,
  error: null,
};

// Async thunk to fetch notifications for the current user
export const fetchNotifications = createAsyncThunk<
  Notification[], // Return type of the payload creator
  void,           // First argument to the payload creator (void means no argument needed here)
  { state: RootState } // Types for ThunkAPI
>(
  'notifications/fetchNotifications',
  async (_, { getState, rejectWithValue }) => {
    const userId = getState().auth.user?.id;
    if (!userId) {
      return rejectWithValue('User not authenticated');
    }
    try {
      console.log(`[NotificationSlice] Fetching notifications for user: ${userId}`);
      // Assuming getNotificationsApi takes userId and returns Notification[]
      const notifications = await getNotificationsApi(userId); 
      console.log(`[NotificationSlice] Received ${notifications.length} notifications.`);
      // TODO: Adapt if API returns a different structure
      return notifications; 
    } catch (error: any) {
      console.error('[NotificationSlice] Error fetching notifications:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Reducer to clear notifications, typically called on logout
    clearNotifications: (state) => {
      state.notifications = [];
      state.isLoading = false;
      state.error = null;
      console.log('[NotificationSlice] Notifications cleared.');
    },
    // Optional: Reducer to mark a notification as read locally
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    // Optional: Reducer to add a single notification (e.g., from push notification)
    addNotification: (state, action: PayloadAction<Notification>) => {
        // Avoid duplicates if needed
        if (!state.notifications.some(n => n.id === action.payload.id)) {
            state.notifications.unshift(action.payload); // Add to the beginning
        }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.isLoading = false;
        // Sort notifications, newest first (assuming createdAt exists)
        state.notifications = action.payload.sort((a, b) => 
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        );
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearNotifications, markNotificationAsRead, addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;