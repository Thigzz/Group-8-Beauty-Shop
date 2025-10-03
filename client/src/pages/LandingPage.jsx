import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import Footer from "../components/Footer";
import TimelessFavourites from "../components/TimelessFavourites";
import LipLibraryImage from '../assets/liplibrary.webp';
import backgroundImage from '../assets/background.png';

import accessoriesImage from '../assets/accessories.png';
import haircareImage from '../assets/haircare.jpeg';
import makeupImage from '../assets/makeup.jpeg';
import perfumeImage from '../assets/perfume.png';
import skincareImage from '../assets/skin.png';

const HeroSection = ({ onShopNow }) => {
const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    // Makeup slides
    {
      id: 1,
      title: "New Lip Collection",
      subtitle: "Bold colors that last all day",
      bgImage:
        "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1000&q=80",
      bgGradient: "from-pink-900/70 to-purple-900/70",
    },
    {
      id: 2,
      title: "Flawless Foundation",
      subtitle: "Perfect coverage for every skin tone",
      bgImage:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&q=80",
      bgGradient: "from-rose-900/70 to-pink-900/70",
    },
    {
      id: 3,
      title: "Eye Makeup Essentials",
      subtitle: "Create stunning looks",
      bgImage:
        "https://images.unsplash.com/photo-1583784561105-a674080f391e?w=1000&q=80",
      bgGradient: "from-purple-900/70 to-indigo-900/70",
    },
    {
      id: 4,
      title: "Fierce Nails",
      subtitle: "Endless color possibilities",
      bgImage:
        "https://plus.unsplash.com/premium_photo-1703343320234-4c1a75b3ff13?w=1000&q=80",
      bgGradient: "from-fuchsia-900/70 to-purple-900/70",
    },
    // Fragrance slides
    {
      id: 5,
      title: "Signature Scents",
      subtitle: "Discover your perfect fragrance",
      bgImage:
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1000&q=80",
      bgGradient: "from-amber-900/70 to-orange-900/70",
    },
    {
      id: 6,
      title: "Luxury Perfumes",
      subtitle: "Indulge in premium fragrances",
      bgImage:
        "https://images.unsplash.com/photo-1757313251182-a50b32360aea?w=1000&q=80",
      bgGradient: "from-yellow-900/70 to-amber-900/70",
    },
    {
      id: 7,
      title: "Body Mists",
      subtitle: "Light, refreshing scents",
      bgImage:
        "https://images.unsplash.com/photo-1671642605304-2a0a812b5529?w=1000&q=80",
      bgGradient: "from-orange-900/70 to-red-900/70",
    },
    {
      id: 8,
      title: "Aromatic Oils",
      subtitle: "Pure essence in every drop",
      bgImage:
        "https://images.unsplash.com/photo-1643907652089-88c92a94416c?w=1000&q=80",
      bgGradient: "from-amber-300/25 to-orange-400/35",
    },
    // Skincare slides
    {
      id: 9,
      title: "Radiant Skin Starts Here",
      subtitle: "Premium skincare for every skin type",
      bgImage:
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1000&q=80",
      bgGradient: "from-green-900/70 to-teal-900/70",
    },
    {
      id: 10,
      title: "Anti-Aging Solutions",
      subtitle: "Turn back time with our serums",
      bgImage:
        "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=1000&q=80",
      bgGradient: "from-teal-900/70 to-cyan-900/70",
    },
    {
      id: 11,
      title: "Hydration Heroes",
      subtitle: "Quench your skin's thirst",
      bgImage:
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1000&q=80",
      bgGradient: "from-blue-900/70 to-green-900/70",
    },
    {
      id: 12,
      title: "Natural Ingredients",
      subtitle: "Pure care for your skin",
      bgImage:
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&q=80",
      bgGradient: "from-emerald-900/70 to-blue-900/70",
    },
    // Haircare slides
    {
      id: 13,
      title: "Hair That Speaks",
      subtitle: "Transform your hair with our collection",
      bgImage:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&q=80",
      bgGradient: "from-indigo-900/70 to-purple-900/70",
    },
    {
      id: 14,
      title: "Salon-Quality Results",
      subtitle: "Professional care at home",
      bgImage:
        "https://images.unsplash.com/photo-1612450149241-9fed1ffc9c2b?w=1000&q=80",
      bgGradient: "from-purple-900/70 to-pink-900/70",
    },
    {
      id: 15,
      title: "Healthy Hair Journey",
      subtitle: "Nourish, strengthen, shine",
      bgImage:
        "https://images.unsplash.com/photo-1713181215534-3b46c62e2018?w=1000&q=80",
      bgGradient: "from-violet-900/70 to-purple-900/70",
    },
    {
      id: 16,
      title: "Color Protection",
      subtitle: "Keep your color vibrant longer",
      bgImage:
        "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1000&q=80",
      bgGradient: "from-blue-900/70 to-indigo-900/70",
    },
    // Accessories slides
    {
      id: 17,
      title: "Complete Your Look",
      subtitle: "Essential beauty tools & accessories",
      bgImage:
        "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=1000&q=80",
      bgGradient: "from-gray-900/70 to-slate-900/70",
    },
    {
      id: 18,
      title: "Professional Tools",
      subtitle: "Elevate your beauty routine",
      bgImage:
        "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000&q=80",
      bgGradient: "from-slate-900/70 to-gray-900/70",
    },
    {
      id: 19,
      title: "Makeup Brushes",
      subtitle: "Precision application every time",
      bgImage:
        "https://images.unsplash.com/photo-1679307741332-eadac4345294?w=1000&q=80",
      bgGradient: "from-neutral-900/70 to-stone-900/70",
    },
    {
      id: 20,
      title: "Beauty Organizers",
      subtitle: "Keep your collection tidy",
      bgImage:
        "https://images.unsplash.com/photo-1585687635785-994bda55c78e?w=1000&q=80",
      bgGradient: "from-zinc-900/70 to-neutral-900/70",
    },
  ];
  const currentHero = heroSlides[currentSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="relative">
      {/* Main Hero Slider */}
      <section className="min-h-[500px] relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${currentHero.bgImage}})` }}
        >
          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${currentHero.bgGradient}`}
          ></div>
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
          <div className="flex items-center min-h-[400px]">
            {/* Content - Reduced width */}
            <div className="max-w-lg space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {currentHero.title}
              </h1>

              <p className="text-lg text-white opacity-90">
                {currentHero.subtitle}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={onShopNow}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </button>
              </div>
              {/* Slide Indicators */}
              <div className="flex gap-2 pt-4">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all z-20"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white/30 transition-all z-20"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </section>
    </div>
  );
};


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
    <div className="container mx-auto py-12 px-4 text-center">
      <h2 className="text-3xl font-bold mb-16 text-[#C9A35D]">SHOP BY CATEGORY</h2>
      <div className="flex justify-center gap-24 flex-wrap">
        {categories
          .filter((cat) => (cat.category_name || "").toUpperCase() !== "SHOP ALL")
          .map((cat) => {
            const categoryName = (cat.category_name || "").toUpperCase();
            const categoryImage = categoryImages[categoryName];
            
            return (
              <button
                key={cat.id}
                onClick={() => handleClick(cat)}
                className={`flex flex-col items-center group focus:outline-none transition-all duration-300 ${
                  selectedCategory?.id === cat.id
                    ? "scale-110"
                    : "hover:scale-105"
                }`}
              >
                <div className="w-55 h-55 rounded-full mb-4 flex items-center justify-center overflow-hidden border-3 border-[#C9A35D] group-hover:border-[#b8934a] transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={cat.category_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#C9A35D] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {cat.category_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span className="font-semibold text-lg text-[#C9A35D] group-hover:text-[#b8934a] transition-colors duration-300 mt-2">
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