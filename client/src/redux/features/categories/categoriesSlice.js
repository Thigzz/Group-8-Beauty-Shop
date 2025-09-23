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

      if (!subcategoryId || !state.selected?.subcategories) {
        console.warn('Subcategory not found or no category selected');
        state.selectedSubcategory = null;
        return;
      }

      // Find the subcategory safely
      const fullSubcategory = state.selected.subcategories.find(
        (s) => s.id.toString() === subcategoryId.toString()
      );

      if (!fullSubcategory) {
        console.warn('Subcategory not found for id:', subcategoryId);
        state.selectedSubcategory = null;
        return;
      }

      state.selectedSubcategory = fullSubcategory;
    },

    clearSelection: (state) => {
      state.selected = null;
      state.selectedSubcategory = null;
    },
  },
});

export const { setItems, selectCategory, selectSubcategory, clearSelection } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;