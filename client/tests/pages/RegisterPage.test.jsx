import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/redux/features/auth/authSlice';
import Register from '../../src/pages/register';

jest.mock('../../src/redux/features/auth/authSlice', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/redux/features/auth/authSlice'),
  registerUser: jest.fn((payload) => ({ type: 'auth/registerUser/fulfilled', payload })),
}));

const { registerUser } = require('../../src/redux/features/auth/authSlice');

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { isAuthenticated: false, status: 'idle', error: null, user: null, ...preloadedState } },
  });

describe('Register Page', () => {
  let store;

  beforeEach(() => {
    registerUser.mockClear();
    store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </Provider>
    );
  });

  test('renders registration form with all fields', () => {
    expect(screen.getByPlaceholderText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('submits the form and calls register action', async () => {
    fireEvent.change(screen.getByPlaceholderText(/Full Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
