import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CategoryMenu = ({ categories = [] }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const normalizedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name || cat.category_name || "Unnamed",
    subcategories: (cat.subcategories || cat.sub_categories || []).map(sub => ({
      id: sub.id,
      name: sub.name || sub.sub_category_name || "Unnamed"
    }))
  }));

  const menuCategories = [{ id: "shop-all", name: "SHOP ALL", subcategories: [] }, ...normalizedCategories];

  const handleCategoryClick = category => {
    setActiveDropdown(activeDropdown === category.id ? null : category.id);
    if (category.id === "shop-all") navigate("/"); 
    else navigate(`/products/category/${category.id}`);
  };

  const handleSubcategoryClick = (category, subcategory) => {
    setActiveDropdown(null);
    if (subcategory) navigate(`/products/category/${category.id}/subcategory/${subcategory.id}`);
    else navigate(`/products/category/${category.id}`); 
  };

  return (
    <div className="bg-gray-50 border-b border-gray-200 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 py-4 overflow-x-auto">
          {menuCategories.map(category => (
            <div key={category.id} className="relative">
              <button
                onClick={() => handleCategoryClick(category)}
                className="flex items-center space-x-1 py-2 px-3 font-medium whitespace-nowrap transition-colors rounded hover:text-yellow-600 hover:bg-gray-100"
              >
                <span>{category.name}</span>
                {category.subcategories?.length > 0 && (
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === category.id ? "rotate-180" : ""}`} />
                )}
              </button>

              {activeDropdown === category.id && category.subcategories?.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col z-50">
                  {/* All subcategory option */}
                  <button
                    onClick={e => { e.stopPropagation(); handleSubcategoryClick(category, null); }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-50"
                  >
                    All {category.name}
                  </button>
                  {category.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={e => { e.stopPropagation(); handleSubcategoryClick(category, sub); }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-100 hover:text-yellow-600"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
