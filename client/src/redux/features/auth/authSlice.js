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
      return rejectWithValue(error.response?.data);
    }
  }
);

// Async to update user profile
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      const response = await apiClient.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch latest full profile (optional)
      dispatch(fetchUserProfile());

      // Show toast once
      // toast.success('Profile updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// CHANGE PASSWORD
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      const response = await apiClient.put('/auth/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || 'Password updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return rejectWithValue(message);
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
      // LOGIN
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

      // REGISTER
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

      // SECURITY QUESTIONS
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

      // Fetch User Profile cases
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
        // Optional: logout if profile fetch fails
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      })

      .addCase(resetPasswordWithSecurity.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(resetPasswordWithSecurity.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })

      // Update User Profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Merge updated fields into existing user state
        state.user = { ...state.user, ...action.payload };
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Change Password cases
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
