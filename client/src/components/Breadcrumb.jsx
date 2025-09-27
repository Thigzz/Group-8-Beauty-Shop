import React from 'react';
import { ChevronRight, Home } from "lucide-react";

const Breadcrumb = ({ selectedCategory, selectedSubcategory }) => {
  const categoryName = selectedCategory?.name || selectedCategory?.category_name;
  const subcategoryName = selectedSubcategory?.name || selectedSubcategory;
  
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
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <a 
          href="/"
          className="flex items-center space-x-1 hover:text-yellow-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </a>
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          <a 
            href={item.href}
            className={`flex items-center space-x-1 hover:text-yellow-600 transition-colors ${
              index === breadcrumbItems.length - 1 ? 'text-gray-900 font-medium' : ''
            }`}
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span className="capitalize">{item.label}</span>
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;