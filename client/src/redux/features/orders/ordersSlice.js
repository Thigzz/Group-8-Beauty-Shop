import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api';

// Thunk to place a new order
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(`${API_URL}/checkout/process`, orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to place order.');
    }
  }
);

// Thunk to fetch the user's order history
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch orders.');
    }
  }
);

// --- NEW THUNK ADDED ---
// Thunk to fetch details for a single order
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      // This endpoint is based on your checkout.py file
      const response = await axios.get(`${API_URL}/checkout/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch order details.');
    }
  }
);


const initialState = {
  orderHistory: [],
  status: 'idle',
  error: null,
  // --- NEW STATE ADDED ---
  currentOrderDetails: null,
  detailsStatus: 'idle',
  detailsError: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // --- NEW CASES ADDED ---
      .addCase(fetchOrderDetails.pending, (state) => {
        state.detailsStatus = 'loading';
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.detailsStatus = 'succeeded';
        state.currentOrderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.detailsStatus = 'failed';
        state.detailsError = action.payload;
      });
  },
});

export default ordersSlice.reducer;