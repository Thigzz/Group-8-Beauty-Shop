import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await apiClient.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch order details'
      );
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      
      const response = await apiClient.put(
        `/api/orders/${orderId}/status`,
        { status, note },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update order status'
      );
    }
  }
);

// Order status enums
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Final statuses that cannot be changed
export const FINAL_STATUSES = [
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.DELIVERED
];

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    currentOrder: null,
    loading: false,
    error: null,
    updating: false,
    updateSuccess: false
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
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        // Update the current order with new status
        if (state.currentOrder) {
          state.currentOrder.status = action.payload.status || action.payload.order?.status;
          // Update status history if provided
          if (action.payload.statusHistory) {
            state.currentOrder.status_history = action.payload.statusHistory;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  }
});

export const { clearOrder, clearError, clearUpdateSuccess } = orderSlice.actions;
export default orderSlice.reducer;