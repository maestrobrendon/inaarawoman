import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Product, ProductImage } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';

interface ProductCardProps {
  product: Product & { images?: ProductImage[] };
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const inWishlist = isInWishlist(product.id);

  const productImages = product.images || [];
  const displayImages = productImages.length > 0 ? productImages : [];

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await toggleWishlist(product);
      showToast(
        inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
        'success'
      );
    } catch (error) {
      showToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-sm mb-4"
        onMouseEnter={() => {
          if (displayImages.length > 1) setCurrentImageIndex(1);
        }}
        onMouseLeave={() => setCurrentImageIndex(0)}
      >
        {displayImages.length > 0 && displayImages[currentImageIndex] && displayImages[currentImageIndex].image_url ? (
          <img
            src={displayImages[currentImageIndex].image_url}
            alt={displayImages[currentImageIndex].alt_text || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-neutral-400">
            No image
          </div>
        )}

        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50 transition-colors z-10"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={18}
            className={inWishlist ? 'fill-red-500 text-red-500' : 'text-neutral-600'}
          />
        </button>

        {product.is_new && (
          <span className="absolute top-3 left-3 bg-neutral-900 text-white text-xs px-3 py-1 rounded-full">
            New
          </span>
        )}

        {product.is_bestseller && !product.is_new && (
          <span className="absolute top-3 left-3 bg-amber-100 text-neutral-900 text-xs px-3 py-1 rounded-full">
            Bestseller
          </span>
        )}

        {product.stock_quantity === 0 && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-900">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-neutral-900">{formatPrice(product.price)}</p>
      </div>
    </div>
  );
}
