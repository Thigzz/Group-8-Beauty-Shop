import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addItemToCart } from '../../redux/features/cart/cartSlice';
import { 
  X, Heart, ShoppingCart, Plus, Minus, Star, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToWishlist }) => {
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Use product.image_url or product.image, fallback to placeholder
  const productImages = product?.image_url || product?.image 
    ? [product.image_url || product.image] 
    : ['/api/placeholder/400/400'];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setSelectedVariant(null);
      setActiveTab('details');
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        id: product.id,
        name: product.name || product.product_name,
        price: product.price,
        image: product.image_url || product.image,
        quantity,
        variant: selectedVariant,
      })
    );
    onClose(); 
  };

  const handleAddToWishlist = () => {
    setIsLiked(!isLiked);
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    }
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + productImages.length) % productImages.length);
  const handleQuantityChange = (change) => setQuantity(prev => Math.max(1, Math.min(10, prev + change)));
  const handleBackdropClick = (e) => { if (e.target === e.currentTarget) onClose(); };
  

  const productName = product.name || product.product_name;
  const productPrice = product.price;
  const productOriginalPrice = product.originalPrice;
  const productSubcategory = product.subcategory;
  const productDescription = product.description;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center bg-gray-200 bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex overflow-hidden shadow-2xl relative">

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/90 hover:bg-white shadow-lg border border-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left - Image Gallery */}
        <div className="w-1/2 bg-gray-50 p-8 flex flex-col relative overflow-y-auto">
          <div className="relative flex-1 flex items-center justify-center mt-8">
            <img 
              src={productImages[selectedImage]} 
              alt={productName}
              className="max-h-[500px] w-auto object-contain rounded-lg"
            />
            
            {/* Only show navigation arrows if there are multiple images */}
            {productImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Preview - Only show if there are multiple images */}
          {productImages.length > 1 && (
            <div className="flex space-x-3 mt-8 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden ${
                    selectedImage === index ? 'border-yellow-500' : 'border-transparent'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right - Product Details */}
        <div className="w-1/2 p-8 flex flex-col overflow-y-auto">
          <div className="pt-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 pr-12">{productName}</h2>
              <button 
                onClick={handleAddToWishlist}
                className={`p-3 rounded-full border transition-colors flex-shrink-0 ${
                  isLiked ? 'bg-pink-100 border-pink-200 text-pink-600' 
                          : 'border-gray-200 hover:bg-gray-50 text-gray-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-600' : ''}`} />
              </button>
            </div>

            {/* Subcategory */}
            {productSubcategory && (
              <div className="text-sm text-gray-500 mb-6">{productSubcategory}</div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-2 mb-8">
              <span className="text-3xl font-bold text-gray-900">
                KSh {Number(productPrice).toLocaleString()}
              </span>
              {productOriginalPrice && (
                <span className="text-gray-500 line-through text-lg">
                  KSh {Number(productOriginalPrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="flex space-x-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center space-x-2 bg-[#ADA88E] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#C9A35D] hover:text-black transition-colors duration-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b mb-6 flex space-x-6">
              {['details'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xl font-medium capitalize ${
                    activeTab === tab 
                      ? 'border-b-2 border-[#ADA88E] text-[#ADA88E]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="text-gray-800 text-base md:test-lg leading-relaxed mt-4">
              {activeTab === 'details' && (
                <p className="text-lg md:text-xl">{productDescription || 'No description available.'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;