import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, sortBy, onProductClick, onAddToCart, onAddToWishlist }) => {
  const [sortedProducts, setSortedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    const timer = setTimeout(() => {
      let sorted = [...products];
      
      switch (sortBy) {
        case 'Price (Low → High)':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'Price (High → Low)':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'Name (A → Z)':
          sorted.sort((a, b) => a.name - b.name);
          break;
        case 'Name (Z → A)':
          sorted.sort((a, b) => b.name - a.name);
          break;
        case 'Newest':
        default:
          break;
      }
      
      setSortedProducts(sorted);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-300 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No products found</div>
        <p className="text-gray-400 mt-2">Try adjusting your filters or browse other categories</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedProducts.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
};

export default ProductGrid;