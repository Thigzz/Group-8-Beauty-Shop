import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import authReducer from './features/auth/authSlice'; // 1. Import auth reducer

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer, // 2. Add auth reducer to the store
  },
});