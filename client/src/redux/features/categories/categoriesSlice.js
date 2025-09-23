import { createSlice } from '@reduxjs/toolkit';

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
      // Handle null case for "Shop All"
      if (action.payload === null) {
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      // action.payload can be an object { id: ... } or just the id
      const categoryId =
        typeof action.payload === 'object' ? action.payload.id : action.payload;

      if (!categoryId) return; // Guard: no id provided

      // Find the category safely
      const fullCategory = state.items.find((c) => c.id.toString() === categoryId.toString());

      if (!fullCategory) {
        console.warn('Category not found for id:', categoryId);
        state.selected = null;
        state.selectedSubcategory = null;
        return;
      }

      state.selected = fullCategory;
      state.selectedSubcategory = null; // Reset subcategory when category changes
    },

    selectSubcategory: (state, action) => {
      // Handle null case for "All Category"
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

      // NEW IMPROVED LOGIC: Search through all categories if no category is selected
      let fullSubcategory = null;
      let parentCategory = state.selected;

      // If a category is selected, search in its subcategories first
      if (state.selected?.subcategories) {
        fullSubcategory = state.selected.subcategories.find(
          (s) => s.id.toString() === subcategoryId.toString()
        );
      }

      // If not found in selected category OR no category is selected, search all categories
      if (!fullSubcategory) {
        for (const category of state.items) {
          if (category.subcategories) {
            const foundSub = category.subcategories.find(
              (s) => s.id.toString() === subcategoryId.toString()
            );
            if (foundSub) {
              fullSubcategory = foundSub;
              parentCategory = category; // Set the parent category
              break;
            }
          }
        }
      }

      if (fullSubcategory) {
        // Auto-select the parent category if it's not already selected
        if (!state.selected || state.selected.id !== parentCategory.id) {
          state.selected = parentCategory;
        }
        state.selectedSubcategory = fullSubcategory;
      } else {
        console.warn('Subcategory not found for id:', subcategoryId);
        state.selectedSubcategory = null;
      }
    },

    // NEW ACTION: Select both category and subcategory at once
    selectCategoryAndSubcategory: (state, action) => {
      const { category, subcategory } = action.payload;
      
      // Handle category selection
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

      // Handle subcategory selection
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
});

export const { 
  setItems, 
  selectCategory, 
  selectSubcategory, 
  selectCategoryAndSubcategory,
  clearSelection 
} = categoriesSlice.actions;

export default categoriesSlice.reducer;