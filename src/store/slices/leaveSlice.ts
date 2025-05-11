import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define LeaveRequest type here
export interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submittedAt: string;
  // adminNotes?: string;
}

interface LeaveState {
  leaveRequests: LeaveRequest[];
  isLoading: boolean;
  error: string | null;
}

// Use the mock data from LeaveStatusScreen for initial state for now
const MOCK_LEAVE_REQUESTS_INITIAL: LeaveRequest[] = [
  { id: 'leave001', leaveType: 'Vacation', startDate: '2025-06-01', endDate: '2025-06-05', reason: 'Family trip', status: 'pending', submittedAt: new Date(2025,4,10).toISOString() },
  { id: 'leave002', leaveType: 'Sick Leave', startDate: '2025-04-20', endDate: '2025-04-21', reason: 'Flu', status: 'approved', submittedAt: new Date(2025,3,19).toISOString() },
];

const initialState: LeaveState = {
  leaveRequests: MOCK_LEAVE_REQUESTS_INITIAL,
  isLoading: false,
  error: null,
};

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    fetchLeaveRequestsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchLeaveRequestsSuccess: (state, action: PayloadAction<LeaveRequest[]>) => {
      state.isLoading = false;
      state.leaveRequests = action.payload;
    },
    fetchLeaveRequestsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    submitLeaveRequestStart: (state, action: PayloadAction<Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>>) => {
      state.isLoading = true;
      state.error = null;
      // In a real app, you wouldn't add to state here until API confirms
    },
    submitLeaveRequestSuccess: (state, action: PayloadAction<LeaveRequest>) => {
      state.isLoading = false;
      state.leaveRequests.push(action.payload);
    },
    submitLeaveRequestFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Add cancelLeaveRequest actions etc.
    clearLeaveError: (state) => {
      state.error = null;
    }
  },
});

export const {
  fetchLeaveRequestsStart,
  fetchLeaveRequestsSuccess,
  fetchLeaveRequestsFailure,
  submitLeaveRequestStart,
  submitLeaveRequestSuccess,
  submitLeaveRequestFailure,
  clearLeaveError,
} = leaveSlice.actions;

export default leaveSlice.reducer;