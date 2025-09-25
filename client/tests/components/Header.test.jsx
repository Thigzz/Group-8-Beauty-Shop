import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../../src/components/Header';
import authReducer from '../../src/redux/features/auth/authSlice';

const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
        auth: { isAuthenticated: false }
    }
});

describe('Header Component', () => {
  test('renders the PAMBO logo', () => {
    render(
      <Provider store={store}>
        <Router>
          <Header />
        </Router>
      </Provider>
    );
    const logoElement = screen.getByTestId('pambo-logo');
    expect(logoElement).toBeInTheDocument();
    expect(logoElement.textContent).toBe('PAMBO');
  });
});