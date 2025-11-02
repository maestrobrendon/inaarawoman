import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collection, Product } from '../types';
import { getProductImageUrl } from '../utils/cloudinaryUpload';

interface ShopPageProps {
  initialFilters?: { collection?: string };
}

const PRODUCTS_PER_PAGE = 12;

export default function ShopPage({ initialFilters }: ShopPageProps) {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(initialFilters?.collection || 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCollection, selectedCategory, sortBy]);

  useEffect(() => {
    // Update displayed products when page changes
    updateDisplayedProducts();
  }, [currentPage, allProducts]);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data) setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setCurrentPage(1); // Reset to page 1 when filters change
    
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active');

      if (selectedCollection !== 'all') {
        query = query.eq('collection_id', selectedCollection);
      }

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name');
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        let filtered = data as Product[];

        // Search filter
        if (searchQuery) {
          filtered = filtered.filter((p: Product) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Price range filters
        if (priceRange.min) {
          filtered = filtered.filter((p: Product) =>
            p.price >= parseFloat(priceRange.min)
          );
        }

        if (priceRange.max) {
          filtered = filtered.filter((p: Product) =>
            p.price <= parseFloat(priceRange.max)
          );
        }

        setAllProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedProducts = () => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setDisplayedProducts(allProducts.slice(startIndex, endIndex));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCollection('all');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('featured');
    setCurrentPage(1);
  };

  const getProductImage = (product: Product, index: number = 0) => {
    if (product.images && product.images.length > index) {
      return getProductImageUrl(product.images[index]);
    } else if (product.main_image) {
      return getProductImageUrl(product.main_image);
    }
    return null;
  };

  // Pagination calculations
  const totalPages = Math.ceil(allProducts.length / PRODUCTS_PER_PAGE);
  const showPagination = totalPages > 1;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'sets', label: 'Sets' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'A-Z' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Minimalist */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl font-light text-neutral-900 mb-3">
          ALL PRODUCTS
          </h1>
          <p className="text-xs text-neutral-600 max-w-2xl mx-auto">
            Carefully crafted to help you be your most confident and stylish self.
          </p>
        </div>

        {/* Filters Bar - Top */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-4">
            {/* Filter Toggle for Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[10px] tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>

            {/* Availability Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] tracking-wider uppercase text-neutral-900 border-none bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Availability</option>
              {categories.slice(1).map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <button 
              onClick={() => setShowFilters(true)}
              className="text-[10px] tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors"
            >
              Price
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-wider uppercase text-neutral-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-[10px] tracking-wider uppercase text-neutral-900 border-none bg-transparent focus:outline-none cursor-pointer"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Count */}
            <span className="text-[10px] tracking-wider uppercase text-neutral-600">
              {allProducts.length} products
            </span>
          </div>
        </div>

        {/* Mobile Filters Dropdown */}
        {showFilters && (
          <div className="mb-8 p-6 border border-neutral-200 rounded-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-neutral-900">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={20} className="text-neutral-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Collection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 bg-white"
                >
                  <option value="all">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Apply & Clear Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    loadProducts();
                    setShowFilters(false);
                  }}
                  className="flex-1 px-4 py-2 bg-neutral-900 text-white text-[10px] tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-900 text-[10px] tracking-widest uppercase hover:bg-neutral-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-3" />
                <div className="h-3 bg-neutral-200 rounded mb-2" />
                <div className="h-3 bg-neutral-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-neutral-600 mb-6">No products found</p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 border border-neutral-900 text-neutral-900 text-[10px] tracking-widest uppercase hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {displayedProducts.map((product) => {
                const mainImage = getProductImage(product, 0);
                const hoverImage = getProductImage(product, 1);

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3 rounded-sm">
                      {mainImage ? (
                        <>
                          {/* Main Image */}
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                            loading="lazy"
                          />
                          {/* Hover Image */}
                          {hoverImage && hoverImage !== mainImage && (
                            <img
                              src={hoverImage}
                              alt={`${product.name} hover`}
                              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                              loading="lazy"
                            />
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                          No image
                        </div>
                      )}

                      {/* Sale Badge */}
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 text-[9px] tracking-wider uppercase">
                          Sale
                        </div>
                      )}

                      {/* New Badge */}
                      {product.is_new && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 text-[9px] tracking-wider uppercase">
                          New
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="text-center">
                      <h3 className="font-serif text-xs font-normal text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        {product.compare_at_price && product.compare_at_price > product.price ? (
                          <>
                            <span className="text-[10px] text-neutral-500 line-through">
                              ₦{product.compare_at_price.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-red-600 font-medium">
                              ₦{product.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-neutral-900">
                            ₦{product.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {showPagination && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 flex items-center justify-center border text-xs transition-colors ${
                    currentPage === 1
                      ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageChange(page)}
                    disabled={page === '...'}
                    className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${
                      page === currentPage
                        ? 'border border-neutral-900 bg-neutral-900 text-white font-medium'
                        : page === '...'
                        ? 'border-none cursor-default text-neutral-400'
                        : 'border border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 flex items-center justify-center border text-xs transition-colors ${
                    currentPage === totalPages
                      ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            {/* Page Info */}
            {showPagination && (
              <div className="text-center mt-4">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">
                  Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
                  {Math.min(currentPage * PRODUCTS_PER_PAGE, allProducts.length)} of {allProducts.length}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}