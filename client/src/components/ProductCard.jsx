import React from 'react';

const ProductCard = ({ product }) => {
  const handleAddToCart = () => {
    alert(`Added ${product.product_name} to cart!`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm 
                   transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2">
      <img src={product.image_url} alt={product.product_name} className="w-full h-48 object-cover" />
      <div className="p-4 text-center flex flex-col justify-between flex-grow">
        <h3 className="text-md font-semibold text-gray-800 h-12">{product.product_name}</h3>
        <p className="text-lg font-bold text-gray-900 my-2">Ksh{Number(product.price).toFixed(2)}</p>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-[#121212] text-white font-semibold py-2 rounded-md hover:bg-[#C9A35D] hover:text-black transition-colors duration-300"
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;