export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  collection_id: string | null;
  category: string;
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  materials: string | null;
  care_instructions: string | null;
  sku: string | null;
  stock_quantity: number;
  is_new: boolean;
  is_bestseller: boolean;
  images?: string[];
  image_public_ids?: string[];
  main_image?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string | null;
  comment: string | null;
  verified_purchase: boolean;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  session_id: string;
  product_id: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  shipping_address: Address;
  billing_address: Address | null;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  shipping_method: string;
  order_status: string;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  product_id: string;
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  sku: string;
}

export interface CartItem {
  product: Product;
  image: string;
  quantity: number;
  size: string;
  color: { name: string; hex: string };
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  collection?: Collection;
}

export interface ProductWithDetails extends ProductWithImages {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export type Currency = 'USD' | 'GBP' | 'EUR' | 'CAD';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  rate: number;
}
