import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Navbar = ({ 
  categories = [], 
  selectedCategory, 
  selectedSubcategory,
  onCategorySelect, 
  onSubcategorySelect 
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const normalizedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name || cat.category_name || "Unnamed",
    subcategories: (cat.subcategories || cat.sub_categories || []).map(sub => ({
      id: sub.id,
      name: sub.name || sub.sub_category_name || "Unnamed"
    }))
  }));

  const menuCategories = [
    { id: "shop-all", name: "SHOP ALL", subcategories: [] }, 
    ...normalizedCategories
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    if (hasSubcategories) {
      setActiveDropdown(activeDropdown === category.id ? null : category.id);
    }

    if (category.id === "shop-all") {
      navigate("/products/");
      onCategorySelect(null);
      onSubcategorySelect(null);
    } else {
      navigate("/categories");
      onCategorySelect(category);
      onSubcategorySelect(null);
    }

    if (!hasSubcategories) setActiveDropdown(null);
  };

  const handleSubcategoryClick = (category, subcategory, event) => {
    event.stopPropagation();
    console.log('Subcategory clicked:', subcategory);
    setActiveDropdown(null);
    navigate("/categories");
    
    if (subcategory && subcategory.id) {
      onCategorySelect(category);
      onSubcategorySelect(subcategory);
    } else {
      onCategorySelect(category);
      onSubcategorySelect(null);
    }
  };

  const getDropdownPosition = (categoryIndex) => {
    const baseLeft = 240;
    const increment = 100;
    return baseLeft + (categoryIndex * increment);
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 relative z-50">
      <div className="container mx-auto px-4" ref={dropdownRef}>
        <div className="flex items-center space-x-8 py-4 overflow-x-auto relative">
          {menuCategories.map((category, index) => {
            const hasSubcategories = category.subcategories.length > 0;
            const isActive = category.id === "shop-all" 
              ? !selectedCategory 
              : selectedCategory?.id === category.id;

            return (
              <div 
                key={category.id} 
                className="relative"
                onMouseEnter={() => hasSubcategories && setActiveDropdown(category.id)}
                onMouseLeave={() => hasSubcategories && setActiveDropdown(null)}
              >
                {/* Category button */}
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`flex items-center space-x-1 py-2 px-3 font-medium whitespace-nowrap transition-colors rounded ${
                    isActive 
                      ? 'text-[#C9A35D] bg-yellow-50' 
                      : 'hover:text-[#C9A35D] hover:bg-gray-100'
                  }`}
                >
                  <span>{category.name}</span>
                  {hasSubcategories && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform ${
                        activeDropdown === category.id ? "rotate-180" : ""
                      }`} 
                    />
                  )}
                </button>

                {/* Subcategory dropdown with fixed positioning */}
                {activeDropdown === category.id && hasSubcategories && (
                  <>
                    {/* Backdrop to catch clicks outside */}
                    <div 
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setActiveDropdown(null)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div 
                      className="fixed w-48 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[9999]"
                      style={{ 
                        top: '120px',
                        left: `${getDropdownPosition(index)}px`
                      }}
                    >
                      {/* "All [Category]" option */}
                      <button
                        onClick={(e) => handleSubcategoryClick(category, null, e)}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition-colors border-b border-gray-100 ${
                          selectedCategory?.id === category.id && !selectedSubcategory
                            ? 'bg-[#C9A35D] text-white'
                            : 'text-[#C9A35D] hover:bg-yellow-50'
                        }`}
                      >
                        All {category.name}
                      </button>

                      {/* Individual subcategories */}
                      {category.subcategories.map(sub => (
                        <button
                          key={sub.id}
                          onClick={(e) => handleSubcategoryClick(category, sub, e)}
                          className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                            selectedSubcategory?.id === sub.id
                              ? 'bg-[#C9A35D] text-white'
                              : 'hover:bg-yellow-100 hover:text-[#C9A35D]'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Navbar;