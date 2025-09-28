import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';
import { logout } from '../auth/authSlice';


export const getCart = createAsyncThunk(
  'cart/getCart',
  async ({ userId, sessionId }, { rejectWithValue }) => {
    try {
      const params = userId ? { user_id: userId } : { session_id: sessionId };
      // FIX: Added trailing slash
      const response = await apiClient.get('/api/carts/', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get cart');
    }
  }
);


export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async ({ cartId, productId, quantity }, { rejectWithValue }) => {
    try {
      // FIX: Added trailing slash
      const response = await apiClient.post('/api/carts/items', {
        cart_id: cartId,
        product_id: productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to add item');
    }
  }
);


export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      // FIX: Added trailing slash
      const response = await apiClient.put(`/api/carts/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update item');
    }
  }
);


export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      // FIX: Added trailing slash
      const response = await apiClient.delete(`/api/carts/items/${itemId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to remove item');
    }
  }
);

const initialState = {
  id: null,
  user_id: null,
  items: [],
  grand_total: 0,
  status: 'idle',
  error: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.id = null;
      state.user_id = null;
      state.items = [];
      state.grand_total = 0;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.id = action.payload.id;
        state.user_id = action.payload.user_id;
        state.items = action.payload.items;
        state.grand_total = action.payload.grand_total;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.grand_total = action.payload.grand_total;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.grand_total = action.payload.grand_total;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.grand_total = action.payload.grand_total;
      })
      .addCase(logout.type, (state) => {
        Object.assign(state, initialState);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;