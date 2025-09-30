import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ProductDetailModal from '../../../../client/src/components/Product/ProductDetailModal';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../../../client/src/redux/features/cart/cartSlice';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../../../client/src/redux/features/cart/cartSlice', () => ({
  addItemToCart: jest.fn((payload) => ({ type: 'cart/addItem', payload })),
}));

describe('ProductDetailModal', () => {
  let dispatchMock;
  const productMock = {
    id: 'p1',
    name: 'Lipstick',
    price: 1500,
    image_url: '/test/lipstick.png',
    description: 'A red lipstick.',
  };

  const onCloseMock = jest.fn();
  const onAddToWishlistMock = jest.fn();

  beforeEach(() => {
    dispatchMock = jest.fn();
    useDispatch.mockReturnValue(dispatchMock);
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(<ProductDetailModal product={productMock} isOpen={false} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    expect(screen.queryByText(/Lipstick/i)).not.toBeInTheDocument();
  });

  test('renders modal with product details when isOpen is true', () => {
    render(<ProductDetailModal product={productMock} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    expect(screen.getByText(/Lipstick/i)).toBeInTheDocument();
    expect(screen.getByText(/KSh 1,500/i)).toBeInTheDocument();
    expect(screen.getByText(/A red lipstick./i)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<ProductDetailModal product={productMock} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('increments and decrements quantity correctly', () => {
    render(<ProductDetailModal product={productMock} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);

    const incrementButton = screen.getByRole('button', { name: /increase quantity/i });
    const decrementButton = screen.getByRole('button', { name: /decrease quantity/i });

    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(incrementButton);
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(decrementButton);
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(decrementButton);
    expect(screen.getByText('1')).toBeInTheDocument(); // min 1
  });

  test('calls dispatch with addItemToCart on "Add to Cart"', () => {
    render(<ProductDetailModal product={productMock} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    fireEvent.click(screen.getByText(/Add to Cart/i));

    expect(dispatchMock).toHaveBeenCalledWith(expect.objectContaining({
      type: 'cart/addItem',
      payload: expect.objectContaining({
        id: 'p1',
        name: 'Lipstick',
        price: 1500,
        quantity: 1,
      }),
    }));
    expect(onCloseMock).toHaveBeenCalled();
  });

  test('toggles wishlist when heart button is clicked', () => {
    render(<ProductDetailModal product={productMock} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    
    const heartButton = screen.getByRole('button', { name: /add to wishlist/i });
    fireEvent.click(heartButton);
    expect(onAddToWishlistMock).toHaveBeenCalledWith('p1');
  });

  test('changes selected image when clicking thumbnail', () => {
    const multiImageProduct = { 
      ...productMock, 
      images: ['/img1.png', '/img2.png'] 
    };
    
    render(<ProductDetailModal product={multiImageProduct} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    
    const thumbnails = screen.getAllByRole('button', { name: /thumbnail/i });
    act(() => fireEvent.click(thumbnails[1]));

    const mainImage = screen.getByAltText(multiImageProduct.name);
    expect(mainImage).toHaveAttribute('src', '/img2.png');
  });

  test('navigates images with arrow buttons when multiple images exist', () => {
    const multiImageProduct = { 
      ...productMock, 
      images: ['/img1.png', '/img2.png', '/img3.png'] 
    };
    
    render(<ProductDetailModal product={multiImageProduct} isOpen={true} onClose={onCloseMock} onAddToWishlist={onAddToWishlistMock} />);
    
    const nextButton = screen.getByRole('button', { name: /next image/i });
    const prevButton = screen.getByRole('button', { name: /previous image/i });

    fireEvent.click(nextButton);
    const mainImage = screen.getByAltText(multiImageProduct.name);
    expect(mainImage).toHaveAttribute('src', '/img2.png');

    fireEvent.click(prevButton);
    expect(mainImage).toHaveAttribute('src', '/img1.png');
  });
});