import { supabase } from '../lib/supabase';
import type { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price),
    salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
    image: product.image_url || '',
    images: product.additional_images || [product.image_url],
    category: product.category || '',
    collection: product.collection_id || '',
    sizes: product.size_options || [],
    colors: product.color_options || [],
    inStock: product.stock_quantity > 0,
    isNew: product.is_new || false,
    isBestseller: product.is_bestseller || false,
  }));
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .limit(limit)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }

  return data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price),
    salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
    image: product.image_url || '',
    images: product.additional_images || [product.image_url],
    category: product.category || '',
    collection: product.collection_id || '',
    sizes: product.size_options || [],
    colors: product.color_options || [],
    inStock: product.stock_quantity > 0,
    isNew: product.is_new || false,
    isBestseller: product.is_bestseller || false,
  }));
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

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    price: parseFloat(data.price),
    salePrice: data.sale_price ? parseFloat(data.sale_price) : undefined,
    image: data.image_url || '',
    images: data.additional_images || [data.image_url],
    category: data.category || '',
    collection: data.collection_id || '',
    sizes: data.size_options || [],
    colors: data.color_options || [],
    inStock: data.stock_quantity > 0,
    isNew: data.is_new || false,
    isBestseller: data.is_bestseller || false,
  };
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }

  return data.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: parseFloat(product.price),
    salePrice: product.sale_price ? parseFloat(product.sale_price) : undefined,
    image: product.image_url || '',
    images: product.additional_images || [product.image_url],
    category: product.category || '',
    collection: product.collection_id || '',
    sizes: product.size_options || [],
    colors: product.color_options || [],
    inStock: product.stock_quantity > 0,
    isNew: product.is_new || false,
    isBestseller: product.is_bestseller || false,
  }));
}
