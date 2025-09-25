import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import apiClient from '../api/axios';
import { selectCategory, selectSubcategory, selectCategoryAndSubcategory } from '../redux/features/categories/categoriesSlice';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const dispatch = useDispatch();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute) return;

    const fetchData = async () => {
      try {
        const [categoriesResponse, subCategoriesResponse] = await Promise.all([
          apiClient.get('/api/categories/'),
          apiClient.get('/api/sub_categories/')
        ]);
        
        setCategories(categoriesResponse.data);
        setAllSubCategories(subCategoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [isAdminRoute]); 
  const handleMouseEnter = (categoryId) => {
    if (isAdminRoute) return;
    setActiveMenu(categoryId);
  };

  const handleMouseLeave = () => {
    if (isAdminRoute) return;
    setActiveMenu(null);
  };

  // Get subcategories for a specific category
  const getSubCategoriesForCategory = (categoryId) => {
    if (isAdminRoute) return [];
    return allSubCategories.filter(sub => sub.category_id === categoryId);
  };

  // Handle category click (for main category links)
  const handleCategoryClick = (category) => {
    if (isAdminRoute) return;
    setActiveMenu(null);
    if (category.id === "shop-all") {
      dispatch(selectCategory(null));
    } else {
      dispatch(selectCategory(category));
    }
  };

  // Handle subcategory click
  const handleSubcategoryClick = (category, subcategory) => {
    if (isAdminRoute) return;
    setActiveMenu(null);
    dispatch(selectCategoryAndSubcategory({ 
      category: category, 
      subcategory: subcategory 
    }));
  };

  // Handle "All [Category]" click
  const handleAllCategoryClick = (category) => {
    if (isAdminRoute) return;
    setActiveMenu(null);
    dispatch(selectCategory(category));
    dispatch(selectSubcategory(null));
  };

  if (isAdminRoute) {
    return null;
  }

  const normalizedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.category_name || "Unnamed",
    ...cat
  }));

  const menuCategories = [{ id: "shop-all", name: "SHOP ALL" }, ...normalizedCategories];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 relative z-300">
      <div className="container mx-auto">
        <div className="flex justify-around items-center h-16">
          {menuCategories.map(category => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => category.id !== "shop-all" && handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main category link */}
              {category.id === "shop-all" ? (
                <Link
                  to="/products"
                  className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors p-4"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </Link>
              ) : (
                <>
                  <Link
                    to={`/products/category/${category.id}`}
                    className="font-semibold tracking-wider uppercase text-gray-700 hover:text-[#C9A35D] transition-colors p-4"
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </Link>

                  {/* Subcategory dropdown */}
                  {activeMenu === category.id && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded-md z-10">
                      <div className="p-2">
                        {/* All products in category */}
                        <Link
                          to={`/products/category/${category.id}`}
                          className="block px-4 py-2 text-sm font-semibold text-[#C9A35D] hover:bg-gray-100 rounded-md"
                          onClick={() => handleAllCategoryClick(category)}
                        >
                          All {category.name}
                        </Link>

                        {/* Individual subcategories */}
                        {getSubCategoriesForCategory(category.id).length > 0 ? (
                          getSubCategoriesForCategory(category.id).map(sub => (
                            <Link
                              key={sub.id}
                              to={`/products/category/${category.id}/subcategory/${sub.id}`}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                              onClick={() => handleSubcategoryClick(category, sub)}
                            >
                              {sub.sub_category_name}
                            </Link>
                          ))
                        ) : (
                          <span className="block px-4 py-2 text-gray-500">No sub-categories</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;