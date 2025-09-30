import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';


const productCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 

const getCacheKey = (type, params = {}) => {
  const { categoryId, subcategoryId, page = 1 } = params;
  switch (type) {
    case 'all':
      return `all_products_page_${page}`;
    case 'category':
      return `category_${categoryId}_page_${page}`;
    case 'subcategory':
      return `subcategory_${subcategoryId}_page_${page}`;
    case 'category_and_subcategory':
      return `category_${categoryId}_subcategory_${subcategoryId}_page_${page}`;
    case 'product':
      return `product_${params.productId}`;
    default:
      return `${type}_${JSON.stringify(params)}`;
  }
};
const getCachedData = (cacheKey) => {
  const cached = productCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (cacheKey, data) => {
  productCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
};

export const handleFulfilled = (state, action, filterType) => {
  state.loading = false;
  state.error = null;
  state.lastFetched = Date.now();

  const page = action.meta.arg?.page || 1;
  const newProducts = (action.payload.products || []).map((product) => {
    const categoryName =
      product.category_name ||
      (product.category_id
        ? state.categories.find((cat) => cat.id === product.category_id)?.name
        : null) ||
      product.category ||
      "Uncategorized";

    const subcategoryName =
      product.subcategory_name ||
      (product.subcategory_id
        ? state.subcategories.find((sub) => sub.id === product.subcategory_id)?.name
        : null) ||
      product.subcategory ||
      "None";

    return {
      ...product,
      categoryName,
      subcategoryName,
    };
  });

  if (page > 1) {
    state.items = [...state.items, ...newProducts];
  } else {
    state.items = newProducts;
  }

  state.pagination = {
    total: action.payload.total || 0,
    pages: action.payload.pages || 0,
    currentPage: action.payload.current_page || page,
  };
  state.currentFilter = filterType;
};


export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
       let query = `?page=${page}`;
       
      const cacheKey = getCacheKey('all', { page });
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get(`api/products/?page=${page}`);
      const data = response.data;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Fetch products by category 
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async ({ categoryId, page = 1 }, { rejectWithValue }) => {
    try {
      const cacheKey = getCacheKey('category', { categoryId, page });
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get(`api/products/?category_id=${categoryId}&page=${page}`);
      const data = response.data;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category products');
    }
  }
);

// Fetch products by subcategory 
export const fetchProductsBySubcategory = createAsyncThunk(
  'products/fetchBySubcategory',
  async ({ subcategoryId, page = 1 }, { rejectWithValue }) => {
    try {
      const cacheKey = getCacheKey('subcategory', { subcategoryId, page });
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get(`api/products/?sub_category_id=${subcategoryId}&page=${page}`);
      const data = response.data;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subcategory products');
    }
  }
);

// Fetch products by category + subcategory w
export const fetchProductsByCategoryAndSubcategory = createAsyncThunk(
  'products/fetchByCategoryAndSubcategory',
  async ({ categoryId, subcategoryId, page = 1 }, { rejectWithValue }) => {
    try {
      const cacheKey = getCacheKey('category_and_subcategory', { categoryId, subcategoryId, page });
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get(
        `api/products/?category_id=${categoryId}&sub_category_id=${subcategoryId}&page=${page}`
      );
      const data = response.data;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Fetch single product by ID
export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async ({ productId }, { rejectWithValue }) => {
    try {
      const cacheKey = getCacheKey('product', { productId });
      const cachedData = getCachedData(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get(`api/products/${productId}`);
      const data = response.data;
      
      setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  'products/search',
  async ({ query, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`api/products/search/?q=${encodeURIComponent(query)}&page=${page}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const clearProductCache = createAsyncThunk(
  'products/clearCache',
  async (_, { dispatch }) => {
    productCache.clear();
    return true;
  }
);

const initialState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  currentFilter: null,
  searchResults: [],
  searchLoading: false,
  searchError: null,
  pagination: {
    total: 0,
    pages: 0,
    currentPage: 1
  },
  lastFetched: null,
  cacheCleared: false
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  products: [],
  categories: [],      
  subcategories: [],
  status: "idle",
  error: null,
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
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.searchError = null;
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.loading = true;
      state.error = null;
    };
    
    const handleRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload || action.error?.message || 'An error occurred';
    };
    
    const handleFulfilled = (state, action, filterType) => {
      state.loading = false;
      state.error = null;
      state.lastFetched = Date.now();

      const page = action.meta.arg?.page || 1;
      const newProducts = action.payload.products || [];

      if (page > 1) {
        state.items = [...state.items, ...newProducts];
      } else {
        state.items = newProducts;
      }

      state.pagination = {
        total: action.payload.total || 0,
        pages: action.payload.pages || 0,
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
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch product';
      });

    // Search Products
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchError = null;
        
        const page = action.meta.arg?.page || 1;
        const newResults = action.payload.products || [];

        if (page > 1) {
          state.searchResults = [...state.searchResults, ...newResults];
        } else {
          state.searchResults = newResults;
        }
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload || action.error?.message || 'Search failed';
      });

    // Clear Cache
    builder
      .addCase(clearProductCache.fulfilled, (state) => {
        state.cacheCleared = true;
        setTimeout(() => {
          state.cacheCleared = false;
        }, 1000);
      });
  }
});

export const { 
  setItems, 
  selectProduct, 
  clearSelectedProduct, 
  clearProducts, 
  clearSearchResults, 
  clearError 
} = productsSlice.actions;

export default productsSlice.reducer;

// Selectors for easy access to state
export const selectAllProducts = (state) => state.products.items;
export const selectSelectedProduct = (state) => state.products.selected;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;
export const selectSearchResults = (state) => state.products.searchResults;
export const selectSearchLoading = (state) => state.products.searchLoading;
export const selectSearchError = (state) => state.products.searchError;
export const selectPagination = (state) => state.products.pagination;
export const selectCurrentFilter = (state) => state.products.currentFilter;