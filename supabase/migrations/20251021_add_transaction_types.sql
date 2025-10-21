-- CRITICAL: Add new transaction types for tips and payouts
-- This migration extends the transaction types constraint to support:
-- - tip_sent/tip_received (for tipping system)
-- - payout_request/payout_completed/payout_rejected (for writer payouts)

-- Remove old constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Add updated constraint with new types
ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
  'purchase',         -- User purchases coins
  'unlock',           -- User unlocks premium chapter
  'tip',              -- Generic tip (legacy)
  'tip_sent',         -- User sent a tip to author
  'tip_received',     -- Author received a tip
  'earning',          -- Author earning from chapter unlocks
  'refund',           -- Refund of transaction
  'payout_request',   -- Writer requested payout (pending)
  'payout_completed', -- Payout was processed successfully
  'payout_rejected'   -- Payout was rejected
));

-- Create index for faster querying of payout transactions
CREATE INDEX IF NOT EXISTS idx_transactions_type_payout 
ON transactions(user_id, type) 
WHERE type IN ('payout_request', 'payout_completed', 'payout_rejected');

-- Add comment for documentation
COMMENT ON CONSTRAINT transactions_type_check ON transactions IS 
'Transaction types: purchase, unlock, tip, tip_sent, tip_received, earning, refund, payout_request, payout_completed, payout_rejected';
