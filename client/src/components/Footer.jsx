import React from 'react';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
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
            <div className="flex space-x-8">
              <a href="#" className="hover:text-[#C9A35D]">Shop All</a>
              <a href="#" className="hover:text-[#C9A35D]">Makeup</a>
              <a href="#" className="hover:text-[#C9A35D]">Skincare</a>
              <a href="#" className="hover:text-[#C9A35D]">Fragrance</a>
              <a href="#" className="hover:text-[#C9A35D]">Accessories</a>
            </div>
             <div className="flex items-center space-x-4">
               <a href="#" className="text-[#C9A35D] hover:text-white"><FaWhatsapp size={24}/></a>
               <a href="#" className="text-[#C9A35D] hover:text-white"><FaInstagram size={24}/></a>
               <a href="#" className="text-[#C9A35D] hover:text-white"><FaFacebookF size={24}/></a>
               <a href="#" className="text-[#C9A35D] hover:text-white"><FaTwitter size={24}/></a>
               <a href="#" className="text-[#C9A35D] hover:text-white"><FaYoutube size={24}/></a>
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