import React from "react";
import { useDispatch } from "react-redux";
import { addItemToCart } from '../../redux/features/cart/cartSlice';
import toast from "react-hot-toast";

const ProductCard = ({ product, onProductClick }) => {
  const dispatch = useDispatch();

  //Add to cart
  const handleAddToCart = () => {
    dispatch(addItemToCart(product));
    toast.success(`${product.product_name} added to cart!`);
  };

  // Open product details
  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.image_url || product.image || "/api/placeholder/250/250"}
          alt={product.name || product.product_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
          {product.name || product.product_name}
        </h3>

        {/* Subcategory */}
        {product.subcategory && (
          <div className="text-sm text-gray-500 mb-2">{product.subcategory}</div>
        )}

        {/* Price */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-yellow-600 font-semibold">
            KSh {Number(product.price).toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-gray-500 line-through text-sm">
              KSh {Number(product.originalPrice).toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button  */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          className="w-full bg-[#ADA88E] text-white font-semibold py-2 rounded-md hover:bg-[#C9A35D] hover:text-black transition-colors duration-300 mt-3"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;