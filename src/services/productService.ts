import { supabase } from '../lib/supabase';
import type { Product } from '../types';

const mapProductData = (product: any): Product & { images?: any[] } => ({
  id: product.id,
  name: product.name,
  description: product.description || '',
  price: parseFloat(product.price),
  salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
  image: product.images?.[0]?.image_url || product.main_image || '',
  images: product.images || [],
  category: product.category || '',
  collection: product.collection_id || '',
  sizes: product.size_options || [],
  colors: product.color_options || [],
  inStock: product.stock_quantity > 0,
  isNew: product.is_new || false,
  isBestseller: product.is_bestseller || false,
  slug: product.slug || '',
  collection_id: product.collection_id || null,
  materials: product.materials || null,
  care_instructions: product.care_instructions || null,
  sku: product.sku || null,
  stock_quantity: product.stock_quantity || 0,
  created_at: product.created_at,
  updated_at: product.updated_at,
});

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
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
    .select(`
      *,
      images:product_images(*)
    `)
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
    .select(`
      *,
      images:product_images(*)
    `)
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
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('category', category)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data.map(mapProductData);
}
