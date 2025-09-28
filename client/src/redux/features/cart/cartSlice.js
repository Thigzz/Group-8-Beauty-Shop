import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from '../auth/authSlice';

const API_URL = 'http://127.0.0.1:5000/api';


export const getCart = createAsyncThunk(
  'cart/getCart',
  async ({ userId, sessionId }, { rejectWithValue }) => {
    try {
      const params = userId ? { user_id: userId } : { session_id: sessionId };
      const response = await axios.get(`${API_URL}/carts/`, { params });
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
      const response = await axios.post(`${API_URL}/carts/items`, {
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
      const response = await axios.put(`${API_URL}/carts/items/${itemId}`, { quantity });
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

      const response = await axios.delete(`${API_URL}/carts/items/${itemId}`);
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
    // --- DO NOT EDIT OR REMOVE!!!! ---
    // This reducer resets the cart state to its initial empty state.
    // It's used after a successful order placement.
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