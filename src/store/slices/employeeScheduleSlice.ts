import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeSchedule, updateShiftSwapAvailability, BackendShift } from '../../api/apiService';
import { User } from './authSlice';

// Frontend Shift type, should include isAvailableForSwap
export interface Shift extends BackendShift {
  // isAvailableForSwap is already optional in BackendShift, so it's inherited
}

interface EmployeeScheduleState {
  shifts: Shift[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeeScheduleState = {
  shifts: [],
  isLoading: false,
  error: null,
};

export const fetchUserSchedule = createAsyncThunk<
  Shift[], 
  string, 
  { rejectValue: string }
>('employeeSchedule/fetchUserSchedule', async (employeeId, thunkAPI) => {
  console.log(`fetchUserSchedule: Thunk started for employeeId: ${employeeId}`);
  try {
    const backendShifts = await getEmployeeSchedule(employeeId);
    console.log('fetchUserSchedule: API response received:', JSON.stringify(backendShifts, null, 2));
    if (!Array.isArray(backendShifts)) {
      console.error('fetchUserSchedule: API response is not an array:', backendShifts);
      return thunkAPI.rejectWithValue('Invalid data format from server.');
    }
    const shifts: Shift[] = backendShifts.map(shift => ({
      ...shift,
    }));
    console.log('fetchUserSchedule: Processed shifts:', JSON.stringify(shifts, null, 2));
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
        state.shifts[index].isAvailableForSwap = action.payload.isAvailableForSwap;
      }
    },
    clearEmployeeScheduleError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateUserShiftAvailability.pending, (state) => {
        state.error = null; 
      })
      .addCase(updateUserShiftAvailability.fulfilled, (state, action: PayloadAction<Shift>) => {
        const index = state.shifts.findIndex(shift => shift._id === action.payload._id);
        if (index !== -1) {
          state.shifts[index] = action.payload; 
        }
      })
      .addCase(updateUserShiftAvailability.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update swap availability';
      });
  },
});

export const { updateShiftAvailabilityOptimistic, clearEmployeeScheduleError } = employeeScheduleSlice.actions;
export default employeeScheduleSlice.reducer;