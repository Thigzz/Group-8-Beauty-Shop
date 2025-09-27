import React from 'react';
import { ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectCategory, selectSubcategory } from '../redux/features/categories/categoriesSlice';

const Breadcrumb = ({ selectedCategory, selectedSubcategory, showAllProducts, className = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categoryName = selectedCategory?.name || selectedCategory?.category_name;
  const subcategoryName = selectedSubcategory?.name || selectedSubcategory?.sub_category_name;
  
  const handleCategoryClick = () => {
    if (selectedCategory) {
      dispatch(selectCategory(selectedCategory));
      dispatch(selectSubcategory(null)); // keep subcategory cleared
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${slug}`);
    }
  };

  const handleHomeClick = () => {
    dispatch(selectCategory({ id: 'shop-all', name: 'SHOP ALL', subcategories: [] }));
    dispatch(selectSubcategory(null));
    navigate('/');
  };

  const handleSubcategoryClick = () => {
    if (selectedCategory && selectedSubcategory) {
      dispatch(selectCategoryAndSubcategory({
        category: selectedCategory,
        subcategory: selectedSubcategory
      }));
      const catSlug = categoryName.toLowerCase().replace(/\s+/g, '-');
      const subSlug = subcategoryName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/category/${catSlug}/${subSlug}`);
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
          <button
            onClick={handleCategoryClick}
            className="text-lg hover:text-yellow-600 transition-colors"
          >
            {categoryName}
          </button>
        </>
      )}

      {subcategoryName && (
        <>
          <ChevronRight className="w-5 h-5" />
          <button
            onClick={handleSubcategoryClick}
            className="text-lg hover:text-yellow-600 transition-colors"
          >
            {subcategoryName}
          </button>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
