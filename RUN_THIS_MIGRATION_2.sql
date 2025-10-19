-- IMPORTANT: Run this in Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql

-- ============================================
-- PART 1: Add missing RLS policies (safe to run multiple times)
-- ============================================

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can create own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can unlock chapters" ON chapter_unlocks;
DROP POLICY IF EXISTS "Users can view own unlocks" ON chapter_unlocks;

-- Allow users to update their own wallet (needed for coin purchases)
CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert transactions (needed for purchases, unlocks, etc.)
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to insert chapter unlocks (needed for unlocking chapters)
CREATE POLICY "Users can unlock chapters"
    ON chapter_unlocks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their unlocked chapters
CREATE POLICY "Users can view own unlocks"
    ON chapter_unlocks FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- PART 2: Verify policies are active
-- ============================================

-- Check all wallet policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'wallets'
ORDER BY cmd;

-- Check all transaction policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'transactions'
ORDER BY cmd;

-- Check chapter_unlocks policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'chapter_unlocks'
ORDER BY cmd;

-- ============================================
-- Expected output:
-- ============================================
-- Wallets should have:
--   1. "Users can view own wallet" (SELECT)
--   2. "Users can update own wallet" (UPDATE) <- NEW
--
-- Transactions should have:
--   1. "Users can view own transactions" (SELECT)
--   2. "Users can create own transactions" (INSERT) <- NEW
--
-- Chapter_unlocks should have:
--   1. "Users can view own unlocks" (SELECT) <- NEW
--   2. "Users can unlock chapters" (INSERT) <- NEW
-- ============================================
