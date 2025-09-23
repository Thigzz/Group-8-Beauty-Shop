import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LipLibraryImage from '../assets/liplibrary.webp';
import TimelessFavourites from '../components/TimelessFavourites';
import { Brush, SprayCan, Sparkles, Scissors, ShoppingBag } from 'lucide-react';

const HeroSection = () => (
  // 2. Apply the imported image as a background using inline styles
  //    and add Tailwind classes to control how the background behaves.
  <div 
    className="container mx-auto my-8 p-16 rounded-lg shadow-lg text-white bg-cover bg-center"
    style={{ backgroundImage: `url(${LipLibraryImage})` }}
  > 
    {/* <h1 className="text-5xl font-bold">VISIT THE LIP LIBRARY</h1> */}
    {/* <p className="text-xl my-4">Your go-to destination for all things lip at Fenty Beauty.</p> */}
    <button className="bg-white text-black font-bold py-3 px-8 rounded-md hover:bg-pink-200">Shop Now</button>
  </div>
);

const ShopByCategory = () => {
    const categoryIcons = {
        MAKEUP: <Brush size={36} className="text-black" />,
        HAIRCARE: <Scissors size={36} className="text-black" />,
        SKINCARE: <Sparkles size={36} className="text-black" />,
        FRAGRANCE: <SprayCan size={36} className="text-black" />,
        ACCESSORIES: <ShoppingBag size={36} className="text-black" />,
    };

    return (
        <div className="container mx-auto py-4 px-4 text-center"> 
            <h2 className="text-3xl font-bold mb-6 text-[#C9A35D]">SHOP BY CATEGORY</h2>
            <div className="flex justify-center space-x-30">
                {Object.keys(categoryIcons).map(cat => (
                     <a href="#" key={cat} className="flex flex-col items-center group focus:outline-none">
                         <div className="w-24 h-24 bg-[#C9A35D] rounded-full mb-2 flex items-center justify-center 
                                       transition-transform duration-300 group-hover:scale-105 group-focus:scale-105">
                            {categoryIcons[cat]}
                         </div>
                         <span className="font-semibold text-sm text-[#C9A35D]">{cat}</span>
                     </a>
                ))}
            </div>
        </div>
    );
};


const LandingPage = () => {
  return (
    <div>
      <Header />
      <Navbar />
      <main>
        <HeroSection />
        <ShopByCategory />
        <TimelessFavourites />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;