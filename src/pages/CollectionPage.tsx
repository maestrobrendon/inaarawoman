import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import { Product } from '../types';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image?: string;
}

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollectionData = async () => {
      const { data: collectionData } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (collectionData) {
        setCollection(collectionData);

        const { data: productsData } = await supabase
          .from('products')
          .select(`
            *,
            product_images(image_url, display_order, is_primary)
          `)
          .eq('collection_id', collectionData.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsData) {
          const formattedProducts = productsData.map((product: any) => ({
            ...product,
            image: product.product_images?.find((img: any) => img.is_primary)?.image_url ||
                   product.product_images?.[0]?.image_url ||
                   '/placeholder.jpg',
            images: product.product_images?.map((img: any) => img.image_url) || []
          }));
          setProducts(formattedProducts);
        }
      }

      setLoading(false);
    };

    fetchCollectionData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Collection Not Found</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-neutral-600 hover:text-neutral-900 underline"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-[60vh] min-h-[500px] bg-neutral-200">
        {collection.hero_image ? (
          <img
            src={collection.hero_image}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200" />
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 tracking-wide uppercase">
              {collection.name} Collection
            </h1>
            {collection.description && (
              <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-neutral-600 text-lg mb-4">
              No products available in this collection yet.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="text-neutral-900 hover:text-neutral-600 underline"
            >
              Browse all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
