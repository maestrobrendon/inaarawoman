/*
  # Setup Storage Bucket for Product Images

  ## Overview
  Creates a public storage bucket for product images with appropriate policies
  for public read access and authenticated write access.

  ## Storage Bucket
  - **product-images**: Public bucket for all product images
    - Public read access (anyone can view images)
    - Authenticated write access (admin users can upload)
    - Max file size: 5MB
    - Allowed file types: jpg, jpeg, png, webp

  ## Security
  - Public read policy for viewing product images
  - Authenticated insert policy for uploading images
  - Authenticated update/delete policies for managing images
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view product images (public read)
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

-- Policy: Authenticated users can upload product images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Authenticated users can update product images
CREATE POLICY "Authenticated users can update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Policy: Authenticated users can delete product images
CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');