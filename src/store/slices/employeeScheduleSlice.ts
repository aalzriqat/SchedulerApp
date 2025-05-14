import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getEmployeeSchedule,
  updateShiftSwapAvailability,
  BackendShift,
  getAllSchedulesAdmin,
  uploadScheduleDataAdmin,
  PopulatedScheduleEntry, // Changed from AdminScheduleView
  getFilteredAvailableShiftsApi // Added for new thunk
} from '../../api/apiService';
import { User } from './authSlice';

// Frontend Shift type, should include isAvailableForSwap
export interface Shift extends BackendShift {
  // isAvailableForSwap is already optional in BackendShift, so it's inherited
}

interface EmployeeScheduleState {
  shifts: Shift[]; // For individual employee view
  allEmployeeSchedules: PopulatedScheduleEntry[]; // For admin view, changed type
  isLoading: boolean; // For individual employee schedule
  isLoadingAllAdmin: boolean; // For admin fetching all schedules
  isUploadingAdmin: boolean; // For admin uploading schedule
  error: string | null;
  errorAllAdmin: string | null;
  errorUploadingAdmin: string | null;
  uploadSuccessMessageAdmin: string | null;
  // New state fields for filtered swappable shifts
  filteredSwappableShifts: BackendShift[];
  isLoadingFilteredSwappable: boolean;
  errorFilteredSwappable: string | null;
}

const initialState: EmployeeScheduleState = {
  shifts: [],
  allEmployeeSchedules: [],
  isLoading: false,
  isLoadingAllAdmin: false,
  isUploadingAdmin: false,
  error: null,
  errorAllAdmin: null,
  errorUploadingAdmin: null,
  uploadSuccessMessageAdmin: null,
  // Initialize new state fields
  filteredSwappableShifts: [],
  isLoadingFilteredSwappable: false,
  errorFilteredSwappable: null,
};

export const fetchUserSchedule = createAsyncThunk<
  Shift[],
  string,
  { rejectValue: string }
>('employeeSchedule/fetchUserSchedule', async (employeeId, thunkAPI) => {
  console.log(`fetchUserSchedule: Thunk started for employeeId: ${employeeId}`);
  try {
    const backendShifts = await getEmployeeSchedule(employeeId);
    // console.log('fetchUserSchedule: API response received:', JSON.stringify(backendShifts, null, 2));
    if (!Array.isArray(backendShifts)) {
      console.error('fetchUserSchedule: API response is not an array:', backendShifts);
      return thunkAPI.rejectWithValue('Invalid data format from server.');
    }
    const shifts: Shift[] = backendShifts.map(shift => ({
      ...shift,
    }));
    // console.log('fetchUserSchedule: Processed shifts:', JSON.stringify(shifts, null, 2));
    return shifts;
  } catch (error: any) {
    console.error('fetchUserSchedule: Error in thunk:', error);
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch schedule via thunk');
  }
});

// Async thunk for updating individual shift swap availability
export const updateUserShiftAvailability = createAsyncThunk<
  Shift, // Return type: the updated shift from backend
  { scheduleId: string; isAvailableForSwap: boolean }, // Argument type
  { rejectValue: string }
>('employeeSchedule/updateUserShiftAvailability', async (payload, thunkAPI) => {
  console.log(`updateUserShiftAvailability: Thunk started for scheduleId: ${payload.scheduleId} to ${payload.isAvailableForSwap}`);
  try {
    const updatedShift = await updateShiftSwapAvailability(payload.scheduleId, payload.isAvailableForSwap);
    console.log('updateUserShiftAvailability: API response received:', updatedShift);
    return updatedShift as Shift; 
  } catch (error: any) {
    console.error('updateUserShiftAvailability: Error in thunk:', error);
    return thunkAPI.rejectWithValue(error.message || 'Failed to update swap availability');
  }
});

