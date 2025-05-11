import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a User type (can be expanded later)
export interface User {
  id: string; // Added user ID
  name: string;
  email: string;
  role: string;
  // Removed isOpenForSwap from User interface here
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringToken: boolean;
  error: string | null;
  // Removed isUpdatingSwapStatus
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringToken: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authProcessStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    authProcessSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;
      state.isRestoringToken = false; 
    },
    authProcessFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
      state.isRestoringToken = false;
    },
    registerRequest: (state) => { // Kept for consistency if needed for UI loading state
      state.isLoading = true;
      state.error = null;
    },
    // registerSuccess doesn't change isAuthenticated directly, user needs to login
    registerSuccessNoAuth: (state) => { 
      state.isLoading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => { // Kept for consistency
        state.isLoading = false;
        state.error = action.payload;
    },
    logoutAction: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isRestoringToken = false;
    },
    tokenRestorationAttempt: (state) => {
      state.isRestoringToken = true;
      state.isLoading = true; // Also set isLoading true during token restoration
    },
    tokenRestored: (state, action: PayloadAction<{ user: User }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.isRestoringToken = false;
      state.isLoading = false;
      state.error = null;
    },
    tokenRestoreFailed: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isRestoringToken = false;
      state.isLoading = false;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
    // Removed updateUserOpenForSwap reducers
  },
});

export const {
  authProcessStart,
  authProcessSuccess,
  authProcessFailure,
  registerRequest,
  registerSuccessNoAuth,
  registerFailure,
  logoutAction,
  tokenRestorationAttempt,
  tokenRestored,
  tokenRestoreFailed,
  clearAuthError,
  // Removed updateUserOpenForSwap actions from export
} = authSlice.actions;

// Selector to easily get the auth loading state (combining isLoading and isRestoringToken)
export const selectIsAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading || state.auth.isRestoringToken;

export default authSlice.reducer;