import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ProductWithImages } from '../types';
import { generateSessionId } from '../lib/utils';
import ProductCard from '../components/product/ProductCard';
import Button from '../components/ui/Button';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const sessionId = generateSessionId();

      const { data: wishlistItems } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('session_id', sessionId);

      if (wishlistItems && wishlistItems.length > 0) {
        const productIds = wishlistItems.map((item) => item.product_id);

        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(*),
            collection:collections(*)
          `)
          .in('id', productIds);

        if (productsData) {
          setProducts(productsData as any);
        }
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-sm mb-4" />
                <div className="h-4 bg-neutral-200 rounded mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-2">My Wishlist</h1>
          <p className="text-neutral-600">
            {products.length} {products.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-neutral-300 mb-4" />
            <p className="text-lg text-neutral-600 mb-2">Your wishlist is empty</p>
            <p className="text-neutral-500 mb-6">
              Save your favorite pieces to easily find them later
            </p>
            <Button onClick={() => navigate('/shop')}>Explore Collection</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
