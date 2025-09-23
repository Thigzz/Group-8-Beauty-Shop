<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/login'
import Register from './pages/register'
import ForgotPassword from './pages/forgot-password'
import SecurityQuestions from './pages/security-questions'
import './App.css'
=======
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import './App.css';
>>>>>>> 6de417152c312916f4f9db6b6ad68f46219b7be5

function App() {
  return (
    <Router>
<<<<<<< HEAD
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/security-questions" element={<SecurityQuestions />} />
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome to PAMBO</h1>
            <p>Your Premium Beauty Destination</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="/login" style={{ margin: '0 1rem', color: '#8B7355' }}>Login</a>
              <a href="/register" style={{ margin: '0 1rem', color: '#8B7355' }}>Register</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
=======
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
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* User Protected Routes */}
          <Route 
            path="/profile" {/*Might Have to change this to fit*/}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
>>>>>>> 6de417152c312916f4f9db6b6ad68f46219b7be5
}

export default App;
