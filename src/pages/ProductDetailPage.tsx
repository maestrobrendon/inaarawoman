import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Plus, Minus, ChevronLeft, Truck, Shield, RotateCcw, Package, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithDetails, Review } from '../types';
import { formatPrice } from '../lib/utils';
import { getProductImageUrl, getFullImageUrl } from '../utils/cloudinaryUpload';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';

export default function ProductDetailPage() {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

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

      if ((productData as any).colors?.length > 0) {
        setSelectedColor((productData as any).colors[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
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
              <div className="aspect-[4/5] bg-neutral-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-neutral-200 rounded-lg animate-pulse" />
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

  const displayImages = product.images && product.images.length > 0 ? product.images : (product.main_image ? [product.main_image] : []);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-[60px] z-30 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/shop"
            className="inline-flex items-center text-neutral-600 hover:text-[#D4AF37] transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="ml-1 font-medium">Back to Shop</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="sticky top-32">
              <motion.div
                className="relative aspect-[4/5] bg-white rounded-lg overflow-hidden shadow-lg mb-6 cursor-zoom-in"
                onClick={() => setShowImageModal(true)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={getProductImageUrl(displayImages[selectedImage] || product.main_image || '')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>

                {product.is_new && (
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    NEW
                  </div>
                )}

                {product.sale_price && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    SALE
                  </div>
                )}
              </motion.div>

              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {displayImages.map((imageUrl, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-[#D4AF37] shadow-md'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={getProductImageUrl(imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              {product.collection && (
                <Link
                  to={`/collection/${product.collection.slug}`}
                  className="text-sm text-[#D4AF37] hover:underline mb-2 inline-block"
                >
                  {product.collection.name} Collection
                </Link>
              )}
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {product.reviewCount > 0 ? (
                    <>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={18}
                            className={
                              i < Math.round(product.averageRating)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-neutral-300'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-neutral-600">
                        {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-neutral-500">No reviews yet</span>
                  )}
                </div>
              </div>

              <div className="flex items-baseline gap-4 mb-6">
                {product.sale_price ? (
                  <>
                    <p className="text-3xl font-bold text-red-600">
                      {formatPrice(product.sale_price)}
                    </p>
                    <p className="text-2xl text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-neutral-900">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="pb-6 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">
                    Color: <span className="font-normal">{selectedColor?.name}</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color: { name: string; hex: string }) => (
                    <motion.button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-2 transition-all relative ${
                        selectedColor?.name === color.name
                          ? 'border-[#D4AF37] shadow-lg'
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {selectedColor?.name === color.name && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 rounded-full border-2 border-[#D4AF37]"
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="pb-6 border-b border-neutral-200">
                <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4 block">
                  Size: <span className="font-normal">{selectedSize || 'Select a size'}</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {product.sizes.map((size: string) => (
                    <motion.button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-white shadow-md'
                          : 'border-neutral-300 hover:border-neutral-900 bg-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="pb-6 border-b border-neutral-200">
              <label className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-4 block">
                Quantity
              </label>
              <div className="flex items-center gap-6">
                <div className="flex items-center border-2 border-neutral-300 rounded-lg overflow-hidden">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Minus size={18} />
                  </motion.button>
                  <span className="px-8 text-lg font-semibold">{quantity}</span>
                  <motion.button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                    disabled={quantity >= product.stock_quantity}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Plus size={18} />
                  </motion.button>
                </div>
                <span className={`text-sm font-medium ${product.stock_quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock_quantity} {product.stock_quantity === 1 ? 'item' : 'items'} in stock
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  fullWidth
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                  className="h-14 text-lg font-semibold"
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </motion.div>
              <motion.button
                onClick={handleToggleWishlist}
                className="p-4 border-2 border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart
                  size={24}
                  className={
                    isInWishlist(product.id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-neutral-600'
                  }
                />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start gap-3">
                <Truck className="text-[#D4AF37] mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-neutral-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="text-[#D4AF37] mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-neutral-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="text-[#D4AF37] mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Secure Payment</p>
                  <p className="text-xs text-neutral-600">100% secure checkout</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="text-[#D4AF37] mt-1" size={24} />
                <div>
                  <p className="font-semibold text-sm">Premium Packaging</p>
                  <p className="text-xs text-neutral-600">Luxury gift wrapping</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-20 bg-white rounded-lg shadow-sm p-8">
          <div className="border-b border-neutral-200 mb-8">
            <div className="flex gap-8">
              {(['description', 'details', 'reviews'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-semibold uppercase tracking-wide transition-colors relative ${
                    activeTab === tab
                      ? 'text-[#D4AF37]'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="description"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="prose max-w-none"
              >
                <p className="text-neutral-700 leading-relaxed text-lg">
                  {product.description || 'No description available.'}
                </p>
                {product.long_description && (
                  <p className="text-neutral-700 leading-relaxed mt-4">
                    {product.long_description}
                  </p>
                )}
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {product.materials && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Materials</h3>
                    <p className="text-neutral-700">{product.materials}</p>
                  </div>
                )}
                {product.care_instructions && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">Care Instructions</h3>
                    <p className="text-neutral-700">{product.care_instructions}</p>
                  </div>
                )}
                {product.sku && (
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">SKU</h3>
                    <p className="text-neutral-700 font-mono">{product.sku}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {product.reviews.length > 0 ? (
                  <div className="space-y-8">
                    {product.reviews.map((review: Review) => (
                      <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={
                                  i < review.rating
                                    ? 'fill-[#D4AF37] text-[#D4AF37]'
                                    : 'text-neutral-300'
                                }
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-neutral-900">{review.customer_name}</span>
                          {review.verified_purchase && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-neutral-900 mb-2">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-600 text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-neutral-300 transition-colors"
            >
              <X size={32} />
            </button>
            <motion.img
              src={getFullImageUrl(displayImages[selectedImage] || product.main_image || '')}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
