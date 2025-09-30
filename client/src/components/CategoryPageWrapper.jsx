import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectProduct,
  fetchAllProducts,
  fetchProductsByCategory,
  fetchProductsBySubcategory,
  fetchProductsByCategoryAndSubcategory
} from '../redux/features/products/productsSlice';
import { setProductModalOpen } from '../redux/features/ui/uiSlice';
import { addItemToCart } from '../redux/features/cart/cartSlice';
import { addItem as addToWishlist } from '../redux/features/wishlist/wishlistSlice';
import CategoryPage from '../pages/CategoryPage';
import { CategoryRouteHandler } from './CategoryProvider';
import { selectCategory, selectSubcategory } from '../redux/features/categories/categoriesSlice';

const CategoryPageWrapper = ({ showAllProducts = false }) => {
  const dispatch = useDispatch();
  const selectedCategory = useSelector(state => state.categories.selectedCategory || state.categories.selected);
  const selectedSubcategory = useSelector(state => state.categories.selectedSubcategory);
  const categories = useSelector(state => state.categories.items);

  useEffect(() => {
    if (showAllProducts) {
      dispatch(selectCategory(null));
      dispatch(selectSubcategory(null));
      dispatch(fetchAllProducts({ page: 1 }));
    } else if (selectedSubcategory?.id === 'all' && selectedCategory) {
      // Category-specific Shop All
      dispatch(fetchProductsByCategory({
        categoryId: selectedCategory.id,
        page: 1
      }));
    } else if (selectedCategory && selectedSubcategory) {
      // Normal category + subcategory
      dispatch(fetchProductsByCategoryAndSubcategory({
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory.id,
        page: 1
      }));
    } else if (selectedCategory) {
      // Only category selected
      dispatch(fetchProductsByCategory({
        categoryId: selectedCategory.id,
        page: 1
      }));
    } else if (selectedSubcategory) {
      // Only subcategory selected
      dispatch(fetchProductsBySubcategory({
        subcategoryId: selectedSubcategory.id,
        page: 1
      }));
    } else {
      // No selections - fetch all products
      dispatch(fetchAllProducts({ page: 1 }));
    }
  }, [selectedCategory, selectedSubcategory, showAllProducts, dispatch]);

  // Handle category selection
  const handleCategorySelect = (category) => {
    dispatch(selectCategory(category));
    dispatch(selectSubcategory(null));
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    dispatch(selectSubcategory(subcategory));
  };

  // Handle Shop All for a specific category
  const handleShopAllCategory = (category) => {
    dispatch(selectCategory(category));
    dispatch(selectSubcategory({ id: 'all', name: 'All Products' }));
  };

  // Handle global Shop All (from navbar)
  const handleGlobalShopAll = () => {
    dispatch(selectCategory(null));
    dispatch(selectSubcategory(null));
  };

  const isShopAllMode = selectedSubcategory?.id === 'all' || showAllProducts;

  return (
    <CategoryRouteHandler>
      <CategoryPage
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategorySelect={handleCategorySelect}
        onSubcategorySelect={handleSubcategorySelect}
        onShopAllCategory={handleShopAllCategory}
        onGlobalShopAll={handleGlobalShopAll} 
        onProductClick={(product) => {
          dispatch(selectProduct(product));
          dispatch(setProductModalOpen(true));
        }}
        onAddToCart={(product) => dispatch(addItemToCart(product))}
        onAddToWishlist={(product) => dispatch(addToWishlist(product))}
        showAllProducts={showAllProducts}
        isShopAllMode={isShopAllMode}
      />
    </CategoryRouteHandler>
  );
};

export default CategoryPageWrapper;