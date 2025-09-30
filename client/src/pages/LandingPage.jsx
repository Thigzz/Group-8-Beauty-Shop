import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import TimelessFavourites from "../components/TimelessFavourites";
import LipLibraryImage from '../assets/liplibrary.webp';
import backgroundImage from '../assets/background.png';

import accessoriesImage from '../assets/accessories.png';
import haircareImage from '../assets/haircare.jpeg';
import makeupImage from '../assets/makeup.jpeg';
import perfumeImage from '../assets/perfume.png';
import skincareImage from '../assets/skin.png';

const HeroSection = ({ onShopNow }) => (
  <div
    className="container mx-auto my-8 p-16 rounded-lg shadow-lg text-white bg-cover bg-center"
    style={{ backgroundImage: `url(${LipLibraryImage})` }}
  >
    <button
      onClick={onShopNow}
      className="bg-white text-black font-bold py-3 px-8 rounded-md hover:bg-pink-200 transition-colors duration-300"
    >
      Shop Now
    </button>
  </div>
);

const fallbackCategories = [
  { id: 1, category_name: "MAKEUP" },
  { id: 2, category_name: "HAIRCARE" },
  { id: 3, category_name: "SKINCARE" },
  { id: 4, category_name: "FRAGRANCE" },
  { id: 5, category_name: "ACCESSORIES" },
];

const ShopByCategory = ({
  categories = fallbackCategories,
  selectedCategory,
  onCategorySelect,
  onSubcategorySelect,
  onCategoryNavigate
}) => {
  const categoryImages = {
    MAKEUP: makeupImage,
    HAIRCARE: haircareImage,
    SKINCARE: skincareImage,
    FRAGRANCE: perfumeImage,
    ACCESSORIES: accessoriesImage,
  };

  const handleClick = (category) => {
    if (onCategoryNavigate) {
      onCategoryNavigate(category);
    } else {
      onCategorySelect(category);
      onSubcategorySelect(null);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 text-center">
      <h2 className="text-3xl font-bold mb-12 text-[#C9A35D]">SHOP BY CATEGORY</h2>
      <div className="flex justify-center gap-16 flex-wrap">
        {categories
          .filter((cat) => (cat.category_name || "").toUpperCase() !== "SHOP ALL")
          .map((cat) => {
            const categoryName = (cat.category_name || "").toUpperCase();
            const categoryImage = categoryImages[categoryName];
            
            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat)}
                className={`flex flex-col items-center group focus:outline-none transition-transform duration-300 ${
                  selectedCategory?.id === cat.id ? "scale-105" : ""
                }`}
              >
                <div className="w-28 h-28 rounded-full mb-3 flex items-center justify-center overflow-hidden border-2 border-[#C9A35D] group-hover:border-[#b8934a] transition-colors duration-300">
                  {categoryImage ? (
                    <img 
                      src={categoryImage} 
                      alt={cat.category_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#C9A35D] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{cat.category_name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="font-semibold text-base text-[#C9A35D] group-hover:text-[#b8934a] transition-colors duration-300 mt-1">
                  {cat.category_name}
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
};

const LandingPage = ({
  categories,
  products = [],
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  onProductClick,
}) => {
  const navigate = useNavigate();
  const finalCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    if (!selectedCategory || (selectedCategory.category_name || "").toUpperCase() === "SHOP ALL") return true;
    const matchesCategory = product.category_id === selectedCategory.id;
    const matchesSubcategory = selectedSubcategory
      ? product.sub_category_id === selectedSubcategory.id
      : true;
    return matchesCategory && matchesSubcategory;
  });

  const handleCategoryNavigation = (category) => {
    const categoryName = (category.category_name || "").toLowerCase();
    navigate(`/category/${categoryName}`, { state: { categoryId: category.id } });
  };

  const handleShopNow = () => {
    navigate("/category/shopall");
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image - Fixed position to cover entire viewport */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',       // This ensures it covers the entire area
          backgroundPosition: 'center',   // Centers the image
          backgroundRepeat: 'no-repeat',  // Prevents repeating
          backgroundAttachment: 'fixed',  // Creates parallax effect
          width: '100vw',
          height: '100vh'
        }}
      >
        {/* Optional: Add a slight overlay if the image is too bright */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>
      
      {/* Content Area */}
      <div className="relative z-10">
        <main className="bg-white bg-opacity-90 min-h-screen">
          <HeroSection onShopNow={handleShopNow} />
          <ShopByCategory
            categories={finalCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            onSubcategorySelect={onSubcategorySelect}
            onCategoryNavigate={handleCategoryNavigation}
          />
          <TimelessFavourites />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;