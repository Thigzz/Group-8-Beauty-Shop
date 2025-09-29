import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchProducts, 
  toggleProductStatus,
  fetchCategories,
  fetchSubcategories 
} from '../../redux/features/admin/adminSlice';
import toast from 'react-hot-toast';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ProductsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const adminState = useSelector(state => state.admin);
  const { 
    products = [], 
    loading = false, 
    error,
    currentPage = 1,
    totalPages = 1,
    totalProducts = 0,
    itemsPerPage = 10,
    categories = [],
    subcategories = []
  } = adminState || {};
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSubcategory, setFilterSubcategory] = useState('all');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
    dispatch(fetchProducts({ page: 1, limit: 10 }));
  }, [dispatch, isAuthenticated, navigate]);

useEffect(() => {
  const filters = { 
    page: 1, 
    limit: itemsPerPage
  };
  
  if (debouncedSearchTerm && debouncedSearchTerm.trim() !== '') {
    filters.search = debouncedSearchTerm;
  }
  
  if (filterStatus !== 'all') {
    filters.status = filterStatus === 'true' ? 1 : 0;
  }
  
  if (filterCategory !== 'all') {
    filters.category_id = filterCategory;
  }
  
  if (filterSubcategory !== 'all') {
    filters.sub_category_id = filterSubcategory;
  }
  
  dispatch(fetchProducts(filters));
}, [debouncedSearchTerm, filterStatus, filterCategory, filterSubcategory, dispatch, itemsPerPage]);


  const getCategoryName = (product) => {
    if (product.category_id && categories.length > 0) {
      const category = categories.find(cat => 
        cat.id === product.category_id || 
        cat.id == product.category_id
      );
      
      if (category) {
        return category.category_name || category.name;
      }
    }
    
    if (product.category && product.category !== 'Uncategorized') {
      const categoryByName = categories.find(cat => 
        cat.category_name === product.category || 
        cat.name === product.category
      );
      if (categoryByName) {
        return categoryByName.category_name || categoryByName.name;
      }
      return product.category;
    }
    
    return 'Uncategorized';
  };

  const getSubcategoryName = (product) => {
    const subcatId = product.subcategory_id || product.sub_category_id;
    
    if (subcatId && subcategories.length > 0) {
      const subcategory = subcategories.find(sub => {
        const subId = sub.id || sub.subcategory_id || sub.sub_category_id;
        return subId === subcatId || subId == subcatId;
      });
      
      if (subcategory) {
        return subcategory.subcategory_name || subcategory.name;
      }
    }
    
    if (product.subcategory && product.subcategory !== 'None') {
      const subcategoryByName = subcategories.find(sub => 
        sub.subcategory_name === product.subcategory || 
        sub.name === product.subcategory
      );
      if (subcategoryByName) {
        return subcategoryByName.subcategory_name || subcategoryByName.name;
      }
      return product.subcategory;
    }
    
    return 'None';
  };

  const getFilteredSubcategories = () => {
    if (filterCategory === 'all') {
      return subcategories;
    }
    
    return subcategories.filter(sub => {
      const subCatId = sub.category_id || sub.categoryId;
      return subCatId == filterCategory || String(subCatId) === String(filterCategory);
    });
  };

  const handleEdit = (product) => {
    navigate(`/admin/products/edit/${product.id}`);
  };

const handleStatusToggle = (productId, currentStatus) => {
  dispatch(toggleProductStatus({ productId, status: !currentStatus }))
    .unwrap()
    .then((result) => {
    })
    .catch((error) => {
      toast.error('❌ UI: Toggle failed:', error);
    });
};

const handlePageChange = (page) => {
  const filters = { 
    page, 
    limit: itemsPerPage
  };
  
  if (searchTerm && searchTerm.trim() !== '') {
    filters.search = searchTerm;
  }
  
  if (filterStatus !== 'all') {
    filters.status = filterStatus === 'true' ? 1 : 0;
  }
  
  if (filterCategory !== 'all') {
    filters.category_id = filterCategory;
  }
  
  if (filterSubcategory !== 'all') {
    filters.sub_category_id = filterSubcategory;
  }
  dispatch(fetchProducts(filters));
};

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(value);
        break;
      case 'category':
        setFilterCategory(value);
        setFilterSubcategory('all');
        break;
      case 'subcategory':
        setFilterSubcategory(value);
        break;
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterCategory('all');
    setFilterSubcategory('all');
  };

  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalProducts)}
              </span>{' '}
              of <span className="font-medium">{totalProducts}</span> results
            </p>
          </div>
          
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const filteredSubcategories = getFilteredSubcategories();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products Management</h1>
        <button 
          onClick={() => navigate('/admin/products/add')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span>+ Add New Product</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Type to search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="all">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Filter</label>
            <select
              value={filterCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.category_name || category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Filter</label>
            <select
              value={filterSubcategory}
              onChange={(e) => handleFilterChange('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || filterCategory === 'all' || filteredSubcategories.length === 0}
            >
              <option value="all">All Subcategories</option>
              {filteredSubcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.subcategory_name || subcategory.name}
                </option>
              ))}
            </select>
            {filterCategory !== 'all' && filteredSubcategories.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">No subcategories for this category</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={handleClearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Clear All Filters
          </button>
          
          <div className="text-sm text-gray-600">
            Showing {products.length} of {totalProducts} products
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (KSH)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-3 text-gray-600">Loading products...</span>
                    </div>
                  </td>
                </tr>
              )}
              
              {error && !loading && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <strong>Error:</strong> {error}
                      <button 
                        onClick={() => dispatch(fetchProducts({ page: currentPage, limit: itemsPerPage }))}
                        className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && !error && products.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {searchTerm || filterStatus !== 'all' || filterCategory !== 'all' || filterSubcategory !== 'all' ? (
                        'No products match your current filters'
                      ) : (
                        <div>
                          <p className="text-lg mb-2">No products found</p>
                          <button 
                            onClick={() => navigate('/admin/products/add')}
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                          >
                            Add Your First Product
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && !error && products.map((product) => {
                const categoryName = getCategoryName(product);
                const subcategoryName = getSubcategoryName(product);
                const isActive = product.isActive;
                const stockQuantity = product.stock;
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subcategoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KSH {product.price?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stockQuantity} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusToggle(product.id, isActive)}
                          className={`px-3 py-1 rounded text-xs ${
                            isActive
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {!loading && products.length > 0 && <PaginationComponent />}
      </div>
    </div>
  );
};

export default ProductsPage;