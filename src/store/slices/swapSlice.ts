import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../api/apiService';

// Re-exporting types from apiService for consistency
export type { APISwapRequest, CreateSwapRequestPayload } from '../../api/apiService';
import { APISwapRequest, CreateSwapRequestPayload } from '../../api/apiService';


interface SwapState {
  mySentRequests: APISwapRequest[];
  myReceivedRequests: APISwapRequest[];
  allSwapRequestsAdmin: APISwapRequest[]; // For admin view

  isLoadingMySwaps: boolean;
  isLoadingAllSwapsAdmin: boolean;
  isCreatingSwap: boolean;
  isRespondingToSwap: boolean; // Employee responding to their part
  isCancellingSwap: boolean; // Employee cancelling their own
  isUpdatingSwapAdmin: boolean; // Admin approving/rejecting

  mySwapsError: string | null;
  allSwapsAdminError: string | null;
  createError: string | null;
  respondError: string | null;
  cancelError: string | null;
  updateAdminError: string | null;
}

const initialState: SwapState = {
  mySentRequests: [],
  myReceivedRequests: [],
  allSwapRequestsAdmin: [],
  isLoadingMySwaps: false,
  isLoadingAllSwapsAdmin: false,
  isCreatingSwap: false,
  isRespondingToSwap: false,
  isCancellingSwap: false,
  isUpdatingSwapAdmin: false,
  mySwapsError: null,
  allSwapsAdminError: null,
  createError: null,
  respondError: null,
  cancelError: null,
  updateAdminError: null,
};

// Async Thunks

// Employee: Fetch their sent and received swap requests
export const fetchMySwapRequests = createAsyncThunk(
  'swaps/fetchMySwapRequests',
  async (userId: string, { rejectWithValue }) => { // Added userId argument
    try {
      return await api.getMySwapRequests(userId); // Pass userId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch your swap requests');
    }
  }
);

