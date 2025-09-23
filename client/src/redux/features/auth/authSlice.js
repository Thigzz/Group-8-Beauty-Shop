import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/login', userData);
      const { access_token } = response.data;
      dispatch(setToken(access_token));
      dispatch(fetchUserProfile());
      return { token: access_token };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// REGISTER
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      toast.success('Registration successful! Please log in.');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// SAVE SECURITY QUESTIONS
export const saveSecurityQuestions = createAsyncThunk(
  'auth/saveSecurityQuestions',
  async (questions, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.post('/auth/security-questions', questions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Security questions saved!');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save security questions');
    }
  }
);

// RESET PASSWORD WITH SECURITY QUESTIONS
export const resetPasswordWithSecurity = createAsyncThunk(
  'auth/resetPasswordWithSecurity',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      toast.success('Password reset successful, please log in.');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

// FETCH PROFILE
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token'),
  status: 'idle',
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveSecurityQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveSecurityQuestions.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(saveSecurityQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(resetPasswordWithSecurity.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetPasswordWithSecurity.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resetPasswordWithSecurity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
