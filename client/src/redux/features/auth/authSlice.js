import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';

// Async thunk to LOG IN a user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', userData);
      const { access_token } = response.data;
      // Store token and fetch user profile
      dispatch(setToken(access_token));
      dispatch(fetchUserProfile());
      return { token: access_token };
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Login failed');
    }
  }
);

// Async thunk to fetch user profile (remains the same)
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      const response = await apiClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      localStorage.removeItem('token');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login User cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Fetch User Profile cases (remains the same)
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;