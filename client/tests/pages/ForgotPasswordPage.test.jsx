import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/redux/features/auth/authSlice';
import ForgotPassword from '../../src/pages/forgot-password';

jest.mock('../../src/redux/features/auth/authSlice', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/redux/features/auth/authSlice'),
  verifySecurityAnswers: jest.fn((payload) => ({ type: 'auth/verifySecurityAnswers/fulfilled', payload })),
}));

const { verifySecurityAnswers } = require('../../src/redux/features/auth/authSlice');

const makeStore = (preloadedState = {}) =>
  configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { status: 'idle', error: null, user: null, ...preloadedState } },
  });

describe('ForgotPassword Page', () => {
  let store;

  beforeEach(() => {
    verifySecurityAnswers.mockClear();
    store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPassword />
        </MemoryRouter>
      </Provider>
    );
  });

  test('renders security question form', () => {
    expect(screen.getByText(/Reset Password/i)).toBeInTheDocument();
  });

  test('submits answers and calls verify action', async () => {
    fireEvent.change(screen.getByLabelText(/Your Answer/i), { target: { value: 'Blue' } });
    fireEvent.click(screen.getByRole('button', { name: /Verify/i }));

    await waitFor(() => {
      expect(verifySecurityAnswers).toHaveBeenCalledWith({ answer: 'Blue' });
    });
  });
});
