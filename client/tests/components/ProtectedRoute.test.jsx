import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import authReducer from '../../src/redux/features/auth/authSlice';

const TestComponent = () => <div>Protected Content</div>;
const LoginComponent = () => <div>Login Page</div>;
const HomeComponent = () => <div>Home Page</div>;

describe('ProtectedRoute', () => {
  test('redirects unauthenticated users to login page', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { isAuthenticated: false } }
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginComponent />} />
            <Route path="/protected" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('renders child component for authenticated users', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { isAuthenticated: true, user: { role: 'customer' } } }
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/protected" element={<ProtectedRoute><TestComponent /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('renders child component for authenticated admin on admin route', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { isAuthenticated: true, user: { role: 'admin' } } }
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><TestComponent /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects non-admin user from admin route', () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: { isAuthenticated: true, user: { role: 'customer' } } }
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><TestComponent /></ProtectedRoute>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});