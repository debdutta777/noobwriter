-- Atomic wallet operations to prevent race conditions
-- This ensures all wallet updates are atomic and safe from double-spending

-- Function to atomically deduct coins from a wallet
-- Returns the new balance or raises an exception if insufficient funds
CREATE OR REPLACE FUNCTION deduct_coins(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Atomic update with balance check
  UPDATE wallets
  SET coin_balance = coin_balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id
    AND coin_balance >= p_amount  -- Ensures sufficient balance
  RETURNING coin_balance INTO v_new_balance;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    -- Check if wallet exists
    IF NOT EXISTS (SELECT 1 FROM wallets WHERE user_id = p_user_id) THEN
      RAISE EXCEPTION 'Wallet not found';
    ELSE
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;
  
  RETURN v_new_balance;
END;
$$;

-- Function to atomically add coins to a wallet
-- Creates wallet if it doesn't exist
CREATE OR REPLACE FUNCTION add_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_add_to_earned BOOLEAN DEFAULT FALSE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Try to update existing wallet
  IF p_add_to_earned THEN
    UPDATE wallets
    SET coin_balance = coin_balance + p_amount,
        total_earned = total_earned + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING coin_balance INTO v_new_balance;
  ELSE
    UPDATE wallets
    SET coin_balance = coin_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING coin_balance INTO v_new_balance;
  END IF;
  
  -- If wallet doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO wallets (user_id, coin_balance, total_earned, total_spent)
    VALUES (
      p_user_id,
      p_amount,
      CASE WHEN p_add_to_earned THEN p_amount ELSE 0 END,
      0
    )
    RETURNING coin_balance INTO v_new_balance;
  END IF;
  
  RETURN v_new_balance;
END;
$$;

-- Atomic tip processing function
-- Ensures all operations succeed or all fail (transaction safety)
CREATE OR REPLACE FUNCTION process_tip(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount INTEGER,
  p_series_id UUID DEFAULT NULL,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_sender_balance INTEGER,
  new_recipient_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance INTEGER;
  v_recipient_balance INTEGER;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Invalid tip amount'::TEXT;
    RETURN;
  END IF;
  
  IF p_sender_id = p_recipient_id THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Cannot tip yourself'::TEXT;
    RETURN;
  END IF;
  
  -- Begin atomic operations (function is already in a transaction)
  
  -- Deduct from sender (will fail if insufficient balance)
  BEGIN
    v_sender_balance := deduct_coins(p_sender_id, p_amount);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT FALSE, 0, 0, SQLERRM::TEXT;
      RETURN;
  END;
  
  -- Add to recipient (creates wallet if needed)
  BEGIN
    v_recipient_balance := add_coins(p_recipient_id, p_amount, TRUE);
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback will happen automatically
      RAISE;
  END;
  
  -- Create transaction records
  INSERT INTO transactions (user_id, type, amount, coin_amount, description, payment_status, metadata)
  VALUES 
    (
      p_sender_id, 
      'tip', 
      -p_amount, 
      -p_amount, 
      'Tip sent to author', 
      'completed',
      jsonb_build_object(
        'recipient_id', p_recipient_id,
        'series_id', p_series_id,
        'chapter_id', p_chapter_id,
        'direction', 'sent'
      )
    ),
    (
      p_recipient_id,
      'tip',
      p_amount,
      p_amount,
      'Tip received from reader',
      'completed',
      jsonb_build_object(
        'sender_id', p_sender_id,
        'series_id', p_series_id,
        'chapter_id', p_chapter_id,
        'direction', 'received'
      )
    );
  
  -- Return success
  RETURN QUERY SELECT TRUE, v_sender_balance, v_recipient_balance, NULL::TEXT;
END;
$$;

-- Atomic chapter unlock function
CREATE OR REPLACE FUNCTION unlock_premium_chapter(
  p_user_id UUID,
  p_chapter_id UUID,
  p_author_id UUID,
  p_price INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  new_user_balance INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_balance INTEGER;
  v_author_balance INTEGER;
  v_already_unlocked BOOLEAN;
BEGIN
  -- Check if already unlocked
  SELECT EXISTS(
    SELECT 1 FROM chapter_unlocks 
    WHERE user_id = p_user_id AND chapter_id = p_chapter_id
  ) INTO v_already_unlocked;
  
  IF v_already_unlocked THEN
    RETURN QUERY SELECT FALSE, 0, 'Chapter already unlocked'::TEXT;
    RETURN;
  END IF;
  
  -- Validate price
  IF p_price <= 0 THEN
    RETURN QUERY SELECT FALSE, 0, 'Invalid price'::TEXT;
    RETURN;
  END IF;
  
  -- Deduct from user
  BEGIN
    v_user_balance := deduct_coins(p_user_id, p_price);
  EXCEPTION
    WHEN OTHERS THEN
      RETURN QUERY SELECT FALSE, 0, SQLERRM::TEXT;
      RETURN;
  END;
  
  -- Add to author
  BEGIN
    v_author_balance := add_coins(p_author_id, p_price, TRUE);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE; -- Will trigger rollback
  END;
  
  -- Create unlock record
  INSERT INTO chapter_unlocks (user_id, chapter_id)
  VALUES (p_user_id, p_chapter_id);
  
  -- Create transaction records
  INSERT INTO transactions (user_id, type, amount, coin_amount, description, payment_status, metadata)
  VALUES 
    (
      p_user_id,
      'unlock',
      -p_price,
      -p_price,
      'Chapter unlocked',
      'completed',
      jsonb_build_object('chapter_id', p_chapter_id, 'author_id', p_author_id)
    ),
    (
      p_author_id,
      'earning',
      p_price,
      p_price,
      'Chapter unlock earning',
      'completed',
      jsonb_build_object('chapter_id', p_chapter_id, 'user_id', p_user_id)
    );
  
  RETURN QUERY SELECT TRUE, v_user_balance, NULL::TEXT;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION deduct_coins TO authenticated;
GRANT EXECUTE ON FUNCTION add_coins TO authenticated;
GRANT EXECUTE ON FUNCTION process_tip TO authenticated;
GRANT EXECUTE ON FUNCTION unlock_premium_chapter TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION deduct_coins IS 'Atomically deduct coins from a wallet with balance check';
COMMENT ON FUNCTION add_coins IS 'Atomically add coins to a wallet, creating it if necessary';
COMMENT ON FUNCTION process_tip IS 'Atomically process a tip transaction with full rollback support';
COMMENT ON FUNCTION unlock_premium_chapter IS 'Atomically unlock a premium chapter and transfer coins';
