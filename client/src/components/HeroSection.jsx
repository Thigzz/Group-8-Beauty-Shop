import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ category }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const getHeroSlides = (categoryName) => {
    const slidesByCategory = {
      MAKEUP: [
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
      ],
      FRAGRANCE: [
        {
          id: 1,
          title: "Signature Scents",
          subtitle: "Discover your perfect fragrance",
          bgImage:
            "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1000&q=80",
          bgGradient: "from-amber-900/70 to-orange-900/70",
        },
        {
          id: 2,
          title: "Luxury Perfumes",
          subtitle: "Indulge in premium fragrances",
          bgImage:
            "https://images.unsplash.com/photo-1757313251182-a50b32360aea?w=500&q=80",
          bgGradient: "from-yellow-900/70 to-amber-900/70",
        },
        {
          id: 3,
          title: "Body Mists",
          subtitle: "Light, refreshing scents",
          bgImage:
            "https://images.unsplash.com/photo-1671642605304-2a0a812b5529?w=1000&q=80",
          bgGradient: "from-orange-900/70 to-red-900/70",
        },
        {
          id: 4,
          title: "Aromatic Oils",
          subtitle: "Pure essence in every drop",
          bgImage:
            "https://images.unsplash.com/photo-1643907652089-88c92a94416c?w=1000&q=80",
          bgGradient: "from-amber-300/25 to-orange-400/35",
        },
      ],
      SKINCARE: [
        {
          id: 1,
          title: "Radiant Skin Starts Here",
          subtitle: "Premium skincare for every skin type",
          bgImage:
            "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1000&q=80",
          bgGradient: "from-green-900/70 to-teal-900/70",
        },
        {
          id: 2,
          title: "Anti-Aging Solutions",
          subtitle: "Turn back time with our serums",
          bgImage:
            "https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=1000&q=80",
          bgGradient: "from-teal-900/70 to-cyan-900/70",
        },
        {
          id: 3,
          title: "Hydration Heroes",
          subtitle: "Quench your skin's thirst",
          bgImage:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=1000&q=80",
          bgGradient: "from-blue-900/70 to-green-900/70",
        },
        {
          id: 4,
          title: "Natural Ingredients",
          subtitle: "Pure care for your skin",
          bgImage:
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1000&q=80",
          bgGradient: "from-emerald-900/70 to-blue-900/70",
        },
      ],
      HAIRCARE: [
        {
          id: 1,
          title: "Hair That Speaks",
          subtitle: "Transform your hair with our collection",
          bgImage:
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&q=80",
          bgGradient: "from-indigo-900/70 to-purple-900/70",
        },
        {
          id: 2,
          title: "Salon-Quality Results",
          subtitle: "Professional care at home",
          bgImage:
            "https://images.unsplash.com/photo-1612450149241-9fed1ffc9c2b?w=1000&q=80",
          bgGradient: "from-purple-900/70 to-pink-900/70",
        },
        {
          id: 3,
          title: "Healthy Hair Journey",
          subtitle: "Nourish, strengthen, shine",
          bgImage:
            "https://images.unsplash.com/photo-1713181215534-3b46c62e2018?w=1000&q=80",
          bgGradient: "from-violet-900/70 to-purple-900/70",
        },
        {
          id: 4,
          title: "Color Protection",
          subtitle: "Keep your color vibrant longer",
          bgImage:
            "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1000&q=80",
          bgGradient: "from-blue-900/70 to-indigo-900/70",
        },
      ],
      ACCESSORIES: [
        {
          id: 1,
          title: "Complete Your Look",
          subtitle: "Essential beauty tools & accessories",
          bgImage:
            "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=1000&q=80",
          bgGradient: "from-gray-900/70 to-slate-900/70",
        },
        {
          id: 2,
          title: "Professional Tools",
          subtitle: "Elevate your beauty routine",
          bgImage:
            "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000&q=80",
          bgGradient: "from-slate-900/70 to-gray-900/70",
        },
        {
          id: 3,
          title: "Makeup Brushes",
          subtitle: "Precision application every time",
          bgImage:
            "https://images.unsplash.com/photo-1679307741332-eadac4345294?w=1000&q=80",
          bgGradient: "from-neutral-900/70 to-stone-900/70",
        },
        {
          id: 4,
          title: "Beauty Organizers",
          subtitle: "Keep your collection tidy",
          bgImage:
            "https://images.unsplash.com/photo-1585687635785-994bda55c78e?w=1000&q=80",
          bgGradient: "from-zinc-900/70 to-neutral-900/70",
        },
      ],
    };

    // Default slides if no category or category not found
    const defaultSlides = [
      {
        id: 1,
        title: "Discover Beauty",
        subtitle: "Premium products for every need",
        bgImage:
          "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1000&q=80",
        bgGradient: "from-pink-900/70 to-purple-900/70",
      },
      {
        id: 2,
        title: "Signature Scents",
        subtitle: "Find your perfect fragrance",
        bgImage:
          "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=1000&q=80",
        bgGradient: "from-amber-900/70 to-orange-900/70",
      },
      {
        id: 3,
        title: "Radiant Skin",
        subtitle: "Skincare that works",
        bgImage:
          "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1000&q=80",
        bgGradient: "from-green-900/70 to-teal-900/70",
      },
      {
        id: 4,
        title: "Hair Excellence",
        subtitle: "Transform your haircare routine",
        bgImage:
          "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&q=80",
        bgGradient: "from-indigo-900/70 to-purple-900/70",
      },
    ];

    const categoryKey = categoryName?.toUpperCase();
    return slidesByCategory[categoryKey] || defaultSlides;
  };

  const heroSlides = getHeroSlides(category?.name || category?.category_name);
  const currentHero = heroSlides[currentSlide];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const handleShopNow = () => {
    navigate("/shop-all");
  };

  return (
    <div className="relative">
      <section className="min-h-[500px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${currentHero.bgImage})` }}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-r ${currentHero.bgGradient}`}
          ></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex items-center min-h-[400px]">
            <div className="max-w-lg space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                {currentHero.title}
              </h1>

              <p className="text-lg text-white opacity-90">
                {currentHero.subtitle}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleShopNow}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                </button>
              </div>

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

export default HeroSection;
