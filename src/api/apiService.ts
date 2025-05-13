import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Notification } from '../store/slices/notificationSlice'; // Import Notification type
const API_BASE_URL = 'https://schedulerappserver-hzie.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data ? `| Data: ${JSON.stringify(config.data)}` : '');
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers['x-auth-token'] = token; // Set x-auth-token
      delete config.headers.Authorization; // Remove Authorization header if present
    }
    return config;
  },
  (error: any) => {
    console.error(`[API Request Error] ${error.message}`, error.config ? `${error.config.method?.toUpperCase()} ${error.config.url}` : '', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] Status: ${response.status} | ${response.config.method?.toUpperCase()} ${response.config.url}`,
      "| Response Data:", 
    );
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const method = error.config?.method?.toUpperCase();
      const url = error.config?.url;
      const responseData = error.response.data ? JSON.stringify(error.response.data) : "No data in error response.";
      const responseHeaders = error.response.headers ? JSON.stringify(error.response.headers) : "No headers in error response.";
      console.error(
        `[API Response Error] Status: ${error.response.status} ${method ? `| ${method} ${url}` : ''}`,
        `Response Data: ${responseData}`,
        `Response Headers: ${responseHeaders}`,
        error
      );
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      const method = error.config?.method?.toUpperCase();
      const url = error.config?.url;
      console.error(
        `[API Response Error] No response received for ${method ? `${method} ${url}` : 'request'}`,
        `Request details: ${JSON.stringify(error.request)}`,
        error
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Response Error] Error setting up request:', error.message, error);
    }
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      console.error(`[API Timeout] Request to ${error.config?.url} timed out.`);
    }
    return Promise.reject(error);
  }
);

export interface BackendShift { // Updated to match actual server response
  _id: string;
  user: string; // Matches 'user' field from response
  week: number; // Matches 'week' field
  workingHours: string; // Matches 'workingHours' field (e.g., "09:00-18:00")
  offDays: string[]; // Matches 'offDays' field
  isOpenForSwap?: boolean; // Matches 'isOpenForSwap' field
  createdAt: string; // Present in response
  // Fields like 'date', 'startTime', 'endTime', 'role', 'location', 'notes' are not directly in the root of the schedule object from this endpoint
  // They might be part of a more detailed shift object if the structure was different, or derived.
  // For now, aligning with the provided log.
  // If 'role' and 'location' are needed, they must be added to the backend response for this schedule item.
}

export const getEmployeeSchedule = async (employeeId: string): Promise<BackendShift[]> => {
  try {
    const response = await apiClient.get<BackendShift[]>(`/schedules/employee/${employeeId}`);
    return response.data;
  } catch (error: unknown) { 
    console.error('Error fetching employee schedule:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>; 
      if (axiosError.response && axiosError.response.data && axiosError.response.data.message) {
        throw new Error(axiosError.response.data.message);
      } else if (axiosError.response) {
        throw new Error(`Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        throw new Error('Network error: No response received from server.');
      } else {
        throw new Error(`Axios error: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to fetch schedule due to an unknown error.');
  }
};

export const updateShiftSwapAvailability = async (
  scheduleId: string,
  isAvailableForSwap: boolean
): Promise<BackendShift> => {
  try {
    // Backend route PATCH /schedules/:scheduleId/availability is expected to exist.
    // Request payload is { isAvailableForSwap: boolean }
    const response = await apiClient.patch<BackendShift>(
      `/schedules/${scheduleId}/availability`,
      { isAvailableForSwap } // Ensure this field name matches what backend controller expects in req.body
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating shift swap availability:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response && axiosError.response.data && axiosError.response.data.message) {
        throw new Error(axiosError.response.data.message);
      } else if (axiosError.response) {
        throw new Error(`Server error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        throw new Error('Network error: No response received from server.');
      } else {
        throw new Error(`Axios error: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to update swap availability due to an unknown error.');
  }
};

// Define types for login
interface LoginCredentials {
  email?: string; 
  username?: string;
  password?: string;
}

export interface LoginResponse { 
  token: string;
  user: { // This is what /users/login is expected to return (but currently doesn't)
    _id: string; 
    name: string;
    email: string;
    role: string;
  };
}

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/users/login', credentials);
    // IMPORTANT: Backend currently only returns { token }. This will fail if backend isn't changed.
    // For Option B, this function would just return { token: response.data.token }
    // and LoginScreen would then call getCurrentUserApi.
    // For now, assuming backend *will* be changed to return LoginResponse structure.
    // If not, this needs to be adjusted.
    return response.data; 
  } catch (error: unknown) {
    console.error('Error during login API call:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, errors?: {msg: string}[] }>; // Added errors for validation
      if (axiosError.response && axiosError.response.data) {
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response.data.errors && axiosError.response.data.errors.length > 0) {
          throw new Error(axiosError.response.data.errors.map(e => e.msg).join(', '));
        } else {
           throw new Error(`Login failed: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        }
      } else if (axiosError.request) {
        throw new Error('Network error: No response received from server during login.');
      } else {
        throw new Error(`Axios login error: ${axiosError.message}`);
      }
    }
    throw new Error('Login failed due to an unknown error.');
  }
};

