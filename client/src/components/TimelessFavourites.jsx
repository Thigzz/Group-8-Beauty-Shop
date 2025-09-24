import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import TimelessFavouriteCard from './TimelessFavouritesCard';
import ProductDetailModal from '../components/Product/ProductDetailModal';

const TimelessFavourites = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.get('api/products/', {
          params: { page: 1, per_page: 6 }
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Timeless Favourites</h2>
      
      {isLoading ? (
        <p className="text-center">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No products found</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product)}
              className="cursor-pointer"
            >
              <TimelessFavouriteCard product={product} /> 
            </div>
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal 
        product={selectedProduct} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddToWishlist={(id) => console.log("wishlist:", id)}
      />
    </section>
  );
};

export default TimelessFavourites;
