create extension if not exists "uuid-ossp";

create extension if not exists pgcrypto;



create table public."categories" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "slug" text not null,
  "image_url" text,
  "description" text,
  "parent_id" uuid,
  "display_order" integer default 0,
  "created_at" timestamp with time zone default now(),
  "banner_image" text,
  "position" integer default 0,
  "is_visible" boolean default true,
  "seo_title" text,
  "seo_description" text,
  constraint "categories_pkey" PRIMARY KEY (id),
  constraint "categories_slug_key" UNIQUE (slug)
);

create table public."collections" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "slug" text not null,
  "description" text,
  "image_url" text,
  "is_featured" boolean default false,
  "display_order" integer default 0,
  "created_at" timestamp with time zone default now(),
  "banner_image" text,
  "start_date" timestamp with time zone,
  "end_date" timestamp with time zone,
  "is_active" boolean default true,
  "discount_percentage" numeric(5,2),
  "seo_title" text,
  "seo_description" text,
  "status" text default 'active'::text,
  "position" integer default 0,
  "updated_at" timestamp with time zone default now(),
  constraint "collections_pkey" PRIMARY KEY (id),
  constraint "collections_slug_key" UNIQUE (slug)
);

create table public."products" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "slug" text not null,
  "description" text,
  "price" numeric(10,2) not null,
  "sale_price" numeric(10,2),
  "category_id" uuid,
  "collection_id" uuid,
  "category" text,
  "image_url" text,
  "additional_images" text[],
  "size_options" text[],
  "color_options_old" text[],
  "sizes" jsonb default '[]'::jsonb,
  "colors" jsonb default '[]'::jsonb,
  "materials" text,
  "care_instructions" text,
  "sku" text,
  "stock_quantity" integer default 0,
  "is_new" boolean default false,
  "is_featured" boolean default false,
  "is_bestseller" boolean default false,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  "compare_at_price" numeric(10,2),
  "cost_price" numeric(10,2),
  "currency" text default 'NGN'::text,
  "long_description" text,
  "featured_image" text,
  "low_stock_threshold" integer default 5,
  "track_inventory" boolean default true,
  "allow_backorder" boolean default false,
  "weight" numeric(10,2),
  "dimensions" jsonb,
  "material" text,
  "size_chart_image" text,
  "status" text default 'active'::text,
  "seo_title" text,
  "seo_description" text,
  "seo_keywords" text[],
  "tags" text[],
  "created_by" uuid,
  "updated_by" uuid,
  "show_on_homepage" boolean default false,
  "homepage_position" integer default 0,
  "homepage_section" text default 'featured'::text,
  "images" text[],
  "image_public_ids" text[],
  "main_image" text,
  "fit_description" text,
  "material_composition" text,
  "care_details" text,
  "sizing_notes" text,
  "measurements" jsonb default '{}'::jsonb,
  "model_measurements" jsonb default '{}'::jsonb,
  "size_chart" jsonb default '{}'::jsonb,
  "color_options" jsonb default '[]'::jsonb,
  "length_guide" jsonb,
  constraint "products_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]))),
  constraint "products_pkey" PRIMARY KEY (id),
  constraint "products_slug_key" UNIQUE (slug),
  constraint "products_sku_key" UNIQUE (sku)
);

create table public."product_images" (
  "id" uuid default gen_random_uuid() not null,
  "product_id" uuid not null,
  "image_url" text not null,
  "alt_text" text,
  "display_order" integer default 0,
  "is_primary" boolean default false,
  constraint "product_images_pkey" PRIMARY KEY (id)
);

create table public."cart" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid,
  "session_id" text,
  "product_id" uuid not null,
  "quantity" integer default 1 not null,
  "size" text,
  "color" text,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "cart_quantity_check" CHECK ((quantity > 0)),
  constraint "cart_pkey" PRIMARY KEY (id)
);

create table public."order_items" (
  "id" uuid default gen_random_uuid() not null,
  "order_id" uuid not null,
  "product_id" uuid not null,
  "quantity" integer not null,
  "price" numeric(10,2) not null,
  "size" text,
  "color" text,
  "created_at" timestamp with time zone default now(),
  "variant_id" uuid,
  "product_name" text,
  "variant_name" text,
  "sku" text,
  "discount_amount" numeric(10,2) default 0,
  "total" numeric(10,2),
  "image_url" text,
  constraint "order_items_quantity_check" CHECK ((quantity > 0)),
  constraint "order_items_pkey" PRIMARY KEY (id)
);

