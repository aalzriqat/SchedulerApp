import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import swapReducer from './slices/swapSlice';
import preferenceReducer from './slices/preferenceSlice';
import leaveReducer from './slices/leaveSlice';
import employeeScheduleReducer from './slices/employeeScheduleSlice'; // Import the new employeeScheduleReducer
import newsReducer from './slices/newsSlice'; // Import the newsReducer
import profileReducer from './slices/profileSlice'; // Import the profileReducer
import analyticsReducer from './slices/analyticsSlice'; // Import the analyticsReducer
import notificationReducer from './slices/notificationSlice'; // Import the notificationReducer

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    swaps: swapReducer,
    preferences: preferenceReducer,
    leaves: leaveReducer,
    employeeSchedule: employeeScheduleReducer, // Add the employeeScheduleReducer to the store
    news: newsReducer, // Add the newsReducer to the store
    profile: profileReducer, // Add the profileReducer to the store
    analytics: analyticsReducer, // Add the analyticsReducer to the store
    notifications: notificationReducer, // Add the notificationReducer to the store
  },
});

/**
 * @typedef {ReturnType<store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

export default store;