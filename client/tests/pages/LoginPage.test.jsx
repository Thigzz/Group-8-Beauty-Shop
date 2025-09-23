import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/redux/features/auth/authSlice';
import LoginPage from '../../src/pages/LoginPage';

jest.mock('../../src/redux/features/auth/authSlice', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/redux/features/auth/authSlice'),
  loginUser: jest.fn((payload) => ({ type: 'auth/loginUser/fulfilled', payload })),
}));

const { loginUser } = require('../../src/redux/features/auth/authSlice');


const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        status: 'idle',
        error: null,
        user: null,
        token: null,
        ...preloadedState,
      },
    },
  });

describe('LoginPage', () => {
  let store;

  beforeEach(() => {
    loginUser.mockClear();
    store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );
  });

  test('renders login form with all fields', () => {
    expect(screen.getByLabelText(/Email or Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() => {
      expect(screen.getByText('Email or Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('submits the form and calls the login action', async () => {
    fireEvent.change(screen.getByLabelText(/Email or Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        login_identifier: 'testuser',
        password: 'password123',
      });
    });
  });
});