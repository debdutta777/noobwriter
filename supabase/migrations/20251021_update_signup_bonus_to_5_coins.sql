-- Update signup bonus from 100 to 5 coins
-- This migration updates the auto-create trigger to give 5 coins instead of 100

-- Update the function to handle new user signup with 5 coins
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

  -- Insert wallet with 5 free coins (updated from 100)
  INSERT INTO public.wallets (user_id, coin_balance, created_at, updated_at)
  VALUES (
    NEW.id,
    5, -- Updated: Give 5 free coins to new users (was 100)
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This only affects NEW users. Existing users keep their current balance.
