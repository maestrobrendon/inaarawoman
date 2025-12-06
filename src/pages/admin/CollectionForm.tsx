import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Search, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { extractImageUrl } from '../../utils/cloudinaryUpload';

interface CollectionFormProps {
  mode: 'new' | 'edit';
}

interface Product {
  id: string;
  name: string;
  price: number;
  main_image: any;
  images: any[];
  collection_id: string | null;
}

export default function CollectionForm({ mode }: CollectionFormProps) {
  const navigate = useNavigate();
  const { id: collectionId } = useParams();
  
  // Form state - only fields used in CollectionPage design
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active',
  });
  
  // Products state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadProducts();
    if (mode === 'edit' && collectionId) {
      loadCollection();
    }
  }, [mode, collectionId]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      
      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', collectionId)
        .single();

      if (collectionError) throw collectionError;
      
      setFormData({
        name: collectionData.name || '',
        slug: collectionData.slug || '',
        status: collectionData.status || 'active',
      });

      // Load products in this collection
      const { data: productsData } = await supabase
        .from('products')
        .select('id')
        .eq('collection_id', collectionId);

      if (productsData) {
        setSelectedProductIds(productsData.map(p => p.id));
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      alert('Failed to load collection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, main_image, images:product_images(*), collection_id')
        .order('name');

      if (error) throw error;
      setAllProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from name (only for new collections)
    if (field === 'name' && mode === 'new') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Collection name is required');
      return;
    }

    if (!formData.slug.trim()) {
      alert('Collection slug is required');
      return;
    }

    try {
      setSaving(true);
      let savedCollectionId = collectionId;

      if (mode === 'new') {
        const { data, error } = await supabase
          .from('collections')
          .insert([formData])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            alert('A collection with this slug already exists.');
            return;
          }
          throw error;
        }
        savedCollectionId = data.id;
      } else {
        const { error } = await supabase
          .from('collections')
          .update(formData)
          .eq('id', collectionId);

        if (error) {
          if (error.code === '23505') {
            alert('A collection with this slug already exists.');
            return;
          }
          throw error;
        }
      }

      // Update product associations
      await supabase
        .from('products')
        .update({ collection_id: null })
        .eq('collection_id', savedCollectionId);

      if (selectedProductIds.length > 0) {
        await supabase
          .from('products')
          .update({ collection_id: savedCollectionId })
          .in('id', selectedProductIds);
      }

      navigate('/admin/collections');
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProductIds(prev => prev.filter(id => id !== productId));
  };

  const selectedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));
  
  const filteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductImage = (product: Product): string => {
    if (product.main_image) {
      return extractImageUrl(product.main_image);
    }
    if (product.images && product.images.length > 0) {
      return extractImageUrl(product.images[0]);
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/collections')}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-900 text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Collections
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {mode === 'edit' ? 'Edit Collection' : 'New Collection'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Collection Details */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-5">
          <h2 className="text-base font-medium text-neutral-900">Collection Details</h2>

          <div className="space-y-4">
            <div>
              <Input
                label="Collection Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Amata Collection"
                required
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                This name will be displayed as the collection page header
              </p>
            </div>

            <div>
              <Input
                label="URL Slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="amata-collection"
                required
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                URL: /collection/<span className="font-medium">{formData.slug || 'your-slug'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-4 h-4 text-amber-500 border-neutral-300 focus:ring-amber-500"
                  />
                  <span className="text-sm text-neutral-700">Active</span>
                  <span className="text-xs text-neutral-500">(visible on website)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-4 h-4 text-amber-500 border-neutral-300 focus:ring-amber-500"
                  />
                  <span className="text-sm text-neutral-700">Draft</span>
                  <span className="text-xs text-neutral-500">(hidden)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-neutral-900">Products</h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {selectedProducts.length} {selectedProducts.length === 1 ? 'product' : 'products'} in this collection
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowProductPicker(!showProductPicker)}
              variant="outline"
              className="gap-2 text-sm"
            >
              <Plus size={16} />
              Add Products
            </Button>
          </div>

          {/* Product Picker */}
          {showProductPicker && (
            <div className="border border-neutral-200 rounded-lg p-4 space-y-4 bg-neutral-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm bg-white"
                />
              </div>
              
              {loadingProducts ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  {searchTerm ? `No products found for "${searchTerm}"` : 'No products available'}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id);
                    const imageUrl = getProductImage(product);
                    
                    return (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-50 border border-amber-200' : 'hover:bg-white border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(product.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                        />
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-md bg-neutral-100"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-neutral-200 rounded-md flex items-center justify-center">
                            <Package size={16} className="text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                          <p className="text-xs text-neutral-500">₦{product.price?.toLocaleString() || '0'}</p>
                        </div>
                        {product.collection_id && product.collection_id !== collectionId && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                            In another collection
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
              
              <div className="flex justify-end pt-2 border-t border-neutral-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowProductPicker(false);
                    setSearchTerm('');
                  }}
                  className="text-sm"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Selected Products List */}
          {selectedProducts.length > 0 ? (
            <div className="space-y-2">
              {selectedProducts.map((product) => {
                const imageUrl = getProductImage(product);
                
                return (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg bg-white"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md bg-neutral-100"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-100 rounded-md flex items-center justify-center">
                        <Package size={20} className="text-neutral-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">₦{product.price?.toLocaleString() || '0'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg">
              <Package className="mx-auto text-neutral-300 mb-2" size={32} />
              <p className="text-neutral-500 text-sm">No products added yet</p>
              <p className="text-neutral-400 text-xs mt-1">Click "Add Products" to get started</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                {mode === 'edit' ? 'Update Collection' : 'Create Collection'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/collections')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}