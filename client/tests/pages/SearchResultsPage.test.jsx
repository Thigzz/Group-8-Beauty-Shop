import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SearchResultsPage from '../../src/pages/SearchResultsPage';
import apiClient from '../../src/api/axios';
import cartReducer from '../../src/redux/features/cart/cartSlice';

jest.mock('../../src/api/axios');

const store = configureStore({ reducer: { cart: cartReducer } });

const renderWithProviders = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe('SearchResultsPage', () => {
  test('shows results when API returns data', async () => {
    const mockSearchResults = {
      products: [{ id: '1', product_name: 'Found Product', price: '10.00', image_url: '' }],
      categories: [],
      sub_categories: [],
    };
    const mockCategoriesResult = [
        {id: 'cat1', category_name: 'Makeup'}
    ];

    apiClient.get.mockImplementation((url) => {
        if (url.startsWith('/api/search')) {
            return Promise.resolve({ data: mockSearchResults });
        }
        if (url.startsWith('/api/categories')) {
            return Promise.resolve({ data: mockCategoriesResult });
        }
        return Promise.reject(new Error('not found'));
    });

    renderWithProviders(<SearchResultsPage />, { route: '/search?q=test' });

    await waitFor(() => {
        expect(screen.getByText('Found Product')).toBeInTheDocument();
    });
  });
});