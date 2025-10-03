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
  onShopAllCategory,
  onGlobalShopAll,
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  showAllProducts = false,
  isShopAllMode = false,
}) => {
  const { categoryName, subcategoryName } = useParams();
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

  const effectiveCategory = selectedCategory;
  const effectiveSubcategory = selectedSubcategory;

  const isGlobalShopAll = showAllProducts && !effectiveCategory;

  useEffect(() => {
  if (!categories.length) return;

  const categorySlug = categoryName?.toLowerCase();
  const subcategorySlug = subcategoryName?.toLowerCase();

  const category = categories.find(
    c => createSlug(c.category_name || c.name) === categorySlug
  );

  if (subcategorySlug === 'all') {
    if (category && category.id !== effectiveCategory?.id) {
      onCategorySelect(category);
    }
    return;
  }

  const subcategory = category?.subcategories?.find(
    sc => createSlug(sc.sub_category_name || sc.name) === subcategorySlug
  );

  if (category && category.id !== effectiveCategory?.id) {
    onCategorySelect(category);
  }
  if (subcategory && subcategory.id !== effectiveSubcategory?.id) {
    onSubcategorySelect(subcategory);
  }
}, [categoryName, subcategoryName, categories]);


  useEffect(() => {
    const fetchProducts = () => {
      if (isGlobalShopAll) {
        // Global Shop All - fetch all products
        dispatch(fetchAllProducts({ 
          page: currentPage,
          append: currentPage > 1,
        }));
      } else if (isShopAllMode && effectiveCategory) {
        // Category-specific Shop All
        dispatch(fetchProductsByCategory({ 
          categoryId: effectiveCategory.id,
          page: currentPage,
          append: currentPage > 1,
        }));
      } else if (effectiveCategory && effectiveSubcategory) {
        // Normal category + subcategory
        dispatch(fetchProductsByCategoryAndSubcategory({ 
          categoryId: effectiveCategory.id,
          subcategoryId: effectiveSubcategory.id,
          page: currentPage,
          append: currentPage > 1,
        }));
      } else if (effectiveCategory) {
        // Only category selected
        dispatch(fetchProductsByCategory({ 
          categoryId: effectiveCategory.id, 
          page: currentPage,
          append: currentPage > 1,
        }));
      } else if (effectiveSubcategory) {
        // Only subcategory selected
        dispatch(fetchProductsBySubcategory({ 
          subcategoryId: effectiveSubcategory.id,
          page: currentPage,
          append: currentPage > 1,
        }));
      } else {
        // No selections - fetch all products
        dispatch(fetchAllProducts({ 
          page: currentPage,
          append: currentPage > 1,
        }));
      }
    };

    fetchProducts();
  }, [effectiveCategory, effectiveSubcategory, currentPage, isShopAllMode, isGlobalShopAll, dispatch]);

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
  };

  const handleCategorySelect = (cat) => {
    onCategorySelect(cat);
    setCurrentPage(1);
    setFilters({ priceRange: [0, 100000], brands: [] });

    const slug = createSlug(cat.category_name || cat.name);
    navigate(`/category/${slug}`);
  };

  const handleSubcategorySelect = (subcat) => {
    onSubcategorySelect(subcat);
    setCurrentPage(1);
    setFilters({ priceRange: [0, 100000], brands: [] });

    if (effectiveCategory) {
      const categorySlug = createSlug(effectiveCategory.category_name || effectiveCategory.name);
      const subcategorySlug = subcat ? createSlug(subcat.sub_category_name || subcat.name) : '';
      navigate(subcategorySlug ? `/category/${categorySlug}/${subcategorySlug}` : `/category/${categorySlug}`);
    }
  };

  const handleShopAllCategory = (category) => {
    onShopAllCategory(category);
    setCurrentPage(1);
    setFilters({ priceRange: [0, 100000], brands: [] });

    const categorySlug = createSlug(category.category_name || category.name);
    navigate(`/category/${categorySlug}/all`);
  };

  const handleGlobalShopAll = () => {
    onGlobalShopAll();
    setCurrentPage(1);
    setFilters({ priceRange: [0, 100000], brands: [] });
    navigate('/shop-all');
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

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <HeroSection category={effectiveCategory} />

      <div className="w-full mx-auto px-4 lg:px-6 xl:px-8 py-8 flex-1">
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <div className="mb-4">
            <Breadcrumb
              selectedCategory={effectiveCategory}
              selectedSubcategory={effectiveSubcategory}
              className="text-xl font-semibold"
              sortBy={sortBy}
              onSortChange={handleSortChange}
              isLoading={productsState.loading}
              showSort={true}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-800 text-lg font-medium">
              {productsState.loading && currentPage === 1
                ? "Loading..."
                : getProductCountText()}
            </p>
            {productsState.error && (
              <p className="text-red-600 text-base font-medium">
                Error: {productsState.error}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filters */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Categories</h3>

                {!isGlobalShopAll && (
                  <button
                    onClick={handleGlobalShopAll}
                    className="w-full mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors font-medium"
                  >
                    Shop All Products
                  </button>
                )}

                {/* CATEGORIES LIST*/}
                <div className="space-y-1">
                  {(isGlobalShopAll
                    ? categories
                    : [effectiveCategory].filter(Boolean)
                  ).map((category) => {
                    const isActiveCategory =
                      effectiveCategory?.id === category.id;

                    return (
                      <div key={category.id}>
                        <button
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full text-left px-3 py-2 rounded transition-colors ${
                            isActiveCategory && !isGlobalShopAll
                              ? "bg-yellow-100 text-yellow-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {category.category_name || category.name}
                        </button>
                        {(isGlobalShopAll || isActiveCategory) && (
                          <div className="ml-4 mt-2 space-y-1">
                            {category.subcategories?.length > 0 ? (
                              <div className="space-y-1">
                                {category.subcategories.map((subcat) => (
                                  <button
                                    key={subcat.id}
                                    onClick={() =>
                                      handleSubcategorySelect(subcat)
                                    }
                                    className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                                      effectiveSubcategory?.id === subcat.id
                                        ? "bg-yellow-50 text-yellow-600 font-medium"
                                        : "hover:bg-gray-50 text-gray-600"
                                    }`}
                                  >
                                    {subcat.sub_category_name || subcat.name}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="ml-4 text-xs text-gray-400">
                                No subcategories available
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handlePriceRangeChange(range)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        filters.priceRange[0] === range.min &&
                        filters.priceRange[1] === range.max
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : "text-gray-600 hover:bg-gray-50"
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
                    {availableBrands.map((brand) => (
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {isGlobalShopAll
                  ? "All Products"
                  : isShopAllMode
                  ? `All ${effectiveCategory?.category_name ||
                      effectiveCategory?.name ||
                      "Products"}`
                  : effectiveCategory?.category_name ||
                    effectiveCategory?.name ||
                    "Products"}
              </h1>
              {isGlobalShopAll ? (
                <p className="text-lg text-gray-600 mt-2">
                  Browse all products from all categories
                </p>
              ) : effectiveSubcategory && effectiveSubcategory.id !== "all" ? (
                <p className="text-lg text-gray-600 mt-2">
                  {effectiveSubcategory.sub_category_name ||
                    effectiveSubcategory.name}
                </p>
              ) : isShopAllMode ? (
                <p className="text-lg text-gray-600 mt-2">
                  All products in{" "}
                  {effectiveCategory?.category_name || effectiveCategory?.name}
                </p>
              ) : effectiveCategory ? (
                <p className="text-lg text-gray-600 mt-2">
                  Browse all products in{" "}
                  {effectiveCategory.category_name || effectiveCategory.name}
                </p>
              ) : null}
            </div>

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
                  onProductClick={handleProductClick}
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
                      {productsState.loading
                        ? "Loading..."
                        : "Load More Products"}
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