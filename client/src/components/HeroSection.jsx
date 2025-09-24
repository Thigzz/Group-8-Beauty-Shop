import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, Star, Truck, Shield, Headphones, Home } from "lucide-react";


const HeroSection = ({ category }) => {
  const getHeroContent = (categoryName) => {
    const heroContent = {
      'MAKEUP': {
        title: 'VISIT THE LIP LIBRARY',
        subtitle: 'Your go-to destination for all things lip at Fenty Beauty.',
        bgColor: 'bg-gradient-to-r from-purple-900 to-pink-800',
        ctaText: 'Shop Makeup'
      },
      'SKINCARE': {
        title: 'GLOW UP YOUR ROUTINE',
        subtitle: 'Discover our premium skincare collection for radiant skin.',
        bgColor: 'bg-gradient-to-r from-green-800 to-blue-900',
        ctaText: 'Shop Skincare'
      },
      'FRAGRANCE': {
        title: 'SCENT YOUR STORY',
        subtitle: 'Find your signature fragrance from our curated collection.',
        bgColor: 'bg-gradient-to-r from-amber-900 to-orange-800',
        ctaText: 'Shop Fragrances'
      },
      'HAIRCARE': {
        title: 'HAIR THAT SPEAKS',
        subtitle: 'Transform your hair with our professional-grade products.',
        bgColor: 'bg-gradient-to-r from-indigo-900 to-purple-800',
        ctaText: 'Shop Haircare'
      },
      'ACCESSORIES': {
        title: 'COMPLETE YOUR LOOK',
        subtitle: 'The perfect finishing touches for your beauty routine.',
        bgColor: 'bg-gradient-to-r from-gray-800 to-black',
        ctaText: 'Shop Accessories'
      }
    };
    
    return heroContent[categoryName] || heroContent['MAKEUP'];
  };

  const heroData = getHeroContent(category?.name);
  
  return (
    <section className={`${heroData.bgColor} text-white py-16 relative overflow-hidden`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="flex-1 max-w-md mb-8 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {heroData.title}
            </h1>
            <p className="text-lg opacity-90 mb-6">
              {heroData.subtitle}
            </p>
            <button className="bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-colors">
              {heroData.ctaText}
            </button>
          </div>
          
          {category?.name === 'MAKEUP' && (
            <div className="flex-1 flex justify-center space-x-4">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-pink-300 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
                <div className="w-12 h-6 lg:w-16 lg:h-8 bg-pink-500 rounded-full"></div>
              </div>
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-purple-300 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
                <div className="w-12 h-6 lg:w-16 lg:h-8 bg-purple-600 rounded-full"></div>
              </div>
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-300 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
                <div className="w-12 h-6 lg:w-16 lg:h-8 bg-red-600 rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
};

export default HeroSection;