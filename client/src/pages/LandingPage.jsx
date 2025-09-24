import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import LipLibraryImage from '../assets/liplibrary.webp';
import TimelessFavourites from "../components/TimelessFavourites";
import { Brush, SprayCan, Sparkles, Scissors, ShoppingBag } from "lucide-react";

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
  const categoryIcons = {
    MAKEUP: <Brush size={36} className="text-white" />,
    HAIRCARE: <Scissors size={36} className="text-white" />,
    SKINCARE: <Sparkles size={36} className="text-white" />,
    FRAGRANCE: <SprayCan size={36} className="text-white" />,
    ACCESSORIES: <ShoppingBag size={36} className="text-white" />,
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
      <h2 className="text-3xl font-bold mb-6 text-[#C9A35D]">SHOP BY CATEGORY</h2>
      <div className="flex justify-center space-x-10 flex-wrap">
        {categories
          .filter((cat) => (cat.category_name || "").toUpperCase() !== "SHOP ALL")
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleClick(cat)}
              className={`flex flex-col items-center group focus:outline-none transition-transform duration-300 ${
                selectedCategory?.id === cat.id ? "scale-105" : ""
              }`}
            >
              <div className="w-24 h-24 bg-[#C9A35D] rounded-full mb-2 flex items-center justify-center group-hover:bg-[#b8934a] transition-colors duration-300">
                {categoryIcons[(cat.category_name || "").toUpperCase()] || null}
              </div>
              <span className="font-semibold text-sm text-[#C9A35D] group-hover:text-[#b8934a] transition-colors duration-300">
                {cat.category_name}
              </span>
            </button>
          ))}
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
    <div>
      <main>
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
  );
};

export default LandingPage;