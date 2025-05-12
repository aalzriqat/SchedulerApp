import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/apiService'; // Assuming apiService handles actual API calls
import { User, authProcessSuccess } from './authSlice'; // Import User type and authProcessSuccess for updating user info

// Define what can be updated
interface UpdateProfileData {
  name?: string;
  // email?: string; // Usually email updates require verification, handle with care
  currentPassword?: string;
  newPassword?: string;
  isOpenForSwap?: boolean; // For employees
}

interface ProfileState {
  loading: boolean;
  error: string | null | undefined;
  successMessage: string | null;
}

const initialState: ProfileState = {
  loading: false,
  error: null,
  successMessage: null,
};

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData: UpdateProfileData, { dispatch, rejectWithValue }) => {
    try {
      // We'll need a new API endpoint for this, e.g., api.updateUserProfile
      const response = await api.updateUserProfile(profileData); 
      // If the update is successful and returns the updated user object
      // dispatch an action to update the authSlice as well
      if (response.data && response.data.user) {
        dispatch(authProcessSuccess({ user: response.data.user as User }));
      }
      return response.data.message || 'Profile updated successfully'; // Assuming backend sends a message
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }
);

// Async thunk for updating employee's isOpenForSwap status (already in apiService)
export const updateUserOpenForSwap = createAsyncThunk(
  'profile/updateUserOpenForSwap',
  async (isOpenForSwap: boolean, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api.updateIsOpenForSwapApi(isOpenForSwap);
      // Update the user object in authSlice
      const { auth } = getState() as { auth: { user: User | null } };
      if (auth.user) {
        const updatedUser = { ...auth.user, isOpenForSwap };
        dispatch(authProcessSuccess({ user: updatedUser as User })); // Re-dispatch to update user in authSlice
      }
      return response; // Contains { isOpenForSwap: newStatus }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update swap status');
    }
  }
);


const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.successMessage = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User Open For Swap
      .addCase(updateUserOpenForSwap.pending, (state) => {
        state.loading = true; // Can use a more specific loading state if needed
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserOpenForSwap.fulfilled, (state, action: PayloadAction<{ isOpenForSwap: boolean }>) => {
        state.loading = false;
        state.successMessage = `Swap availability updated to: ${action.payload.isOpenForSwap ? 'Open' : 'Closed'}`;
      })
      .addCase(updateUserOpenForSwap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfileStatus } = profileSlice.actions;
export default profileSlice.reducer;