create table public."reviews" (
  "id" uuid default gen_random_uuid() not null,
  "product_id" uuid not null,
  "user_id" uuid,
  "customer_name" text not null,
  "customer_email" text not null,
  "rating" integer not null,
  "title" text,
  "comment" text,
  "verified_purchase" boolean default false,
  "created_at" timestamp with time zone default now(),
  constraint "reviews_rating_check" CHECK (((rating >= 1) AND (rating <= 5))),
  constraint "reviews_pkey" PRIMARY KEY (id)
);

create table public."wishlist_items" (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid,
  "session_id" text not null,
  "product_id" uuid not null,
  "created_at" timestamp with time zone default now(),
  constraint "wishlist_items_pkey" PRIMARY KEY (id)
);

create table public."newsletter_subscribers" (
  "id" uuid default gen_random_uuid() not null,
  "email" text not null,
  "name" text,
  "subscribed_at" timestamp with time zone default now(),
  "is_active" boolean default true,
  constraint "newsletter_subscribers_pkey" PRIMARY KEY (id),
  constraint "newsletter_subscribers_email_key" UNIQUE (email)
);

create table public."admin_users" (
  "id" uuid default gen_random_uuid() not null,
  "email" text not null,
  "full_name" text not null,
  "role" text default 'staff'::text not null,
  "permissions" jsonb default '{}'::jsonb,
  "is_active" boolean default true,
  "last_login" timestamp with time zone,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "admin_users_role_check" CHECK ((role = ANY (ARRAY['super_admin'::text, 'manager'::text, 'staff'::text]))),
  constraint "admin_users_pkey" PRIMARY KEY (id),
  constraint "admin_users_email_key" UNIQUE (email)
);

create table public."product_variants" (
  "id" uuid default gen_random_uuid() not null,
  "product_id" uuid not null,
  "sku" text not null,
  "variant_name" text not null,
  "size" text,
  "color" text,
  "color_hex" text,
  "price_adjustment" numeric(10,2) default 0,
  "stock_quantity" integer default 0,
  "image_url" text,
  "is_available" boolean default true,
  "position" integer default 0,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "product_variants_pkey" PRIMARY KEY (id),
  constraint "product_variants_sku_key" UNIQUE (sku)
);

create table public."customers" (
  "id" uuid default gen_random_uuid() not null,
  "email" text not null,
  "first_name" text,
  "last_name" text,
  "phone" text,
  "default_address" jsonb,
  "total_orders" integer default 0,
  "total_spent" numeric(10,2) default 0,
  "tags" text[],
  "notes" text,
  "marketing_consent" boolean default false,
  "created_at" timestamp with time zone default now(),
  "last_order_at" timestamp with time zone,
  "address" text,
  "city" text,
  "state" text,
  "country" text,
  "postal_code" text,
  "currency" text default 'NGN'::text,
  "updated_at" timestamp with time zone default now(),
  constraint "customers_pkey" PRIMARY KEY (id),
  constraint "customers_email_key" UNIQUE (email)
);

create table public."discount_codes" (
  "id" uuid default gen_random_uuid() not null,
  "code" text not null,
  "type" text not null,
  "value" numeric(10,2) not null,
  "minimum_purchase" numeric(10,2),
  "maximum_uses" integer,
  "uses_count" integer default 0,
  "per_customer_limit" integer,
  "start_date" timestamp with time zone not null,
  "end_date" timestamp with time zone,
  "is_active" boolean default true,
  "applicable_to" text default 'all'::text,
  "product_ids" uuid[],
  "collection_ids" uuid[],
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "discount_codes_applicable_to_check" CHECK ((applicable_to = ANY (ARRAY['all'::text, 'specific_products'::text, 'specific_collections'::text]))),
  constraint "discount_codes_type_check" CHECK ((type = ANY (ARRAY['percentage'::text, 'fixed_amount'::text, 'free_shipping'::text]))),
  constraint "discount_codes_pkey" PRIMARY KEY (id),
  constraint "discount_codes_code_key" UNIQUE (code)
);

