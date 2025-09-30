import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser } from 'react-icons/fi';
import { setQuery } from '../redux/features/search/searchSlice';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  const cartItemCount = cartItems ? cartItems.length : 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      dispatch(setQuery(searchTerm.trim()));
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-[#000000] text-gray-300 p-4 shadow-md relative z-40">
      <div className="flex justify-between items-center">
        <div className="font-['Orbitron'] text-4xl font">
          <Link to="/" data-testid="pambo-logo">
            <span className="text-white">PA</span>
            <span className="text-[#C9A35D]">M</span>
            <span className="text-white">BO</span>
          </Link>
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
        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link to="/cart" className="relative">
            <FiShoppingCart className="h-6 w-20 text-[#C9A35D] hover:text-white" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                {cartItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated && user ? (
            <Link to="/profile" className="flex items-center space-x-2 text-[#C9A35D] hover:text-white">
              <FiUser className="h-6 w-6" />
              <span>Hi, {user.first_name || user.username}</span>
            </Link>
          ) : (
            <Link to="/login" className="flex items-center space-x-2 text-[#C9A35D] hover:text-white">
              <FiUser className="h-6 w-10" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

