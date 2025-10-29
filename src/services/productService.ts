import { supabase } from '../lib/supabase';
import type { Product } from '../types';

const mapProductData = (product: any): Product => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  price: parseFloat(product.price),
  salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
  image: product.main_image || product.images?.[0] || product.image_url || '',
  images: product.images || product.additional_images || (product.image_url ? [product.image_url] : []),
  category: product.category || '',
  collection: product.collection_id || '',
  sizes: product.size_options || [],
  colors: product.color_options || [],
  inStock: product.stock_quantity > 0,
  isNew: product.is_new || false,
  isBestseller: product.is_bestseller || false,
});

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data.map(mapProductData);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'active')
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data.map(mapProductData);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching product:', error);
    return null;
  }

  return mapProductData(data);
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data.map(mapProductData);
}
