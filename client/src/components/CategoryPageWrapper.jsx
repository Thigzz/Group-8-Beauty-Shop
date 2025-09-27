import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectProduct } from '../redux/features/products/productsSlice';
import { setProductModalOpen } from '../redux/features/ui/uiSlice';
import { addItemToCart } from '../redux/features/cart/cartSlice';
import { addItem as addToWishlist } from '../redux/features/wishlist/wishlistSlice';
import CategoryPage from '../pages/CategoryPage';
import { CategoryRouteHandler } from './CategoryProvider';
import { selectCategory, selectSubcategory } from '../redux/features/categories/categoriesSlice';


const CategoryPageWrapper = ({ showAllProducts }) => {
  const dispatch = useDispatch();
  const selectedCategory = useSelector(state => state.categories.selected);
  const selectedSubcategory = useSelector(state => state.categories.selectedSubcategory);
  const categories = useSelector(state => state.categories.items);

  return (
    <CategoryRouteHandler showAllProducts={showAllProducts}>
      <CategoryPage
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onCategorySelect={(category) => dispatch(selectCategory(category))}
        onSubcategorySelect={(subcategory) => dispatch(selectSubcategory(subcategory))}
        onProductClick={(product) => {
          dispatch(selectProduct(product)); 
          dispatch(setProductModalOpen(true));
        }}
        onAddToCart={(product) => dispatch(addItemToCart(product))}
        onAddToWishlist={(product) => dispatch(addToWishlist(product))}
        showAllProducts={showAllProducts}
      />
    </CategoryRouteHandler>
  );
};

export default CategoryPageWrapper;