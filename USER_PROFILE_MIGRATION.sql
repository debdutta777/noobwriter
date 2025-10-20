-- User Profile & Settings Feature - Database Migrations

-- 1. Add missing columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Create username from email for existing users (if username doesn't exist)
UPDATE profiles
SET username = LOWER(SPLIT_PART(email, '@', 1))
WHERE username IS NULL AND email IS NOT NULL;

-- Add index on username for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 3. Create follows table for user following feature
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 4. RLS Policies for follows table

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can view follows
CREATE POLICY "Public can view follows"
ON follows FOR SELECT
TO public
USING (true);

-- Users can follow others
CREATE POLICY "Users can follow others"
ON follows FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
ON follows FOR DELETE
TO authenticated
USING (auth.uid() = follower_id);

-- 5. Update profiles RLS policies to allow public viewing

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Allow public to view profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for avatars bucket

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Verification queries

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND column_name IN ('username', 'bio', 'social_links', 'avatar_url')
ORDER BY column_name;

-- Check follows table
SELECT COUNT(*) as follows_count FROM follows;

-- Check storage buckets
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('covers', 'avatars');

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'follows')
ORDER BY tablename, policyname;
