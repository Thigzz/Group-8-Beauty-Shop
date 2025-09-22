import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProductCard from '../../src/components/ProductCard';
import cartReducer from '../../src/redux/features/cart/cartSlice';

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
}));

const mockProduct = {
  id: '1',
  product_name: 'Test Lipstick',
  price: '15.99',
  image_url: 'test-image.jpg',
};

const store = configureStore({ reducer: { cart: cartReducer } });

describe('ProductCard Component', () => {
  test('renders product information', () => {
    render(
      <Provider store={store}>
        <ProductCard product={mockProduct} />
      </Provider>
    );
    expect(screen.getByText('Test Lipstick')).toBeInTheDocument();
  });
});