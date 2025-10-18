import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Home, Star, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ImageUpload from '../../components/admin/ImageUpload';

interface ProductFormProps {
  mode: 'new' | 'edit';
}

export default function ProductForm({ mode }: ProductFormProps) {
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productImages, setProductImages] = useState<Array<{
    secure_url: string;
    public_id: string;
    is_featured: boolean;
  }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    long_description: '',
    price: '',
    compare_at_price: '',
    cost_price: '',
    category: '',
    stock_quantity: '',
    low_stock_threshold: '5',
    status: 'draft',
    show_on_homepage: false,
    homepage_section: 'featured',
    homepage_position: '0',
    is_featured: false,
    is_bestseller: false,
    is_new: false,
    size_options: [] as string[],
    color_options: [] as string[],
    material: '',
    care_instructions: '',
    seo_title: '',
    seo_description: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProduct();
    }
  }, [mode, productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        sku: data.sku || '',
        description: data.description || '',
        long_description: data.long_description || '',
        price: data.price?.toString() || '',
        compare_at_price: data.compare_at_price?.toString() || '',
        cost_price: data.cost_price?.toString() || '',
        category: data.category || '',
        stock_quantity: data.stock_quantity?.toString() || '',
        low_stock_threshold: data.low_stock_threshold?.toString() || '5',
        status: data.status || 'draft',
        show_on_homepage: data.show_on_homepage || false,
        homepage_section: data.homepage_section || 'featured',
        homepage_position: data.homepage_position?.toString() || '0',
        is_featured: data.is_featured || false,
        is_bestseller: data.is_bestseller || false,
        is_new: data.is_new || false,
        size_options: data.size_options || [],
        color_options: data.color_options || [],
        material: data.material || '',
        care_instructions: data.care_instructions || '',
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        tags: data.tags || [],
      });

      if (data.images && data.images.length > 0) {
        const formattedImages = data.images.map((url: string, index: number) => ({
          secure_url: url,
          public_id: data.image_public_ids?.[index] || '',
          is_featured: data.main_image === url,
        }));
        setProductImages(formattedImages);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateSKU = () => {
    return 'PRD-' + Date.now().toString().slice(-8);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === 'name' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    if (field === 'name' && !formData.seo_title) {
      setFormData(prev => ({ ...prev, seo_title: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const imageUrls = productImages.map(img => img.secure_url);
      const imagePublicIds = productImages.map(img => img.public_id);
      const mainImage = productImages.find(img => img.is_featured)?.secure_url || imageUrls[0] || null;

      const productData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        sku: formData.sku || generateSKU(),
        description: formData.description,
        long_description: formData.long_description,
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        category: formData.category,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 5,
        status: formData.status,
        show_on_homepage: formData.show_on_homepage,
        homepage_section: formData.homepage_section,
        homepage_position: parseInt(formData.homepage_position) || 0,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        is_new: formData.is_new,
        size_options: formData.size_options,
        color_options: formData.color_options,
        material: formData.material,
        care_instructions: formData.care_instructions,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description,
        tags: formData.tags,
        images: imageUrls,
        image_public_ids: imagePublicIds,
        main_image: mainImage,
        updated_at: new Date().toISOString(),
      };

      if (mode === 'edit' && productId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);

        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw error;
      }

      alert(`Product ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert('Failed to save product: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-neutral-600">Loading product...</p>
      </div>
    );
  }

  const profitMargin = formData.price && formData.cost_price
    ? ((parseFloat(formData.price) - parseFloat(formData.cost_price)) / parseFloat(formData.price) * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
        <h1 className="text-2xl font-semibold text-neutral-900">
          {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Product Images</h2>
          <ImageUpload
            productId={productId}
            existingImages={productImages}
            onImagesChange={setProductImages}
          />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>

          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Elegant Summer Dress"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="elegant-summer-dress"
            />
            <Input
              label="SKU"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              placeholder="PRD-12345678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g., Dresses"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Short Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
              placeholder="Brief description..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Long Description
            </label>
            <textarea
              value={formData.long_description}
              onChange={(e) => handleChange('long_description', e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={6}
              placeholder="Detailed product description..."
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Price (₦) *"
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="50000"
              required
            />
            <Input
              label="Compare at Price (₦)"
              type="number"
              value={formData.compare_at_price}
              onChange={(e) => handleChange('compare_at_price', e.target.value)}
              placeholder="75000"
            />
            <Input
              label="Cost Price (₦)"
              type="number"
              value={formData.cost_price}
              onChange={(e) => handleChange('cost_price', e.target.value)}
              placeholder="30000"
            />
          </div>

          {profitMargin !== '0' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Profit Margin: <span className="font-semibold">{profitMargin}%</span>
              </p>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Inventory</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Quantity *"
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => handleChange('stock_quantity', e.target.value)}
              placeholder="100"
              required
            />
            <Input
              label="Low Stock Threshold"
              type="number"
              value={formData.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
              placeholder="5"
            />
          </div>
        </div>

        {/* Homepage & Visibility */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
            <Home className="text-amber-500" size={20} />
            Homepage & Visibility
          </h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.show_on_homepage}
                onChange={(e) => handleChange('show_on_homepage', e.target.checked)}
                className="mt-1 w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <div>
                <p className="font-medium text-amber-900">Show on Homepage</p>
                <p className="text-sm text-amber-700 mt-1">
                  This product will be featured on the store homepage
                </p>
              </div>
            </label>
          </div>

          {formData.show_on_homepage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Homepage Section
                </label>
                <select
                  value={formData.homepage_section}
                  onChange={(e) => handleChange('homepage_section', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="hero">Hero/Banner</option>
                  <option value="best_sellers">Best Sellers</option>
                  <option value="new_arrivals">New Arrivals</option>
                  <option value="featured">Featured Products</option>
                  <option value="what_we_see">What Do We See?</option>
                  <option value="latest_collections">Latest Collections</option>
                </select>
              </div>

              <Input
                label="Position on Homepage"
                type="number"
                value={formData.homepage_position}
                onChange={(e) => handleChange('homepage_position', e.target.value)}
                placeholder="0"
              />
            </motion.div>
          )}

          <div className="space-y-3 pt-4 border-t border-neutral-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => handleChange('is_featured', e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="flex items-center gap-2">
                <Star size={16} className="text-amber-500" />
                Featured Product
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_bestseller}
                onChange={(e) => handleChange('is_bestseller', e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                Bestseller Badge
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new}
                onChange={(e) => handleChange('is_new', e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
              />
              <span>New Arrival Badge</span>
            </label>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Status</h2>

          <div className="flex gap-4">
            {['draft', 'active', 'archived'].map((status) => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={formData.status === status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
                <span className="capitalize">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            <Save size={20} />
            {saving ? 'Saving...' : mode === 'edit' ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/products')}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
