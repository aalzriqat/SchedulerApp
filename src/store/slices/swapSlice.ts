import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from './authSlice'; // Assuming User type is exported from authSlice

// Define a type for a Shift (can be imported or redefined if more specific here)
interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  location: string;
  employeeId?: string;
  employeeName?: string;
}

export interface SwapRequest {
  id: string;
  requesterUser: Pick<User, 'name' | 'email' | 'id'> & { id: string }; // Ensure 'id' is available
  responderUser?: Pick<User, 'name' | 'email' | 'id'> & { id: string }; // User whose shift is being taken (if applicable)
  offeredShift: Shift; // Shift offered by the requester
  requestedShift?: Shift; // Shift requested from another employee (target of the swap)
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'; // Status of the swap request
  createdAt: string; // ISO date string
  // Add any other relevant fields like notes, admin_notes, etc.
}

interface SwapState {
  sentRequests: SwapRequest[];
  receivedRequests: SwapRequest[]; // For when others request a swap with the current user
  isLoading: boolean;
  error: string | null;
}

const initialState: SwapState = {
  sentRequests: [],
  receivedRequests: [],
  isLoading: false,
  error: null,
};

// Mock initial swap requests for testing
const MOCK_SENT_SWAPS: SwapRequest[] = [
  {
    id: 'swap001',
    requesterUser: { id: 'currentUserEmpId', name: 'Current Employee', email: 'employee@test.com' },
    offeredShift: { id: '3', date: '2025-05-15', startTime: '08:00', endTime: '16:00', role: 'CSA', location: 'Main Branch', employeeId: 'currentUserEmpId', employeeName: 'Current Employee' },
    requestedShift: { id: '101', date: '2025-05-12', startTime: '09:00', endTime: '17:00', role: 'CSA', location: 'Main Branch', employeeId: 'emp002', employeeName: 'Jane Doe' },
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
];
const MOCK_RECEIVED_SWAPS: SwapRequest[] = [
   {
    id: 'swap002',
    requesterUser: { id: 'emp003', name: 'John Smith', email: 'john.s@test.com' },
    offeredShift: { id: '102', date: '2025-05-13', startTime: '14:00', endTime: '22:00', role: 'CSA', location: 'West Wing', employeeId: 'emp003', employeeName: 'John Smith' },
    requestedShift: { id: '4', date: '2025-05-17', startTime: '12:00', endTime: '20:00', role: 'CSA', location: 'Support Desk', employeeId: 'currentUserEmpId', employeeName: 'Current Employee' },
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
];


const swapSlice = createSlice({
  name: 'swaps',
  // initialState, // Use mock data for initial state for now
  initialState: { // Initialize with mock data for easier UI development
    sentRequests: MOCK_SENT_SWAPS,
    receivedRequests: MOCK_RECEIVED_SWAPS,
    isLoading: false,
    error: null,
  } as SwapState, // Cast to SwapState to satisfy TypeScript with mock data
  reducers: {
    fetchSwapsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSwapsSuccess: (state, action: PayloadAction<{ sent: SwapRequest[]; received: SwapRequest[] }>) => {
      state.isLoading = false;
      state.sentRequests = action.payload.sent;
      state.receivedRequests = action.payload.received;
    },
    fetchSwapsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createSwapRequestStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    createSwapRequestSuccess: (state, action: PayloadAction<SwapRequest>) => {
      state.isLoading = false;
      state.sentRequests.push(action.payload);
    },
    createSwapRequestFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Add actions for cancelSwap, respondToSwap (approve/reject for employee if they are responder)
    // Admin actions (approve/reject any) will be separate or have role checks.
    clearSwapError: (state) => {
      state.error = null;
    }
  },
  // Later, add extraReducers for async thunks
});

export const {
  fetchSwapsStart,
  fetchSwapsSuccess,
  fetchSwapsFailure,
  createSwapRequestStart,
  createSwapRequestSuccess,
  createSwapRequestFailure,
  clearSwapError,
} = swapSlice.actions;

export default swapSlice.reducer;