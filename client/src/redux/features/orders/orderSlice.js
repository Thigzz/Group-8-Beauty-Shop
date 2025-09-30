import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';

// --- Thunks ---
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.post('/api/checkout/process', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to place order.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.get('/api/orders/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch orders.';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchAdminOrderDetails = createAsyncThunk(
  'orders/fetchAdminOrderDetails',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.get(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch admin order details.';
      return rejectWithValue(errorMessage);
    }
  }
);

// This is the thunk for the user's order details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch order details.';
      return rejectWithValue(errorMessage);
    }
  }
);


export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.put(
        `/admin/orders/${orderId}/status`,
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update order status.';
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Enums ---
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const FINAL_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED];

// --- Slice ---
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orderHistory: [],
    currentOrder: null,
    loading: false,
    error: null,
    placing: false,
    updating: false,
    updateSuccess: false,
  },
  reducers: {
    clearOrder: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.updateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => { state.placing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state) => { state.placing = false; })
      .addCase(placeOrder.rejected, (state, action) => { state.placing = false; state.error = action.payload; })
      
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload.orders;
      })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(fetchOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchAdminOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOrderDetails.fulfilled, (state, action) => {
          state.loading = false;
          state.currentOrder = action.payload;
      })
      .addCase(fetchAdminOrderDetails.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })

      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.currentOrder = action.payload;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.updateSuccess = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrder, clearError, clearUpdateSuccess } = ordersSlice.actions;
export default ordersSlice.reducer;