import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';

// --- Thunks ---
// Place a new order
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
      return rejectWithValue(error.response?.data?.message || 'Failed to place order.');
    }
  }
);

// Fetch user's order history
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders.');
    }
  }
);

// Fetch single order details
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
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details.');
    }
  }
);

// Update order status (admin use case)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.put(
        `/api/orders/${orderId}/status`,
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status.');
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
      // Place order
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.placing = false;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = action.payload;
      })

      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order || action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        if (state.currentOrder) {
          state.currentOrder.status = action.payload.status || action.payload.order?.status;
          if (action.payload.statusHistory) {
            state.currentOrder.status_history = action.payload.statusHistory;
          }
        }
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
