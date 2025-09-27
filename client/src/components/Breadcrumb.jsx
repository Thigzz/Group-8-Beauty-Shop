import React from 'react';
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ selectedCategory, selectedSubcategory, className = "" }) => {
  const categoryName = selectedCategory?.name || selectedCategory?.category_name;
  const subcategoryName = selectedSubcategory?.name || selectedSubcategory?.sub_category_name;
  
  const breadcrumbItems = [
    { 
      label: 'Home', 
      href: '/', 
      icon: Home 
    }
  ];

  if (categoryName) {
    breadcrumbItems.push({
      label: categoryName,
      href: `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }

  if (subcategoryName && categoryName) {
    breadcrumbItems.push({
      label: subcategoryName,
      href: `/${categoryName.toLowerCase().replace(/\s+/g, '-')}/${subcategoryName.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }

  if (breadcrumbItems.length <= 1) {
    return (
      <nav className={`flex items-center space-x-2 text-gray-600 ${className}`}>
        <a 
          href="/"
          className="flex items-center space-x-1 hover:text-yellow-600 transition-colors"
        >
          <Home className="w-5 h-5" /> 
          <span className="text-lg">Home</span>
        </a>
      </nav>
    );
  }

  return (
    <nav className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-5 h-5" />} 
          <a 
            href={item.href}
            className={`flex items-center space-x-1 hover:text-yellow-600 transition-colors ${
              index === breadcrumbItems.length - 1 ? 'text-gray-900 font-semibold' : ''
            }`}
          >
            {item.icon && <item.icon className="w-5 h-5" />} 
            <span className="capitalize text-lg">
              {item.label}
            </span>
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;