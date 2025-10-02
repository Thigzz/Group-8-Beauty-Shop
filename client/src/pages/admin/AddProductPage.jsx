import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  createProduct, 
  fetchCategories, 
  fetchSubcategories,
  createCategory, 
  createSubcategory,
  bulkUploadProducts 
} from '../../redux/features/admin/adminSlice';

const AddProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const { 
    operationLoading, 
    categories = [], 
    subcategories = [], 
    loading = false 
  } = useSelector(state => state.admin);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    stock: '',
    image: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      setPageLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          dispatch(fetchCategories()).unwrap(),
          dispatch(fetchSubcategories()).unwrap()
        ]);
      
      } catch (error) {
        setError(`Failed to load page data: ${error}`);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadPage();
  }, [dispatch, isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category');
      return;
    }
    
    const productData = {
      product_name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      stock_qty: parseInt(formData.stock),
      category_id: formData.category,
      sub_category_id: formData.subcategory || null,
      image_url: formData.image.trim() || null,
      status: true
    };
    
    dispatch(createProduct(productData))
      .unwrap()
      .then(() => {
        navigate('/admin/products');
      })
      .catch(error => {
        alert(`Error creating product: ${error.message || 'Please check the form data'}`);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      setFormData({
        ...formData,
        [name]: value,
        subcategory: '' 
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const newCategoryData = await dispatch(createCategory({ category_name: newCategory.trim() })).unwrap();

        await dispatch(fetchCategories()).unwrap();

        
        setFormData({
          ...formData,
          category: newCategoryData.id
        });
        
        setNewCategory('');
        setShowNewCategory(false);

        setShowNewSubcategory(true);

        alert('Category created and selected!');
      } catch (error) {
        toast.error('Failed to create category:', error);
      }
    }
  };

  const handleAddSubcategory = async () => {
    if (newSubcategory.trim() && formData.category) {
      try {
        const newSubcategoryData = await dispatch(createSubcategory({ 
          sub_category_name: newSubcategory.trim(), 
          category_id: formData.category 
        })).unwrap();

        await dispatch(fetchSubcategories()).unwrap();
        
        setFormData({
          ...formData,
          subcategory: newSubcategoryData.id
        });
        
        setNewSubcategory('');
        setShowNewSubcategory(false);
        alert('Subcategory created and selected!');
      } catch (error) {
        toast.error('Failed to create subcategory:', error);
      }
    }
  };

  const handleBulkUpload = (e) => {
    e.preventDefault();
    if (!bulkUploadFile) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        const products = parseCSVData(csvData);
        
        const invalidProducts = products.filter(product => !product.category_id);
        if (invalidProducts.length > 0) {
          alert(`Could not find categories for ${invalidProducts.length} product(s). Please check the category names in your CSV.`);
          return;
        }
        
        try {
          const result = await dispatch(bulkUploadProducts(products)).unwrap();
          setBulkUploadFile(null);
          setShowBulkUpload(false);
          navigate('/admin/products');
        } catch (error) {
          toast.error('❌ Bulk upload failed:', error);
          if (error.message) {
            toast.error('🚨 Error message:', error.message);
          }
          
          alert(`Bulk upload failed: ${error.message || 'Please check your CSV data and try again'}`);
        }
      } catch (error) {
        toast.error('❌ Error processing CSV:', error);
        alert('Error processing CSV file. Please check the format.');
      }
    };
    reader.readAsText(bulkUploadFile);
  };

  const parseCSVData = (csvData) => {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    const products = lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(value => value.trim());
      const product = {};
      
      headers.forEach((header, index) => {
        if (header === 'price' || header === 'stock_qty') {
          product[header] = parseFloat(values[index]) || 0;
        } else {
          product[header] = values[index] || '';
        }
      });
      
      return product;
    });

    const mappedProducts = products.map((product, index) => {
      if (!product.product_name && !product.name) {
        toast.error(`❌ Product at line ${index + 2} missing name`);
        return null;
      }
      
      if (!product.category_name) {
        toast.error(`❌ Product at line ${index + 2} missing category_name`);
        return null;
      }

      const mappedProduct = {
        product_name: product.product_name || product.name,
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        stock_qty: parseInt(product.stock_qty || product.stock) || 0,
        image_url: product.image_url || product.image || null,
        status: true,
        sub_category_id: null
      };

      // Find category ID by name
      if (product.category_name) {
        const categoryName = product.category_name.trim().toLowerCase();
        
        const category = categories.find(cat => {
          const catName = (cat.category_name || cat.name || '').trim().toLowerCase();
          return catName === categoryName;
        });
        
        if (category) {
          mappedProduct.category_id = category.id;
        } else {
          toast.error(`❌ Category not found: "${product.category_name}"`);
          return null;
        }
      }

      if (product.sub_category_name) {
        const subcategoryName = product.sub_category_name.trim().toLowerCase();
        
        const subcategory = subcategories.find(sub => {
          const subName = (sub.subcategory_name || sub.name || '').trim().toLowerCase();
          const subCatId = sub.category_id || sub.categoryId;
        
          return subName === subcategoryName && subCatId === mappedProduct.category_id;
        });
        
        if (subcategory) {
          mappedProduct.sub_category_id = subcategory.id;
        } else {
          toast.warn(`⚠️ Subcategory not found: "${product.sub_category_name}" for category "${product.category_name}"`);
        
          const availableSubs = subcategories.filter(sub => 
            (sub.category_id || sub.categoryId) === mappedProduct.category_id
          );
      
            availableSubs.map(s => s.subcategory_name || s.name)
          
        }
      } 
      return mappedProduct;
    }).filter(product => product !== null);

    return mappedProducts;
  };

  const filteredSubcategories = subcategories?.filter(sub => {
    const subCategoryId = sub.category_id || sub.categoryId;
    const formCategoryId = formData.category;
    
    return subCategoryId == formCategoryId || 
          String(subCategoryId) === String(formCategoryId);
  }) || [];

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchSubcategories());
    }
  }, [formData.category, dispatch]);

  if (pageLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading categories and page data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Refresh Page
          </button>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowBulkUpload(!showBulkUpload)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {showBulkUpload ? 'Single Product' : 'Bulk Upload'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>

      {/* Bulk Upload Section */}
      {showBulkUpload && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Bulk Upload Products</h2>
          
          {/* Available Categories Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <p className="text-sm font-medium mb-2">Available Categories & Subcategories (use exact names):</p>
            <div className="text-sm text-gray-600 space-y-2">
              {categories.map(category => {
                const categorySubs = subcategories.filter(sub => 
                  sub.category_id === category.id || sub.categoryId === category.id
                );
                return (
                  <div key={category.id} className="mb-3 p-2 bg-white rounded border">
                    <div className="font-medium text-blue-600">
                      "{category.category_name || category.name}"
                    </div>
                    {categorySubs.length > 0 && (
                      <div className="ml-4 mt-1 text-green-600">
                        Subcategories: {categorySubs.map(sub => `"${sub.subcategory_name || sub.name}"`).join(', ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Important:</strong> Use exact category and subcategory names as shown above (case-sensitive)
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Upload a CSV file with columns: <strong>product_name, description, price, stock_qty, category_name, sub_category_name, image_url</strong>
            </p>
            <a 
              href="/sample-products.csv" 
              download 
              className="text-blue-500 text-sm underline hover:text-blue-700"
            >
              Download Sample CSV
            </a>
          </div>
          
          <form onSubmit={handleBulkUpload}>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setBulkUploadFile(e.target.files[0])}
              className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!bulkUploadFile || operationLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {operationLoading ? 'Uploading...' : 'Upload Products'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkUpload(false);
                  setBulkUploadFile(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Single Product Form */}
      {!showBulkUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSH) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Category Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="flex gap-2 mb-2">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                >
                  <option value="">
                    {loading ? 'Loading categories...' : 'Select Category'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name || cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-medium"
                  disabled={loading}
                >
                  +
                </button>
              </div>
              
              {categories.length === 0 && !loading && (
                <p className="text-red-500 text-sm">No categories found. Please create one first.</p>
              )}
              
              {showNewCategory && (
                <div className="flex gap-2 mb-4 items-center">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={operationLoading || !newCategory.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                  >
                    {operationLoading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategory('');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center rounded-md font-bold text-lg"
                    title="Cancel"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Subcategory Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
              <div className="flex gap-2 mb-2">
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.category || loading}
                >
                  <option value="">
                    {!formData.category 
                      ? 'Select category first' 
                      : loading 
                        ? 'Loading subcategories...' 
                        : 'Select Subcategory (Optional)'}
                  </option>
                  {filteredSubcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subcategory_name || sub.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSubcategory(!showNewSubcategory)}
                  disabled={!formData.category || loading}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              
              {showNewSubcategory && formData.category && (
                <div className="flex gap-2 mb-4 items-center">
                  <input
                    type="text"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    placeholder="New subcategory name"
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    disabled={operationLoading || !newSubcategory.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                  >
                    {operationLoading ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewSubcategory(false);
                      setNewSubcategory('');
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 flex items-center justify-center rounded-md font-bold text-lg"
                    title="Cancel"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Product preview" 
                    className="h-20 w-20 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={operationLoading || !formData.category}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {operationLoading ? 'Creating...' : 'Create Product'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProductPage;