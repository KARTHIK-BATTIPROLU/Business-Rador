-- Migration 002: Add Real-World Launch Date & Instagram Activity Tracking
-- Run via: npx supabase db push or execute in Supabase SQL Editor

-- 1. Ensure osm_id has a unique constraint for idempotent upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_osm_id'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT unique_osm_id UNIQUE (osm_id);
  END IF;
END $$;

-- 2. Add real-world launch intelligence & social velocity columns
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS actual_launch_date DATE,
  ADD COLUMN IF NOT EXISTS launch_source TEXT,
  ADD COLUMN IF NOT EXISTS instagram_first_post_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS instagram_post_count INTEGER,
  ADD COLUMN IF NOT EXISTS is_opening_soon BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS claimed_by_user TEXT; -- Teamwork multi-caller assignment

-- 3. Performance indexes for filtering by actual launch date & status
CREATE INDEX IF NOT EXISTS idx_businesses_actual_launch ON businesses(actual_launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_opening_soon ON businesses(is_opening_soon);
CREATE INDEX IF NOT EXISTS idx_businesses_ig_first_post ON businesses(instagram_first_post_at DESC);
