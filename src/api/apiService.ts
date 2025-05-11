import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.1.17:4000'; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers['x-auth-token'] = token; // Set x-auth-token
      delete config.headers.Authorization; // Remove Authorization header if present
    }
    return config;
  },
  (error: any) => { 
    return Promise.reject(error);
  }
);

export interface BackendShift {
  _id: string;
  employee: string; 
  date: string; 
  startTime: string;
  endTime: string;
  role?: string; 
  location?: string;
  isAvailableForSwap?: boolean;
  notes?: string;
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
    const response = await apiClient.patch<BackendShift>(
      `/schedules/${scheduleId}/availability`, 
      { isAvailableForSwap }
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

export default apiClient;