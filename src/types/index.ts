// ============================================
// INAARA WOMAN - COMPLETE TYPE DEFINITIONS
// Merged: Original + Enhanced Product Details
// ============================================

// Collection Types
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

// Enhanced Product Measurement Types (NEW)
export interface ProductMeasurements {
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
  inseam?: string;
  [key: string]: string | undefined; // Allow custom measurements
}

export interface ModelMeasurements {
  height?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  size_worn?: string;
  [key: string]: string | undefined;
}

export interface SizeChartEntry {
  bust?: string;
  waist?: string;
  hips?: string;
  length?: string;
  [key: string]: string | undefined;
}

export interface SizeChart {
  [size: string]: SizeChartEntry; // e.g., { "S": { bust: "32-34", waist: "26-28" } }
}

// Color Types
export interface ColorOption {
  name: string;
  hex: string;
}

// Product Types (ENHANCED - includes all old + new fields)
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description?: string | null; // NEW
  price: number;
  compare_at_price?: number | null; // NEW
  sale_price?: number | null; // NEW
  cost_price?: number | null; // NEW
  collection_id: string | null;
  category: string;
  status?: 'active' | 'draft' | 'archived'; // NEW
  
  // Images
  images?: string[];
  image_public_ids?: string[];
  main_image?: string;
  image?: string;
  image_url?: string;
  
  // Variants
  sizes: string[];
  colors: Array<{ name: string; hex: string }>;
  
  // Materials (keeping old for backwards compatibility)
  materials: string | null;
  care_instructions: string | null;
  
  // NEW Enhanced Details
  fit_description?: string | null;
  material_composition?: string | null;
  care_details?: string | null;
  sizing_notes?: string | null;
  measurements?: ProductMeasurements | null;
  model_measurements?: ModelMeasurements | null;
  color_options?: ColorOption[] | null;
  size_chart?: SizeChart | null;
  
  // Stock & SKU
  sku: string | null;
  barcode?: string | null; // NEW
  stock_quantity: number;
  low_stock_threshold?: number; // NEW
  weight?: number; // NEW
  
  // Badges
  is_new: boolean;
  is_bestseller: boolean;
  is_featured?: boolean; // NEW
  
  // Homepage & Visibility (NEW)
  show_on_homepage?: boolean;
  homepage_section?: string;
  homepage_position?: number;
  
  // SEO (NEW)
  seo_title?: string | null;
  seo_description?: string | null;
  tags?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Product Image Types
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  cloudinary_url?: string; // NEW - for cloudinary
  cloudinary_public_id?: string; // NEW
  alt_text: string | null;
  display_order: number;
  image_order?: number; // NEW - alternative naming
  is_primary: boolean;
  created_at?: string;
}

// Product with Images
export interface ProductWithImages extends Product {
  images: ProductImage[];
  collection?: Collection;
}

// Product with Full Details (includes reviews)
export interface ProductWithDetails extends Product {
  images: string[] | ProductImage[];
  collection?: Collection;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

// Review Types
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

// Wishlist Types
export interface WishlistItem {
  id: string;
  session_id: string;
  user_id?: string; // NEW - for logged in users
  product_id: string;
  product?: Product; // NEW - populated product
  created_at: string;
}

// Cart Types
export interface CartItem {
  id?: string; // NEW
  product: Product;
  image: string;
  quantity: number;
  size: string;
  color: { name: string; hex: string };
}

// Order Types
export interface Order {
  id: string;
  order_number: string;
  user_id?: string; // NEW
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
  payment_reference?: string; // NEW - for Paystack/Flutterwave
  shipping_method: string;
  order_status: string;
  tracking_number: string | null;
  notes?: string | null; // NEW
  created_at: string;
  updated_at: string;
}

// Address Types
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
  email?: string; // NEW
}

// Order Item Types
export interface OrderItem {
  id?: string; // NEW
  order_id?: string; // NEW
  product_id: string;
  product_name?: string; // NEW - alternative to name
  name: string;
  image_url: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  sku: string;
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
  unsubscribed_at?: string | null; // NEW
}

// Currency Types
export type Currency = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'GHS' | 'ZAR' | 'KES';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name?: string; // NEW
  flag?: string; // NEW
  rate: number;
}

// User Types (NEW)
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}

// Admin Types (NEW)
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

// Product Form Data Types (NEW - for admin form)
export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description: string;
  long_description: string;
  price: string;
  compare_at_price: string;
  cost_price: string;
  category: string;
  stock_quantity: string;
  low_stock_threshold: string;
  status: 'active' | 'draft' | 'archived';
  
  // Enhanced details
  fit_description: string;
  material_composition: string;
  care_details: string;
  sizing_notes: string;
  
  // Structured data
  measurements: ProductMeasurements;
  model_measurements: ModelMeasurements;
  color_options: ColorOption[];
  size_chart: SizeChart;
  
  // Homepage
  show_on_homepage: boolean;
  homepage_section: string;
  homepage_position: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  
  // SEO
  seo_title: string;
  seo_description: string;
  tags: string[];
}

// Payment Types (NEW - for Paystack/Flutterwave)
export interface PaymentConfig {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  publicKey: string;
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export interface PaymentResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
  redirecturl?: string;
}

// API Response Types (NEW)
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Pagination Types (NEW)
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Filter Types (NEW)
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  collections?: string[];
  inStock?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  search?: string;
}

// Export all types
export type {
  Collection,
  Product,
  ProductImage,
  ProductWithImages,
  ProductWithDetails,
  ProductMeasurements,
  ModelMeasurements,
  SizeChart,
  SizeChartEntry,
  ColorOption,
  Review,
  WishlistItem,
  Order,
  OrderItem,
  Address,
  CartItem,
  NewsletterSubscriber,
  Currency,
  CurrencyInfo,
  User,
  AdminUser,
  ProductFormData,
  PaymentConfig,
  PaymentResponse,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ProductFilters,
};