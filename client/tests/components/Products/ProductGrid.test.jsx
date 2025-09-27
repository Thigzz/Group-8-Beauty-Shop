import React from 'react';
import { render, screen, act } from '@testing-library/react';
import ProductGrid from '../../../src/components/Product/ProductGrid';
import ProductCard from '../../../src/components/Product/ProductCard';

jest.mock('../../../src/components/Product/ProductCard', () => (props) => {
  return (
    <div data-testid="product-card">
      {props.product.name || props.product.product_name}
    </div>
  );
});

describe('ProductGrid', () => {
  const productsMock = [
    { id: '1', name: 'Lipstick', price: 1500 },
    { id: '2', name: 'Foundation', price: 2500 },
    { id: '3', name: 'Mascara', price: 2000 },
  ];

  test('renders loading skeletons when loading', () => {
    jest.useFakeTimers();

    render(<ProductGrid products={productsMock} sortBy="Newest" />);

    // check skeletons (animate-pulse divs)
    const skeletons = document.querySelectorAll('div.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);

    // flush timers to finish loading
    act(() => {
      jest.runAllTimers();
    });

    jest.useRealTimers();
  });

  test('renders products after sorting', async () => {
    jest.useFakeTimers();
    render(<ProductGrid products={productsMock} sortBy="Price (Low → High)" />);

    // flush sorting timeout
    await act(async () => {
      jest.runAllTimers();
    });

    const productCards = screen.getAllByTestId('product-card');
    expect(productCards.length).toBe(productsMock.length);

    // first product should be lowest price
    expect(productCards[0].textContent).toBe('Lipstick');

    jest.useRealTimers();
  });

  test('renders "No products found" message when empty', async () => {
    jest.useFakeTimers();
    render(<ProductGrid products={[]} sortBy="Newest" />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByText(/No products found/i)).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your filters/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  test('respects sort order "Name (A → Z)"', async () => {
    jest.useFakeTimers();
    render(<ProductGrid products={productsMock} sortBy="Name (A → Z)" />);

    await act(async () => {
      jest.runAllTimers();
    });

    const productCards = screen.getAllByTestId('product-card');
    const names = productCards.map((card) => card.textContent);
    expect(names).toEqual(['Foundation', 'Lipstick', 'Mascara']);

    jest.useRealTimers();
  });

  test('respects sort order "Price (High → Low)"', async () => {
    jest.useFakeTimers();
    render(<ProductGrid products={productsMock} sortBy="Price (High → Low)" />);

    await act(async () => {
      jest.runAllTimers();
    });

    const productCards = screen.getAllByTestId('product-card');
    const names = productCards.map((card) => card.textContent);
    expect(names).toEqual(['Foundation', 'Mascara', 'Lipstick']);

    jest.useRealTimers();
  });
});
