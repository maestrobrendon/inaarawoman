import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Save, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface Product {
  id: string;
  name: string;
  price: number;
  featured_image: string;
  show_on_homepage: boolean;
  homepage_section: string;
  homepage_position: number;
}

export default function HomepageManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHomepageProducts();
  }, []);

  const loadHomepageProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, featured_image, show_on_homepage, homepage_section, homepage_position')
        .eq('show_on_homepage', true)
        .eq('status', 'active')
        .order('homepage_position');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading homepage products:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedProducts = products.reduce((acc, product) => {
    const section = product.homepage_section || 'featured';
    if (!acc[section]) acc[section] = [];
    acc[section].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const sectionTitles: Record<string, string> = {
    hero: 'Hero/Banner Section',
    best_sellers: 'Best Sellers',
    new_arrivals: 'New Arrivals',
    featured: 'Featured Products',
    what_we_see: 'What Do We See?',
    latest_collections: 'Latest Collections',
  };

  const handleRefresh = () => {
    loadHomepageProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <Home className="text-amber-500" size={28} />
            Homepage Manager
          </h1>
          <p className="text-neutral-600 mt-1">
            Control what appears on your store's homepage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </Button>
          <Button
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="gap-2"
          >
            <Eye size={20} />
            Preview Store
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-neutral-600">Loading homepage products...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-2">Homepage Overview</h2>
            <p className="text-amber-100 mb-4">
              {products.length} product{products.length !== 1 ? 's' : ''} currently featured on homepage
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(groupedProducts).map(([section, prods]) => (
                <div key={section} className="bg-white/10 rounded-lg p-3">
                  <p className="text-sm text-amber-100">{sectionTitles[section]}</p>
                  <p className="text-2xl font-bold">{prods.length}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Section */}
          {Object.keys(sectionTitles).map((section) => {
            const sectionProducts = groupedProducts[section] || [];

            return (
              <div key={section} className="bg-white rounded-lg shadow">
                <div className="border-b border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {sectionTitles[section]}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    {sectionProducts.length} product{sectionProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="p-6">
                  {sectionProducts.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                      No products in this section. Add products from the product list.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {sectionProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                          whileHover={{ y: -4 }}
                        >
                          <div className="aspect-square bg-neutral-100">
                            {product.featured_image && (
                              <img
                                src={product.featured_image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-neutral-900 text-sm line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-sm text-neutral-600 mt-1">
                              ₦{product.price.toLocaleString()}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                              <span>Position: {product.homepage_position}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to Manage Homepage</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Go to Products page and edit any product</li>
              <li>• Enable "Show on Homepage" toggle</li>
              <li>• Select which section to display it in</li>
              <li>• Set the position order</li>
              <li>• Save the product</li>
              <li>• Changes appear on the store homepage immediately</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
