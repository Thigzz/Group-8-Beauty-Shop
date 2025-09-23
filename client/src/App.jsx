import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import apiClient from "./api/axios";

import { setItems as setCategoriesItems, selectCategory, selectSubcategory } from "./redux/features/categories/categoriesSlice";
import { selectProduct, fetchAllProducts } from "./redux/features/products/productsSlice"; // Updated import
import { addItemToCart } from "./redux/features/cart/cartSlice";
import { addItem as addToWishlist } from "./redux/features/wishlist/wishlistSlice";
import { setProductModalOpen } from "./redux/features/ui/uiSlice";

import LandingPage from "./pages/LandingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailModal from "./components/Product/ProductDetailModal";

const STATIC_CATEGORIES = [
  { id: 1, name: "Fragrance", subcategories: [] },
  { id: 2, name: "Haircare", subcategories: [] },
  { id: 3, name: "Makeup", subcategories: [] },
  { id: 4, name: "Skincare", subcategories: [] },
  { id: 5, name: "Shop All", subcategories: [] },
];

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useSelector(state => 
    state.categories.items.length ? state.categories.items : STATIC_CATEGORIES
  );
  
  const selectedProduct = useSelector(state => state.products.selected);
  const selectedCategory = useSelector(state => state.categories.selected);
  const selectedSubcategory = useSelector(state => state.categories.selectedSubcategory);
  const isProductModalOpen = useSelector(state => state.ui.isProductModalOpen);

  const productsState = useSelector(state => state.products);
  
  useEffect(() => {
  }, [productsState]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        
        const [catRes, subRes] = await Promise.all([
          apiClient.get("/categories/"),
          apiClient.get("/sub_categories/"),
          dispatch(fetchAllProducts())
        ]);

        const cats = catRes.data || [];
        const subs = subRes.data || [];

        const mergedCategories = cats.map(cat => ({
          ...cat,
          subcategories: subs.filter(sub => sub.category_id === cat.id).map(sub => ({ 
            ...sub, 
            name: sub.sub_category_name 
          }))
        }));

        dispatch(setCategoriesItems(mergedCategories));
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load data.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleCategorySelect = (category) => {
    dispatch(selectCategory(category));
  };
  
  const handleSubcategorySelect = (subcategory) => {
    dispatch(selectSubcategory(subcategory));
  };

  const handleProductClick = product => { 
    dispatch(selectProduct(product)); 
    dispatch(setProductModalOpen(true)); 
  };
  const handleCloseModal = () => dispatch(setProductModalOpen(false));
  const handleAddToCart = product => dispatch(addItemToCart(product));
  const handleAddToWishlist = product => dispatch(addToWishlist(product));

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              categories={categories} 
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect} 
              onSubcategorySelect={handleSubcategorySelect} 
              onProductClick={handleProductClick}
            />
          } 
        />

    <Route 
  path="/products" 
  element={
    <CategoryPage
      categories={categories}
      selectedCategory={selectedCategory}
      selectedSubcategory={selectedSubcategory}
      onCategorySelect={handleCategorySelect}
      onSubcategorySelect={handleSubcategorySelect}
      onProductClick={handleProductClick}
      onAddToCart={handleAddToCart}
      onAddToWishlist={handleAddToWishlist}
      showAllProducts={true}
    />
  }
/>

        
        <Route 
          path="/categories" 
          element={
            <CategoryPage
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              showAllProducts={true}
            />
          } 
        />
        
        <Route 
          path="/products/category/:categoryId" 
          element={
            <CategoryPage
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              showAllProducts={false}
            />
          } 
        />
        <Route 
          path="/products/category/:categoryId/subcategory/:subcategoryId" 
          element={
            <CategoryPage
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              showAllProducts={false}
            />
          } 
        />
        
        <Route 
          path="/search" 
          element={
            <SearchResultsPage 
              onProductClick={handleProductClick} 
            />
          } 
        />
      </Routes>

      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isProductModalOpen} 
        onClose={handleCloseModal} 
        onAddToCart={handleAddToCart} 
        onAddToWishlist={handleAddToWishlist} 
      />

      
    </Router>
  );
}

export default App;
