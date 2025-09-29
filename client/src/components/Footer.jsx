import React from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#000000] text-gray-300 relative z-20">
      <div className="h-30 flex flex-col justify-center px-4">
        <div className="flex justify-between items-center">
            <div className="font-['Orbitron'] text-4xl font">
                <a href="/">
                    <span className="text-white">PA</span>
                    <span className="text-[#C9A35D]">M</span>
                    <span className="text-white">BO</span>
                </a>
            </div>

            {/* 🔹 Updated nav links */}
            <div className="flex space-x-8">
              <button onClick={() => handleNav("/products")} className="hover:text-[#C9A35D]">Shop All</button>
              <button onClick={() => handleNav("/category/makeup")} className="hover:text-[#C9A35D]">Makeup</button>
              <button onClick={() => handleNav("/category/skincare")} className="hover:text-[#C9A35D]">Skincare</button>
              <button onClick={() => handleNav("/category/fragrance")} className="hover:text-[#C9A35D]">Fragrance</button>
              <button onClick={() => handleNav("/category/accessories")} className="hover:text-[#C9A35D]">Accessories</button>
            </div>

            {/* Socials → still link to /login or socials page */}
            <div className="flex items-center space-x-4">
               <a href="/login" className="text-[#C9A35D] hover:text-white"><FaWhatsapp size={24}/></a>
               <a href="/login" className="text-[#C9A35D] hover:text-white"><FaInstagram size={24}/></a>
               <a href="/login" className="text-[#C9A35D] hover:text-white"><FaFacebookF size={24}/></a>
               <a href="/login" className="text-[#C9A35D] hover:text-white"><FaTwitter size={24}/></a>
               <a href="/login" className="text-[#C9A35D] hover:text-white"><FaYoutube size={24}/></a>
               <span className="font-semibold">+254 700 000 000</span>
            </div>
        </div>

        <div className="border-t border-gray-00 pt-4 mt-4 text-center text-sm text-gray-500">
          <p>© 2025 Pambo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
