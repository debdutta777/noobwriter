-- Migration: Auto-create profile and wallet for new users
-- This ensures every authenticated user has a profile and wallet record

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert wallet
  INSERT INTO public.wallets (user_id, coin_balance, created_at, updated_at)
  VALUES (
    NEW.id,
    100, -- Give 100 free coins to new users
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Backfill existing users (if any don't have profiles/wallets)
INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', email),
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (user_id, coin_balance, created_at, updated_at)
SELECT 
  id,
  100,
  created_at,
  NOW()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.wallets)
ON CONFLICT (user_id) DO NOTHING;
