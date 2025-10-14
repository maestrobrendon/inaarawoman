import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Collection, ProductWithImages } from '../types';
import ProductCard from '../components/product/ProductCard';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

interface ShopPageProps {
  onNavigate: (page: string, data?: any) => void;
  initialFilters?: { collection?: string };
}

export default function ShopPage({ onNavigate, initialFilters }: ShopPageProps) {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(initialFilters?.collection || 'all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCollection, selectedCategory, sortBy]);

  const loadCollections = async () => {
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('name');

    if (data) setCollections(data);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          collection:collections(*)
        `);

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
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) {
        let filtered = data as any;

        if (searchQuery) {
          filtered = filtered.filter((p: ProductWithImages) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

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

        setProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-2">Shop</h1>
          <p className="text-neutral-600">Discover timeless pieces that celebrate your unique beauty</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between lg:hidden mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={loadProducts}
                    onKeyPress={(e) => e.key === 'Enter' && loadProducts()}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  <option value="all">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    onBlur={loadProducts}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    onBlur={loadProducts}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCollection('all');
                  setSelectedCategory('all');
                  setPriceRange({ min: '', max: '' });
                  setSortBy('newest');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-neutral-600">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 text-sm font-medium text-neutral-900"
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>

                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-4" />
                    <div className="h-4 bg-neutral-200 rounded mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-neutral-600 mb-4">No products found</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCollection('all');
                    setSelectedCategory('all');
                    setPriceRange({ min: '', max: '' });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => onNavigate('product', { id: product.id })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
