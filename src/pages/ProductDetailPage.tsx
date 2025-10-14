import { useEffect, useState } from 'react';
import { Heart, Star, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithDetails, Review } from '../types';
import { formatPrice } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (page: string, data?: any) => void;
}

export default function ProductDetailPage({ productId, onNavigate }: ProductDetailPageProps) {
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          images:product_images(*),
          collection:collections(*)
        `)
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      const sortedImages = (productData as any).images.sort(
        (a: any, b: any) => a.display_order - b.display_order
      );

      setProduct({
        ...(productData as any),
        images: sortedImages,
        reviews: reviews || [],
        averageRating,
        reviewCount: reviews.length
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

    if (!selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }

    if (!selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }

    const primaryImage = product.images.find((img) => img.is_primary) || product.images[0];

    addItem({
      product,
      image: primaryImage?.image_url || '',
      quantity,
      size: selectedSize,
      color: selectedColor
    });

    showToast('Added to cart', 'success');
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
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-pulse">
              <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-neutral-200 rounded-sm" />
                ))}
              </div>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
              <div className="h-6 bg-neutral-200 rounded w-1/4" />
              <div className="h-24 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Product not found</p>
          <Button onClick={() => onNavigate('shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
        >
          <ChevronLeft size={20} />
          <span className="ml-1">Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="relative aspect-[3/4] bg-neutral-100 rounded-sm mb-4 overflow-hidden group">
              {product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.image_url}
                  alt={product.images[selectedImage]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  No image available
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    disabled={selectedImage === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                    disabled={selectedImage === product.images.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-neutral-900'
                        : 'border-transparent hover:border-neutral-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || ''}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-6">
              {product.collection && (
                <p className="text-sm text-neutral-600 mb-2">{product.collection.name}</p>
              )}
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <p className="text-2xl font-semibold text-neutral-900">
                  {formatPrice(product.price)}
                </p>
                {product.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < Math.round(product.averageRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-neutral-600">
                      ({product.reviewCount} {product.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                )}
              </div>
              <p className="text-neutral-700 leading-relaxed">{product.description}</p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-900">
                    Color: {selectedColor?.name}
                  </label>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((color: { name: string; hex: string }) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name
                          ? 'border-neutral-900 scale-110'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-neutral-900">
                    Size: {selectedSize || 'Select'}
                  </label>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-neutral-600 hover:text-neutral-900 underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-3 px-4 border rounded-sm text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-sm font-medium text-neutral-900 block mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="p-3 hover:bg-neutral-100 transition-colors"
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-neutral-600">
                  {product.stock_quantity} in stock
                </span>
              </div>
            </div>

            <div className="flex gap-4 mb-8">
              <Button
                fullWidth
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <button
                onClick={handleToggleWishlist}
                className="p-3 border border-neutral-300 rounded-sm hover:bg-neutral-50 transition-colors"
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

            {product.materials && (
              <div className="mb-4 pb-4 border-b border-neutral-200">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Materials</h3>
                <p className="text-sm text-neutral-700">{product.materials}</p>
              </div>
            )}

            {product.care_instructions && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-neutral-900 mb-2">Care Instructions</h3>
                <p className="text-sm text-neutral-700">{product.care_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 mb-8">
              Customer Reviews
            </h2>
            <div className="space-y-6">
              {product.reviews.map((review: Review) => (
                <div key={review.id} className="border-b border-neutral-200 pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-medium text-neutral-900">{review.customer_name}</span>
                    {review.verified_purchase && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-neutral-900 mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-sm text-neutral-700">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        title="Size Guide"
        size="lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="py-3 px-4 text-left font-medium">Size</th>
                <th className="py-3 px-4 text-left font-medium">Bust (inches)</th>
                <th className="py-3 px-4 text-left font-medium">Waist (inches)</th>
                <th className="py-3 px-4 text-left font-medium">Hips (inches)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100">
                <td className="py-3 px-4">XS</td>
                <td className="py-3 px-4">32-33</td>
                <td className="py-3 px-4">24-25</td>
                <td className="py-3 px-4">35-36</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-3 px-4">S</td>
                <td className="py-3 px-4">34-35</td>
                <td className="py-3 px-4">26-27</td>
                <td className="py-3 px-4">37-38</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-3 px-4">M</td>
                <td className="py-3 px-4">36-37</td>
                <td className="py-3 px-4">28-29</td>
                <td className="py-3 px-4">39-40</td>
              </tr>
              <tr className="border-b border-neutral-100">
                <td className="py-3 px-4">L</td>
                <td className="py-3 px-4">38-39</td>
                <td className="py-3 px-4">30-31</td>
                <td className="py-3 px-4">41-42</td>
              </tr>
              <tr>
                <td className="py-3 px-4">XL</td>
                <td className="py-3 px-4">40-42</td>
                <td className="py-3 px-4">32-34</td>
                <td className="py-3 px-4">43-45</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
