import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collection, ProductWithImages } from '../types';
import ProductCard from '../components/product/ProductCard';

interface ShopPageProps {
  initialFilters?: { collection?: string };
}

export default function ShopPage({ initialFilters }: ShopPageProps) {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          collection:collections(*)
        `)
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
        let filtered = data as any;

        // Search filter
        if (searchQuery) {
          filtered = filtered.filter((p: ProductWithImages) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Price range filters
        if (priceRange.min) {
          filtered = filtered.filter((p: ProductWithImages) =>
            p.price >= parseFloat(priceRange.min)
          );
        }

        if (priceRange.max) {
          filtered = filtered.filter((p: ProductWithImages) =>
            p.price <= parseFloat(priceRange.max)
          );
        }

        // Map products to use stored images array
        filtered = filtered.map((p: any) => ({
          ...p,
          image: p.main_image || p.images?.[0] || p.image_url || '',
          images: p.images || (p.image_url ? [p.image_url] : [])
        }));

        setProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCollection('all');
    setSelectedCategory('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('featured');
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
            INAARA WOMAN
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
            <button className="text-[10px] tracking-wider uppercase text-neutral-900 hover:text-neutral-600 transition-colors">
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
              {products.length} products
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
                  onClick={loadProducts}
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
        ) : products.length === 0 ? (
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3">
                  {product.images && product.images.length > 0 ? (
                    <>
                      {/* Main Image - from Cloudinary via Supabase */}
                      <img
                        src={`${product.images[0].cloudinary_url}?w=600&q_auto&f_auto`}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                      />
                      {/* Hover Image - Second image if available */}
                      {product.images[1] && (
                        <img
                          src={`${product.images[1].cloudinary_url}?w_600&q_auto&f_auto`}
                          alt={`${product.name} hover`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <h3 className="font-serif text-xs font-normal text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    {product.compare_at_price && product.compare_at_price > product.price ? (
                      <>
                        <span className="text-[10px] text-neutral-500 line-through">
                          ₦{product.compare_at_price.toLocaleString()} NGN
                        </span>
                        <span className="text-[10px] text-neutral-900 font-medium">
                          ₦{product.price.toLocaleString()} NGN
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-neutral-900">
                        ₦{product.price.toLocaleString()} NGN
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Placeholder */}
        {products.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button className="w-8 h-8 flex items-center justify-center border border-neutral-300 text-xs hover:bg-neutral-100 transition-colors">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-neutral-300 text-xs hover:bg-neutral-100 transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-neutral-300 text-xs hover:bg-neutral-100 transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-neutral-300 text-xs hover:bg-neutral-100 transition-colors">
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}