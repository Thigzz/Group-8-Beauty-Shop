import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import { selectProduct } from "./redux/features/products/productsSlice";
import { setProductModalOpen } from "./redux/features/ui/uiSlice";
import { addItemToCart } from "./redux/features/cart/cartSlice";
import { addItem as addToWishlist } from "./redux/features/wishlist/wishlistSlice";

// Components
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailModal from "./components/Product/ProductDetailModal";
import { CategoryProvider } from "./components/CategoryProvider";
import { AuthProvider } from "./components/AuthProvider";
import CategoryPageWrapper from "./components/CategoryPageWrapper";

// Pages
import LandingPage from "./pages/LandingPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from './pages/ProfilePage';ƒ
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import Register from './pages/register';
import ForgotPassword from './pages/forgot-password';
import SecurityQuestions from './pages/security-questions';

// Admin
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';

import './App.css';

function App() {
  const dispatch = useDispatch();
  const selectedProduct = useSelector(state => state.products.selected);
  const isProductModalOpen = useSelector(state => state.ui.isProductModalOpen);

  const handleProductClick = product => { 
    dispatch(selectProduct(product)); 
    dispatch(setProductModalOpen(true)); 
  };
  
  const handleCloseModal = () => dispatch(setProductModalOpen(false));
  const handleAddToCart = product => dispatch(addItemToCart(product));
  const handleAddToWishlist = product => dispatch(addToWishlist(product));

  return (
    <CategoryProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                success: { style: { background: '#28a745', color: 'white' } },
                error: { style: { background: '#dc3545', color: 'white' } },
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
                    <LandingPage onProductClick={handleProductClick} />
                  } 
                />

                <Route path="/products" element={<CategoryPageWrapper showAllProducts={true} />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/security-questions" element={<SecurityQuestions />} />
                <Route path="/search" element={<SearchResultsPage onProductClick={handleProductClick} />} />

                {/* Category Routes */}
                <Route path="/categories" element={<CategoryPageWrapper showAllProducts={true} />} />
                <Route path="/products/category/:categoryId" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/products/category/:categoryId/subcategory/:subcategoryId" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/category/:categoryName" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/category/:categoryName/:subcategoryName" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/shop-all" element={<CategoryPageWrapper showAllProducts={true} />} />
                <Route path="/makeup" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/skincare" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/fragrance" element={<CategoryPageWrapper showAllProducts={false} />} />
                <Route path="/accessories" element={<CategoryPageWrapper showAllProducts={false} />} />

                {/* Protected Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />

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
      </AuthProvider>
    </CategoryProvider>
  );
}

export default App;