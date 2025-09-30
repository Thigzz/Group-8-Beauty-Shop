import React from 'react';
import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectCategory, selectSubcategory } from '../redux/features/categories/categoriesSlice';

const Breadcrumb = ({ selectedCategory, selectedSubcategory, className = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categoryName = selectedCategory?.category_name || selectedCategory?.name;
  const subcategoryName = selectedSubcategory?.sub_category_name || selectedSubcategory?.name;
  
  const isShopAll = selectedSubcategory?.id === 'all';

  const createSlug = (name) => {
    return name
      ?.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  };

  const handleCategoryClick = () => {
    if (selectedCategory) {
      dispatch(selectCategory(selectedCategory));
      dispatch(selectSubcategory(null));
      const slug = createSlug(categoryName);
      navigate(`/category/${slug}`);
    }
  };

  const handleHomeClick = () => {
    dispatch(selectCategory(null));
    dispatch(selectSubcategory(null));
    navigate('/');
  };

  const handleSubcategoryClick = () => {
    if (selectedCategory && selectedSubcategory && !isShopAll) {
      dispatch(selectCategory(selectedCategory));
      dispatch(selectSubcategory(selectedSubcategory));
      const catSlug = createSlug(categoryName);
      const subSlug = createSlug(subcategoryName);
      navigate(`/category/${catSlug}/${subSlug}`);
    }
  };

  const handleShopAllClick = () => {
    if (selectedCategory) {
      dispatch(selectCategory(selectedCategory));
      dispatch(selectSubcategory({ id: 'all', name: 'All Products' }));
      const catSlug = createSlug(categoryName);
      navigate(`/category/${catSlug}/all`);
    }
  };

  return (
    <nav className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      <button onClick={handleHomeClick} className="flex items-center space-x-1 hover:text-yellow-600 transition-colors">
        <Home className="w-5 h-5" />
        <span className="text-lg">Home</span>
      </button>

      {categoryName && (
        <>
          <ChevronRight className="w-5 h-5" />
          
          {selectedSubcategory ? (
            <button
              onClick={handleCategoryClick}
              className="text-lg hover:text-yellow-600 transition-colors"
            >
              {categoryName}
            </button>
          ) : (
            <span className="text-lg font-semibold text-yellow-600">{categoryName}</span>
          )}
        </>
      )}

      {isShopAll && (
        <>
          <ChevronRight className="w-5 h-5" />
          <span className="text-lg font-semibold text-yellow-600">All Products</span>
        </>
      )}

      {subcategoryName && !isShopAll && (
        <>
          <ChevronRight className="w-5 h-5" />
          <span className="text-lg font-semibold text-yellow-600">{subcategoryName}</span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;