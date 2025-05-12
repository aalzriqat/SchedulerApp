import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/apiService'; // Assuming apiService handles actual API calls

export interface NewsItem { // Exporting NewsItem
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

interface NewsState {
  items: NewsItem[];
  loading: boolean;
  error: string | null | undefined;
  postLoading: boolean;
  postError: string | null | undefined;
  postSuccess: boolean;
}

const initialState: NewsState = {
  items: [],
  loading: false,
  error: null,
  postLoading: false,
  postError: null,
  postSuccess: false,
};

// Async thunk for fetching news
export const fetchNews = createAsyncThunk('news/fetchNews', async (_, { rejectWithValue }) => {
  try {
    const response = await api.getNews(); // Ensure getNews exists in apiService
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Async thunk for posting news
export const postNews = createAsyncThunk(
  'news/postNews',
  async (newsData: { title: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.postNews(newsData); // Ensure postNews exists in apiService
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    resetPostStatus: (state) => {
      state.postLoading = false;
      state.postError = null;
      state.postSuccess = false;
    },
    clearFetchError: (state) => { // Added to clear fetch errors specifically
        state.loading = false;
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Post News
      .addCase(postNews.pending, (state) => {
        state.postLoading = true;
        state.postError = null;
        state.postSuccess = false;
      })
      .addCase(postNews.fulfilled, (state, action: PayloadAction<NewsItem>) => {
        state.postLoading = false;
        state.postSuccess = true;
        state.items.unshift(action.payload); // Add new news to the beginning of the list
      })
      .addCase(postNews.rejected, (state, action) => {
        state.postLoading = false;
        state.postError = action.payload as string;
      });
  },
});

export const { resetPostStatus, clearFetchError } = newsSlice.actions; // Export new action
export default newsSlice.reducer;