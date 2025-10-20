-- DIAGNOSTIC CHECK - Run this first to see current database state
-- Copy the results and share them so we can create the correct migration

-- 1. Check all columns in series table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'series'
ORDER BY ordinal_position;

-- 2. Check all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check all columns in chapters table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chapters'
ORDER BY ordinal_position;

-- 4. Check if follows table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'follows'
) as follows_table_exists;

-- 5. Check storage buckets
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 6. Check constraints on series table
SELECT
    con.conname as constraint_name,
    con.contype as constraint_type,
    CASE con.contype
        WHEN 'c' THEN 'CHECK'
        WHEN 'f' THEN 'FOREIGN KEY'
        WHEN 'p' THEN 'PRIMARY KEY'
        WHEN 'u' THEN 'UNIQUE'
        ELSE con.contype::text
    END as type_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'series'
ORDER BY con.conname;

-- 7. Check indexes on series table
SELECT
    i.relname as index_name,
    a.attname as column_name,
    ix.indisprimary as is_primary,
    ix.indisunique as is_unique
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'series'
ORDER BY i.relname, a.attname;

-- 8. Check RLS policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies
WHERE tablename IN ('profiles', 'series', 'chapters', 'follows')
ORDER BY tablename, policyname;

-- 9. Sample data check - series table
SELECT 
    id,
    title,
    CASE 
        WHEN column_name = 'description' THEN 'HAS description COLUMN'
        WHEN column_name = 'synopsis' THEN 'HAS synopsis COLUMN'
        ELSE 'UNKNOWN'
    END as description_column_check
FROM series
CROSS JOIN (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'series' 
    AND column_name IN ('description', 'synopsis')
) AS cols
LIMIT 1;

-- 10. Count existing data
SELECT 
    (SELECT COUNT(*) FROM series) as total_series,
    (SELECT COUNT(*) FROM chapters) as total_chapters,
    (SELECT COUNT(*) FROM profiles) as total_profiles;
