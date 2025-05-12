import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/apiService'; // Assuming apiService will have analytics endpoints

// Define interfaces for various analytics data points
export interface ScheduleAdherenceMetric {
  totalShifts: number;
  onTimePercentage: number;
  // ... other relevant adherence data
}

export interface SwapRequestTrends {
  totalRequests: number;
  approvedPercentage: number;
  averageTimeToApprove?: string; // e.g., "2 days"
  // ... other trend data
}

export interface LeaveTrends {
  totalRequests: number;
  commonLeaveTypes: Array<{ type: string; count: number }>;
  // ... other leave trend data
}

// Example for a heatmap data structure (could be more complex)
export interface ScheduleHeatmapPoint {
  date: string; // or dayOfWeek, hourOfDay
  intensity: number; // e.g., number of shifts, requests
}

export interface AdminAnalyticsData {
  scheduleAdherence?: ScheduleAdherenceMetric;
  swapRequestTrends?: SwapRequestTrends;
  leaveTrends?: LeaveTrends;
  scheduleHeatmap?: ScheduleHeatmapPoint[];
  // ... other aggregated data
  }
  
  export interface EmployeePersonalAnalytics {
    shiftsCompleted: number;
    punctualityPercentage: number; // e.g., percentage of on-time clock-ins
    hoursWorkedThisPeriod: number; // e.g., current week/month
    // ... other personal metrics
  }
  
  interface AnalyticsState {
    adminDashboardData: AdminAnalyticsData | null;
    isLoadingAdminData: boolean;
    adminDataError: string | null;
    
    employeePersonalData: EmployeePersonalAnalytics | null;
    isLoadingEmployeeData: boolean;
    employeeDataError: string | null;
  }
  
  const initialState: AnalyticsState = {
    adminDashboardData: null,
    isLoadingAdminData: false,
    adminDataError: null,
  
    employeePersonalData: null,
    isLoadingEmployeeData: false,
    employeeDataError: null,
  };
  
  // Async Thunks for Admin Analytics
  export const fetchAdminDashboardAnalytics = createAsyncThunk<
    AdminAnalyticsData, // Return type
    void,               // Argument type (void for no argument)
  { rejectValue: string } // ThunkAPI config
>('analytics/fetchAdminDashboardAnalytics', async (_, { rejectWithValue }) => {
  try {
    // This would call a new API endpoint in apiService.ts
    // const data = await api.getAdminAnalyticsDashboard(); 
    // return data;
    // MOCKING DATA for now as backend endpoint is not defined yet
    console.warn("fetchAdminDashboardAnalytics: Using MOCK DATA. Implement backend and API call.");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    return {
      scheduleAdherence: { totalShifts: 580, onTimePercentage: 92.5 },
      swapRequestTrends: { totalRequests: 120, approvedPercentage: 75, averageTimeToApprove: "1.5 days" },
      leaveTrends: { totalRequests: 45, commonLeaveTypes: [{type: 'Vacation', count: 20}, {type: 'Sick', count: 15}] },
      scheduleHeatmap: [ // Example: Peak times for shifts
        { date: "Monday-0900", intensity: 5 }, { date: "Monday-1700", intensity: 8 },
        { date: "Tuesday-1000", intensity: 6 }, { date: "Friday-1800", intensity: 7 },
      ]
    } as AdminAnalyticsData;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch admin analytics data');
  }
});

// Async Thunk for Employee Personal Analytics
export const fetchMyPersonalAnalytics = createAsyncThunk<
  EmployeePersonalAnalytics,
  void, // Assuming it fetches for the currently logged-in user, so no specific ID needed
  { rejectValue: string }
>('analytics/fetchMyPersonalAnalytics', async (_, { rejectWithValue }) => {
  try {
    // This would call a new API endpoint: api.getMyPersonalAnalyticsData()
    // MOCKING DATA for now
    console.warn("fetchMyPersonalAnalytics: Using MOCK DATA. Implement backend and API call.");
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      shiftsCompleted: 25,
      punctualityPercentage: 98.2,
      hoursWorkedThisPeriod: 38.5,
    } as EmployeePersonalAnalytics;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch personal analytics data');
  }
});


const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAdminAnalyticsError: (state) => {
      state.adminDataError = null;
    },
    clearEmployeeAnalyticsError: (state) => {
      state.employeeDataError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin Analytics
      .addCase(fetchAdminDashboardAnalytics.pending, (state) => {
        state.isLoadingAdminData = true;
        state.adminDataError = null;
      })
      .addCase(fetchAdminDashboardAnalytics.fulfilled, (state, action: PayloadAction<AdminAnalyticsData>) => {
        state.isLoadingAdminData = false;
        state.adminDashboardData = action.payload;
      })
      .addCase(fetchAdminDashboardAnalytics.rejected, (state, action) => {
        state.isLoadingAdminData = false;
        state.adminDataError = action.payload as string;
      })
      // Employee Personal Analytics
      .addCase(fetchMyPersonalAnalytics.pending, (state) => {
        state.isLoadingEmployeeData = true;
        state.employeeDataError = null;
      })
      .addCase(fetchMyPersonalAnalytics.fulfilled, (state, action: PayloadAction<EmployeePersonalAnalytics>) => {
        state.isLoadingEmployeeData = false;
        state.employeePersonalData = action.payload;
      })
      .addCase(fetchMyPersonalAnalytics.rejected, (state, action) => {
        state.isLoadingEmployeeData = false;
        state.employeeDataError = action.payload as string;
      });
  },
});

export const { clearAdminAnalyticsError, clearEmployeeAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;