import { configureStore } from '@reduxjs/toolkit';
// Import the reducer from your cart slice
import cartReducer from './features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    // Add your reducers to the store
    cart: cartReducer,
  },
});