import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import Footer from '../components/Footer';
import ProductCard from '../components/Product/ProductCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const query = searchParams.get('q');

  useEffect(() => {
    if (!query) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`api/search/?q=${query}`);
        setResults(response.data);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const hasResults = results && (results.products.length > 0 || results.categories.length > 0 || results.sub_categories.length > 0);

  return (
    <div>
      <main className="container mx-auto py-12 px-4 min-h-[60vh]">
        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          className="mb-6 flex items-center text-gray-600 hover:text-[#C9A35D] transition-colors duration-200"
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold mb-8">
          Search Results for: <span className="text-[#C9A35D]">{query}</span>
        </h1>
        {isLoading ? (
          <p>Searching...</p>
        ) : hasResults ? (
          <div className="space-y-10">
            {results.products.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {results.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
            {results.categories.length > 0 && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Categories</h2>
                <div className="flex flex-wrap gap-4">
                  {results.categories.map(cat => (
                    <Link to={`/products/category/${cat.id}`} key={cat.id} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full hover:bg-[#C9A35D] hover:text-black">
                      {cat.category_name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <p>No results found for "{query}".</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;