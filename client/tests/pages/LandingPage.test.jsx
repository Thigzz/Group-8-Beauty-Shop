import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LandingPage from '../../src/pages/LandingPage';
import cartReducer from '../../src/redux/features/cart/cartSlice';
import authReducer from '../../src/redux/features/auth/authSlice';


jest.mock('../../src/components/Navbar', () => () => <div>Navbar Mock</div>);
jest.mock('../../src/components/TimelessFavourites', () => () => <div>Timeless Favourites Mock</div>);

const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer
    },
    preloadedState: {
        auth: { isAuthenticated: false }
    }
});

describe('LandingPage', () => {
  test('renders all main sections', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/SHOP BY CATEGORY/i)).toBeInTheDocument();
    expect(screen.getByText('Timeless Favourites Mock')).toBeInTheDocument();
  });
});