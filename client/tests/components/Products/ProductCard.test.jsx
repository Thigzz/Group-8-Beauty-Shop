import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import ProductCard from "../../../../client/src/components/Product/ProductCard";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import '@testing-library/jest-dom';



const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));


jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
}));

describe("ProductCard Component", () => {
  const product = {
    product_name: "Lipstick",
    name: "Lipstick",
    price: 1200,
    originalPrice: 1500,
    subcategory: "Makeup",
    image_url: "/lipstick.jpg",
  };

  const onProductClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders product details correctly", () => {
    render(<ProductCard product={product} onProductClick={onProductClick} />);

    // Check product name
    expect(screen.getByText(product.name)).toBeInTheDocument();

    // Check subcategory
    expect(screen.getByText(product.subcategory)).toBeInTheDocument();

    // Check price
    expect(screen.getByText(`KSh ${product.price.toLocaleString()}`)).toBeInTheDocument();

    // Check original price
    expect(screen.getByText(`KSh ${product.originalPrice.toLocaleString()}`)).toBeInTheDocument();

    // Check image
    expect(screen.getByRole("img")).toHaveAttribute("src", product.image_url);
  });

  test("calls onProductClick when card is clicked", () => {
    render(<ProductCard product={product} onProductClick={onProductClick} />);

    const card = screen.getByRole("img").closest("div");
    fireEvent.click(card);

    expect(onProductClick).toHaveBeenCalledWith(product);
  });

  test("dispatches addItemToCart and shows toast on Add To Cart button click", () => {
    render(<ProductCard product={product} onProductClick={onProductClick} />);

    const button = screen.getByText(/Add To Cart/i);
    fireEvent.click(button);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(`${product.product_name} added to cart!`);
  });

  test("does not trigger onProductClick when Add To Cart button is clicked", () => {
    render(<ProductCard product={product} onProductClick={onProductClick} />);

    const button = screen.getByText(/Add To Cart/i);
    fireEvent.click(button);

    expect(onProductClick).not.toHaveBeenCalled();
  });
});
