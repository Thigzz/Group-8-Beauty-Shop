import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryPage from '../CategoryPage';
import { 
  fetchAllProducts, 
  fetchProductsByCategory, 
  fetchProductsBySubcategory,
  fetchProductsByCategoryAndSubcategory 
} from '../../redux/features/products/productsSlice';

// Mock the Redux hooks and actions
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../redux/features/products/productsSlice', () => ({
  fetchAllProducts: jest.fn(() => ({ type: 'products/fetchAllProducts' })),
  fetchProductsByCategory: jest.fn(() => ({ type: 'products/fetchProductsByCategory' })),
  fetchProductsBySubcategory: jest.fn(() => ({ type: 'products/fetchProductsBySubcategory' })),
  fetchProductsByCategoryAndSubcategory: jest.fn(() => ({ type: 'products/fetchProductsByCategoryAndSubcategory' })),
}));

describe('CategoryPage', () => {
  let dispatchMock;

  const categoriesMock = [
    { 
      id: '1', 
      category_name: 'Makeup', 
      subcategories: [
        { id: '10', sub_category_name: 'Lips' }, 
        { id: '11', sub_category_name: 'Eyes' }
      ] 
    }
  ];

  beforeEach(() => {
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    useSelector.mockImplementation((selector) =>
      selector({
        products: {
          items: [],
          loading: false,
          error: null,
          pagination: { total: 0, currentPage: 1 },
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders component and filters', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    expect(screen.getByText(/Categories/i)).toBeInTheDocument();
    expect(screen.getByText(/SHOP ALL/i)).toBeInTheDocument();
  });

  test('shows loading spinner when productsState.loading=true', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { 
          items: [], 
          loading: true, 
          error: null, 
          pagination: { total: 0, currentPage: 1 } 
        }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();
  });

  test('shows "No products found" message when no products', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  test('displays subcategories when a category with subcategories is selected', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={false} />);

    // Click on Makeup category
    fireEvent.click(screen.getByText('Makeup'));
    
    // Check if subcategories are displayed
    expect(screen.getByText('Subcategories')).toBeInTheDocument();
    expect(screen.getByText('Lips')).toBeInTheDocument();
    expect(screen.getByText('Eyes')).toBeInTheDocument();
  });

  test('selecting a subcategory calls onSubcategorySelect callback', () => {
    const mockOnSubcategorySelect = jest.fn();
    
    render(
      <CategoryPage 
        categories={categoriesMock} 
        showAllProducts={false}
        onSubcategorySelect={mockOnSubcategorySelect}
      />
    );

    // Select category first
    fireEvent.click(screen.getByText('Makeup'));
    // Then select subcategory
    fireEvent.click(screen.getByText('Lips'));
    
    expect(mockOnSubcategorySelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: '10', sub_category_name: 'Lips' })
    );
  });

  test('clears filters when "Clear All" button is clicked', () => {
    const mockOnCategorySelect = jest.fn();
    const mockOnSubcategorySelect = jest.fn();
    
    render(
      <CategoryPage 
        categories={categoriesMock} 
        showAllProducts={false}
        onCategorySelect={mockOnCategorySelect}
        onSubcategorySelect={mockOnSubcategorySelect}
      />
    );

    // Select a category and subcategory first
    fireEvent.click(screen.getByText('Makeup'));
    fireEvent.click(screen.getByText('Lips'));
    
    // Clear filters
    fireEvent.click(screen.getByText(/Clear All/i));
    
    expect(mockOnCategorySelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'shop-all', name: 'SHOP ALL' })
    );
    expect(mockOnSubcategorySelect).toHaveBeenCalledWith(null);
  });

  test('sort dropdown changes sortBy state', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'Price (Low → High)' } });
    expect(sortSelect.value).toBe('Price (Low → High)');
  });

  test('handles error display', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { 
          items: [], 
          loading: false, 
          error: 'Some error', 
          pagination: { total: 0, currentPage: 1 } 
        }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Error: Some error/i)).toBeInTheDocument();
  });

  test('load more button appears when there are more pages', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { 
          items: [{ id: 1, name: 'Product 1' }], 
          loading: false, 
          error: null, 
          pagination: { total: 25, currentPage: 1, totalPages: 3 } 
        }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Load More Products/i)).toBeInTheDocument();
  });

  test('dispatches fetchAllProducts on mount when showAllProducts=true', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(dispatchMock).toHaveBeenCalledWith(fetchAllProducts({ page: 1 }));
  });
});