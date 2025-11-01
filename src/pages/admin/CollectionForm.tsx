import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface CollectionFormProps {
  mode: 'new' | 'edit';
}

interface Product {
  id: string;
  name: string;
  price: number;
  main_image: string | null;
  images: string[] | null;
}

export default function CollectionForm({ mode }: CollectionFormProps) {
  const navigate = useNavigate();
  const { id: collectionId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active',
    position: 0,
    seo_title: '',
    seo_description: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
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
      const [collectionRes, productsRes] = await Promise.all([
        supabase.from('collections').select('*').eq('id', collectionId).single(),
        supabase
          .from('collection_products')
          .select('product_id')
          .eq('collection_id', collectionId),
      ]);

      if (collectionRes.error) throw collectionRes.error;
      setFormData(collectionRes.data);
      setSelectedProducts(productsRes.data?.map(p => p.product_id) || []);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, main_image, images')
        .in('status', ['active', 'published', 'draft'])
        .order('name');

      if (error) throw error;
      setAvailableProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Failed to load products. Please try again.');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'name' && !collectionId) {
      const slug = value.toLowerCase()
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

    try {
      setSaving(true);

      let collId = collectionId;

      if (mode === 'new') {
        const { data, error } = await supabase
          .from('collections')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        collId = data.id;
      } else {
        const { error } = await supabase
          .from('collections')
          .update(formData)
          .eq('id', collectionId);

        if (error) throw error;
      }

      await supabase
        .from('collection_products')
        .delete()
        .eq('collection_id', collId);

      if (selectedProducts.length > 0) {
        const collectionProducts = selectedProducts.map((productId, index) => ({
          collection_id: collId,
          product_id: productId,
          position: index,
        }));

        const { error: insertError } = await supabase
          .from('collection_products')
          .insert(collectionProducts);

        if (insertError) throw insertError;
      }

      alert('Collection saved successfully!');
      navigate('/admin/collections');
    } catch (error) {
      console.error('Error saving collection:', error);
      alert('Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  const selectedProductsData = availableProducts.filter(p =>
    selectedProducts.includes(p.id)
  );

  const filteredProducts = availableProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-4">
        <button
          onClick={() => navigate('/admin/collections')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={20} />
          Back to Collections
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {mode === 'edit' ? 'Edit Collection' : 'Create Collection'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>

          <Input
            label="Collection Name *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Summer Collection"
            required
          />

          <Input
            label="Slug *"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="summer-collection"
            required
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={4}
              placeholder="Describe this collection..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <Input
              label="Position"
              type="number"
              value={formData.position.toString()}
              onChange={(e) => handleChange('position', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              Products ({selectedProductsData.length})
            </h2>
            <Button
              type="button"
              onClick={() => setShowProductPicker(!showProductPicker)}
              variant="outline"
              className="gap-2"
            >
              <Plus size={16} />
              Add Products
            </Button>
          </div>

          {showProductPicker && (
            <div className="border border-neutral-300 rounded-lg p-4 space-y-4">
              <Input
                label="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by product name..."
              />
              {loadingProducts ? (
                <div className="text-center py-8 text-neutral-500">
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  {searchTerm ? `No products found matching "${searchTerm}"` : 'No products available. Create products first.'}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="w-4 h-4"
                    />
                    {(product.main_image || (product.images && product.images.length > 0)) && (
                      <img
                        src={product.main_image || (product.images?.[0]) || ''}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-neutral-600">₦{product.price?.toLocaleString() || '0'}</p>
                    </div>
                  </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedProductsData.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {selectedProductsData.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border border-neutral-200 rounded-lg"
                >
                  {(product.main_image || (product.images && product.images.length > 0)) && (
                    <img
                      src={product.main_image || (product.images?.[0]) || ''}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-neutral-600">₦{product.price?.toLocaleString() || '0'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">
              No products added. Click "Add Products" to start.
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">SEO Settings</h2>

          <Input
            label="SEO Title"
            value={formData.seo_title}
            onChange={(e) => handleChange('seo_title', e.target.value)}
            placeholder="Collection page title for search engines"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              SEO Description
            </label>
            <textarea
              value={formData.seo_description}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
              placeholder="Meta description for search engines"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Collection'}
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
