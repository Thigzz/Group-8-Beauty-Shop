import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import AddProductPage from './AddProductPage';
import adminReducer from '../../redux/features/admin/adminSlice';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const renderWithProviders = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      admin: adminReducer,
      auth: () => ({ isAuthenticated: true, token: 'mock-token' })
    },
    preloadedState: {
      admin: {
        categories: [],
        subcategories: [],
        operationLoading: false,
        loading: false,
        ...initialState
      }
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <AddProductPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('AddProductPage Happy Path Tests', () => {
  it('should render add product form', () => {
    renderWithProviders();

    expect(screen.getByText('Add New Product')).toBeInTheDocument();
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByText('Create Product')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    renderWithProviders();

    const nameInput = screen.getByLabelText(/product name/i);
    const priceInput = screen.getByLabelText(/price/i);
    const stockInput = screen.getByLabelText(/stock/i);

    fireEvent.change(nameInput, { target: { value: 'Test Product' } });
    fireEvent.change(priceInput, { target: { value: '100' } });
    fireEvent.change(stockInput, { target: { value: '50' } });

    expect(nameInput.value).toBe('Test Product');
    expect(priceInput.value).toBe('100');
    expect(stockInput.value).toBe('50');
  });

  it('should display categories in dropdown', () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Makup' },
      { id: 'cat-2', name: 'Fragrance' }
    ];

    renderWithProviders({ categories: mockCategories });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.click(categorySelect);

    expect(screen.getByText('Makeup')).toBeInTheDocument();
    expect(screen.getByText('Fragrance')).toBeInTheDocument();
  });

  it('should display subcategories when category is selected', () => {
    const mockCategories = [{ id: 'cat-1', name: 'Makeup' }];
    const mockSubcategories = [
      { id: 'sub-1', name: 'Lips', category_id: 'cat-1' },
      { id: 'sub-2', name: 'Men', category_id: 'cat-1' }
    ];

    renderWithProviders({ 
      categories: mockCategories, 
      subcategories: mockSubcategories 
    });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: 'cat-1' } });

    const subcategorySelect = screen.getByLabelText(/subcategory/i);
    fireEvent.click(subcategorySelect);

    expect(screen.getByText('Lips')).toBeInTheDocument();
    expect(screen.getByText('Men')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    const mockCategories = [{ id: 'cat-1', name: 'Makeup' }];

    renderWithProviders({ categories: mockCategories });

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/product name/i), { 
      target: { value: 'Test Product' } 
    });
    fireEvent.change(screen.getByLabelText(/sku/i), { 
      target: { value: 'TEST-SKU-001' } 
    });
    fireEvent.change(screen.getByLabelText(/price/i), { 
      target: { value: '100' } 
    });
    fireEvent.change(screen.getByLabelText(/stock/i), { 
      target: { value: '50' } 
    });
    fireEvent.change(screen.getByLabelText(/category/i), { 
      target: { value: 'cat-1' } 
    });

    // Submit the form
    const submitButton = screen.getByText('Create Product');
    fireEvent.click(submitButton);

  });

  it('should toggle bulk upload mode', () => {
    renderWithProviders();

    const bulkUploadButton = screen.getByText('Bulk Upload');
    fireEvent.click(bulkUploadButton);

    expect(screen.getByText('Single Product')).toBeInTheDocument();
    expect(screen.getByText('Upload a CSV file')).toBeInTheDocument();
  });
});