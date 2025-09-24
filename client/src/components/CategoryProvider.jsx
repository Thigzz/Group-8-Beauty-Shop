import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import apiClient from '../api/axios';
import { setItems as setCategoriesItems, selectCategory, selectSubcategory } from '../redux/features/categories/categoriesSlice';
import { fetchAllProducts } from '../redux/features/products/productsSlice';

const STATIC_CATEGORIES = [
  { id: 1, name: "FRAGRANCE", subcategories: [] },
  { id: 2, name: "HAIR CARE", subcategories: [] },
  { id: 3, name: "MAKEUP", subcategories: [] },
  { id: 4, name: "SKIN CARE", subcategories: [] },
  { id: 5, name: "SHOP ALL", subcategories: [] },
];

export const CategoryProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = useSelector(state => 
    state.categories.items.length ? state.categories.items : STATIC_CATEGORIES
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const [catRes, subRes] = await Promise.all([
          apiClient.get("api/categories/"),
          apiClient.get("api/sub_categories/"),
          dispatch(fetchAllProducts())
        ]);

        const cats = catRes.data || [];
        const subs = subRes.data || [];

        const mergedCategories = cats.map(cat => ({
          ...cat,
          subcategories: subs.filter(sub => sub.category_id === cat.id).map(sub => ({ 
            ...sub, 
            name: sub.sub_category_name 
          }))
        }));

        dispatch(setCategoriesItems(mergedCategories));
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading category data:", err);
        setError("Failed to load category data.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  return children;
};

// Separate component for category route handling
export const CategoryRouteHandler = ({ showAllProducts, children }) => {
  const { categoryId, subcategoryId, categoryName, subcategoryName } = useParams(); 
  const dispatch = useDispatch();
  const categories = useSelector(state => state.categories.items);
  
  useEffect(() => {
    if (categoryId && categoryId !== "undefined") {
      // Handle ID-based routes
      const category = categories.find(cat => cat.id.toString() === categoryId.toString());
      if (category) {
        dispatch(selectCategory(category));
        
        if (subcategoryId && subcategoryId !== "undefined") {
          const subcategory = category.subcategories?.find(
            sub => sub.id.toString() === subcategoryId.toString()
          );
          if (subcategory) {
            dispatch(selectSubcategory(subcategory));
          } else {
            dispatch(selectSubcategory(null));
          }
        } else {
          dispatch(selectSubcategory(null));
        }
      }
    } else if (categoryName) {
      // Handle slug-based routes
      const category = categories.find(cat => {
        const catName = (cat.category_name || cat.name || "").toLowerCase();
        return catName === categoryName.toLowerCase();
      });
      
      if (category) {
        dispatch(selectCategory(category));
        
        if (subcategoryName) {
          const subcategory = category.subcategories?.find(
            sub => {
              const subName = (sub.sub_category_name || sub.name || "").toLowerCase();
              return subName === subcategoryName.toLowerCase();
            }
          );
          dispatch(selectSubcategory(subcategory || null));
        } else {
          dispatch(selectSubcategory(null));
        }
      } else {
        dispatch(selectCategory(null));
        dispatch(selectSubcategory(null));
      }
    } else {
      dispatch(selectCategory(null));
      dispatch(selectSubcategory(null));
    }
  }, [categoryId, subcategoryId, categoryName, subcategoryName, categories, dispatch]);

  return children;
};