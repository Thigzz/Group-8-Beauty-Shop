import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import apiClient from "./api/axios";

import { setItems as setCategoriesItems, selectCategory, selectSubcategory, selectCategoryAndSubcategory } from "./redux/features/categories/categoriesSlice";
import { selectProduct, fetchAllProducts } from "./redux/features/products/productsSlice";
import { addItemToCart } from "./redux/features/cart/cartSlice";
import { addItem as addToWishlist } from "./redux/features/wishlist/wishlistSlice";
import { setProductModalOpen } from "./redux/features/ui/uiSlice";

// Import the merged Navbar component
import Header from "./components/Header";
import Navbar from "./components/Navbar";

// Auth pages
// import LoginPage from './pages/LoginPage';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import SecurityQuestions from './pages/security-questions';

// Main pages
import LandingPage from "./pages/LandingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Admin
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

import CategoryPage from "./pages/CategoryPage";
import ProductDetailModal from "./components/Product/ProductDetailModal";

import './App.css';

const STATIC_CATEGORIES = [
  { id: 1, name: "FRAGRANCE", subcategories: [] },
  { id: 2, name: "HAIR CARE", subcategories: [] },
  { id: 3, name: "MAKEUP", subcategories: [] },
  { id: 4, name: "SKIN CARE", subcategories: [] },
  { id: 5, name: "SHOP ALL", subcategories: [] },
];

const CategoryPageWrapper = ({ showAllProducts }) => {
  const { categoryId, subcategoryId, categoryName, subcategoryName } = useParams(); 
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.items);
  
  useEffect(() => {
    if (categoryId && categoryId !== "undefined") {
      // Handle ID-based routes
      const category = categories.find(cat => cat.id.toString() === categoryId.toString());
      if (category) {
        dispatch(selectCategory(category));
        
        if (subcategoryId && subcategoryId !== "undefined") {
          const subcategory = category.subcategories?.find(
            sub => sub.id.toString() === subcategoryId.toString()
          );
          if (subcategory) {
            dispatch(selectSubcategory(subcategory));
          } else {
            dispatch(selectSubcategory(null));
          }
        } else {
          dispatch(selectSubcategory(null));
        }
      }
    } else if (categoryName) {
      // Handle slug-based routes (e.g., /category/makeup, /category/makeup/lipstick)
      const category = categories.find(cat => {
        const catName = (cat.category_name || cat.name || "").toLowerCase();
        return catName === categoryName.toLowerCase();
      });
      
      if (category) {
        dispatch(selectCategory(category));
        
        if (subcategoryName) {
          const subcategory = category.subcategories?.find(
            sub => {
              const subName = (sub.sub_category_name || sub.name || "").toLowerCase();
              return subName === subcategoryName.toLowerCase();
            }
          );
          dispatch(selectSubcategory(subcategory || null));
        } else {
          dispatch(selectSubcategory(null));
        }
      } else {
        // Category not found, clear selections
        dispatch(selectCategory(null));
        dispatch(selectSubcategory(null));
      }
    } else {
      // If no category parameters, clear selections (for /products route)
      dispatch(selectCategory(null));
      dispatch(selectSubcategory(null));
    }
  }, [categoryId, subcategoryId, categoryName, subcategoryName, categories, dispatch]);

  const selectedCategory = useSelector(state => state.categories.selected);
  const selectedSubcategory = useSelector(state => state.categories.selectedSubcategory);

  return (
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
  );
};

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useSelector(state => 
    state.categories.items.length ? state.categories.items : STATIC_CATEGORIES
  );
  
  const selectedProduct = useSelector(state => state.products.selected);
  const isProductModalOpen = useSelector(state => state.ui.isProductModalOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [catRes, subRes] = await Promise.all([
          apiClient.get("api/categories/"),
          apiClient.get("api/sub_categories/"),
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
      <div className="App">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            success: {
              style: {
                background: '#28a745',
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#dc3545',
                color: 'white',
              },
            },
          }}
        />
        
        <div className="sticky top-0 z-50">
          <Header />
          <Navbar />
        </div>
        
        <div className="pt-0">
          <Routes>
            {/* Main Routes */}
            <Route 
              path="/" 
              element={
                <LandingPage 
                  categories={categories} 
                  onProductClick={handleProductClick}
                />
              } 
            />

            <Route 
              path="/products" 
              element={<CategoryPageWrapper showAllProducts={true} />} 
            />
            
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/security-questions" element={<SecurityQuestions />} />
            <Route path="/search" element={<SearchResultsPage />} />
    
  

            {/* Search Route */}
            <Route 
              path="/search" 
              element={
                <SearchResultsPage 
                  onProductClick={handleProductClick} 
                />
              } 
            />

            {/* Category & Product Routes */}
            <Route 
              path="/categories" 
              element={<CategoryPageWrapper showAllProducts={true} />} 
            />
            
            {/* ID-based category routes */}
            <Route 
              path="/products/category/:categoryId" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />
            
            <Route 
              path="/products/category/:categoryId/subcategory/:subcategoryId" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />

            {/* Slug-based category routes */}
            <Route 
              path="/category/:categoryName" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />
            
            <Route 
              path="/category/:categoryName/:subcategoryName" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />

            {/* User Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            {/* Admin Protected Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route index element={<DashboardPage />} />
            </Route>

              <Route path="/shop-all" element={<CategoryPageWrapper showAllProducts={true} />} />
              <Route path="/makeup" element={<CategoryPageWrapper showAllProducts={false} />} />
              <Route path="/skincare" element={<CategoryPageWrapper showAllProducts={false} />} />
              <Route path="/fragrance" element={<CategoryPageWrapper showAllProducts={false} />} />
              <Route path="/accessories" element={<CategoryPageWrapper showAllProducts={false} />} />

              {/* Slug-based category routes */}
            <Route 
              path="/category/:categoryName" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />

            <Route 
              path="/category/:categoryName/:subcategoryName" 
              element={<CategoryPageWrapper showAllProducts={false} />} 
            />

          </Routes>
        </div>


        {/* Global Modal */}
        <ProductDetailModal 
          product={selectedProduct} 
          isOpen={isProductModalOpen} 
          onClose={handleCloseModal} 
          onAddToCart={handleAddToCart} 
          onAddToWishlist={handleAddToWishlist} 
        />
      </div>
    </Router>
  );
}

export default App;