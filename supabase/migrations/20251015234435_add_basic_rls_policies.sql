/*
  # Add Basic RLS Policies
  
  Simple policies without complex conditions
*/

-- Product Images
CREATE POLICY "product_images_admin" ON product_images FOR ALL TO authenticated USING (true);
CREATE POLICY "product_images_public" ON product_images FOR SELECT TO anon USING (true);

-- Product Variants
CREATE POLICY "product_variants_admin" ON product_variants FOR ALL TO authenticated USING (true);
CREATE POLICY "product_variants_public" ON product_variants FOR SELECT TO anon USING (true);

-- Customers
CREATE POLICY "customers_admin" ON customers FOR ALL TO authenticated USING (true);

-- Orders
CREATE POLICY "orders_admin" ON orders FOR ALL TO authenticated USING (true);

-- Order Items
CREATE POLICY "order_items_admin" ON order_items FOR ALL TO authenticated USING (true);

-- Collections
CREATE POLICY "collections_admin" ON collections FOR ALL TO authenticated USING (true);
CREATE POLICY "collections_public" ON collections FOR SELECT TO anon USING (true);

-- Collection Products
CREATE POLICY "collection_products_admin" ON collection_products FOR ALL TO authenticated USING (true);
CREATE POLICY "collection_products_public" ON collection_products FOR SELECT TO anon USING (true);

-- Inventory Logs
CREATE POLICY "inventory_logs_admin" ON inventory_logs FOR ALL TO authenticated USING (true);

-- Store Settings
CREATE POLICY "store_settings_admin" ON store_settings FOR ALL TO authenticated USING (true);

-- Shipping Zones
CREATE POLICY "shipping_zones_admin" ON shipping_zones FOR ALL TO authenticated USING (true);
CREATE POLICY "shipping_zones_public" ON shipping_zones FOR SELECT TO anon USING (true);

-- Email Templates
CREATE POLICY "email_templates_admin" ON email_templates FOR ALL TO authenticated USING (true);
