/*
  # Add Homepage Control Fields to Products

  1. New Columns
    - `show_on_homepage` - Boolean to control homepage visibility
    - `homepage_position` - Integer for ordering products on homepage
    - `homepage_section` - Text for which section to display in
    
  2. Notes
    - These fields enable the Homepage Manager feature
    - Admin can control exactly what appears on homepage
*/

DO $$
BEGIN
  -- Add show_on_homepage column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'show_on_homepage'
  ) THEN
    ALTER TABLE products ADD COLUMN show_on_homepage boolean DEFAULT false;
  END IF;

  -- Add homepage_position column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'homepage_position'
  ) THEN
    ALTER TABLE products ADD COLUMN homepage_position integer DEFAULT 0;
  END IF;

  -- Add homepage_section column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'homepage_section'
  ) THEN
    ALTER TABLE products ADD COLUMN homepage_section text DEFAULT 'featured';
  END IF;
END $$;

-- Create index for homepage queries
CREATE INDEX IF NOT EXISTS idx_products_homepage ON products(show_on_homepage, homepage_position) WHERE show_on_homepage = true;
