import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../api/axios';


export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/categories/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  items: [],
  selected: null,
  selectedSubcategory: null,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },

    selectCategory: (state, action) => {
      if (action.payload === null) {
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      const categoryId =
        typeof action.payload === 'object' ? action.payload.id : action.payload;

      if (!categoryId) return;

      const fullCategory = state.items.find((c) => c.id.toString() === categoryId.toString());

      if (!fullCategory) {
        console.warn('Category not found for id:', categoryId);
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      state.selected = fullCategory;
      state.selectedSubcategory = null;
    },

    selectSubcategory: (state, action) => {
      if (action.payload === null) {
        state.selectedSubcategory = null;
        return;
      }

      const subcategoryId =
        typeof action.payload === 'object' ? action.payload.id : action.payload;

      if (!subcategoryId) {
        console.warn('No subcategory id provided');
        state.selectedSubcategory = null;
        return;
      }

      let fullSubcategory = null;
      let parentCategory = state.selected;

      if (state.selected?.subcategories) {
        fullSubcategory = state.selected.subcategories.find(
          (s) => s.id.toString() === subcategoryId.toString()
        );
      }

      if (!fullSubcategory) {
        for (const category of state.items) {
          if (category.subcategories) {
            const foundSub = category.subcategories.find(
              (s) => s.id.toString() === subcategoryId.toString()
            );
            if (foundSub) {
              fullSubcategory = foundSub;
              parentCategory = category;
              break;
            }
          }
        }
      }

      if (fullSubcategory) {
        if (!state.selected || state.selected.id !== parentCategory.id) {
          state.selected = parentCategory;
        }
        state.selectedSubcategory = fullSubcategory;
      } else {
        console.warn('Subcategory not found for id:', subcategoryId);
        state.selectedSubcategory = null;
      }
    },

    selectCategoryAndSubcategory: (state, action) => {
      const { category, subcategory } = action.payload;

      if (category === null) {
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      const categoryId = typeof category === 'object' ? category.id : category;
      const fullCategory = state.items.find((c) => c.id.toString() === categoryId.toString());

      if (!fullCategory) {
        console.warn('Category not found for id:', categoryId);
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      state.selected = fullCategory;

      if (subcategory === null) {
        state.selectedSubcategory = null;
        return;
      }

      const subcategoryId = typeof subcategory === 'object' ? subcategory.id : subcategory;

      if (!subcategoryId) {
        console.warn('No subcategory id provided');
        state.selectedSubcategory = null;
        return;
      }

      const fullSubcategory = state.selected.subcategories?.find(
        (s) => s.id.toString() === subcategoryId.toString()
      );

      if (fullSubcategory) {
        state.selectedSubcategory = fullSubcategory;
      } else {
        console.warn('Subcategory not found for id:', subcategoryId);
        state.selectedSubcategory = null;
      }
    },

    clearSelection: (state) => {
      state.selected = null;
      state.selectedSubcategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setItems,
  selectCategory,
  selectSubcategory,
  selectCategoryAndSubcategory,
  clearSelection
} = categoriesSlice.actions;

export default categoriesSlice.reducer;