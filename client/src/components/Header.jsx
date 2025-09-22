import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShoppingCart, FiUser } from 'react-icons/fi';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm.trim()}`);
    }
  };

  return (
    <header className="bg-[#000000] text-gray-300 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="font-['Orbitron'] text-4xl font-bold">
          <a href="/" data-testid="pambo-logo">
            <span className="text-white">PA</span>
            <span className="text-[#C9A35D]">M</span>
            <span className="text-white">BO</span>
          </a>
        </div>
        {/* Search Form */}
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <input
            type="text"
            placeholder="I'm looking for..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#C9A35D]"
          />
        </form>
        {/* Links */}
        <div className="flex items-center space-x-15">
          <Link to="/cart" className="relative">
            <FiShoppingCart className="h-6 w-6 text-[#C9A35D] hover:text-white" />
          </Link>
          {isAuthenticated ? (
            <Link to="/profile" className="flex items-center space-x-2 text-[#C9A35D] hover:text-white">
              <FiUser className="h-6 w-6" />
              <span>Profile</span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 text-[#C9A35D] hover:text-white">
              <FiUser className="h-6 w-6" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;