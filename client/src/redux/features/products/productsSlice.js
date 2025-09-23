import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';

// ================== Async Thunks ==================

// Fetch all products with optional page
export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page = 1 } = {}) => {
    const response = await apiClient.get(`/products/?page=${page}`);
    return response.data;
  }
);

// Fetch products by category with optional page
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async ({ categoryId, page = 1 }) => {
    const response = await apiClient.get(`/products/?category_id=${categoryId}&page=${page}`);
    return response.data;
  }
);

// Fetch products by subcategory with optional page
export const fetchProductsBySubcategory = createAsyncThunk(
  'products/fetchBySubcategory',
  async ({ subcategoryId, page = 1 }) => {
    const response = await apiClient.get(`/products/?sub_category_id=${subcategoryId}&page=${page}`);
    return response.data;
  }
);

// Fetch products by category + subcategory with optional page
export const fetchProductsByCategoryAndSubcategory = createAsyncThunk(
  'products/fetchByCategoryAndSubcategory',
  async ({ categoryId, subcategoryId, page = 1 }) => {
    const response = await apiClient.get(
      `/products/?category_id=${categoryId}&sub_category_id=${subcategoryId}&page=${page}`
    );
    return response.data;
  }
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async ({ productId }) => {
    const response = await apiClient.get(`/products/${productId}`);
    return response.data;
  }
);

// ================== Initial State ==================

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  currentFilter: null,
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1
  }
};

// ================== Slice ==================

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    selectProduct: (state, action) => {
      state.selected = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selected = null;
    },
    clearProducts: (state) => {
      state.items = [];
      state.currentFilter = null;
      state.pagination = { total: 0, pages: 0, currentPage: 1 };
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    };
    const handleFulfilled = (state, action, filterType) => {
      state.loading = false;

      // Append or replace based on page
      const page = action.meta.arg?.page || 1;
      const newProducts = action.payload.products || [];

      if (page > 1) {
        state.items = [...state.items, ...newProducts];
      } else {
        state.items = newProducts;
      }

      state.pagination = {
        total: action.payload.total,
        pages: action.payload.pages,
        currentPage: action.payload.current_page || page
      };
      state.currentFilter = filterType;
    };

    // All Products
    builder
      .addCase(fetchAllProducts.pending, handlePending)
      .addCase(fetchAllProducts.fulfilled, (state, action) => handleFulfilled(state, action, 'all'))
      .addCase(fetchAllProducts.rejected, handleRejected);

    // By Category
    builder
      .addCase(fetchProductsByCategory.pending, handlePending)
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => handleFulfilled(state, action, 'category'))
      .addCase(fetchProductsByCategory.rejected, handleRejected);

    // By Subcategory
    builder
      .addCase(fetchProductsBySubcategory.pending, handlePending)
      .addCase(fetchProductsBySubcategory.fulfilled, (state, action) => handleFulfilled(state, action, 'subcategory'))
      .addCase(fetchProductsBySubcategory.rejected, handleRejected);

    // By Category + Subcategory
    builder
      .addCase(fetchProductsByCategoryAndSubcategory.pending, handlePending)
      .addCase(fetchProductsByCategoryAndSubcategory.fulfilled, (state, action) =>
        handleFulfilled(state, action, 'category_and_subcategory')
      )
      .addCase(fetchProductsByCategoryAndSubcategory.rejected, handleRejected);

    // Single Product
    builder
      .addCase(fetchProductById.pending, handlePending)
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchProductById.rejected, handleRejected);
  }
});

export const { setItems, selectProduct, clearSelectedProduct, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;