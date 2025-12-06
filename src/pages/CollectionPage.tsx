import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image?: string;
}

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc';
type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock';

interface PriceRange {
  min: number | null;
  max: number | null;
}

// Dropdown Component
interface DropdownProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterDropdown({ label, isOpen, onToggle, children }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 transition-colors py-2"
      >
        <span className="tracking-wide">{label}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[180px]"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Data state
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [availability, setAvailability] = useState<AvailabilityFilter>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: null, max: null });
  
  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch collection and products
  useEffect(() => {
    const fetchCollectionData = async () => {
      setLoading(true);
      
      try {
        // Get collection by slug
        const { data: collectionData, error: collectionError } = await supabase
          .from('collections')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'active')
          .maybeSingle();

        if (collectionError) throw collectionError;

        if (collectionData) {
          setCollection(collectionData);

          // Get products in this collection
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select(`
              *,
              images:product_images(*)
            `)
            .eq('collection_id', collectionData.id)
            .order('created_at', { ascending: false });

          if (productsError) throw productsError;

          if (productsData) {
            const formattedProducts = productsData.map((product: any) => {
              // Safely extract image URL
              let mainImage = '';
              
              if (product.main_image) {
                mainImage = typeof product.main_image === 'string' 
                  ? product.main_image 
                  : product.main_image.image_url || product.main_image.cloudinary_url || '';
              } else if (product.images && product.images.length > 0) {
                const firstImage = product.images[0];
                mainImage = typeof firstImage === 'string'
                  ? firstImage
                  : firstImage.image_url || firstImage.cloudinary_url || '';
              }

              return {
                ...product,
                image: mainImage,
                images: product.images || []
              };
            });
            setProducts(formattedProducts);
            setFilteredProducts(formattedProducts);
          }
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Availability filter
    if (availability === 'in-stock') {
      result = result.filter(p => (p.stock_quantity ?? 0) > 0);
    } else if (availability === 'out-of-stock') {
      result = result.filter(p => (p.stock_quantity ?? 0) === 0);
    }

    // Price filter
    if (priceRange.min !== null) {
      result = result.filter(p => p.price >= priceRange.min!);
    }
    if (priceRange.max !== null) {
      result = result.filter(p => p.price <= priceRange.max!);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Featured - keep original order or sort by is_bestseller
        result.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
    }

    setFilteredProducts(result);
  }, [products, sortBy, availability, priceRange]);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const clearFilters = () => {
    setSortBy('featured');
    setAvailability('all');
    setPriceRange({ min: null, max: null });
  };

  const hasActiveFilters = availability !== 'all' || priceRange.min !== null || priceRange.max !== null;

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-xl font-normal text-neutral-800 mb-4 tracking-wide">Collection Not Found</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors underline underline-offset-4"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Elegant minimal design */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-800 tracking-wide uppercase"
          >
            {collection.name}
          </motion.h1>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-0 z-40 bg-[#f5f5f5] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Left: Filters */}
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest hidden sm:block">Filter:</span>
              
              {/* Desktop Filters */}
              <div className="hidden sm:flex items-center gap-6">
                {/* Availability Dropdown */}
                <FilterDropdown
                  label="Availability"
                  isOpen={openDropdown === 'availability'}
                  onToggle={() => toggleDropdown('availability')}
                >
                  <div className="py-2">
                    {(['all', 'in-stock', 'out-of-stock'] as AvailabilityFilter[]).map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setAvailability(option);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors ${
                          availability === option ? 'text-neutral-900 font-medium' : 'text-neutral-600'
                        }`}
                      >
                        {option === 'all' ? 'All' : option === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>

                {/* Price Dropdown */}
                <FilterDropdown
                  label="Price"
                  isOpen={openDropdown === 'price'}
                  onToggle={() => toggleDropdown('price')}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min || ''}
                        onChange={(e) => setPriceRange(prev => ({ 
                          ...prev, 
                          min: e.target.value ? Number(e.target.value) : null 
                        }))}
                        className="w-20 px-2 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
                      />
                      <span className="text-neutral-400 text-xs self-center">to</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max || ''}
                        onChange={(e) => setPriceRange(prev => ({ 
                          ...prev, 
                          max: e.target.value ? Number(e.target.value) : null 
                        }))}
                        className="w-20 px-2 py-1.5 text-xs border border-neutral-200 rounded-md focus:outline-none focus:border-neutral-400"
                      />
                    </div>
                    <button
                      onClick={() => setOpenDropdown(null)}
                      className="w-full py-1.5 bg-neutral-900 text-white text-xs rounded-md hover:bg-neutral-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </FilterDropdown>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <X size={12} />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="sm:hidden flex items-center gap-1.5 text-xs text-neutral-600"
              >
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>

            {/* Right: Sort & Count */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest hidden sm:block">Sort by:</span>
                <FilterDropdown
                  label={sortOptions.find(o => o.value === sortBy)?.label || 'Featured'}
                  isOpen={openDropdown === 'sort'}
                  onToggle={() => toggleDropdown('sort')}
                >
                  <div className="py-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs hover:bg-neutral-50 transition-colors ${
                          sortBy === option.value ? 'text-neutral-900 font-medium' : 'text-neutral-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </FilterDropdown>
              </div>

              {/* Product Count */}
              <span className="text-xs text-neutral-400">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-sm font-normal text-neutral-800 uppercase tracking-widest">Filters</h2>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X size={20} className="text-neutral-500" />
                  </button>
                </div>

                {/* Availability */}
                <div className="mb-8">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest mb-4">Availability</h3>
                  <div className="space-y-3">
                    {(['all', 'in-stock', 'out-of-stock'] as AvailabilityFilter[]).map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          checked={availability === option}
                          onChange={() => setAvailability(option)}
                          className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-neutral-500"
                        />
                        <span className="text-sm text-neutral-600">
                          {option === 'all' ? 'All' : option === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="text-xs text-neutral-400 uppercase tracking-widest mb-4">Price</h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min || ''}
                      onChange={(e) => setPriceRange(prev => ({ 
                        ...prev, 
                        min: e.target.value ? Number(e.target.value) : null 
                      }))}
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max || ''}
                      onChange={(e) => setPriceRange(prev => ({ 
                        ...prev, 
                        max: e.target.value ? Number(e.target.value) : null 
                      }))}
                      className="flex-1 px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full py-3 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearFilters();
                        setShowMobileFilters(false);
                      }}
                      className="w-full py-3 border border-neutral-200 text-neutral-600 text-sm rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-neutral-500 text-sm mb-4">
                No products match your filters.
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-neutral-800 hover:text-neutral-600 underline underline-offset-4 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onClick={() => navigate(`/product/${product.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}