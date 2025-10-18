/*
  # Add Cloudinary Image Fields to Products Table

  1. Changes
    - Add `images` column (TEXT[] array) to store Cloudinary URLs
    - Add `image_public_ids` column (TEXT[] array) to store Cloudinary public IDs for deletion
    - Add `main_image` column (TEXT) to store the primary display image URL
    - These fields will replace the Supabase Storage implementation

  2. Notes
    - Existing products will have NULL values for these fields initially
    - The old `featured_image` field remains for backward compatibility
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    ALTER TABLE products ADD COLUMN images TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'image_public_ids'
  ) THEN
    ALTER TABLE products ADD COLUMN image_public_ids TEXT[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'main_image'
  ) THEN
    ALTER TABLE products ADD COLUMN main_image TEXT;
  END IF;
END $$;
