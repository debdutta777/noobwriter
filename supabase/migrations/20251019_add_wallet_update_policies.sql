-- Add missing RLS policies for wallets and transactions

-- Allow users to update their own wallet
CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert transactions (for purchases, etc.)
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT UPDATE ON wallets TO authenticated;
GRANT INSERT ON transactions TO authenticated;
