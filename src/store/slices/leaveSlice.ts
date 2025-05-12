import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/apiService'; // Assuming apiService handles actual API calls

// Re-exporting LeaveRequest type from apiService for consistency, or define it here if preferred
export type { LeaveRequest, LeaveRequestPayload } from '../../api/apiService';
import { LeaveRequest, LeaveRequestPayload } from '../../api/apiService';


interface LeaveState {
  leaveRequests: LeaveRequest[]; // For both employee's own and all requests (admin)
  isLoading: boolean;
  isSubmitting: boolean; // For new request submission
  isUpdating: boolean; // For admin updates or employee cancellations
  error: string | null;
  submitError: string | null;
  updateError: string | null;
}

const initialState: LeaveState = {
  leaveRequests: [],
  isLoading: false,
  isSubmitting: false,
  isUpdating: false,
  error: null,
  submitError: null,
  updateError: null,
};

// Async Thunks

// Fetch leave requests (can be for current user or all, depending on API called by component)
export const fetchMyLeaveRequests = createAsyncThunk(
  'leaves/fetchMyLeaveRequests',
  async (userId: string, { rejectWithValue }) => { // Added userId argument
    try {
      const data = await api.getMyLeaveRequests(userId); // Pass userId
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch leave requests');
    }
  }
);

export const fetchAllLeaveRequestsAdmin = createAsyncThunk(
  'leaves/fetchAllLeaveRequestsAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getAllLeaveRequests();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all leave requests');
    }
  }
);

export const submitNewLeaveRequest = createAsyncThunk(
  'leaves/submitNewLeaveRequest',
  async (leaveData: LeaveRequestPayload, { rejectWithValue }) => {
    try {
      const data = await api.submitLeaveRequest(leaveData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit leave request');
    }
  }
);

export const updateLeaveStatusAdmin = createAsyncThunk(
  'leaves/updateLeaveStatusAdmin',
  async (
    { leaveId, status, adminNotes }: { leaveId: string; status: 'approved' | 'rejected'; adminNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await api.updateLeaveRequestStatusAdmin(leaveId, status, adminNotes);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update leave status');
    }
  }
);

export const cancelMyLeaveRequest = createAsyncThunk(
  'leaves/cancelMyLeaveRequest',
  async (leaveId: string, { rejectWithValue }) => {
    try {
      const data = await api.cancelLeaveRequestEmployee(leaveId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel leave request');
    }
  }
);


const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearLeaveErrors: (state) => {
      state.error = null;
      state.submitError = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Leave Requests
      .addCase(fetchMyLeaveRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaveRequests.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
        state.isLoading = false;
        state.leaveRequests = action.payload;
      })
      .addCase(fetchMyLeaveRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch All Leave Requests (Admin)
      .addCase(fetchAllLeaveRequestsAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllLeaveRequestsAdmin.fulfilled, (state, action: PayloadAction<LeaveRequest[]>) => {
        state.isLoading = false;
        state.leaveRequests = action.payload; // Overwrites with all requests for admin view
      })
      .addCase(fetchAllLeaveRequestsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit New Leave Request
      .addCase(submitNewLeaveRequest.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitNewLeaveRequest.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isSubmitting = false;
        state.leaveRequests.push(action.payload); // Add to current list
      })
      .addCase(submitNewLeaveRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      })
      // Update Leave Status (Admin)
      .addCase(updateLeaveStatusAdmin.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateLeaveStatusAdmin.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isUpdating = false;
        const index = state.leaveRequests.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.leaveRequests[index] = action.payload;
        }
      })
      .addCase(updateLeaveStatusAdmin.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // Cancel My Leave Request (Employee)
      .addCase(cancelMyLeaveRequest.pending, (state) => {
        state.isUpdating = true; // Re-use isUpdating or create isCancelling
        state.updateError = null;
      })
      .addCase(cancelMyLeaveRequest.fulfilled, (state, action: PayloadAction<LeaveRequest>) => {
        state.isUpdating = false;
        const index = state.leaveRequests.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.leaveRequests[index] = action.payload;
        }
      })
      .addCase(cancelMyLeaveRequest.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string; // Re-use updateError or create cancelError
      });
  },
});

export const { clearLeaveErrors } = leaveSlice.actions;

export default leaveSlice.reducer;