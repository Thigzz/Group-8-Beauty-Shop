import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/redux/features/auth/authSlice';
import SecurityQuestions from '../../src/pages/security-questions';

jest.mock('../../src/redux/features/auth/authSlice', () => ({
  __esModule: true,
  ...jest.requireActual('../../src/redux/features/auth/authSlice'),
  saveSecurityQuestions: jest.fn((payload) => ({ type: 'auth/saveSecurityQuestions/fulfilled', payload })),
}));

const { saveSecurityQuestions } = require('../../src/redux/features/auth/authSlice');

const makeStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

describe('SecurityQuestions Page', () => {
  let store;

  beforeEach(() => {
    saveSecurityQuestions.mockClear();
    store = makeStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <SecurityQuestions />
        </MemoryRouter>
      </Provider>
    );
  });

  test('renders security questions form', () => {
    expect(screen.getByText(/Set Your Security Questions/i)).toBeInTheDocument();
  });

  test('submits answers and calls save action', async () => {
    fireEvent.change(screen.getByPlaceholderText(/Answer 1/i), { target: { value: 'Blue' } });
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(saveSecurityQuestions).toHaveBeenCalledWith({ question1: 'Blue' });
    });
  });
});
