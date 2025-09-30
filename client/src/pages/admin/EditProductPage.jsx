import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  updateProduct, 
  fetchCategories, 
  createCategory, 
  createSubcategory,
  fetchProducts,
  fetchSubcategories 
} from '../../redux/features/admin/adminSlice';

const EditProductPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: productId } = useParams();
  
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const { 
    operationLoading, 
    categories = [], 
    subcategories = [], 
    products = [],
    loading = false 
  } = useSelector(state => state.admin);
  
  const productToEdit = products.find(p => p.id == productId || p.id === parseInt(productId));
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    stock: '',
    image: '',
    sku: '',
    isActive: true
  });

  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewSubcategory, setShowNewSubcategory] = useState(false);
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
        await dispatch(fetchCategories()).unwrap();
      
        if (!productToEdit && products.length === 0) {
          await dispatch(fetchProducts({ page: 1, limit: 100 })).unwrap();
        }
      } catch (error) {
        setError(`Failed to load page data: ${error}`);
      } finally {
        setPageLoading(false);
      }
    };
    
    loadPage();
  }, [dispatch, isAuthenticated, navigate, productId, productToEdit, products.length]);

  // Load product 
  useEffect(() => {
    if (productToEdit && !pageLoading) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        category: productToEdit.category_id || '',
        subcategory: productToEdit.subcategory_id || '',
        stock: productToEdit.stock || '',
        image: productToEdit.image || '',
        sku: productToEdit.sku || '',
        isActive: productToEdit.isActive !== undefined ? productToEdit.isActive : true
      });
    }
  }, [productToEdit, pageLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
const productData = {
  product_name: formData.name.trim(),
  description: formData.description.trim(),
  price: parseFloat(formData.price),
  stock_qty: parseInt(formData.stock),
  category_id: formData.category,
  sub_category_id: formData.subcategory || null,
  image_url: formData.image.trim() || null,
  sku: formData.sku.trim(),
  status: formData.isActive 
};
      dispatch(updateProduct({ productId, productData }))
      .unwrap()
      .then(() => {
        navigate('/admin/products');
      })
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category' && value) {
      dispatch(fetchSubcategories(value));
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
        subcategory: '' 
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

const handleAddCategory = async () => {
  if (newCategory.trim()) {
    try {
      await dispatch(createCategory({ 
        category_name: newCategory.trim() 
      })).unwrap();
      
      setNewCategory('');
      setShowNewCategory(false);
      dispatch(fetchCategories());
    } catch (error) {
      alert(`Failed to create category: ${error}`);
    }
  }
};

const handleAddSubcategory = async () => {
  if (newSubcategory.trim() && formData.category) {
    try { 
      await dispatch(createSubcategory({ 
        sub_category_name: newSubcategory.trim(),
        category_id: formData.category 
      })).unwrap();
      
      setNewSubcategory('');
      setShowNewSubcategory(false);
      dispatch(fetchSubcategories());
    } catch (error) {
      alert(`Failed to create subcategory: ${error}`);
    }
  }
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
          <span className="ml-3 text-gray-600">Loading product and categories...</span>
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

  if (!productToEdit && !pageLoading) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <strong>Product not found:</strong> The product with ID {productId} could not be found.
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
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Products
        </button>
      </div>

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
            
            {showNewCategory && (
              <div className="flex gap-2 mb-4">
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
              <div className="flex gap-2 mb-4">
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

          {/* Product Status */}
          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Product is Active</span>
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={operationLoading || !formData.category}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {operationLoading ? 'Updating...' : 'Update Product'}
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
    </div>
  );
};

export default EditProductPage;