create table public."inventory_logs" (
  "id" uuid default gen_random_uuid() not null,
  "product_id" uuid not null,
  "variant_id" uuid,
  "change_type" text not null,
  "quantity_change" integer not null,
  "new_quantity" integer not null,
  "reason" text,
  "admin_user_id" uuid,
  "created_at" timestamp with time zone default now(),
  constraint "inventory_logs_change_type_check" CHECK ((change_type = ANY (ARRAY['restock'::text, 'sale'::text, 'return'::text, 'adjustment'::text, 'damaged'::text]))),
  constraint "inventory_logs_pkey" PRIMARY KEY (id)
);

create table public."activity_logs" (
  "id" uuid default gen_random_uuid() not null,
  "admin_user_id" uuid not null,
  "action" text not null,
  "entity_type" text not null,
  "entity_id" uuid,
  "changes" jsonb,
  "ip_address" text,
  "created_at" timestamp with time zone default now(),
  constraint "activity_logs_pkey" PRIMARY KEY (id)
);

create table public."site_settings" (
  "id" uuid default gen_random_uuid() not null,
  "key" text not null,
  "value" jsonb not null,
  "updated_at" timestamp with time zone default now(),
  "updated_by" uuid,
  constraint "site_settings_pkey" PRIMARY KEY (id),
  constraint "site_settings_key_key" UNIQUE (key)
);

create table public."shipping_zones" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "states" text[] not null,
  "base_rate" numeric(10,2) not null,
  "additional_rate_per_kg" numeric(10,2),
  "free_shipping_threshold" numeric(10,2),
  "is_active" boolean default true,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "shipping_zones_pkey" PRIMARY KEY (id)
);

create table public."email_templates" (
  "id" uuid default gen_random_uuid() not null,
  "name" text not null,
  "subject" text not null,
  "body" text not null,
  "variables" text[],
  "is_active" boolean default true,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "email_templates_pkey" PRIMARY KEY (id),
  constraint "email_templates_name_key" UNIQUE (name)
);

create table public."collection_products" (
  "id" uuid default gen_random_uuid() not null,
  "collection_id" uuid,
  "product_id" uuid,
  "position" integer default 0,
  "created_at" timestamp with time zone default now(),
  constraint "collection_products_pkey" PRIMARY KEY (id),
  constraint "collection_products_collection_id_product_id_key" UNIQUE (collection_id, product_id)
);

create table public."store_settings" (
  "id" uuid default gen_random_uuid() not null,
  "key" text not null,
  "value" jsonb not null,
  "category" text not null,
  "description" text,
  "updated_at" timestamp with time zone default now(),
  "updated_by" uuid,
  constraint "store_settings_pkey" PRIMARY KEY (id),
  constraint "store_settings_key_key" UNIQUE (key)
);

create table public."homepage_content" (
  "id" uuid default gen_random_uuid() not null,
  "section_key" character varying(100) not null,
  "content" jsonb not null,
  "is_active" boolean default true,
  "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
  "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
  constraint "homepage_content_pkey" PRIMARY KEY (id),
  constraint "homepage_content_section_key_key" UNIQUE (section_key)
);

create table public."transactions" (
  "id" bigint generated always as identity not null,
  "email" text not null,
  "reference" text not null,
  "amount" numeric not null,
  "status" text default 'pending'::text not null,
  "method" text not null,
  "created_at" timestamp without time zone default now(),
  constraint "transactions_pkey" PRIMARY KEY (id),
  constraint "transactions_reference_key" UNIQUE (reference)
);

create table public."orders" (
  "id" uuid default uuid_generate_v4() not null,
  "order_number" text not null,
  "user_id" uuid,
  "customer_id" uuid,
  "customer_email" text not null,
  "customer_name" text not null,
  "customer_phone" text,
  "shipping_address" text not null,
  "shipping_city" text not null,
  "shipping_state" text not null,
  "shipping_country" text not null,
  "shipping_postal_code" text,
  "subtotal" numeric(10,2) not null,
  "shipping_fee" numeric(10,2) default 0,
  "total_amount" numeric(10,2) not null,
  "currency" text default 'NGN'::text,
  "payment_method" text not null,
  "payment_status" text default 'pending'::text,
  "payment_reference" text,
  "order_status" text default 'pending'::text,
  "tracking_number" text,
  "notes" text,
  "items" jsonb not null,
  "created_at" timestamp with time zone default now(),
  "updated_at" timestamp with time zone default now(),
  constraint "orders_pkey" PRIMARY KEY (id),
  constraint "orders_order_number_key" UNIQUE (order_number)
);