// Employee: Create a new swap request
export const createNewSwapRequest = createAsyncThunk(
  'swaps/createNewSwapRequest',
  async (payload: CreateSwapRequestPayload, { rejectWithValue }) => {
    try {
      return await api.createSwapRequest(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create swap request');
    }
  }
);

// Employee: Respond to a swap request directed at them
export const respondToReceivedSwap = createAsyncThunk(
  'swaps/respondToReceivedSwap',
  async ({ swapId, responseStatus }: { swapId: string; responseStatus: 'accepted' | 'declined' }, { rejectWithValue }) => {
    try {
      return await api.respondToSwapRequestEmployee(swapId, responseStatus);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to respond to swap request');
    }
  }
);

// Employee: Cancel their own pending swap request
export const cancelMyPendingSwap = createAsyncThunk(
  'swaps/cancelMyPendingSwap',
  async (swapId: string, { rejectWithValue }) => {
    try {
      return await api.cancelMySwapRequestEmployee(swapId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel swap request');
    }
  }
);

// Admin: Fetch all swap requests
export const fetchAllSwapRequestsForAdmin = createAsyncThunk(
  'swaps/fetchAllSwapRequestsForAdmin',
  async (_, { rejectWithValue }) => {
    try {
      return await api.getAllSwapRequestsAdmin();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch all swap requests');
    }
  }
);

// Admin: Update status of a swap request (approve/reject)
export const updateSwapStatusByAdmin = createAsyncThunk(
  'swaps/updateSwapStatusByAdmin',
  async (
    { swapId, status, adminNotes }: { swapId: string; status: 'approved' | 'rejected'; adminNotes?: string },
    { rejectWithValue }
  ) => {
    try {
      return await api.updateSwapRequestStatusAdmin(swapId, status, adminNotes);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update swap request status');
    }
  }
);


const swapSlice = createSlice({
  name: 'swaps',
  initialState,
  reducers: {
    clearAllSwapErrors: (state) => {
      state.mySwapsError = null;
      state.allSwapsAdminError = null;
      state.createError = null;
      state.respondError = null;
      state.cancelError = null;
      state.updateAdminError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Swaps (Employee)
      .addCase(fetchMySwapRequests.pending, (state) => {
        state.isLoadingMySwaps = true;
        state.mySwapsError = null;
      })
      .addCase(fetchMySwapRequests.fulfilled, (state, action: PayloadAction<{ sent: APISwapRequest[]; received: APISwapRequest[] }>) => {
        state.isLoadingMySwaps = false;
        state.mySentRequests = action.payload.sent;
        state.myReceivedRequests = action.payload.received;
      })
      .addCase(fetchMySwapRequests.rejected, (state, action) => {
        state.isLoadingMySwaps = false;
        state.mySwapsError = action.payload as string;
      })
      // Create New Swap (Employee)
      .addCase(createNewSwapRequest.pending, (state) => {
        state.isCreatingSwap = true;
        state.createError = null;
      })
      .addCase(createNewSwapRequest.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isCreatingSwap = false;
        state.mySentRequests.unshift(action.payload); // Add to top
      })
      .addCase(createNewSwapRequest.rejected, (state, action) => {
        state.isCreatingSwap = false;
        state.createError = action.payload as string;
      })
      // Respond to Received Swap (Employee)
      .addCase(respondToReceivedSwap.pending, (state) => {
        state.isRespondingToSwap = true;
        state.respondError = null;
      })
      .addCase(respondToReceivedSwap.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isRespondingToSwap = false;
        // Update in myReceivedRequests and potentially mySentRequests if it was a direct swap response
        const updateOrRemove = (list: APISwapRequest[]) =>
          list.map(req => req._id === action.payload._id ? action.payload : req)
              .filter(req => req.status !== 'cancelled'); // Or based on how backend handles it

        state.myReceivedRequests = updateOrRemove(state.myReceivedRequests);
        // If the admin is also viewing, this might need to update allSwapRequestsAdmin too, or re-fetch.
      })
      .addCase(respondToReceivedSwap.rejected, (state, action) => {
        state.isRespondingToSwap = false;
        state.respondError = action.payload as string;
      })
      // Cancel My Pending Swap (Employee)
      .addCase(cancelMyPendingSwap.pending, (state) => {
        state.isCancellingSwap = true;
        state.cancelError = null;
      })
      .addCase(cancelMyPendingSwap.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isCancellingSwap = false;
        state.mySentRequests = state.mySentRequests.map(req => req._id === action.payload._id ? action.payload : req);
        // Potentially filter out if status is 'cancelled'
      })
      .addCase(cancelMyPendingSwap.rejected, (state, action) => {
        state.isCancellingSwap = false;
        state.cancelError = action.payload as string;
      })
      // Fetch All Swaps (Admin)
      .addCase(fetchAllSwapRequestsForAdmin.pending, (state) => {
        state.isLoadingAllSwapsAdmin = true;
        state.allSwapsAdminError = null;
      })
      .addCase(fetchAllSwapRequestsForAdmin.fulfilled, (state, action: PayloadAction<APISwapRequest[]>) => {
        state.isLoadingAllSwapsAdmin = false;
        state.allSwapRequestsAdmin = action.payload;
      })
      .addCase(fetchAllSwapRequestsForAdmin.rejected, (state, action) => {
        state.isLoadingAllSwapsAdmin = false;
        state.allSwapsAdminError = action.payload as string;
      })
      // Update Swap Status (Admin)
      .addCase(updateSwapStatusByAdmin.pending, (state) => {
        state.isUpdatingSwapAdmin = true;
        state.updateAdminError = null;
      })
      .addCase(updateSwapStatusByAdmin.fulfilled, (state, action: PayloadAction<APISwapRequest>) => {
        state.isUpdatingSwapAdmin = false;
        const index = state.allSwapRequestsAdmin.findIndex(req => req._id === action.payload._id);
        if (index !== -1) {
          state.allSwapRequestsAdmin[index] = action.payload;
        }
        // Also update in employee's lists if they happen to be the same list in some scenarios or if admin is also an employee
        const sentIdx = state.mySentRequests.findIndex(req => req._id === action.payload._id);
        if (sentIdx !== -1) state.mySentRequests[sentIdx] = action.payload;
        const receivedIdx = state.myReceivedRequests.findIndex(req => req._id === action.payload._id);
        if (receivedIdx !== -1) state.myReceivedRequests[receivedIdx] = action.payload;
      })
      .addCase(updateSwapStatusByAdmin.rejected, (state, action) => {
        state.isUpdatingSwapAdmin = false;
        state.updateAdminError = action.payload as string;
      });
  },
});

export const { clearAllSwapErrors } = swapSlice.actions;

export default swapSlice.reducer;