import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm.trim()}`);
    }
  };

  return (
    <header className="bg-[#000000] text-gray-300 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-['Orbitron'] text-4xl font">
          <a href="/">
            <span className="text-white">PA</span>
            <span className="text-[#C9A35D]">M</span>
            <span className="text-white">BO</span>
          </a>
        </div>
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <input
            type="text"
            placeholder="I'm looking for..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#C9A35D]"
          />
        </form>
        <div className="flex items-center space-x-20">
          <a href="/cart" className="relative">
            <FiShoppingCart className="h-6 w-6 text-[#C9A35D] hover:text-white" />
          </a>
          <a href="/login" className="flex items-center space-x-2 text-[#C9A35D] hover:text-white">
            <FiUser className="h-6 w-6" />
            <span>Log In</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;