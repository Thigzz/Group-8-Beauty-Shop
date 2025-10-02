import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';
import { clearCart } from '../cart/cartSlice';

// --- Thunks ---
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { getState, dispatch, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await apiClient.post('/api/checkout/process', orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // After placing the order, dispatch the clearCart action
      dispatch(clearCart());
      
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

// --- Helper functions for status validation ---
const isValidStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === ORDER_STATUS.PAID) {
    return newStatus !== ORDER_STATUS.PENDING && newStatus !== ORDER_STATUS.CANCELLED;
  }
  if (currentStatus === ORDER_STATUS.DISPATCHED && newStatus === ORDER_STATUS.CANCELLED) {
    return false;
  }
  if (FINAL_STATUSES.includes(currentStatus)) {
    return false;
  }
  
  return true;
};

const getStatusTransitionError = (currentStatus, newStatus) => {
  if (currentStatus === ORDER_STATUS.PAID && 
      (newStatus === ORDER_STATUS.PENDING || newStatus === ORDER_STATUS.CANCELLED)) {
    return 'Cannot return to pending or cancel an order that has been paid.';
  }
  
  if (currentStatus === ORDER_STATUS.DISPATCHED && newStatus === ORDER_STATUS.CANCELLED) {
    return 'Cannot cancel an order that has been dispatched.';
  }
  
  if (FINAL_STATUSES.includes(currentStatus)) {
    return 'Cannot modify order status once delivered or cancelled.';
  }
  
  return 'Invalid status transition.';
};

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status, note }, { getState, rejectWithValue }) => {
    try {
      const { token,orders } = getState().auth;
      
      const currentOrder = orders.currentOrder || 
                        orders.orderHistory.find(order => order._id === orderId);
      
      if (currentOrder && !isValidStatusTransition(currentOrder.status, status)) {
        return rejectWithValue(getStatusTransitionError(currentOrder.status, status));
      }
      const response = await apiClient.put(
        `/admin/orders/${orderId}/status`,
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      // Server-side validation error
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      
      // Our client-side validation error
      if (error.payload) {
        return rejectWithValue(error.payload);
      }
      
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

// Valid status transitions for reference
export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.DISPATCHED, ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DISPATCHED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
};


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
  
        const updatedOrder = action.payload;
        const orderIndex = state.orderHistory.findIndex(order => order._id === updatedOrder._id);
        if (orderIndex !== -1) {
          state.orderHistory[orderIndex] = updatedOrder;
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