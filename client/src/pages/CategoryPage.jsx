import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductGrid from "../components/Product/ProductGrid";
import HeroSection from "../components/HeroSection";
import Breadcrumb from "../components/Breadcrumb";
import { ChevronDown } from "lucide-react";
import { 
  fetchAllProducts, 
  fetchProductsByCategory, 
  fetchProductsBySubcategory, 
  fetchProductsByCategoryAndSubcategory 
} from "../redux/features/products/productsSlice";

const CategoryPage = ({
  categories = [],
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  showAllProducts = false,
}) => {
  const { categoryId, subcategoryId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productsState = useSelector(state => state.products);
  const productsArray = Array.isArray(productsState.items) ? productsState.items : [];

  const [sortBy, setSortBy] = useState('Newest');
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    brands: [],
    ratings: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const category = useMemo(
    () => categories.find((c) => c.id.toString() === categoryId),
    [categories, categoryId]
  );

  const subcategory = useMemo(
    () =>
      category?.subcategories?.find((s) => s.id.toString() === subcategoryId) || null,
    [category, subcategoryId]
  );

  // Reset page and fetch data when category/subcategory changes
  useEffect(() => {
    setCurrentPage(1);
    
    if ((categoryId || subcategoryId) && window.location.pathname === '/categories') {
      navigate('/categories', { replace: true });
      return;
    }

    // Fetch initial data
    if (showAllProducts) {
      if (!selectedCategory || selectedCategory.id === 'shop-all') {
        dispatch(fetchAllProducts({ page: 1 }));
      } else if (selectedSubcategory) {
        dispatch(fetchProductsBySubcategory({ subcategoryId: selectedSubcategory.id, page: 1 }));
      } else {
        dispatch(fetchProductsByCategory({ categoryId: selectedCategory.id, page: 1 }));
      }
    } else if (categoryId) {
      if (subcategoryId) {
        dispatch(fetchProductsByCategoryAndSubcategory({ categoryId, subcategoryId, page: 1 }));
      } else {
        dispatch(fetchProductsByCategory({ categoryId, page: 1 }));
      }
    }
  }, [categoryId, subcategoryId, showAllProducts, selectedCategory?.id, selectedSubcategory?.id, dispatch, navigate]);

  // Load more products when page changes (but not on initial load)
  useEffect(() => {
    if (currentPage > 1) {
      if (showAllProducts) {
        if (!selectedCategory || selectedCategory.id === 'shop-all') {
          dispatch(fetchAllProducts({ page: currentPage, append: true }));
        } else if (selectedSubcategory) {
          dispatch(fetchProductsBySubcategory({ subcategoryId: selectedSubcategory.id, page: currentPage, append: true }));
        } else {
          dispatch(fetchProductsByCategory({ categoryId: selectedCategory.id, page: currentPage, append: true }));
        }
      } else if (categoryId) {
        if (subcategoryId) {
          dispatch(fetchProductsByCategoryAndSubcategory({ categoryId, subcategoryId, page: currentPage, append: true }));
        } else {
          dispatch(fetchProductsByCategory({ categoryId, page: currentPage, append: true }));
        }
      }
    }
  }, [currentPage]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    if (productsState.loading && currentPage === 1) return [];

    return productsArray.filter(product => {
      const price = product.price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;

      if (filters.brands.length > 0 && product.brand) {
        if (!filters.brands.includes(product.brand)) return false;
      }

      if (filters.ratings > 0 && product.rating) {
        if (product.rating < filters.ratings) return false;
      }

      return true;
    });
  }, [productsArray, filters, productsState.loading, currentPage]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'Price (Low → High)':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'Price (High → Low)':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'Name (A-Z)':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'Name (Z-A)':
        return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      default:
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  }, [filteredProducts, sortBy]);

  // Get unique brands for filter
  const availableBrands = useMemo(() => {
    return [...new Set(productsArray.map(p => p.brand).filter(Boolean))].sort();
  }, [productsArray]);

  const displayCategory = showAllProducts ? selectedCategory : category;

  const handleSortChange = (newSortBy) => setSortBy(newSortBy);

  const handlePriceRangeChange = (range) => {
    setFilters(prev => ({ ...prev, priceRange: [range.min, range.max] }));
  };

  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const handleRatingChange = (rating) => {
    setFilters(prev => ({ ...prev, ratings: rating }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      brands: [],
      ratings: 0,
    });
    if (showAllProducts) {
      onCategorySelect({ id: 'shop-all', name: 'SHOP ALL', subcategories: [] });
      onSubcategorySelect(null);
    }
  };

  const handleCategorySelect = (cat) => {
    onCategorySelect(cat);
    onSubcategorySelect(null); // Reset subcategory when changing category
    setCurrentPage(1);
  };

  const handleSubcategorySelect = (subcat) => {
    onSubcategorySelect(subcat);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const getResultsText = () => {
    if (showAllProducts && (!selectedCategory || selectedCategory.id === 'shop-all')) {
      return 'All Products';
    }
    if (showAllProducts && selectedCategory && selectedCategory.id !== 'shop-all') {
      const categoryName = selectedCategory.category_name || selectedCategory.name || 'Products';
      const subcategoryText = selectedSubcategory ? ` - ${selectedSubcategory.name}` : '';
      return `${categoryName}${subcategoryText}`;
    }
    if (category) {
      const categoryName = category.category_name || category.name || 'Products';
      const subcategoryText = subcategory ? ` - ${subcategory.name}` : '';
      return `${categoryName}${subcategoryText}`;
    }
    return 'Products';
  };

  const getProductCountText = () => {
    const currentCount = sortedProducts.length;
    const totalCount = productsState.pagination?.total || currentCount;
    
    return `Showing ${currentCount} of ${totalCount} products`;
  };

  const hasMoreProducts = () => {
    const totalProducts = productsState.pagination?.total || 0;
    const currentProducts = productsArray.length;
    return currentProducts < totalProducts;
  };

  // Price ranges
  const priceRanges = [
    { label: 'Under KSh 2,500', min: 0, max: 2500 },
    { label: 'KSh 2,500 - KSh 5,000', min: 2500, max: 5000 },
    { label: 'KSh 5,000 - KSh 10,000', min: 5000, max: 10000 },
    { label: 'Over KSh 10,000', min: 10000, max: 100000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        selectedSubcategory={selectedSubcategory}
        onSubcategorySelect={handleSubcategorySelect}
      />
      <HeroSection category={displayCategory || category} />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div className="mb-4 lg:mb-0">
            <Breadcrumb 
              selectedCategory={displayCategory || category}
              selectedSubcategory={selectedSubcategory || subcategory}
              showAllProducts={showAllProducts}
            />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{getResultsText()}</h1>
            <p className="text-gray-600">
              {productsState.loading && currentPage === 1 ? 'Loading...' : getProductCountText()}
            </p>
            {productsState.error && (
              <p className="text-red-600 text-sm mt-1">Error: {productsState.error}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-white border border-gray-300 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Filters
            </button>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 focus:outline-none focus:border-yellow-500 text-sm"
                disabled={productsState.loading}
              >
                <option value="Newest">Newest</option>
                <option value="Price (Low → High)">Price (Low → High)</option>
                <option value="Price (High → Low)">Price (High → Low)</option>
                <option value="Name (A-Z)">Name (A-Z)</option>
                <option value="Name (Z-A)">Name (Z-A)</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button onClick={clearFilters} className="text-sm text-yellow-600 hover:text-yellow-700">
                  Clear All
                </button>
              </div>

              {/* Show All Categories - Only on /categories route when no category is selected */}
              {showAllProducts && (!selectedCategory || selectedCategory.id === 'shop-all') && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat)}
                        className="w-full text-left px-3 py-2 rounded text-sm transition-colors text-gray-600 hover:bg-gray-50"
                      >
                        {cat.category_name || cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subcategories - Only show if we have a category context */}
              {displayCategory?.subcategories && displayCategory.subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {showAllProducts && (!selectedCategory || selectedCategory.id === 'shop-all') 
                      ? 'Subcategories' 
                      : 'Categories'
                    }
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSubcategorySelect(null)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        !(selectedSubcategory || subcategory) 
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All {displayCategory.category_name || displayCategory.name}
                    </button>
                    {displayCategory.subcategories.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSubcategorySelect(subcat)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          (selectedSubcategory?.id === subcat.id || subcategory?.id === subcat.id) 
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRangeChange(range)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filters.priceRange[0] === range.min && filters.priceRange[1] === range.max
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand filter */}
              {availableBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                          className="mr-2 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        />
                        <span className="text-sm text-gray-600">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Ratings filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(rating)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center ${
                        filters.ratings === rating
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <span>& Up</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {productsState.loading && currentPage === 1 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <>
                <ProductGrid 
                  products={sortedProducts} 
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />
                
                {hasMoreProducts() && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      className="bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={productsState.loading}
                    >
                      {productsState.loading ? 'Loading...' : 'Load More Products'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;