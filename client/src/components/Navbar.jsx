import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [activeMenu, setActiveMenu] = useState(null);

  // Fetch main categories on component
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Function to handle hovering over a category
  const handleMouseEnter = async (categoryId) => {
    setActiveMenu(categoryId);
    if (!subCategories[categoryId]) {
      try {
        const response = await apiClient.get(`/api/sub_categories/by_category/${categoryId}`);
        setSubCategories(prev => ({ ...prev, [categoryId]: response.data }));
      } catch (error) {
        console.error(`Failed to fetch sub-categories for ${categoryId}:`, error);
        setSubCategories(prev => ({ ...prev, [categoryId]: [] }));
      }
    }
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto flex justify-around items-center h-16">
        <Link to="/products" className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors">
          Shop All
        </Link>
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to={`/products/category/${category.id}`}
              className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors p-4"
            >
              {category.category_name}
            </Link>
            {activeMenu === category.id && subCategories[category.id] && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md z-10">
                <div className="p-2">
                  {subCategories[category.id].length > 0 ? (
                    subCategories[category.id].map(sub => (
                      <Link
                        key={sub.id}
                        to={`/products/sub_category/${sub.id}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        {sub.sub_category_name}
                      </Link>
                    ))
                  ) : (
                    <span className="block px-4 py-2 text-gray-500">No sub-categories</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;