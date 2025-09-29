import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './features/cart/cartSlice';
import authReducer from './features/auth/authSlice';
import categoriesReducer from './features/categories/categoriesSlice';
import productsReducer from './features/products/productsSlice';
import wishlistReducer from './features/wishlist/wishlistSlice';
import uiReducer from './features/ui/uiSlice';
import searchReducer from './features/search/searchSlice';
import profileReducer from './features/profile/profileSlice';
import addressReducer  from './features/address/addressSlice';
import adminReducer from './features/admin/adminSlice';
import orderReducer from './features/orders/orderSlice'

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    cart: cartReducer,
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    wishlist: wishlistReducer,
    ui: uiReducer,
    search: searchReducer,
    address:addressReducer,
    admin:adminReducer,
    orders: orderReducer
  },
});