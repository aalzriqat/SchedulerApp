import { configureStore } from '@reduxjs/toolkit';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import swapReducer from './slices/swapSlice';
import preferenceReducer from './slices/preferenceSlice';
import leaveReducer from './slices/leaveSlice';
import employeeScheduleReducer from './slices/employeeScheduleSlice'; // Import the new employeeScheduleReducer

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    swaps: swapReducer,
    preferences: preferenceReducer,
    leaves: leaveReducer,
    employeeSchedule: employeeScheduleReducer, // Add the employeeScheduleReducer to the store
  },
});

export default store;