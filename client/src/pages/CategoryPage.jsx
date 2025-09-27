import React, { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../components/Footer";
import ProductDetailModal from "../components/Product/ProductDetailModal";
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
  const { categoryId, subcategoryId, categoryName, subcategoryName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const productsState = useSelector(state => state.products);
  const productsArray = Array.isArray(productsState.items) ? productsState.items : [];

  const [sortBy, setSortBy] = useState('Newest');
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    brands: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createSlug = (name) => {
    return name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || '';
  };

  // Find category based on URL or Redux
  const category = useMemo(() => {
    if (categoryId && categoryId !== "undefined") {
      return categories.find(cat => cat.id.toString() === categoryId.toString());
    } else if (categoryName) {
      return categories.find((cat) => {
        const categorySlug = createSlug(cat.category_name || cat.name);
        return categorySlug === categoryName.toLowerCase();
      });
    }
    return null;
  }, [categories, categoryId, categoryName]);

  // Find subcategory based on URL or Redux
  const subcategory = useMemo(() => {
    if (!category) return null;
    
    if (subcategoryId && subcategoryId !== "undefined") {
      return category.subcategories?.find(sub => sub.id.toString() === subcategoryId.toString());
    } else if (subcategoryName) {
      return category.subcategories?.find((sub) => {
        const subSlug = createSlug(sub.sub_category_name || sub.name);
        return subSlug === subcategoryName.toLowerCase();
      });
    }
    return null;
  }, [category, subcategoryId, subcategoryName]);

  const effectiveCategory = showAllProducts ? selectedCategory : category;
  const effectiveSubcategory = showAllProducts ? selectedSubcategory : subcategory;

  // Fetch Products
  useEffect(() => {
    const fetchProducts = () => {
      if (effectiveCategory) {
        if (effectiveSubcategory) {
          dispatch(fetchProductsByCategoryAndSubcategory({ 
            categoryId: effectiveCategory.id,
            subcategoryId: effectiveSubcategory.id,
            page: currentPage,
            append: currentPage > 1,
          }));
        } else {
          dispatch(fetchProductsByCategory({ 
            categoryId: effectiveCategory.id, 
            page: currentPage,
            append: currentPage > 1,
          }));
        }
      } else {
        dispatch(fetchAllProducts({ 
          page: currentPage,
          append: currentPage > 1,
        }));
      }
    };

    fetchProducts();
  }, [effectiveCategory, effectiveSubcategory, currentPage, dispatch]);

  // Filtered & Sorted Products 
  const filteredProducts = useMemo(() => {
    if (productsState.loading && currentPage === 1) return [];

    return productsArray.filter(product => {
      const price = product.price || 0;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      if (filters.brands.length > 0 && product.brand) {
        if (!filters.brands.includes(product.brand)) return false;
      }
      return true;
    });
  }, [productsArray, filters, productsState.loading, currentPage]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'Price (Low → High)': return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'Price (High → Low)': return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'Name (A-Z)': return sorted.sort((a, b) => ((a.name||a.product_name||'').toLowerCase()).localeCompare((b.name||b.product_name||'').toLowerCase()));
      case 'Name (Z-A)': return sorted.sort((a, b) => ((b.name||b.product_name||'').toLowerCase()).localeCompare((a.name||a.product_name||'').toLowerCase()));
      default: return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }
  }, [filteredProducts, sortBy]);

  const availableBrands = useMemo(() => [...new Set(productsArray.map(p => p.brand).filter(Boolean))].sort(), [productsArray]);

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

  const clearFilters = () => {
    setFilters({ priceRange: [0, 100000], brands: [] });
    if (showAllProducts) {
      onCategorySelect({ id: 'shop-all', name: 'SHOP ALL', subcategories: [] });
      onSubcategorySelect(null);
    }
  };

  const handleCategorySelect = (cat) => {
    onCategorySelect(cat);
    onSubcategorySelect(null);
    setCurrentPage(1);

    if (!showAllProducts) {
      const slug = createSlug(cat.category_name || cat.name);
      navigate(`/category/${slug}`);
    }
  };

  const handleSubcategorySelect = (subcat) => {
    onSubcategorySelect(subcat);
    setCurrentPage(1);

    if (!showAllProducts && effectiveCategory) {
      const categorySlug = createSlug(effectiveCategory.category_name || effectiveCategory.name);
      const subcategorySlug = subcat ? createSlug(subcat.sub_category_name || subcat.name) : '';
      navigate(subcategorySlug ? `/category/${categorySlug}/${subcategorySlug}` : `/category/${categorySlug}`);
    }
  };

  const handleLoadMore = () => setCurrentPage(prev => prev + 1);

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

  const priceRanges = [
    { label: 'Under KSh 2,500', min: 0, max: 2500 },
    { label: 'KSh 2,500 - KSh 5,000', min: 2500, max: 5000 },
    { label: 'KSh 5,000 - KSh 10,000', min: 5000, max: 10000 },
    { label: 'Over KSh 10,000', min: 10000, max: 100000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection category={effectiveCategory} />

      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <Breadcrumb 
              selectedCategory={effectiveCategory}
              selectedSubcategory={effectiveSubcategory}
              showAllProducts={showAllProducts}
              onCategoryClick={handleCategorySelect}
              onSubcategoryClick={handleSubcategorySelect}
              className="text-xl font-semibold" 
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-800 text-lg font-medium">
              {productsState.loading && currentPage === 1 ? 'Loading...' : getProductCountText()}
            </p>
            {productsState.error && (
              <p className="text-red-600 text-base font-medium">Error: {productsState.error}</p> 
            )}
          </div>
        </div>

        {/* Sort & Filter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 bg-white rounded-lg shadow-sm p-4">
          <div></div>
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

              {effectiveCategory?.subcategories && effectiveCategory.subcategories.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Subcategories</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleSubcategorySelect(null)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        !effectiveSubcategory 
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All {effectiveCategory.category_name || effectiveCategory.name}
                    </button>
                    {effectiveCategory.subcategories.map((subcat) => (
                      <button
                        key={subcat.id}
                        onClick={() => handleSubcategorySelect(subcat)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          effectiveSubcategory?.id === subcat.id
                            ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' 
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subcat.sub_category_name || subcat.name}
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
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <>
                <ProductGrid 
                  products={sortedProducts} 
                  onProductClick={onProductClick}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                />

                <ProductDetailModal
                  product={selectedProduct}
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
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
