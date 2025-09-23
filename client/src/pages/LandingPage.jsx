import React from "react";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TimelessFavourites from "../components/TimelessFavourites";
import CategoryMenu from "../components/CategoryMenu";
import { Brush, SprayCan, Sparkles, Scissors, ShoppingBag } from "lucide-react";

const HeroSection = () => (
  <div className="container mx-auto my-8 py-24 px-8 bg-gray-100 rounded-lg shadow-lg text-center">
    <h1 className="text-5xl font-bold">VISIT THE LIP LIBRARY</h1>
    <p className="text-xl my-4">Your go-to destination for all things lip at Fenty Beauty.</p>
    <button className="bg-[#C9A35D] text-white font-bold py-3 px-8 rounded-md hover:bg-[#b08a4f] transition-colors">
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

const ShopByCategory = ({ categories = fallbackCategories, selectedCategory, onCategorySelect, onSubcategorySelect }) => {
  const categoryIcons = {
    MAKEUP: <Brush size={36} className="text-white" />,
    HAIRCARE: <Scissors size={36} className="text-white" />,
    SKINCARE: <Sparkles size={36} className="text-white" />,
    FRAGRANCE: <SprayCan size={36} className="text-white" />,
    ACCESSORIES: <ShoppingBag size={36} className="text-white" />,
  };

  const handleClick = (category) => {
    onCategorySelect(category);
    onSubcategorySelect(null);
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
              <div className="w-24 h-24 bg-[#C9A35D] rounded-full mb-2 flex items-center justify-center">
                {categoryIcons[(cat.category_name || "").toUpperCase()] || null}
              </div>
              <span className="font-semibold text-sm text-[#C9A35D]">{cat.category_name}</span>
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
  const finalCategories = categories && categories.length > 0 ? categories : fallbackCategories;

  const filteredProducts = (Array.isArray(products) ? products : []).filter((product) => {
    if (!selectedCategory || (selectedCategory.category_name || "").toUpperCase() === "SHOP ALL") return true;
    const matchesCategory = product.category_id === selectedCategory.id;
    const matchesSubcategory = selectedSubcategory
      ? product.sub_category_id === selectedSubcategory.id
      : true;
    return matchesCategory && matchesSubcategory;
  });

  return (
    <div>
      <Header />
      <Navbar />

      <CategoryMenu
        categories={finalCategories}
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
        selectedSubcategory={selectedSubcategory}
        onSubcategorySelect={onSubcategorySelect}
      />

      <main>
        <HeroSection />
        <ShopByCategory
          categories={finalCategories}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          onSubcategorySelect={onSubcategorySelect}
        />
        <TimelessFavourites products={filteredProducts} onProductClick={onProductClick} />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;