import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateSessionId } from '../lib/utils';
import { Product } from '../types';

interface WishlistContextType {
  wishlistIds: Set<string>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const sessionId = generateSessionId();
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('session_id', sessionId);

      if (error) throw error;

      const ids = new Set(data?.map((item) => item.product_id) || []);
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistIds.has(productId);
  };

  const toggleWishlist = async (product: Product) => {
    const sessionId = generateSessionId();
    const inWishlist = wishlistIds.has(product.id);

    try {
      if (inWishlist) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('session_id', sessionId)
          .eq('product_id', product.id);

        if (error) throw error;

        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
      } else {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({
            session_id: sessionId,
            product_id: product.id
          });

        if (error) throw error;

        setWishlistIds((prev) => new Set([...prev, product.id]));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
