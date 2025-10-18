import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Home, Edit, Trash2, Image } from 'lucide-react';
import { getThumbnailUrl } from '../../utils/cloudinaryUpload';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock_quantity: number;
  status: string;
  show_on_homepage: boolean;
  homepage_section: string;
  main_image: string;
  images: string[];
  category: string;
  created_at: string;
}

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [homepageFilter, setHomepageFilter] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [statusFilter, homepageFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (homepageFilter) {
        query = query.eq('show_on_homepage', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const toggleHomepage = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ show_on_homepage: !product.show_on_homepage })
        .eq('id', product.id);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Products</h1>
          <p className="text-neutral-600 mt-1">{filteredProducts.length} products</p>
        </div>
        <Button
          onClick={() => navigate('/admin/products/new')}
          className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          <Plus size={20} />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={homepageFilter}
              onChange={(e) => setHomepageFilter(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
            />
            <span className="text-sm">Homepage Only</span>
          </label>

          <Button
            onClick={loadProducts}
            variant="outline"
            className="gap-2"
          >
            <Filter size={20} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-neutral-600 mb-4">No products found</p>
            <Button onClick={() => navigate('/admin/products/new')}>
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Homepage</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-neutral-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          {product.main_image ? (
                            <>
                              <img
                                src={getThumbnailUrl(product.main_image)}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                              {product.images && product.images.length > 1 && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white rounded-bl px-1 py-0.5">
                                  <Image size={10} />
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <Image size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{product.name}</p>
                          <p className="text-sm text-neutral-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{product.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      ₦{product.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${product.stock_quantity > 10 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-800' :
                        product.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-neutral-100 text-neutral-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleHomepage(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.show_on_homepage
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                        }`}
                        title={product.show_on_homepage ? 'Remove from homepage' : 'Add to homepage'}
                      >
                        <Home size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                          className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
