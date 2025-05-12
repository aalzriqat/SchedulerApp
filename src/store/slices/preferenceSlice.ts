import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/apiService'; // Adjust path as needed
import { EmployeePreferenceData, EmployeePreferenceRecord } from '../../api/apiService'; // Adjust path

interface PreferenceState {
  currentUserPreference: EmployeePreferenceRecord | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  submitError: string | null;
}

const initialState: PreferenceState = {
  currentUserPreference: null,
  isLoading: false,
  error: null,
  isSubmitting: false,
  submitError: null,
};

// Async thunk to fetch current user's preferences
export const fetchMyPreferences = createAsyncThunk(
  'preferences/fetchMyPreferences',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await api.getMyPreferences(userId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch preferences');
    }
  }
);

// Async thunk to submit/update current user's preferences
// The API `submitMyPreferences` might handle both create and update (upsert)
export const submitMyPreferences = createAsyncThunk(
  'preferences/submitMyPreferences',
  async (preferenceData: EmployeePreferenceData & { userId: string }, { rejectWithValue }) => {
    // We need userId for the API call, but EmployeePreferenceData might not have it.
    // The component should pass it, or we get it from auth state here.
    // For simplicity, assuming it's passed in preferenceData for now.
    try {
      const { userId, ...payload } = preferenceData; // Separate userId for API call if needed by API structure
      // If your api.submitMyPreferences expects userId as a separate param:
      // const data = await api.submitMyPreferences(userId, payload);
      // If api.submitMyPreferences expects userId within the payload (and backend handles it):
      const data = await api.submitMyPreferences(preferenceData); // Assuming API takes the full object with userId
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit preferences');
    }
  }
);

const preferenceSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearPreferenceError: (state) => {
      state.error = null;
      state.submitError = null;
    },
    // You could add a reducer to manually set/update preferences from local actions if needed
    // e.g., if a preference is set before a user logs in, or for optimistic updates.
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Preferences
      .addCase(fetchMyPreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyPreferences.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord | null>) => {
        state.isLoading = false;
        state.currentUserPreference = action.payload;
      })
      .addCase(fetchMyPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Submit My Preferences
      .addCase(submitMyPreferences.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitMyPreferences.fulfilled, (state, action: PayloadAction<EmployeePreferenceRecord>) => {
        state.isSubmitting = false;
        state.currentUserPreference = action.payload; // Update state with the submitted/returned preference
      })
      .addCase(submitMyPreferences.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      });
  },
});

export const { clearPreferenceError } = preferenceSlice.actions;
export default preferenceSlice.reducer;