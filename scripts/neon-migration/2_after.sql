alter table public."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX idx_categories_parent ON public.categories USING btree (parent_id);

CREATE INDEX idx_categories_slug ON public.categories USING btree (slug);

CREATE INDEX idx_collections_slug ON public.collections USING btree (slug);

alter table public."products" add constraint "products_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;

alter table public."products" add constraint "products_created_by_fkey" FOREIGN KEY (created_by) REFERENCES admin_users(id);

alter table public."products" add constraint "products_category_id_fkey" FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

alter table public."products" add constraint "products_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admin_users(id);

CREATE INDEX idx_products_slug ON public.products USING btree (slug);

CREATE INDEX idx_products_collection ON public.products USING btree (collection_id);

CREATE INDEX idx_products_status ON public.products USING btree (status);

CREATE INDEX idx_products_sale ON public.products USING btree (sale_price) WHERE (sale_price IS NOT NULL);

CREATE INDEX idx_products_featured ON public.products USING btree (is_featured) WHERE (is_featured = true);

CREATE INDEX idx_products_homepage ON public.products USING btree (show_on_homepage, homepage_position) WHERE (show_on_homepage = true);

CREATE INDEX idx_products_category ON public.products USING btree (category);

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);

CREATE INDEX idx_products_created_by ON public.products USING btree (created_by);

CREATE INDEX idx_products_length_guide_enabled ON public.products USING btree (((length_guide ->> 'enabled'::text))) WHERE (length_guide IS NOT NULL);

CREATE INDEX idx_products_with_length_guide ON public.products USING btree (id) WHERE (((length_guide ->> 'enabled'::text))::boolean = true);

alter table public."product_images" add constraint "product_images_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_product_images_product ON public.product_images USING btree (product_id);

alter table public."cart" add constraint "cart_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_cart_product ON public.cart USING btree (product_id);

CREATE INDEX idx_cart_user ON public.cart USING btree (user_id);

CREATE INDEX idx_cart_session ON public.cart USING btree (session_id);

alter table public."order_items" add constraint "order_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT;

alter table public."order_items" add constraint "order_items_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES product_variants(id);

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);

CREATE INDEX idx_order_items_product ON public.order_items USING btree (product_id);

alter table public."reviews" add constraint "reviews_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_reviews_product ON public.reviews USING btree (product_id);

alter table public."wishlist_items" add constraint "wishlist_items_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_wishlist_user ON public.wishlist_items USING btree (user_id);

CREATE INDEX idx_wishlist_session ON public.wishlist_items USING btree (session_id);

CREATE INDEX idx_admin_users_email ON public.admin_users USING btree (email);

CREATE INDEX idx_admin_users_role ON public.admin_users USING btree (role);

alter table public."product_variants" add constraint "product_variants_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_product_variants_sku ON public.product_variants USING btree (sku);

CREATE INDEX idx_product_variants_product ON public.product_variants USING btree (product_id);

CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at DESC);

CREATE INDEX idx_customers_email ON public.customers USING btree (email);

CREATE INDEX idx_discount_codes_code ON public.discount_codes USING btree (code);

CREATE INDEX idx_discount_codes_active ON public.discount_codes USING btree (is_active) WHERE (is_active = true);

alter table public."inventory_logs" add constraint "inventory_logs_admin_user_id_fkey" FOREIGN KEY (admin_user_id) REFERENCES admin_users(id);

alter table public."inventory_logs" add constraint "inventory_logs_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

alter table public."inventory_logs" add constraint "inventory_logs_variant_id_fkey" FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE;

CREATE INDEX idx_inventory_logs_product ON public.inventory_logs USING btree (product_id);

CREATE INDEX idx_inventory_logs_created ON public.inventory_logs USING btree (created_at DESC);

alter table public."activity_logs" add constraint "activity_logs_admin_user_id_fkey" FOREIGN KEY (admin_user_id) REFERENCES admin_users(id);

CREATE INDEX idx_activity_logs_admin ON public.activity_logs USING btree (admin_user_id);

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at DESC);

alter table public."site_settings" add constraint "site_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admin_users(id);

alter table public."collection_products" add constraint "collection_products_collection_id_fkey" FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

alter table public."collection_products" add constraint "collection_products_product_id_fkey" FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

CREATE INDEX idx_collection_products_collection ON public.collection_products USING btree (collection_id);

CREATE INDEX idx_collection_products_product ON public.collection_products USING btree (product_id);

alter table public."store_settings" add constraint "store_settings_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL;

CREATE INDEX idx_homepage_content_section_key ON public.homepage_content USING btree (section_key);

CREATE INDEX idx_homepage_content_is_active ON public.homepage_content USING btree (is_active);

alter table public."orders" add constraint "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id);

-- skipped (Supabase auth): orders.orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)

CREATE INDEX idx_orders_order_status ON public.orders USING btree (order_status);

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);

CREATE INDEX idx_orders_customer_email ON public.orders USING btree (customer_email);

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_custom_measurements(measurements jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Null is valid (no custom sizing)
  IF measurements IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check required fields exist
  IF NOT (
    measurements ? 'bust' AND
    measurements ? 'waist' AND
    measurements ? 'hips' AND
    measurements ? 'length'
  ) THEN
    RETURN FALSE;
  END IF;

  -- Check that required values are strings
  IF NOT (
    jsonb_typeof(measurements->'bust') = 'string' AND
    jsonb_typeof(measurements->'waist') = 'string' AND
    jsonb_typeof(measurements->'hips') = 'string' AND
    jsonb_typeof(measurements->'length') = 'string'
  ) THEN
    RETURN FALSE;
  END IF;

  -- Height is optional, but if present must be string
  IF measurements ? 'height' THEN
    IF jsonb_typeof(measurements->'height') != 'string' THEN
      RETURN FALSE;
    END IF;
  END IF;

  RETURN TRUE;
END;
$function$;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_content_updated_at BEFORE UPDATE ON public.homepage_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

create view public."customer_statistics" as SELECT count(*) AS total_customers,
    sum(total_orders) AS total_orders,
    sum(total_spent) AS total_revenue,
    avg(total_spent) AS average_customer_value
   FROM customers;
