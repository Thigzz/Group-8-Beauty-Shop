import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import EditProductPage from '../EditProductPage';
import adminReducer from '../../../redux/features/admin/adminSlice';
import authReducer from '../../../redux/features/auth/authSlice';

jest.mock('../../../api/axios');

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-product-id-123' }),
}));

const mockCategories = [
  { id: 'cat-1', category_name: 'Makeup' },
  { id: 'cat-2', category_name: 'Skincare' },
];

const mockSubcategories = [
  { id: 'sub-1', subcategory_name: 'Lipstick', category_id: 'cat-1' },
  { id: 'sub-2', subcategory_name: 'Foundation', category_id: 'cat-1' },
  { id: 'sub-3', subcategory_name: 'Moisturizers', category_id: 'cat-2' },
];

const mockProduct = {
  id: 'test-product-id-123',
  name: 'Matte Lipstick',
  description: 'Long lasting matte lipstick',
  price: 19.99,
  stock: 100,
  category_id: 'cat-1',
  subcategory_id: 'sub-1',
  image: 'https://example.com/lipstick.jpg',
  sku: 'LS123',
  isActive: true,
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      admin: adminReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        token: 'mock-token',
        user: { id: 'user-1', role: 'admin' },
        ...initialState.auth,
      },
      admin: {
        products: [mockProduct],
        categories: mockCategories,
        subcategories: mockSubcategories,
        loading: false,
        operationLoading: false,
        error: null,
        ...initialState.admin,
      },
    },
  });
};

const renderWithProviders = (store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <EditProductPage />
      </BrowserRouter>
    </Provider>
  );
};

describe('EditProductPage - Happy Path Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page Loading and Authentication', () => {
    test('should render edit product page when authenticated', async () => {
      const store = createMockStore();
      renderWithProviders(store);

      await waitFor(() => {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Matte Lipstick')).toBeInTheDocument();
      expect(screen.getByDisplayValue('19.99')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    test('should redirect to login when not authenticated', () => {
      const store = createMockStore({
        auth: { isAuthenticated: false }
      });
      renderWithProviders(store);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('should load product data into form fields', async () => {
      const store = createMockStore();
      renderWithProviders(store);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Matte Lipstick')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Matte Lipstick')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Long lasting matte lipstick')).toBeInTheDocument();
      expect(screen.getByDisplayValue('19.99')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/lipstick.jpg')).toBeInTheDocument();
      
      const categorySelect = screen.getByDisplayValue('Makeup');
      expect(categorySelect).toBeInTheDocument();

      const subcategorySelect = screen.getByDisplayValue('Lipstick');
      expect(subcategorySelect).toBeInTheDocument();

      const activeCheckbox = screen.getByRole('checkbox', { name: /product is active/i });
      expect(activeCheckbox).toBeChecked();
    });
  });
});
