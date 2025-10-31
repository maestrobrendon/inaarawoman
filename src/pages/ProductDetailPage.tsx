import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Plus, Minus, ChevronLeft, Truck, Shield, RotateCcw, Package, Ruler } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Review, ColorOption, ProductMeasurements, ModelMeasurements, SizeChart, Product } from '../types';
import { getProductImageUrl } from '../utils/cloudinaryUpload';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import Button from '../components/ui/Button';
import ImageSlider from '../components/product/ImageSlider';
import { ImageModal } from '../components/product/ImageSlider';

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'measurements' | 'sizeguide' | 'reviews'>('description');
  const [measurementUnit, setMeasurementUnit] = useState<'cm' | 'in'>('cm');

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      loadRecommendedProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (productError) throw productError;

      if (!productData) {
        setLoading(false);
        return;
      }

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      setProduct({
        ...(productData as any),
        reviews: reviews || [],
        averageRating,
        reviewCount: reviews?.length || 0
      });

      // Set default color if available
      if (productData.color_options && productData.color_options.length > 0) {
        setSelectedColor(productData.color_options[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedProducts = async () => {
    if (!product) return;

    try {
      // Recommendation Algorithm:
      // Priority 1: Same category (60% weight)
      // Priority 2: Same collection (30% weight)
      // Priority 3: Similar price range ±30% (10% weight)
      // Fallback: Featured/Bestsellers or Random

      let recommendedItems: Product[] = [];

      // Try same category first
      if (product.category) {
        const { data: sameCategoryProducts } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .eq('category', product.category)
          .neq('id', product.id)
          .limit(8);

        if (sameCategoryProducts && sameCategoryProducts.length > 0) {
          recommendedItems = [...sameCategoryProducts];
        }
      }

      // If we don't have enough, add from same collection
      if (recommendedItems.length < 4 && product.collection_id) {
        const { data: sameCollectionProducts } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .eq('collection_id', product.collection_id)
          .neq('id', product.id)
          .limit(8);

        if (sameCollectionProducts) {
          // Merge and remove duplicates
          const existingIds = new Set(recommendedItems.map(p => p.id));
          const newProducts = sameCollectionProducts.filter(p => !existingIds.has(p.id));
          recommendedItems = [...recommendedItems, ...newProducts];
        }
      }

      // If still not enough, add similar price range
      if (recommendedItems.length < 4) {
        const priceMin = product.price * 0.7;
        const priceMax = product.price * 1.3;

        const { data: similarPriceProducts } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .neq('id', product.id)
          .gte('price', priceMin)
          .lte('price', priceMax)
          .limit(8);

        if (similarPriceProducts) {
          const existingIds = new Set(recommendedItems.map(p => p.id));
          const newProducts = similarPriceProducts.filter(p => !existingIds.has(p.id));
          recommendedItems = [...recommendedItems, ...newProducts];
        }
      }

      // If still not enough, add featured/bestsellers
      if (recommendedItems.length < 4) {
        const { data: featuredProducts } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .neq('id', product.id)
          .or('is_featured.eq.true,is_bestseller.eq.true')
          .limit(8);

        if (featuredProducts) {
          const existingIds = new Set(recommendedItems.map(p => p.id));
          const newProducts = featuredProducts.filter(p => !existingIds.has(p.id));
          recommendedItems = [...recommendedItems, ...newProducts];
        }
      }

      // Last resort: get any random products
      if (recommendedItems.length < 4) {
        const { data: anyProducts } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .neq('id', product.id)
          .limit(8);

        if (anyProducts) {
          const existingIds = new Set(recommendedItems.map(p => p.id));
          const newProducts = anyProducts.filter(p => !existingIds.has(p.id));
          recommendedItems = [...recommendedItems, ...newProducts];
        }
      }

      // Take only 4 products and shuffle for variety
      const shuffled = recommendedItems.sort(() => Math.random() - 0.5);
      setRecommendedProducts(shuffled.slice(0, 4));
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  };

  const getProductImage = (product: Product, index: number = 0) => {
    if (product.images && product.images.length > index) {
      return getProductImageUrl(product.images[index]);
    } else if (product.main_image) {
      return getProductImageUrl(product.main_image);
    }
    return null;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    if (product.color_options && product.color_options.length > 0 && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }

    addItem({
      product,
      image: product.main_image || '',
      quantity,
      size: selectedSize || 'One Size',
      color: selectedColor || { name: 'Default', hex: '#000000' }
    });

    showToast('Added to cart successfully!', 'success');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;

    try {
      await toggleWishlist(product);
      showToast(
        isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist',
        'success'
      );
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-neutral-200 rounded-lg animate-pulse" />
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-neutral-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            <div className="space-y-6 animate-pulse">
              <div className="h-10 bg-neutral-200 rounded w-3/4" />
              <div className="h-8 bg-neutral-200 rounded w-1/4" />
              <div className="h-32 bg-neutral-200 rounded" />
              <div className="h-12 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <h2 className="text-2xl font-serif font-bold mb-4">Product Not Found</h2>
          <p className="text-neutral-600 mb-6">This product doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const displayImages = product.images && product.images.length > 0 
    ? product.images.map((img: any) => {
        if (typeof img === 'string') {
          return getProductImageUrl(img);
        } else if (img && typeof img === 'object' && 'image_url' in img) {
          return getProductImageUrl(img.image_url);
        }
        return getProductImageUrl(img);
      })
    : (product.main_image ? [getProductImageUrl(product.main_image)] : []);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-white border-b border-neutral-200 sticky top-[60px] z-30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/shop"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1 font-medium text-sm">Back to Shop</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image Slider - FIXED: Only sticky on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-32"
          >
            <ImageSlider
              images={displayImages}
              productName={product.name}
              onImageClick={() => setShowImageModal(true)}
            />
          </motion.div>

          {/* Right: Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Product Name */}
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-light text-neutral-900 tracking-wide uppercase mb-2">
                {product.name}
              </h1>

              {/* Price in NGN */}
              <div className="flex items-baseline gap-3 mb-4">
                {product.sale_price ? (
                  <>
                    <p className="text-2xl font-medium text-red-600">
                      {formatPrice(product.sale_price)}
                    </p>
                    <p className="text-xl text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </p>
                  </>
                ) : (
                  <p className="text-2xl font-medium text-neutral-900">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 pb-4 border-b border-neutral-200">
                {product.reviewCount > 0 ? (
                  <>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.round(product.averageRating)
                              ? 'fill-neutral-900 text-neutral-900'
                              : 'text-neutral-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-600">
                      {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-500">No reviews yet</span>
                )}
              </div>
            </div>

            {/* Short Description */}
            {product.description && (
              <div className="pb-6 border-b border-neutral-200">
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Color Selector */}
            {product.color_options && product.color_options.length > 0 && (
              <div className="pb-6 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                    Color
                  </label>
                  {selectedColor && (
                    <span className="text-xs text-neutral-600">{selectedColor.name}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.color_options.map((color: ColorOption) => (
                    <motion.button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-sm border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? 'border-neutral-900 scale-110'
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pb-6 border-b border-neutral-200">
                <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3 block">
                  Size: {selectedSize && <span className="font-normal">{selectedSize}</span>}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map((size: string) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-center border transition-all text-xs ${
                        selectedSize === size
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-900'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="pb-6 border-b border-neutral-200">
              <label className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-300">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="px-4 py-2 hover:bg-neutral-100 transition-colors"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className={`text-xs ${product.stock_quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock_quantity} in stock
                </span>
              </div>
            </div>

            {/* Add to Cart & Wishlist */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Button
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="h-12 text-sm font-semibold uppercase tracking-wider"
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
              <button
                onClick={handleToggleWishlist}
                className="px-4 border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                <Heart
                  size={20}
                  className={
                    isInWishlist(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-neutral-600'
                  }
                />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-neutral-200">
              <div className="flex items-start gap-2">
                <Truck className="text-neutral-900 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold">Free Shipping</p>
                  <p className="text-[10px] text-neutral-600">On orders over ₦50,000</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <RotateCcw className="text-neutral-900 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold">Easy Returns</p>
                  <p className="text-[10px] text-neutral-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="text-neutral-900 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold">Secure Payment</p>
                  <p className="text-[10px] text-neutral-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Package className="text-neutral-900 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-semibold">Premium Packaging</p>
                  <p className="text-[10px] text-neutral-600">Luxury gift wrapping</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-neutral-200 mb-8">
            <div className="flex gap-8">
              {(['description', 'measurements', 'sizeguide', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
                    activeTab === tab
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {tab === 'measurements' ? 'Details & Care' : tab === 'sizeguide' ? 'Size Guide' : tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-3xl"
              >
                <p className="text-sm text-neutral-700 leading-relaxed mb-6">
                  {product.long_description || product.description || 'No description available.'}
                </p>

                {product.fit_description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2 uppercase tracking-wide">Fit</h3>
                    <p className="text-sm text-neutral-700">{product.fit_description}</p>
                  </div>
                )}

                {product.sizing_notes && (
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded">
                    <p className="text-xs text-neutral-700">{product.sizing_notes}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Measurements Tab */}
            {activeTab === 'measurements' && (
              <motion.div
                key="measurements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl space-y-8"
              >
                {/* Product Measurements */}
                {product.measurements && Object.keys(product.measurements).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                      <Ruler size={16} />
                      Product Measurements
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(product.measurements as ProductMeasurements).map(([key, value]) => (
                        value && (
                          <div key={key} className="border border-neutral-200 p-3 text-center">
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">{key}</p>
                            <p className="text-sm font-medium text-neutral-900">{value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Info */}
                {product.model_measurements && Object.keys(product.model_measurements).length > 0 && (
                  <div className="bg-neutral-50 border border-neutral-200 p-6 rounded">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Model Info</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Object.entries(product.model_measurements as ModelMeasurements).map(([key, value]) => (
                        value && (
                          <div key={key}>
                            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">
                              {key.replace('_', ' ')}
                            </p>
                            <p className="text-sm font-medium text-neutral-900">{value}</p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Chart */}
                {product.size_chart && Object.keys(product.size_chart).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Size Chart</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-neutral-100">
                            <th className="border border-neutral-300 px-3 py-2 text-left font-semibold">Size</th>
                            {Object.values(product.size_chart as SizeChart)[0] && 
                              Object.keys(Object.values(product.size_chart as SizeChart)[0]).map(measurement => (
                                <th key={measurement} className="border border-neutral-300 px-3 py-2 text-left font-semibold capitalize">
                                  {measurement}
                                </th>
                              ))
                            }
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(product.size_chart as SizeChart).map(([size, measurements]) => (
                            <tr key={size} className="hover:bg-neutral-50">
                              <td className="border border-neutral-300 px-3 py-2 font-medium">{size}</td>
                              {Object.values(measurements).map((value, idx) => (
                                <td key={idx} className="border border-neutral-300 px-3 py-2">
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Material & Care */}
                <div className="grid md:grid-cols-2 gap-6">
                  {product.material_composition && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">Material</h3>
                      <p className="text-sm text-neutral-700 whitespace-pre-line">{product.material_composition}</p>
                    </div>
                  )}
                  {product.care_details && (
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 mb-3 uppercase tracking-wide">Care Instructions</h3>
                      <p className="text-sm text-neutral-700 whitespace-pre-line">{product.care_details}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SIZE GUIDE TAB */}
            {activeTab === 'sizeguide' && (
              <motion.div
                key="sizeguide"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl"
              >
                {/* Header with Unit Toggle */}
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-serif font-light text-neutral-900 uppercase tracking-wide">
                    Size Guide
                  </h3>
                  <div className="flex items-center gap-2 bg-neutral-100 rounded-sm p-1">
                    <button
                      onClick={() => setMeasurementUnit('cm')}
                      className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                        measurementUnit === 'cm'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      CM
                    </button>
                    <button
                      onClick={() => setMeasurementUnit('in')}
                      className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                        measurementUnit === 'in'
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      IN
                    </button>
                  </div>
                </div>

                {/* Body Measurements Table */}
                <div className="mb-10">
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                    Body Measurements
                  </h4>
                  <div className="overflow-x-auto bg-white border border-neutral-200 rounded-sm">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left px-6 py-3 text-neutral-600 font-semibold uppercase tracking-wider">
                            AU / UK
                          </th>
                          {['4', '6', '8', '10', '12', '14'].map((size) => (
                            <th key={size} className="text-center px-4 py-3 text-neutral-900 font-semibold">
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">Bust</td>
                          {measurementUnit === 'cm' ? (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">75.5-81</td>
                              <td className="text-center px-4 py-3 text-neutral-700">81-82</td>
                              <td className="text-center px-4 py-3 text-neutral-700">82-90</td>
                              <td className="text-center px-4 py-3 text-neutral-700">90-92</td>
                              <td className="text-center px-4 py-3 text-neutral-700">96-97</td>
                              <td className="text-center px-4 py-3 text-neutral-700">97-101</td>
                            </>
                          ) : (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">29.7-31.9</td>
                              <td className="text-center px-4 py-3 text-neutral-700">31.9-32.3</td>
                              <td className="text-center px-4 py-3 text-neutral-700">32.3-35.4</td>
                              <td className="text-center px-4 py-3 text-neutral-700">35.4-36.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">37.8-38.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">38.2-39.8</td>
                            </>
                          )}
                        </tr>
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">Waist</td>
                          {measurementUnit === 'cm' ? (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">59-62.5</td>
                              <td className="text-center px-4 py-3 text-neutral-700">62-64</td>
                              <td className="text-center px-4 py-3 text-neutral-700">66-70</td>
                              <td className="text-center px-4 py-3 text-neutral-700">70-76</td>
                              <td className="text-center px-4 py-3 text-neutral-700">76-79</td>
                              <td className="text-center px-4 py-3 text-neutral-700">82-87</td>
                            </>
                          ) : (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">23.2-24.6</td>
                              <td className="text-center px-4 py-3 text-neutral-700">24.4-25.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">26.0-27.6</td>
                              <td className="text-center px-4 py-3 text-neutral-700">27.6-29.9</td>
                              <td className="text-center px-4 py-3 text-neutral-700">29.9-31.1</td>
                              <td className="text-center px-4 py-3 text-neutral-700">32.3-34.3</td>
                            </>
                          )}
                        </tr>
                        <tr className="hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">Hip</td>
                          {measurementUnit === 'cm' ? (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">82.5-90</td>
                              <td className="text-center px-4 py-3 text-neutral-700">90-92</td>
                              <td className="text-center px-4 py-3 text-neutral-700">92-97</td>
                              <td className="text-center px-4 py-3 text-neutral-700">97-101</td>
                              <td className="text-center px-4 py-3 text-neutral-700">101-102</td>
                              <td className="text-center px-4 py-3 text-neutral-700">102-109</td>
                            </>
                          ) : (
                            <>
                              <td className="text-center px-4 py-3 text-neutral-700">32.5-35.4</td>
                              <td className="text-center px-4 py-3 text-neutral-700">35.4-36.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">36.2-38.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">38.2-39.8</td>
                              <td className="text-center px-4 py-3 text-neutral-700">39.8-40.2</td>
                              <td className="text-center px-4 py-3 text-neutral-700">40.2-42.9</td>
                            </>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Size Conversion Table */}
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                    Size Conversion
                  </h4>
                  <div className="overflow-x-auto bg-white border border-neutral-200 rounded-sm">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left px-6 py-3 text-neutral-600 font-semibold uppercase tracking-wider">
                            AU / UK
                          </th>
                          {['4', '6', '8', '10', '12', '14'].map((size) => (
                            <th key={size} className="text-center px-4 py-3 text-neutral-900 font-semibold">
                              {size}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">USA</td>
                          <td className="text-center px-4 py-3 text-neutral-700">0</td>
                          <td className="text-center px-4 py-3 text-neutral-700">2</td>
                          <td className="text-center px-4 py-3 text-neutral-700">4</td>
                          <td className="text-center px-4 py-3 text-neutral-700">6</td>
                          <td className="text-center px-4 py-3 text-neutral-700">8</td>
                          <td className="text-center px-4 py-3 text-neutral-700">10</td>
                        </tr>
                        <tr className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">EU</td>
                          <td className="text-center px-4 py-3 text-neutral-700">32</td>
                          <td className="text-center px-4 py-3 text-neutral-700">34</td>
                          <td className="text-center px-4 py-3 text-neutral-700">36</td>
                          <td className="text-center px-4 py-3 text-neutral-700">38</td>
                          <td className="text-center px-4 py-3 text-neutral-700">40</td>
                          <td className="text-center px-4 py-3 text-neutral-700">42</td>
                        </tr>
                        <tr className="hover:bg-neutral-50">
                          <td className="px-6 py-3 font-medium text-neutral-900 uppercase tracking-wide">INTL</td>
                          <td className="text-center px-4 py-3 text-neutral-700">S</td>
                          <td className="text-center px-4 py-3 text-neutral-700">S</td>
                          <td className="text-center px-4 py-3 text-neutral-700">M</td>
                          <td className="text-center px-4 py-3 text-neutral-700">M</td>
                          <td className="text-center px-4 py-3 text-neutral-700">L</td>
                          <td className="text-center px-4 py-3 text-neutral-700">L</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sizing Note */}
                <div className="mt-8 bg-neutral-50 border-l-4 border-neutral-900 p-6 rounded-sm">
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    <span className="font-semibold text-neutral-900">Need sizing assistance?</span> Our pieces are designed to flatter every body type. 
                    If you're between sizes, we recommend sizing up for a more relaxed fit or sizing down for a fitted silhouette. 
                    For personalized styling advice, chat with us or call <span className="font-medium">+234 888 675 0308</span>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {product.reviews.length > 0 ? (
                  <div className="space-y-6 max-w-3xl">
                    {product.reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={
                                  i < review.rating
                                    ? 'fill-neutral-900 text-neutral-900'
                                    : 'text-neutral-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-neutral-900">{review.customer_name}</span>
                          {review.verified_purchase && (
                            <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="text-sm font-semibold text-neutral-900 mb-1">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="text-sm text-neutral-700 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-600 text-center py-12">
                    No reviews yet. Be the first to review this product!
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RECOMMENDED PRODUCTS SECTION */}
        {recommendedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-24 border-t border-neutral-200 pt-16"
          >
            <h2 className="text-center font-serif text-xl md:text-2xl font-light text-neutral-900 tracking-wide uppercase mb-12">
              THESE WOULD ALSO LOOK GOOD ON YOU
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendedProducts.map((recommendedProduct) => {
                const mainImage = getProductImage(recommendedProduct, 0);
                const hoverImage = getProductImage(recommendedProduct, 1);

                return (
                  <motion.div
                    key={recommendedProduct.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => navigate(`/product/${recommendedProduct.id}`)}
                    className="group cursor-pointer"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 mb-3 rounded-sm">
                      {mainImage ? (
                        <>
                          {/* Main Image */}
                          <img
                            src={mainImage}
                            alt={recommendedProduct.name}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                            loading="lazy"
                          />
                          {/* Hover Image */}
                          {hoverImage && hoverImage !== mainImage && (
                            <img
                              src={hoverImage}
                              alt={`${recommendedProduct.name} hover`}
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
                      {recommendedProduct.compare_at_price && recommendedProduct.compare_at_price > recommendedProduct.price && (
                        <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 text-[9px] tracking-wider uppercase">
                          Sale
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="text-center">
                      <h3 className="font-serif text-xs font-normal text-neutral-900 mb-1 group-hover:text-neutral-600 transition-colors line-clamp-2">
                        {recommendedProduct.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        {recommendedProduct.compare_at_price && recommendedProduct.compare_at_price > recommendedProduct.price ? (
                          <>
                            <span className="text-[10px] text-neutral-500 line-through">
                              {formatPrice(recommendedProduct.compare_at_price)}
                            </span>
                            <span className="text-[10px] text-red-600 font-medium">
                              {formatPrice(recommendedProduct.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-neutral-900">
                            {formatPrice(recommendedProduct.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            images={displayImages}
            currentIndex={0}
            onClose={() => setShowImageModal(false)}
            productName={product.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}