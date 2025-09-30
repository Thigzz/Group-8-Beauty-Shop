import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/axios';

export const fetchSearchResults = createAsyncThunk(
  'search/fetchSearchResults',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    loading: false,
    error: null,
    query: ''
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearSearchResults: (state) => {
      state.results = [];
      state.error = null;
      state.query = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
        state.error = null;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.results = [];
      });
  }
});

export const { setQuery, clearSearchResults } = searchSlice.actions;
export default searchSlice.reducer;