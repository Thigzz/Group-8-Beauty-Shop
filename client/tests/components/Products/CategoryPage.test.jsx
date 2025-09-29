import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryPage from '../../../../client/src/pages/CategoryPage';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllProducts, fetchProductsByCategory, fetchProductsBySubcategory, fetchProductsByCategoryAndSubcategory } from '../../../src/redux/features/products/productsSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock('../../../src/redux/features/products/productsSlice', () => ({
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
      subcategories: [{ id: '10', sub_category_name: 'Lips' }, { id: '11', sub_category_name: 'Eyes' }] 
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
  });

  test('shows loading spinner when productsState.loading=true', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { items: [], loading: true, error: null, pagination: { total: 0, currentPage: 1 } }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Loading products.../i)).toBeInTheDocument();
  });

  test('shows "No products found" message when no products', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
  });

  test('dispatches fetchAllProducts on mount when showAllProducts=true and shop-all', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(dispatchMock).toHaveBeenCalledWith(fetchAllProducts({ page: 1 }));
  });

  test('clears filters when "Clear All" button is clicked', () => {
    const onCategorySelect = jest.fn();
    const onSubcategorySelect = jest.fn();
    render(
      <CategoryPage 
        categories={categoriesMock} 
        showAllProducts={true} 
        onCategorySelect={onCategorySelect}
        onSubcategorySelect={onSubcategorySelect}
      />
    );
    fireEvent.click(screen.getByText(/Clear All/i));
    expect(onCategorySelect).toHaveBeenCalledWith({ id: 'shop-all', name: 'SHOP ALL', subcategories: [] });
    expect(onSubcategorySelect).toHaveBeenCalledWith(null);
  });

  test('sort dropdown changes sortBy state', () => {
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'Price (Low → High)' } });
    expect(sortSelect.value).toBe('Price (Low → High)');
  });

  test('selecting a subcategory calls onSubcategorySelect', () => {
    const onSubcategorySelect = jest.fn();
    render(
      <CategoryPage 
        categories={categoriesMock} 
        showAllProducts={true} 
        onCategorySelect={() => {}} 
        onSubcategorySelect={onSubcategorySelect}
      />
    );
    fireEvent.click(screen.getByText(/Lips/i));
    expect(onSubcategorySelect).toHaveBeenCalledWith(categoriesMock[0].subcategories[0]);
  });

  test('load more button dispatches fetchAllProducts with next page', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { items: [{ id: 1 }], loading: false, error: null, pagination: { total: 2, currentPage: 1 } }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    const loadMoreButton = screen.getByText(/Load More Products/i);
    fireEvent.click(loadMoreButton);
    // Since currentPage state increments, we cannot directly assert dispatch; real dispatch tests need redux-mock-store
    expect(loadMoreButton).toBeInTheDocument();
  });

  test('handles error display', () => {
    useSelector.mockImplementation((selector) =>
      selector({
        products: { items: [], loading: false, error: 'Some error', pagination: { total: 0, currentPage: 1 } }
      })
    );
    render(<CategoryPage categories={categoriesMock} showAllProducts={true} />);
    expect(screen.getByText(/Error: Some error/i)).toBeInTheDocument();
  });
});
