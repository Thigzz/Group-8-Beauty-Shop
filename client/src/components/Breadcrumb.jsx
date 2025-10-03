import React from "react";
import { ChevronRight, Home, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  selectCategory,
  selectSubcategory,
} from "../redux/features/categories/categoriesSlice";

const Breadcrumb = ({
  selectedCategory,
  selectedSubcategory,
  className = "",
  sortBy,
  onSortChange,
  isLoading = false,
  showSort = false,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categoryName =
    selectedCategory?.category_name || selectedCategory?.name;
  const subcategoryName =
    selectedSubcategory?.sub_category_name || selectedSubcategory?.name;

  const isShopAll = selectedSubcategory?.id === "all";

  const createSlug = (name) => {
    return name
      ?.toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
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
    navigate("/");
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-gray-600">
        <button
          onClick={handleHomeClick}
          className="flex items-center space-x-1 hover:text-yellow-600 transition-colors"
        >
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
              <span className="text-lg font-semibold text-yellow-600">
                {categoryName}
              </span>
            )}
          </>
        )}

        {isShopAll && (
          <>
            <ChevronRight className="w-5 h-5" />
            <span className="text-lg font-semibold text-yellow-600">
              All Products
            </span>
          </>
        )}

        {subcategoryName && !isShopAll && (
          <>
            <ChevronRight className="w-5 h-5" />
            <span className="text-lg font-semibold text-yellow-600">
              {subcategoryName}
            </span>
          </>
        )}
      </nav>

      {/* Sort Dropdown - Updated styling to match sidebar */}
      {showSort && sortBy !== undefined && onSortChange && (
        <div className="flex items-center space-x-4">
          <span className="text-base text-gray-700 font-medium">Sort by:</span>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500 text-base font-medium text-gray-900 cursor-pointer hover:border-gray-400 transition-colors min-w-[200px]"
              disabled={isLoading}
            >
              <option value="Newest">Newest</option>
              <option value="Price (Low → High)">Price (Low → High)</option>
              <option value="Price (High → Low)">Price (High → Low)</option>
              <option value="Name (A-Z)">Name (A-Z)</option>
              <option value="Name (Z-A)">Name (Z-A)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Breadcrumb;
