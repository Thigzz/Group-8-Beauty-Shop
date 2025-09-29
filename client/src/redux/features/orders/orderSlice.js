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

// ✅ --- THIS THUNK IS NOW SPECIFICALLY FOR ADMINS --- ✅
// It hits the detailed admin endpoint. Your component will be aliased to use this.
export const fetchAdminOrderDetails = createAsyncThunk(
  'orders/fetchAdminOrderDetails', // A new unique name
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.get(`/admin/orders/${orderId}`, { // Correct admin route
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // This returns the full rich object
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch admin order details.';
      return rejectWithValue(errorMessage);
    }
  }
);

// This is the original thunk for users, it remains unchanged
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

// ✅ --- THIS THUNK NOW CORRECTLY POINTS TO THE ADMIN UPDATE ROUTE --- ✅
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.put( // Correct method is PUT
        `/admin/orders/${orderId}/status`, // Correct admin route
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // The backend now returns the full, updated order object
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update order status.';
      return rejectWithValue(errorMessage);
    }
  }
);

// --- Your Enums ---
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DISPATCHED: 'dispatched',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const FINAL_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED];

// --- Your Slice ---
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
      // Your existing reducers for placeOrder, fetchOrders are untouched
      .addCase(placeOrder.pending, (state) => { state.placing = true; state.error = null; })
      .addCase(placeOrder.fulfilled, (state) => { state.placing = false; })
      .addCase(placeOrder.rejected, (state, action) => { state.placing = false; state.error = action.payload; })
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orderHistory = action.payload; })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // Your existing reducer for USER fetchOrderDetails
      .addCase(fetchOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = { ...action.payload.order, items: action.payload.items };
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // ✅ --- ADDED: Reducer for the new ADMIN fetch order details thunk --- ✅
      .addCase(fetchAdminOrderDetails.pending, (state) => { state.loading = true; })
      .addCase(fetchAdminOrderDetails.fulfilled, (state, action) => {
          state.loading = false;
          state.currentOrder = action.payload; // The payload is the full, rich object
      })
      .addCase(fetchAdminOrderDetails.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })

      // ✅ --- MODIFIED: Reducer for updateOrderStatus --- ✅
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.updateSuccess = false;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.currentOrder = action.payload; // The backend returns the entire updated order object
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