// Thunk for Admin to fetch all schedules
export const fetchAllSchedulesForAdmin = createAsyncThunk<
  PopulatedScheduleEntry[], // Changed type
  void, // No argument needed
  { rejectValue: string }
>('employeeSchedule/fetchAllSchedulesForAdmin', async (_, thunkAPI) => {
  try {
    const data = await getAllSchedulesAdmin();
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch all schedules for admin');
  }
});

// Thunk for Admin to upload schedule data
export const uploadScheduleByAdmin = createAsyncThunk<
  { message: string, newSchedules?: any }, // Expected success response
  any, // scheduleData: type depends on how upload is handled (e.g., string for CSV, object for JSON)
  { rejectValue: string }
>('employeeSchedule/uploadScheduleByAdmin', async (scheduleData, thunkAPI) => {
  try {
    const response = await uploadScheduleDataAdmin(scheduleData);
    // Optionally, if response contains newSchedules, dispatch another action or handle here
    // For now, just returning the message.
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to upload schedule data');
  }
});

// Thunk for fetching filtered available shifts for swap
export const fetchFilteredAvailableShifts = createAsyncThunk<
  BackendShift[], // Return type
  { week: number; excludeUserId: string }, // Argument type
  { rejectValue: string }
>('employeeSchedule/fetchFilteredAvailableShifts', async (params, thunkAPI) => {
  try {
    const data = await getFilteredAvailableShiftsApi(params.week, params.excludeUserId); // Removed 'api.'
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || 'Failed to fetch filtered available shifts');
  }
});