// Interface for registration payload
interface RegisterPayload {
  username?: string; // Or name, depending on backend model
  email?: string;
  password?: string;
  role?: string; // Optional, backend might assign default
}

// Interface for registration response (backend might just return a success message or the new user)
interface RegisterResponse {
  message: string; // e.g., "User registered successfully"
  user?: BackendUser; // Optional: backend might return the created user object
}

// API function for user registration
export const registerUserApi = async (userData: RegisterPayload): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/users/register', userData);
    return response.data;
  } catch (error: unknown) {
    console.error('Error during registration API call:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, errors?: {msg: string}[] }>;
      if (axiosError.response && axiosError.response.data) {
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response.data.errors && axiosError.response.data.errors.length > 0) {
          throw new Error(axiosError.response.data.errors.map(e => e.msg).join(', '));
        } else {
           throw new Error(`Registration failed: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        }
      } else if (axiosError.request) {
        throw new Error('Network error: No response received from server during registration.');
      } else {
        throw new Error(`Axios registration error: ${axiosError.message}`);
      }
    }
    throw new Error('Registration failed due to an unknown error.');
  }
};

// Type for the user object returned by /users/me
export interface BackendUser {
  _id: string;
  name?: string; // name might not be on User model, username is.
  username: string; // From User model
  email: string;
  role: string;
  isOpenForSwap?: boolean;
  // Add other fields returned by /users/me (excluding password)
}

export const getCurrentUserApi = async (): Promise<BackendUser> => {
  try {
    const response = await apiClient.get<BackendUser>('/users/me');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching current user:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, msg?: string }>;
      if (axiosError.response && axiosError.response.data) {
        // Backend /users/me might return { msg: "..." } for token errors
        throw new Error(axiosError.response.data.message || axiosError.response.data.msg || 'Failed to fetch user data.');
      } else if (axiosError.request) {
        throw new Error('Network error: No response received for /users/me.');
      } else {
        throw new Error(`Axios /users/me error: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to fetch user data due to an unknown error.');
  }
};

export const updateIsOpenForSwapApi = async (isOpenForSwap: boolean): Promise<{ isOpenForSwap: boolean }> => {
  // Token is automatically added by the interceptor
  try {
    // Backend route is POST /users/updateOpenForSwap and expects { isOpenForSwap } in body
    const response = await apiClient.post<{ isOpenForSwap: boolean }>('/users/updateOpenForSwap', { isOpenForSwap });
    return response.data; // Should return { isOpenForSwap: newStatus }
  } catch (error: unknown) {
    console.error('Error updating user isOpenForSwap status:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, msg?: string }>;
      if (axiosError.response && axiosError.response.data) {
        throw new Error(axiosError.response.data.message || axiosError.response.data.msg || 'Failed to update swap status.');
      } else if (axiosError.request) {
        throw new Error('Network error: No response received for updating swap status.');
      } else {
        throw new Error(`Axios error updating swap status: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to update swap status due to an unknown error.');
  }
};

// Interface for News Item (consistent with newsSlice)
export interface NewsItem {
  _id: string; // Assuming MongoDB _id
  title: string;
  content: string;
  date: string; // ISO date string
  author?: string; // Optional, might be populated by backend
  // Add any other fields returned by the backend news endpoints
}

// API function to fetch all news items
export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await apiClient.get<NewsItem[]>('/news'); // Assuming '/news' is the endpoint
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching news:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      if (axiosError.response && axiosError.response.data && axiosError.response.data.message) {
        throw new Error(axiosError.response.data.message);
      } else if (axiosError.response) {
        throw new Error(`Server error fetching news: ${axiosError.response.status} - ${axiosError.response.statusText}`);
      } else if (axiosError.request) {
        throw new Error('Network error: No response received while fetching news.');
      } else {
        throw new Error(`Axios error fetching news: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to fetch news due to an unknown error.');
  }
};

// API function to post a new news item
export const postNews = async (newsData: { title: string; content: string }): Promise<NewsItem> => {
  try {
    // Backend expects { title, description }
    const payload = { title: newsData.title, description: newsData.content };
    const response = await apiClient.post<NewsItem>('/news', payload); // Assuming '/news' is the endpoint
    return response.data;
  } catch (error: unknown) {
    console.error('Error posting news:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, errors?: {msg: string}[] }>;
      if (axiosError.response && axiosError.response.data) {
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response.data.errors && axiosError.response.data.errors.length > 0) {
          throw new Error(axiosError.response.data.errors.map(e => e.msg).join(', '));
        } else {
           throw new Error(`Failed to post news: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        }
      } else if (axiosError.request) {
        throw new Error('Network error: No response received while posting news.');
      } else {
        throw new Error(`Axios error posting news: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to post news due to an unknown error.');
  }
};

// Interface for profile update data (subset of what might be updatable)
interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  // email changes often require a separate verification flow, so not included here
  // isOpenForSwap is handled by its own dedicated API and thunk
}

// Interface for the expected response from profile update
interface UpdateProfileResponse {
  message: string;
  user?: BackendUser; // Backend might return the updated user object
}

// API function to update user profile
export const updateUserProfile = async (profileData: UpdateProfilePayload): Promise<{ data: UpdateProfileResponse }> => {
  try {
    // TODO: Backend does not have a PUT /users/me/profile route.
    // A new route (e.g., PUT /users/me/details or PATCH /users/me) needs to be added to the backend (usersRoutes.js)
    // to handle name and password changes.
    // The current implementation will fail.
    console.warn("updateUserProfile: Backend route PUT /users/me/profile is not implemented. This call will fail.");
    const response = await apiClient.put<UpdateProfileResponse>('/users/me/profile', profileData); // This will likely 404 or error
    return { data: response.data };
  } catch (error: unknown) {
    console.error('Error updating user profile (check if backend route /users/me/profile (PUT) exists):', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string, errors?: {msg: string}[] }>;
      if (axiosError.response && axiosError.response.data) {
        if (axiosError.response.data.message) {
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.response.data.errors && axiosError.response.data.errors.length > 0) {
          throw new Error(axiosError.response.data.errors.map(e => e.msg).join(', '));
        } else {
           throw new Error(`Failed to update profile: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        }
      } else if (axiosError.request) {
        throw new Error('Network error: No response received while updating profile.');
      } else {
        throw new Error(`Axios error updating profile: ${axiosError.message}`);
      }
    }
    throw new Error('Failed to update profile due to an unknown error.');
  }
};

// --- Leave Management API Functions ---

// Interface for Leave Request (can be shared or defined in leaveSlice too)
export interface LeaveRequestPayload { // For submitting
  leaveType: string;
  startDate: string; // ISO Date string - This is what frontend form will use
  endDate: string;   // ISO Date string - This is what frontend form will use
  reason: string;
  // For submission, backend might expect fromDate and toDate (duration type)
  // This payload might need adjustment based on POST /leaves/create expectations
}
export interface LeaveRequest { // Reflects data from GET /leaves/user/:id
  _id: string;
  user: string | { _id: string, name: string, username: string };
  leaveType: string; // Assuming this is still part of the main object or needs to be added to backend response
  fromDate: string; // Changed from startDate
  toDate: string[];   // Changed from endDate, now an array like ["Full Day"]
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string; // Changed from submittedAt
  updatedAt?: string; // Added from logs
  adminNotes?: string;
  adminApproval?: string; // Added from logs (often redundant if status is comprehensive)
  OU?: string; // Added from logs
  // any other fields from backend
}

// Fetch all leave requests (for Admin)
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await apiClient.get<LeaveRequest[]>('/leaves/all'); // Example endpoint
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching all leave requests:', error);
    // Generic error handling, can be more specific
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch all leave requests.');
  }
};

// Fetch leave requests for a specific employee
export const getMyLeaveRequests = async (userId: string): Promise<LeaveRequest[]> => {
  try {
    console.log(`[API Call] getMyLeaveRequests for userId: ${userId}`);
    // Backend route is /leaves/user/:id.
    const response = await apiClient.get<LeaveRequest[]>(`/leaves/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching my leave requests:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch my leave requests.');
  }
};


// Submit a new leave request (for Employee)
export const submitLeaveRequest = async (leaveData: LeaveRequestPayload): Promise<LeaveRequest> => {
  try {
    const response = await apiClient.post<LeaveRequest>('/leaves/create', leaveData); // Corrected Path
    return response.data;
  } catch (error: unknown) {
    console.error('Error submitting leave request:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to submit leave request.');
  }
};

// Update leave request status (for Admin)
export const updateLeaveRequestStatusAdmin = async (
  leaveId: string,
  status: 'approved' | 'rejected',
  adminNotes?: string
): Promise<LeaveRequest> => {
  try {
    // TODO: Backend route is PUT /leaves/update. This is unusual for updating a specific resource without an ID in the path.
    // Assuming backend might expect leaveId in the body. This needs verification with backend implementation.
    // Frontend was PATCH /leaves/:leaveId/status.
    console.warn(`updateLeaveRequestStatusAdmin: Using PUT /leaves/update. Backend needs to correctly identify leave request (e.g., by _id in body) and handle status update.`);
    const response = await apiClient.put<LeaveRequest>( // Corrected Method
      `/leaves/update`, // Corrected Path (as per backend, though problematic)
      { _id: leaveId, status, adminNotes } // Sending _id in body
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating leave request status:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to update leave request status.');
  }
};

// Cancel a leave request (for Employee, if status is 'pending')
export const cancelLeaveRequestEmployee = async (leaveId: string): Promise<LeaveRequest> => {
  try {
    // TODO: Backend has DELETE /leaves/delete. Frontend was PATCH /leaves/:leaveId/cancel.
    // Reconciling by using the PUT /leaves/update route and setting status to 'cancelled'.
    // This assumes backend's updateLeaveRequest can handle setting status to 'cancelled'.
    // A dedicated backend route for cancellation (e.g., PATCH /leaves/:leaveId/cancel) would be clearer.
    console.warn(`cancelLeaveRequestEmployee: Using PUT /leaves/update with status 'cancelled'. Backend must handle this.`);
    const response = await apiClient.put<LeaveRequest>( // Corrected Method
      `/leaves/update`, // Corrected Path (as per backend, though problematic for specific resource update)
      { _id: leaveId, status: 'cancelled' } // Sending _id and new status in body
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error cancelling leave request:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to cancel leave request.');
  }
};

// --- Preference API Functions ---

// Interface for individual employee preferences when submitting/fetching own
export interface EmployeePreferenceData { // Data for submission
  preferredDaysOff: string;
  preferredShift: string; // Changed from preferredShiftTimes
  unavailability: string;
  notes: string;
  user: string; // Added user ID
  week: number; // Added week number
}

export interface EmployeePreferenceRecord extends EmployeePreferenceData {
  _id: string; // Preference record ID
  employee: string | { _id: string, name: string, username: string }; // Employee ID or populated object
  lastUpdatedAt: string; // ISO Date string
  // any other fields from backend
}

// Fetch preferences for a specific employee
export const getMyPreferences = async (userId: string): Promise<EmployeePreferenceRecord | null> => {
  try {
    console.log(`[API Call] getMyPreferences for userId: ${userId}`);
    // Backend route is /preferences/user/:user.
    const response = await apiClient.get<EmployeePreferenceRecord>(`/preferences/user/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No preferences found is not necessarily an error
    }
    console.error('Error fetching my preferences:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch my preferences.');
  }
};

// Submit/update preferences for the current employee
export const submitMyPreferences = async (preferenceData: EmployeePreferenceData): Promise<EmployeePreferenceRecord> => {
  try {
    // TODO: Backend has POST /preferences/create and PUT /preferences/update/:id.
    // Frontend was POST /preferences/my (expecting upsert).
    // Changing to POST /preferences/create. This will not handle updates of existing preferences.
    // For updates, frontend would need to fetch existing, get ID, then call PUT /preferences/update/:id.
    // Or backend /create could be modified to perform an upsert based on authenticated user.
    console.warn(`submitMyPreferences: Using POST /preferences/create. This will not update existing preferences.`);
    const response = await apiClient.post<EmployeePreferenceRecord>('/preferences/create', preferenceData); // Corrected Path
    return response.data;
  } catch (error: unknown) {
    console.error('Error submitting my preferences:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to submit my preferences.');
  }
};

// Fetch all employee preferences (for Admin)
export const getAllEmployeePreferences = async (): Promise<EmployeePreferenceRecord[]> => {
  try {
    const response = await apiClient.get<EmployeePreferenceRecord[]>('/preferences/all'); // Example endpoint
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching all employee preferences:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch all employee preferences.');
  }
};

// --- Swap Request API Functions ---

// Interface for creating a swap request
export interface CreateSwapRequestPayload {
  offeredShiftId: string;
  requestedShiftId?: string; // If swapping with a specific shift from another employee
  notes?: string;
}

// Interface for Swap Request (can be shared or defined in swapSlice too)
// Assuming Shift and User types are defined elsewhere or imported (e.g., from authSlice for User)
// APIShift will now align with BackendShift for consistency, but note that recipientSchedule in logs has week as string.
// For simplicity, we'll use BackendShift directly or a slightly modified version for recipientSchedule.

// This represents the structure of recipientSchedule as seen in logs
export interface RecipientScheduleData extends Omit<BackendShift, 'week' | 'user'> {
  week: string; // In logs, recipientSchedule.week is a string
  user: string | { _id: string, name?: string, username?: string }; // Can be populated
  status?: string; // Seen in logs
  swapRequests?: string[]; // Seen in logs
  updatedAt?: string; // Seen in logs
}

export interface APISwapRequest {
  _id: string;
  requester: string | { _id: string, name?: string, username?: string }; // Typically populated for 'received' requests
  recipient?: string | { _id: string, name?: string, username?: string }; // Typically populated for 'sent' requests
  
  requesterSchedule: string | BackendShift; // ID for sent, potentially populated for received (though logs show ID)
                                          // For simplicity, let's assume it might be populated or we fetch details if it's just an ID.
                                          // The log for sent items shows this as just an ID.
  
  recipientSchedule?: RecipientScheduleData; // Populated object for sent requests, as per logs.
                                            // For received requests, this might be the user's own schedule if it's a direct swap.

  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'auto-approved';
  adminApproval?: 'pending' | 'approved' | 'rejected'; // from logs
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string; // from logs
  week?: number | string; // Top-level week field from logs (type varies)
  // any other fields from backend
}

// Fetch swap requests for a specific employee (sent and received)
export const getMySwapRequests = async (
  userId: string
): Promise<{ sent: APISwapRequest[]; received: APISwapRequest[] }> => {
  try {
    console.log(`[API Call] getMySwapRequests for userId: ${userId}`);
    
    const [sentResponse, receivedResponse] = await Promise.all([
      apiClient.get<APISwapRequest[]>(`/swap/sent/${userId}`),
      apiClient.get<APISwapRequest[]>(`/swap/received/${userId}`),
    ]);

    console.log(`Sent swap requests for userId ${userId}:`, sentResponse.data);
    // console.log(`Received swap requests for userId ${userId}:`, receivedResponse.data);

    return {
      sent: sentResponse.data,
      received: receivedResponse.data,
    };
  } catch (error: unknown) {
    console.error(`Error fetching swap requests for userId ${userId}:`, error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch my swap requests.');
  }
};


// Create a new swap request
export const createSwapRequest = async (payload: CreateSwapRequestPayload): Promise<APISwapRequest> => {
  try {
    const response = await apiClient.post<APISwapRequest>('/swap/request', payload); // Changed to singular /swap
    return response.data;
  } catch (error: unknown) {
    console.error('Error creating swap request:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to create swap request.');
  }
};

// Employee responds to a received swap request (accept/reject their involvement)
export const respondToSwapRequestEmployee = async (
  swapId: string,
  responseStatus: 'accepted' | 'declined' // Employee's response to being part of the swap
): Promise<APISwapRequest> => {
  try {
    // Backend uses PUT /swaps/update/:swapId for all status updates.
    // The backend controller needs to interpret this status update correctly.
    // 'accepted' by employee might mean the swap is still 'pending' overall until admin approval.
    // This might require the backend to handle a more complex status field or specific logic.
    console.warn(`respondToSwapRequestEmployee: Using PUT /swap/update/${swapId}. Backend must handle this status update appropriately.`);
    const response = await apiClient.put<APISwapRequest>(
      `/swap/update/${swapId}`,
      { status: responseStatus, role: 'employee' } // Added role: 'employee'
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error responding to swap request:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to respond to swap request.');
  }
};

// Employee cancels their own pending swap request
export const cancelMySwapRequestEmployee = async (swapId: string): Promise<APISwapRequest> => {
  try {
    // Backend uses PUT /swaps/update/:swapId for all status updates.
    // Sending status: 'cancelled'. Backend controller must handle this.
    console.warn(`cancelMySwapRequestEmployee: Using PUT /swap/update/${swapId} with status 'cancelled'.`);
    const response = await apiClient.put<APISwapRequest>(
        `/swap/update/${swapId}`, // Changed to singular /swap
        { status: 'cancelled' }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error cancelling swap request:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to cancel swap request.');
  }
};
// --- Notification API Functions ---

// Fetch notifications for a specific user
export const getNotificationsApi = async (userId: string): Promise<Notification[]> => {
  try {
    // Assuming backend endpoint is GET /notifications/user/:userId
    console.log(`[API Call] getNotificationsApi for userId: ${userId}`);
    const response = await apiClient.get<Notification[]>(`/notifications/user/${userId}`);
    // TODO: Ensure backend response matches the Notification interface structure
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching notifications:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to fetch notifications.');
    }
    throw new Error('Failed to fetch notifications due to an unknown error.');
  }
};

// Optional: API function to mark a notification as read (e.g., PATCH /notifications/:notificationId/read)
// export const markNotificationReadApi = async (notificationId: string): Promise<void> => { ... }


// Fetch all swap requests (for Admin)
export const getAllSwapRequestsAdmin = async (): Promise<APISwapRequest[]> => {
  try {
    const response = await apiClient.get<APISwapRequest[]>('/swap/swaps'); // Changed to singular /swap
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching all swap requests:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch all swap requests.');
  }
};

// Update swap request status (for Admin: approve/reject the entire swap)
export const updateSwapRequestStatusAdmin = async (
  swapId: string,
  status: 'approved' | 'rejected', // Admin's final decision
  adminNotes?: string
): Promise<APISwapRequest> => {
  try {
    const response = await apiClient.put<APISwapRequest>(
      `/swap/update/${swapId}`, // Changed to singular /swap
      { status, adminNotes }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Error updating swap request status by admin:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to update swap request status by admin.');
  }
};

// --- Schedule Management API Functions ---

// Interface for schedule data when fetching all (might include employee info)
// Assuming BackendShift is the detailed shift model from earlier in this file.
export interface AdminScheduleView {
  employee: {
    _id: string;
    name?: string;
    username?: string;
    // other relevant employee details
  };
  shifts: BackendShift[];
}

// Fetch all employee schedules (for Admin)
export const getAllSchedulesAdmin = async (): Promise<AdminScheduleView[]> => {
  try {
    // Example endpoint, adjust as per your backend
    const response = await apiClient.get<AdminScheduleView[]>('/schedules/all');
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching all schedules for admin:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch all schedules for admin.');
  }
};

// Fetch filtered available shifts for swap
export const getFilteredAvailableShiftsApi = async (week: number, excludeUserId: string): Promise<BackendShift[]> => {
  try {
    const response = await apiClient.get<BackendShift[]>(`/schedules/available-for-swap-filtered`, {
      params: { week, excludeUserId },
    });
    return response.data;
  } catch (error: unknown) {
    console.error('Error fetching filtered available shifts:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch filtered available shifts.');
  }
};

// Upload schedule data (for Admin)
// The 'scheduleFile' could be FormData if direct upload, or structured JSON/CSV data if not.
// For Expo Go, direct file system access for picking arbitrary files is limited.
// This might involve a text input for CSV data, or a URL, or a more complex setup.
export const uploadScheduleDataAdmin = async (scheduleData: any): Promise<{ message: string, newSchedules?: any }> => {
  try {
    // This endpoint and payload structure are highly dependent on backend implementation.
    // If sending raw data (e.g., CSV text or JSON):
    const response = await apiClient.post<{ message: string, newSchedules?: any }>('/schedules/upload', { data: scheduleData });
    return response.data;
  } catch (error: unknown) {
    console.error('Error uploading schedule data:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to upload schedule data.');
  }
};

// --- Analytics API Functions ---

// Placeholder for Admin Dashboard Analytics Data
// The actual structure of AdminAnalyticsData will depend on what the backend provides.
// For now, using the interface from analyticsSlice.ts as a reference.
import { AdminAnalyticsData } from '../store/slices/analyticsSlice'; // Adjust path as necessary

export const getAdminAnalyticsDashboard = async (): Promise<AdminAnalyticsData> => {
  try {
    // const response = await apiClient.get<AdminAnalyticsData>('/analytics/admin/dashboard');
    // return response.data;
    
    // MOCKING for now, as done in the slice. Remove when backend is ready.
    console.warn("API getAdminAnalyticsDashboard: Using MOCK DATA. Implement backend endpoint.");
    await new Promise(resolve => setTimeout(resolve, 500));
     return {
      scheduleAdherence: { totalShifts: 580, onTimePercentage: 92.5 },
      swapRequestTrends: { totalRequests: 120, approvedPercentage: 75, averageTimeToApprove: "1.5 days" },
      leaveTrends: { totalRequests: 45, commonLeaveTypes: [{type: 'Vacation', count: 20}, {type: 'Sick', count: 15}] },
      scheduleHeatmap: [
        { date: "Monday-0900", intensity: 5 }, { date: "Monday-1700", intensity: 8 },
        { date: "Tuesday-1000", intensity: 6 }, { date: "Friday-1800", intensity: 7 },
      ]
    } as AdminAnalyticsData;

  } catch (error: unknown) {
    console.error('Error fetching admin analytics dashboard:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch admin analytics dashboard.');
  }
};

// Placeholder for Employee Personal Analytics Data
import { EmployeePersonalAnalytics } from '../store/slices/analyticsSlice'; // Adjust path

export const getMyPersonalAnalyticsData = async (): Promise<EmployeePersonalAnalytics> => {
  try {
    // const response = await apiClient.get<EmployeePersonalAnalytics>('/analytics/my/dashboard');
    // return response.data;

    // MOCKING for now
    console.warn("API getMyPersonalAnalyticsData: Using MOCK DATA. Implement backend endpoint.");
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      shiftsCompleted: 25,
      punctualityPercentage: 98.2,
      hoursWorkedThisPeriod: 38.5,
    } as EmployeePersonalAnalytics;

  } catch (error: unknown) {
    console.error('Error fetching personal analytics data:', error);
    if (axios.isAxiosError(error)) throw new Error(error.response?.data?.message || error.message);
    throw new Error('Failed to fetch personal analytics data.');
  }
};


export default apiClient;