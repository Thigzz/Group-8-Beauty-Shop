import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import cartReducer from './features/cart/cartSlice';
import categoriesReducer from './features/categories/categoriesSlice';
import productsReducer from './features/products/productsSlice';
import searchReducer from './features/search/searchSlice';
import uiReducer from './features/ui/uiSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import addressReducer from './features/address/addressSlice';
import ordersReducer from './features/orders/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    categories: categoriesReducer,
    products: productsReducer,
    search: searchReducer,
    ui: uiReducer,
    wishlist: wishlistReducer,
    address: addressReducer,
    orders: ordersReducer,
  },
});

export default store;