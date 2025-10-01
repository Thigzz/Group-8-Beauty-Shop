import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';
import { getCart } from '../cart/cartSlice';

// LOGIN
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const session_id = localStorage.getItem('sessionId');
      
      const response = await apiClient.post('/auth/login', {
        ...userData,
        session_id: session_id
      });

      const { access_token, user_info } = response.data;
      
      dispatch(setToken(access_token)); 
      dispatch(setUser(user_info));

      if (user_info?.id) {
        dispatch(getCart({ userId: user_info.id }));
      }
      
      localStorage.removeItem('sessionId');

      return response.data;
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
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { access_token, user_info } = response.data;

      dispatch(setToken(access_token));
      dispatch(setUser(user_info));
      
      toast.success('Registration successful!');
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
  async (questions, { getState, dispatch, rejectWithValue }) => {
    try {
      const { token, user } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      
      if (!user) {
        return rejectWithValue('User object not found in state');
      }

      const userId = user.id || user.user_id || user._id || user.uuid || user.pk || user.user_uuid;
      
      if (!userId) {
        console.error('User object:', user);
        return rejectWithValue(`User ID not found in user object. Available keys: ${Object.keys(user).join(', ')}`);
      }

      const transformedQuestions = questions.map(q => ({
        question_id: q.question_id,
        answer: q.answer
      }));

      const response = await apiClient.post(
        `/api/security-questions/user/${userId}`, 
        { questions: transformedQuestions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Re-fetch the user's security questions after saving them successfully
      dispatch(fetchUserSecurityQuestions());

      toast.success('Security questions saved!');
      return response.data;
    } catch (error) {
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
      const message = error.response?.data?.message || 'Failed to fetch security questions';
      return rejectWithValue(message);
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
      const message = error.response?.data?.message || 'Failed to fetch user security questions';
      return rejectWithValue(message);
    }
  }
);

// GET RESET QUESTIONS
export const getResetQuestions = createAsyncThunk(
    'auth/getResetQuestions',
    async (data, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/reset-questions', data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to get reset questions';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
)

// VERIFY ANSWERS
export const verifyAnswers = createAsyncThunk(
    'auth/verifyAnswers',
    async (data, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/verify-answers', data);
            toast.success('Answers verified successfully');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to verify answers';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
)

// RESET PASSWORD WITH TOKEN
export const resetPasswordWithToken = createAsyncThunk(
    'auth/resetPasswordWithToken',
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const response = await apiClient.post('/auth/reset-password', data);
            const { access_token, user_info } = response.data;
      
            dispatch(setToken(access_token)); 
            dispatch(setUser(user_info));
            toast.success('Password reset successfully');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Password reset failed';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
)


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
        localStorage.removeItem('token');
      }
      const message = error.response?.data?.message || 'Failed to fetch profile';
      return rejectWithValue(message);
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
      
      const response = await apiClient.put('/auth/change-password', requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Password updated successfully! Please log in with your new password.');
      
      dispatch(logout());
      
      return response.data;
      
    } catch (error) {
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
  profileLoading: false,
  securityQuestionsLoading: false,
  userSecurityQuestionsLoading: false,
  savingSecurityQuestions: false,
  error: null,
  securityQuestions: [], 
  userSecurityQuestions: [],
  resetQuestions: [],
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
    setUser: (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
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
        state.user = null; 
        state.isAuthenticated = false;
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
        state.savingSecurityQuestions = true;
      })
      .addCase(saveSecurityQuestions.fulfilled, (state) => {
        state.savingSecurityQuestions = false;
      })
      .addCase(saveSecurityQuestions.rejected, (state, action) => {
        state.savingSecurityQuestions = false;
        state.error = action.payload;
      })
      .addCase(fetchSecurityQuestions.pending, (state) => {
        state.securityQuestionsLoading = true;
      })
      .addCase(fetchSecurityQuestions.fulfilled, (state, action) => {
        state.securityQuestionsLoading = false;
        state.securityQuestions = action.payload.questions || [];
      })
      .addCase(fetchSecurityQuestions.rejected, (state, action) => {
        state.securityQuestionsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserSecurityQuestions.pending, (state) => {
        state.userSecurityQuestionsLoading = true;
      })
      .addCase(fetchUserSecurityQuestions.fulfilled, (state, action) => {
        state.userSecurityQuestionsLoading = false;
        state.userSecurityQuestions = action.payload.questions || [];
      })
      .addCase(fetchUserSecurityQuestions.rejected, (state, action) => {
        state.userSecurityQuestionsLoading = false;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.status = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload; 
        state.isAuthenticated = true;
        state.status = 'succeeded';
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
        state.status = 'failed';
      })
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
      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(getResetQuestions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getResetQuestions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.resetQuestions = action.payload;
      })
      .addCase(getResetQuestions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(verifyAnswers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyAnswers.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(verifyAnswers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(resetPasswordWithToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, setToken, setUser, clearError } = authSlice.actions;
export default authSlice.reducer;