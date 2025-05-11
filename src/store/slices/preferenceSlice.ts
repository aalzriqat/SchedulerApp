import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EmployeePreferences {
  preferredDaysOff: string;
  preferredShiftTimes: string;
  unavailability: string;
  notes: string;
  // Add lastUpdated or other metadata if needed
}

interface PreferenceState {
  currentPreferences: EmployeePreferences | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PreferenceState = {
  currentPreferences: null, // Or load from a persisted state/API on app load
  isLoading: false,
  error: null,
};

const preferenceSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    fetchPreferencesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchPreferencesSuccess: (state, action: PayloadAction<EmployeePreferences | null>) => { // Accept null
      state.isLoading = false;
      state.currentPreferences = action.payload; // Will be null if nothing found and null is passed
    },
    fetchPreferencesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    submitPreferencesStart: (state, action: PayloadAction<EmployeePreferences>) => {
      state.isLoading = true;
      state.error = null;
    },
    submitPreferencesSuccess: (state, action: PayloadAction<EmployeePreferences>) => {
      state.isLoading = false;
      state.currentPreferences = action.payload; // Update with submitted/confirmed preferences
      // Potentially show a success message via another state property or UI feedback
    },
    submitPreferencesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearPreferenceError: (state) => {
      state.error = null;
    }
  },
});

export const {
  fetchPreferencesStart,
  fetchPreferencesSuccess,
  fetchPreferencesFailure,
  submitPreferencesStart,
  submitPreferencesSuccess,
  submitPreferencesFailure,
  clearPreferenceError,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;