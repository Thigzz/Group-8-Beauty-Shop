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
      const errorMessage = error.response?.data?.message || 'Login failed';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
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
      const errorMessage = error.response?.data?.message || 'Registration failed';
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(errorMessage);
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// SAVE SECURITY QUESTIONS 
export const saveSecurityQuestions = createAsyncThunk(
  'auth/saveSecurityQuestions',
  async (questions, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      console.log('Full user object:', JSON.stringify(user, null, 2));
      console.log('User object keys:', Object.keys(user || {}));
      console.log('Auth state for saving:', { 
        token: !!token, 
        user: !!user, 
        userId: user?.id,
        user_id: user?.user_id,
        _id: user?._id,
        uuid: user?.uuid,
        pk: user?.pk,
        user_uuid: user?.user_uuid
      });
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      if (!user) {
        return rejectWithValue('User object not found in state');
      }

      // Try different possible user ID fields
      const userId = user.id || user.user_id || user._id || user.uuid || user.pk || user.user_uuid;
      
      if (!userId) {
        console.error('User object:', user);
        return rejectWithValue(`User ID not found in user object. Available keys: ${Object.keys(user).join(', ')}`);
      }

      // Transform questions to match backend format
      const transformedQuestions = questions.map(q => ({
        question_id: q.question_id,
        answer: q.answer
      }));

      console.log('Using userId:', userId);
      console.log('Saving questions:', transformedQuestions);
      console.log('Request URL:', `/api/security-questions/user/${userId}`);

      const response = await apiClient.post(
        `/api/security-questions/user/${userId}`, 
        { questions: transformedQuestions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Security questions saved!');
      return response.data;
    } catch (error) {
      console.error('Save security questions error:', error.response?.data);
      console.error('Full error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save security questions';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// FETCH AVAILABLE SECURITY QUESTIONS
export const fetchSecurityQuestions = createAsyncThunk(
  'auth/fetchSecurityQuestions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      
      const response = await apiClient.get('/api/security-questions/available', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch security questions'
      );
    }
  }
);

// FETCH USER'S SECURITY QUESTIONS
export const fetchUserSecurityQuestions = createAsyncThunk(
  'auth/fetchUserSecurityQuestions',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      if (!token || !user?.id) return rejectWithValue('User not authenticated');
      
      const response = await apiClient.get(`/api/security-questions/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user security questions'
      );
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
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// VERIFY SECURITY ANSWERS
export const verifySecurityAnswers = createAsyncThunk(
  'auth/verifySecurityAnswers',
  async ({ userId, answers }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/api/security-questions/verify/${userId}`, {
        answers
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Verification failed';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
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
      if (error.response?.status === 401) {
        // Auto-logout on 401 errors
        localStorage.removeItem('token');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// UPDATE USER PROFILE 
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      const response = await apiClient.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      dispatch(fetchUserProfile());

      toast.success('Profile updated successfully!');
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
  async (passwordData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue('No token found');
      
      const requestData = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword 
      };
      
      console.log('Sending change password request:', requestData);
      
      const response = await apiClient.put('/auth/change-password', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Password updated successfully! Please log in with your new password.');
      
      // Logout user after successful password change
      dispatch(logout());
      
      return response.data;
      
    } catch (error) {
      console.error('Change password error:', error.response?.data);
      
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// FORGOT PASSWORD
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      toast.success('Password reset instructions sent to your email!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset instructions';
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
  securityQuestions: [], // Available security questions from backend
  userSecurityQuestions: [], // User's assigned security questions
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    clearError: (state) => {
      state.error = null;
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

      // SECURITY QUESTIONS - SAVE
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

      // AVAILABLE SECURITY QUESTIONS - FETCH
      .addCase(fetchSecurityQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSecurityQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.securityQuestions = action.payload.questions || [];
      })
      .addCase(fetchSecurityQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // USER SECURITY QUESTIONS - FETCH
      .addCase(fetchUserSecurityQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserSecurityQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userSecurityQuestions = action.payload.questions || [];
      })
      .addCase(fetchUserSecurityQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // VERIFY SECURITY ANSWERS
      .addCase(verifySecurityAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifySecurityAnswers.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(verifySecurityAnswers.rejected, (state, action) => {
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
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      })

      // RESET PASSWORD WITH SECURITY
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

      // Update User Profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
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
      })

      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, setToken, clearError } = authSlice.actions;
export default authSlice.reducer;