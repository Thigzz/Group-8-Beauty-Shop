import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';
import toast from 'react-hot-toast';

const transformationCache = new Map();

export const fetchProducts = createAsyncThunk(
  'admin/fetchProducts',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { token } = state.auth;
      
      if (!token) {
        toast.error('Please log in to access admin features');
        return rejectWithValue('No authentication token');
      }

      const queryParams = new URLSearchParams();
      
      queryParams.append('page', params.page || 1);
      queryParams.append('limit', params.limit || 10);
      
      if (params.search && params.search.trim() !== '') {
        queryParams.append('search', params.search);
      }
      if (params.status !== undefined && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      if (params.category_id && params.category_id !== 'all') {
        queryParams.append('category_id', params.category_id);
      }
      if (params.sub_category_id && params.sub_category_id !== 'all') {
        queryParams.append('sub_category_id', params.sub_category_id);
      }
      const response = await apiClient.get(`/api/products/?${queryParams.toString()}`);
      
      return response.data;
    } catch (error) {
     
      const errorMessage = error.response?.data?.message || 'Failed to fetch products';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      await apiClient.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      return { productId };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const toggleProductStatus = createAsyncThunk(
  'admin/toggleProductStatus',
  async ({ productId, status }, { getState, rejectWithValue, dispatch }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        return rejectWithValue('No authentication token');
      }
      
      const updateData = { status: status };
      const response = await apiClient.put(`/api/products/${productId}`, updateData);

      toast.success(`Product ${status ? 'activated' : 'deactivated'} successfully`);

      return {
        productId,
        status: status,
        updatedProduct: response.data
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update product status';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await apiClient.post('/api/products/', productData);
      
      toast.success('Product created successfully');
      return response.data;
    } catch (error) {
      toast.error('Create product error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create product';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ productId, productData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await apiClient.put(`/api/products/${productId}`, productData);

      toast.success('Product updated successfully');
      return response.data;
    } catch (error) {
      toast.error('Update product error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update product';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'admin/fetchCategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await apiClient.get('/api/categories/');
      
      return response.data;
    } catch (error) {
      toast.error('fetchCategories error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch categories';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchSubcategories = createAsyncThunk(
  'admin/fetchSubcategories',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await apiClient.get('/api/sub_categories/');
      
      return response.data;
    } catch (error) {
      toast.error('fetchSubcategories error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch subcategories';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createCategory = createAsyncThunk(
  'admin/createCategory',
  async ({ category_name }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await apiClient.post('/api/categories/', { 
        category_name: category_name 
      });
      
      toast.success('Category created successfully');
      return response.data;
    } catch (error) {
      toast.error('Create category error:', error);
      toast.error('Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create category';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const createSubcategory = createAsyncThunk(
  'admin/createSubcategory',
  async ({ sub_category_name, category_id }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }


      const response = await apiClient.post('/api/sub_categories/', { 
        sub_category_name: sub_category_name,
        category_id: category_id 
      });
      
      toast.success('Subcategory created successfully');
      return response.data;
    } catch (error) {
      toast.error('Create subcategory error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create subcategory';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const bulkUploadProducts = createAsyncThunk(
  'admin/bulkUploadProducts',
  async (products, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const createdProducts = [];
      const errors = [];

      for (const productData of products) {
        try {
          const response = await apiClient.post('/api/products/', productData);
          createdProducts.push(response.data);
        } catch (error) {
          errors.push({
            product: productData.name || 'Unknown',
            error: error.response?.data?.message || error.message
          });
        }
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} products failed to upload.`);
        toast.error('Bulk upload errors:', errors);
      }

      if (createdProducts.length > 0) {
        toast.success(`Successfully uploaded ${createdProducts.length} products`);
      }

      return createdProducts;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to bulk upload products';
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  products: [],
  categories: [],
  subcategories: [],
  loading: false,
  error: null,
  operationLoading: false,
  currentPage: 1,
  totalPages: 1,
  totalProducts: 0,
  itemsPerPage: 10,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    resetAdminState: () => {
      transformationCache.clear();
      return initialState;
    },
 
    manuallyUpdateProductStatus: (state, action) => {
      const { productId, status } = action.payload;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        product.isActive = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

.addCase(fetchProducts.fulfilled, (state, action) => {
  state.loading = false;
  const response = action.payload;
  const productsData = response.products || response.results || response;
  
  state.currentPage = response.current_page || response.page || 1;
  state.totalPages = response.pages || response.total_pages || Math.ceil((response.total || productsData.length) / state.itemsPerPage);
  state.totalProducts = response.total || response.count || productsData.length;
  
  if (Array.isArray(productsData)) {
    state.products = productsData.map(product => {
      const isActive = product.status === true;
      
      return {
        id: product.id,
        name: product.product_name || product.name || 'Unknown Product',
        image: product.image_url || product.image,
        sku: product.sku || 'N/A',
        category: product.category_name || product.category || 'Uncategorized',
        subcategory: product.subcategory_name || product.sub_category_name || product.subcategory || 'None',
        price: product.price || 0,
        stock: product.stock_qty || product.stock || product.quantity || 0,
        isActive: isActive, 
        isDeleted: product.is_deleted === true || product.is_deleted === 1,
        description: product.description,
        category_id: product.category_id,
        subcategory_id: product.subcategory_id || product.sub_category_id,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });
  } else {
    state.products = [];
  }
})
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { productId } = action.payload;
        transformationCache.clear();
        state.products = state.products.filter(product => product.id !== productId);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleProductStatus.pending, (state, action) => {
        state.operationLoading = true;
        const { productId, status } = action.meta.arg;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.isActive = status;
        }
      })
      .addCase(toggleProductStatus.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { productId, status, numericStatus, updatedProduct } = action.payload;
        const index = state.products.findIndex(p => p.id === productId);
  
        if (index !== -1) {
      state.products[index] = {
      ...state.products[index],
      isActive: status, 
      ...(updatedProduct && {
        name: updatedProduct.product_name || updatedProduct.name || state.products[index].name,
        price: updatedProduct.price || state.products[index].price,
        stock: updatedProduct.stock_qty || updatedProduct.stock || state.products[index].stock,
      })
    };
  }
})
      .addCase(toggleProductStatus.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
        
        const { productId, status } = action.meta.arg;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.isActive = !status;
        }
      })
      
      .addCase(createProduct.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.operationLoading = false;
        const newProduct = action.payload;
        
        state.products.unshift({
          id: newProduct.id,
          name: newProduct.name || newProduct.product_name || 'Unknown Product',
          image: newProduct.image_url || newProduct.image,
          sku: newProduct.sku || 'N/A',
          category: newProduct.category_name || newProduct.category || 'Uncategorized',
          subcategory: newProduct.subcategory_name || newProduct.subcategory || 'None',
          price: newProduct.price || 0,
          stock: newProduct.stock_qty || newProduct.stock || newProduct.quantity || 0,
          isActive: newProduct.is_active === true || newProduct.is_active === 1 || 
                    newProduct.active === true || newProduct.active === 1 ||
                    newProduct.status === 'active',
          isDeleted: newProduct.is_deleted === true || newProduct.is_deleted === 1,
          description: newProduct.description,
          category_id: newProduct.category_id,
          subcategory_id: newProduct.subcategory_id,
          created_at: newProduct.created_at,
          updated_at: newProduct.updated_at
        });
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateProduct.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.operationLoading = false;
        const updatedProduct = action.payload;
        const index = state.products.findIndex(p => p.id === updatedProduct.id);
        
        if (index !== -1) {
          state.products[index] = {
            id: updatedProduct.id,
            name: updatedProduct.name || updatedProduct.product_name || state.products[index].name,
            image: updatedProduct.image_url || updatedProduct.image || state.products[index].image,
            sku: updatedProduct.sku || state.products[index].sku,
            category: updatedProduct.category_name || updatedProduct.category || state.products[index].category,
            subcategory: updatedProduct.subcategory_name || updatedProduct.subcategory || state.products[index].subcategory,
            price: updatedProduct.price || state.products[index].price,
            stock: updatedProduct.stock_qty || updatedProduct.stock || updatedProduct.quantity || state.products[index].stock,
            isActive: updatedProduct.is_active === true || updatedProduct.is_active === 1 || 
            updatedProduct.active === true || updatedProduct.active === 1 ||
            updatedProduct.status === 'active',
            isDeleted: updatedProduct.is_deleted === true || updatedProduct.is_deleted === 1,
            description: updatedProduct.description || state.products[index].description,
            category_id: updatedProduct.category_id || state.products[index].category_id,
            subcategory_id: updatedProduct.subcategory_id || state.products[index].subcategory_id,
            created_at: updatedProduct.created_at || state.products[index].created_at,
            updated_at: updatedProduct.updated_at || state.products[index].updated_at
          };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;
        
        if (response.categories && Array.isArray(response.categories)) {
          state.categories = response.categories;
        } else if (Array.isArray(response)) {
          state.categories = response;
        } else if (response.results && Array.isArray(response.results)) {
          state.categories = response.results;
        } else if (response.data && Array.isArray(response.data)) {
          state.categories = response.data;
        } else {
          state.categories = [];
        }
        
        if (response.subcategories && Array.isArray(response.subcategories)) {
          state.subcategories = response.subcategories;
        } else if (response.results && response.results.subcategories) {
          state.subcategories = response.results.subcategories;
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchSubcategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubcategories.fulfilled, (state, action) => {
        state.loading = false;
        const response = action.payload;

  let subcategoriesData = [];
  
  if (response.sub_categories && Array.isArray(response.sub_categories)) {
    subcategoriesData = response.sub_categories;
  } else if (Array.isArray(response)) {
    subcategoriesData = response;
  } else if (response.results && Array.isArray(response.results)) {
    subcategoriesData = response.results;
  } else if (response.data && Array.isArray(response.data)) {
    subcategoriesData = response.data;
  } else {
    subcategoriesData = [];
  }
  
  state.subcategories = subcategoriesData.map(sub => ({
    id: sub.id,
    name: sub.sub_category_name || sub.subcategory_name || sub.name || 'Unknown Subcategory',
    category_id: sub.category_id || sub.categoryId,
    created_at: sub.created_at
  }));
  
})
    
      .addCase(fetchSubcategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createCategory.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(createSubcategory.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(createSubcategory.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.subcategories.push(action.payload);
      })
      .addCase(createSubcategory.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      .addCase(bulkUploadProducts.pending, (state) => {
        state.operationLoading = true;
      })
      .addCase(bulkUploadProducts.fulfilled, (state, action) => {
        state.operationLoading = false;
        if (Array.isArray(action.payload)) {
          const transformedProducts = action.payload.map(product => ({
            id: product.id,
            name: product.name || product.product_name || 'Unknown Product',
            image: product.image_url || product.image,
            sku: product.sku || 'N/A',
            category: product.category_name || product.category || 'Uncategorized',
            subcategory: product.subcategory_name || product.subcategory || 'None',
            price: product.price || 0,
            stock: product.stock_qty || product.stock || product.quantity || 0,
            isActive: product.is_active === true || product.is_active === 1 || 
            product.active === true || product.active === 1 ||
            product.status === 'active',
            isDeleted: product.is_deleted === true || product.is_deleted === 1,
            description: product.description,
            category_id: product.category_id,
            subcategory_id: product.subcategory_id,
            created_at: product.created_at,
            updated_at: product.updated_at
          }));
          state.products.push(...transformedProducts);
        }
      })
      .addCase(bulkUploadProducts.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});
export const { clearAdminError, resetAdminState, manuallyUpdateProductStatus } = adminSlice.actions;
export default adminSlice.reducer;