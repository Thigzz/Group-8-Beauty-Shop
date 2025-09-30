import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProductModalOpen: false,
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setProductModalOpen: (state, action) => {
      state.isProductModalOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setProductModalOpen, setLoading, setError, clearError } = uiSlice.actions;
export default uiSlice.reducer;