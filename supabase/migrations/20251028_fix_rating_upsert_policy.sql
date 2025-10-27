-- Fix rating upsert RLS policy
-- The issue is that upsert requires both INSERT and UPDATE permissions
-- The current policies don't work well with Supabase's upsert operation

-- Drop existing rating policies
DROP POLICY IF EXISTS "Users can create ratings" ON ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON ratings;

-- Create combined policy for upsert (INSERT and UPDATE)
CREATE POLICY "Users can upsert own ratings"
  ON ratings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Or alternatively, use separate but more permissive policies
-- This approach is more explicit and recommended

DROP POLICY IF EXISTS "Users can upsert own ratings" ON ratings;

CREATE POLICY "Users can insert own ratings"
  ON ratings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the ratings table has the proper structure
-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ratings_updated_at ON ratings;
CREATE TRIGGER update_ratings_updated_at
    BEFORE UPDATE ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
