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
import profileReducer from './features/profile/profileSlice';
import adminReducer from './features/admin/adminSlice';

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
    profile: profileReducer,
    admin: adminReducer,
  },
});

export default store;
