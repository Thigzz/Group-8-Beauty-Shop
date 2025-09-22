import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/categories/');
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto flex justify-around items-center h-16">
        <Link to="/products" className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors">
          Shop All
        </Link>
        {isLoading ? (
          <p className="text-gray-700">Loading...</p>
        ) : (
          categories.map((category) => (
            <Link key={category.id} to={`/products/category/${category.id}`} className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors">
              {category.category_name}
            </Link>
          ))
        )}
      </div>
    </nav>
  );
};

export default Navbar;