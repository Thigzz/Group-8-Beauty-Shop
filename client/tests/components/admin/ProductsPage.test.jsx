import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from './ProductsPage';
import adminReducer from '../../redux/features/admin/adminSlice';


jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));


jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

const renderWithProviders = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      admin: adminReducer,
      auth: () => ({ isAuthenticated: true, token: 'mock-token' })
    },
    preloadedState: {
      admin: {
        products: [],
        categories: [],
        subcategories: [],
        loading: false,
        error: null,
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        ...initialState
      }
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <ProductsPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('ProductsPage Happy Path Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render products page with empty state', () => {
    renderWithProviders();

    expect(screen.getByText('Products Management')).toBeInTheDocument();
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByText('No products found')).toBeInTheDocument();
  });

  it('should display products list when products exist', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        category: 'Makeup',
        subcategory: 'Lips',
        price: 100,
        stock: 50,
        isActive: true
      },
      {
        id: '2',
        name: 'Test Product 2',
        category: 'Frgrance',
        subcategory: 'Men',
        price: 200,
        stock: 25,
        isActive: false
      }
    ];

    renderWithProviders({ products: mockProducts });

    expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Makeip')).toBeInTheDocument();
    expect(screen.getByText('Lips')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    renderWithProviders();

    const searchInput = screen.getByPlaceholderText('Type to search products...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(searchInput.value).toBe('test search');
  });

  it('should handle status filter change', () => {
    renderWithProviders();

    const statusFilter = screen.getByDisplayValue('All Statuses');
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    expect(statusFilter.value).toBe('active');
  });

  it('should handle category filter change', () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Makeup' },
      { id: 'cat-2', name: 'Lips' }
    ];

    renderWithProviders({ categories: mockCategories });

    const categoryFilter = screen.getByDisplayValue('All Categories');
    fireEvent.change(categoryFilter, { target: { value: 'cat-1' } });

    expect(categoryFilter.value).toBe('cat-1');
  });

  it('should navigate to add product page', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    renderWithProviders();

    const addButton = screen.getByText('Add New Product');
    fireEvent.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/add');
  });

  it('should navigate to edit product page', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    const mockProducts = [
      {
        id: '1',
        name: 'Test Product',
        category: 'Makeup',
        subcategory: 'Lips',
        price: 100,
        stock: 50,
        isActive: true
      }
    ];

    renderWithProviders({ products: mockProducts });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/edit/1');
  });

  it('should clear all filters', () => {
    renderWithProviders();

    const searchInput = screen.getByPlaceholderText('Type to search products...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('should display loading state', () => {
    renderWithProviders({ loading: true });

    expect(screen.getByText('Loading products...')).toBeInTheDocument();
  });

  it('should handle pagination', () => {
    const mockProducts = Array.from({ length: 15 }, (_, i) => ({
      id: `product-${i}`,
      name: `Product ${i}`,
      category: 'Makeup',
      subcategory: 'Lips',
      price: 100 + i,
      stock: 50,
      isActive: true
    }));

    renderWithProviders({ 
      products: mockProducts,
      totalProducts: 25,
      totalPages: 3,
      currentPage: 2
    });

    expect(screen.getByText('Showing 11 to 20 of 25 results')).toBeInTheDocument();
  });
});