const employeeScheduleSlice = createSlice({
  name: 'employeeSchedule',
  initialState,
  reducers: {
    updateShiftAvailabilityOptimistic: (
      state,
      action: PayloadAction<{ shiftId: string; isAvailableForSwap: boolean }>
    ) => {
      const index = state.shifts.findIndex(shift => shift._id === action.payload.shiftId);
      if (index !== -1) {
        state.shifts[index].isOpenForSwap = action.payload.isAvailableForSwap; // Corrected field name
      }
      // Also update in allEmployeeSchedules if the shift exists there
      // This logic might need adjustment as allEmployeeSchedules is now a flat list of PopulatedScheduleEntry
      // Each item in allEmployeeSchedules *is* a schedule/shift itself.
      state.allEmployeeSchedules.forEach(scheduleEntry => {
        if (scheduleEntry._id === action.payload.shiftId) {
          scheduleEntry.isOpenForSwap = action.payload.isAvailableForSwap;
        }
      });
    },
    clearEmployeeScheduleErrors: (state) => { // Renamed for clarity
      state.error = null;
      state.errorAllAdmin = null;
      state.errorUploadingAdmin = null;
      state.uploadSuccessMessageAdmin = null;
      state.errorFilteredSwappable = null; // Clear this error too
    },
    resetUploadStatusAdmin: (state) => {
      state.isUploadingAdmin = false;
      state.errorUploadingAdmin = null;
      state.uploadSuccessMessageAdmin = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Schedule (Employee)
      .addCase(fetchUserSchedule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSchedule.fulfilled, (state, action: PayloadAction<Shift[]>) => {
        state.isLoading = false;
        state.shifts = action.payload;
      })
      .addCase(fetchUserSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to fetch schedule';
      })
      // Update User Shift Availability (Employee)
      .addCase(updateUserShiftAvailability.pending, (state) => {
        // state.isLoading = true; // Or a more specific loading state
        state.error = null;
      })
      .addCase(updateUserShiftAvailability.fulfilled, (state, action: PayloadAction<Shift>) => {
        // state.isLoading = false;
        const index = state.shifts.findIndex(shift => shift._id === action.payload._id);
        if (index !== -1) {
          state.shifts[index] = action.payload;
        }
         // Also update in allEmployeeSchedules if the shift exists there
        // Each item in allEmployeeSchedules *is* a schedule/shift itself.
        const scheduleIndex = state.allEmployeeSchedules.findIndex(s => s._id === action.payload._id);
        if (scheduleIndex !== -1) {
          // Ensure the payload matches the structure of PopulatedScheduleEntry or map it
          // For now, assuming action.payload is compatible or this update is primarily for 'shifts' state
          // This part might need more careful handling if action.payload is just a 'Shift'
          // and allEmployeeSchedules expects more (like the populated user).
          // However, updateUserShiftAvailability returns a BackendShift, which PopulatedScheduleEntry extends.
          // We need to ensure the 'user' part is preserved if it was there.
          // A safer update might be:
          // state.allEmployeeSchedules[scheduleIndex] = { ...state.allEmployeeSchedules[scheduleIndex], ...action.payload };
          // For now, direct assignment if structure is compatible:
           state.allEmployeeSchedules[scheduleIndex].isOpenForSwap = action.payload.isOpenForSwap;
           // If other fields from action.payload (a Shift) need updating:
           state.allEmployeeSchedules[scheduleIndex].workingHours = action.payload.workingHours;
           state.allEmployeeSchedules[scheduleIndex].offDays = action.payload.offDays;
           // etc. for fields common between Shift and PopulatedScheduleEntry's shift part
        }
      })
      .addCase(updateUserShiftAvailability.rejected, (state, action) => {
        // state.isLoading = false;
        state.error = action.payload ?? 'Failed to update swap availability';
      })
      // Fetch All Schedules (Admin)
      .addCase(fetchAllSchedulesForAdmin.pending, (state) => {
        state.isLoadingAllAdmin = true;
        state.errorAllAdmin = null;
      })
      .addCase(fetchAllSchedulesForAdmin.fulfilled, (state, action: PayloadAction<PopulatedScheduleEntry[]>) => {
        state.isLoadingAllAdmin = false;
        state.allEmployeeSchedules = action.payload;
      })
      .addCase(fetchAllSchedulesForAdmin.rejected, (state, action) => {
        state.isLoadingAllAdmin = false;
        state.errorAllAdmin = action.payload ?? 'Failed to fetch all schedules';
      })
      // Upload Schedule (Admin)
      .addCase(uploadScheduleByAdmin.pending, (state) => {
        state.isUploadingAdmin = true;
        state.errorUploadingAdmin = null;
        state.uploadSuccessMessageAdmin = null;
      })
      .addCase(uploadScheduleByAdmin.fulfilled, (state, action: PayloadAction<{ message: string, newSchedules?: any }>) => {
        state.isUploadingAdmin = false;
        state.uploadSuccessMessageAdmin = action.payload.message;
        // Optionally, if newSchedules are returned and structured correctly, update allEmployeeSchedules
        // This might require a more sophisticated merge or replace strategy.
        // For now, admin might need to re-fetch all schedules to see uploaded ones.
      })
      .addCase(uploadScheduleByAdmin.rejected, (state, action) => {
        state.isUploadingAdmin = false;
        state.errorUploadingAdmin = action.payload ?? 'Failed to upload schedule';
      })
      // Fetch Filtered Available Shifts
      .addCase(fetchFilteredAvailableShifts.pending, (state) => {
        state.isLoadingFilteredSwappable = true;
        state.errorFilteredSwappable = null;
      })
      .addCase(fetchFilteredAvailableShifts.fulfilled, (state, action: PayloadAction<BackendShift[]>) => {
        state.isLoadingFilteredSwappable = false;
        state.filteredSwappableShifts = action.payload;
      })
      .addCase(fetchFilteredAvailableShifts.rejected, (state, action) => {
        state.isLoadingFilteredSwappable = false;
        state.errorFilteredSwappable = action.payload ?? 'Failed to fetch filtered shifts';
      });
  },
});

export const { updateShiftAvailabilityOptimistic, clearEmployeeScheduleErrors, resetUploadStatusAdmin } = employeeScheduleSlice.actions;
export default employeeScheduleSlice.reducer;