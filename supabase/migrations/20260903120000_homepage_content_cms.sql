/*
  # Homepage CMS content — RLS + table guard

  The storefront Homepage Manager stores one row per homepage section in
  `homepage_content` (`section_key` unique, editable shape in `content` jsonb).
  The new storefront homepage reads keys prefixed `home_` (e.g. `home_hero`);
  legacy rows are left untouched.

  1. Table
     - `homepage_content` created only if missing (it already exists in prod)

  2. Security
     - Public (anon) SELECT so the storefront can render from it
     - `authenticated` write (INSERT/UPDATE/DELETE) — admins sign in with
       Supabase Auth, so the admin app writes as `authenticated`
     - Adds the missing public SELECT on `store_settings`
*/

CREATE TABLE IF NOT EXISTS homepage_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "homepage_content_public_read" ON homepage_content;
CREATE POLICY "homepage_content_public_read"
  ON homepage_content FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "homepage_content_admin_write" ON homepage_content;
CREATE POLICY "homepage_content_admin_write"
  ON homepage_content FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- store_settings currently has no anon SELECT policy; the storefront needs to
-- read store name / currency / shipping thresholds anonymously.
DROP POLICY IF EXISTS "store_settings_public_read" ON store_settings;
CREATE POLICY "store_settings_public_read"
  ON store_settings FOR SELECT
  TO anon, authenticated
  USING (true);
