# Database Guide - NoobWriter

Complete database schema, migrations, and management guide.

---

## 📋 Current Schema

### Core Tables

#### profiles
```sql
id              UUID PRIMARY KEY (references auth.users)
email           TEXT NOT NULL UNIQUE
username        TEXT UNIQUE
display_name    TEXT
avatar_url      TEXT
bio             TEXT
role            TEXT ('reader', 'writer', 'admin')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### series
```sql
id                UUID PRIMARY KEY
author_id         UUID (references profiles)
title             TEXT NOT NULL
cover_url         TEXT
content_type      TEXT ('novel', 'manga')
status            TEXT ('ongoing', 'completed', 'hiatus')
genres            TEXT[]
total_chapters    INTEGER
total_views       INTEGER
average_rating    DECIMAL
is_published      BOOLEAN
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### chapters
```sql
id              UUID PRIMARY KEY
series_id       UUID (references series)
chapter_number  INTEGER NOT NULL
title           TEXT NOT NULL
content         TEXT
is_premium      BOOLEAN
coin_price      INTEGER
is_published    BOOLEAN
view_count      INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### wallets
```sql
id              UUID PRIMARY KEY
user_id         UUID UNIQUE (references profiles)
coin_balance    INTEGER DEFAULT 0
total_earned    DECIMAL
total_spent     DECIMAL
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### transactions
```sql
id                  UUID PRIMARY KEY
user_id             UUID (references profiles)
type                TEXT (see Transaction Types below)
amount              DECIMAL
coin_amount         INTEGER
description         TEXT
payment_status      TEXT ('pending', 'completed', 'failed', 'refunded', 'cancelled')
metadata            JSONB
created_at          TIMESTAMP
```

#### favorites
```sql
id          UUID PRIMARY KEY
user_id     UUID (references profiles)
series_id   UUID (references series)
created_at  TIMESTAMP
UNIQUE(user_id, series_id)
```

#### reading_progress
```sql
id                    UUID PRIMARY KEY
user_id               UUID (references profiles)
chapter_id            UUID (references chapters)
series_id             UUID (references series)
progress_percentage   INTEGER
last_read_at          TIMESTAMP
created_at            TIMESTAMP
UNIQUE(user_id, chapter_id)
```

#### chapter_unlocks
```sql
id          UUID PRIMARY KEY
user_id     UUID (references profiles)
chapter_id  UUID (references chapters)
created_at  TIMESTAMP
UNIQUE(user_id, chapter_id)
```

---

## 🔐 Transaction Types

### Current (After Migration)
```sql
type IN (
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
)
```

---

## 🚀 Pending Migrations

### ⚠️ CRITICAL: Transaction Types Constraint

**File**: `supabase/migrations/20251021_add_transaction_types.sql`

**Why**: Code uses `tip_sent`, `tip_received`, `payout_request` but database only allows `purchase`, `unlock`, `tip`, `earning`, `refund`

**Impact**: Tips and payouts will CRASH without this migration!

**Apply Now**:
```sql
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
  'purchase',
  'unlock',
  'tip',
  'tip_sent',
  'tip_received',
  'earning',
  'refund',
  'payout_request',
  'payout_completed',
  'payout_rejected'
));

CREATE INDEX IF NOT EXISTS idx_transactions_type_payout 
ON transactions(user_id, type) 
WHERE type IN ('payout_request', 'payout_completed', 'payout_rejected');
```

### Signup Bonus Update

**File**: `supabase/migrations/20251021_update_signup_bonus_to_5_coins.sql`

**Why**: Database trigger gives 100 coins, but code now gives 5 coins

**Apply Now**:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, coin_balance, created_at, updated_at)
  VALUES (
    NEW.id,
    5, -- Updated from 100
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📝 How to Apply Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Copy SQL from migration file
5. Paste and click **Run**
6. Verify no errors

### Option 2: Supabase CLI

```bash
# Initialize Supabase if not done
npx supabase init

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push

# Or apply specific migration
npx supabase migration up
```

### Option 3: Direct PostgreSQL Connection

Connect to your Supabase PostgreSQL database using connection string from dashboard and run SQL directly.

---

## 🔍 Verify Migrations

### Check Transaction Types
```sql
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'transactions_type_check';
```

### Check Signup Bonus Function
```sql
SELECT 
  proname, 
  prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

Should show `coin_balance: 5` in the function body.

### Test Tip Transaction
```sql
-- Should NOT error
INSERT INTO transactions (user_id, type, amount, coin_amount, description, payment_status)
VALUES (
  'your-user-id',
  'tip_sent',
  10,
  -10,
  'Test tip',
  'completed'
);
```

---

## 🗂️ All Migrations (In Order)

1. `20241019_initial_schema.sql` - Initial database setup
2. `20251019_add_analytics_comments.sql` - Analytics tracking
3. `20251019_add_analytics_comments_fixed.sql` - Fixed version
4. `20251019_add_wallet_update_policies.sql` - RLS policies for wallets
5. `20251019_auto_create_user_records.sql` - Auto-create profile & wallet trigger
6. `20251021_add_transaction_types.sql` - **⚠️ APPLY THIS NOW**
7. `20251021_update_signup_bonus_to_5_coins.sql` - **⚠️ APPLY THIS NOW**
8. `create_stats_functions.sql` - Stats aggregation functions
9. `create_stats_tracking_tables.sql` - Analytics tables
10. `fix_chapters_rls_policies.sql` - Chapter access policies

---

## 🛠️ Useful Queries

### Check User Wallet Balance
```sql
SELECT 
  p.display_name,
  w.coin_balance,
  w.total_earned,
  w.total_spent
FROM profiles p
JOIN wallets w ON w.user_id = p.id
WHERE p.email = 'user@example.com';
```

### View Recent Transactions
```sql
SELECT 
  t.id,
  p.display_name,
  t.type,
  t.coin_amount,
  t.description,
  t.payment_status,
  t.created_at
FROM transactions t
JOIN profiles p ON p.id = t.user_id
ORDER BY t.created_at DESC
LIMIT 20;
```

### Check Pending Payouts
```sql
SELECT 
  t.id,
  p.display_name,
  p.email,
  t.coin_amount,
  t.amount as inr_amount,
  t.created_at
FROM transactions t
JOIN profiles p ON p.id = t.user_id
WHERE t.type = 'payout_request'
  AND t.payment_status = 'pending'
ORDER BY t.created_at ASC;
```

### User Library Stats
```sql
SELECT 
  p.display_name,
  COUNT(DISTINCT f.series_id) as favorites_count,
  COUNT(DISTINCT rp.chapter_id) as chapters_read,
  COUNT(DISTINCT cu.chapter_id) as premium_unlocked
FROM profiles p
LEFT JOIN favorites f ON f.user_id = p.id
LEFT JOIN reading_progress rp ON rp.user_id = p.id
LEFT JOIN chapter_unlocks cu ON cu.user_id = p.id
WHERE p.email = 'user@example.com'
GROUP BY p.id, p.display_name;
```

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **profiles**: Public read, user can update own
- **series**: Public read if published, author can update own
- **chapters**: Public read if published, author can update own
- **wallets**: User can read own only
- **transactions**: User can read own only
- **favorites**: User can manage own only
- **reading_progress**: User can manage own only

---

## 📊 Indexes

Performance indexes on:
- `series.author_id`
- `chapters.series_id`
- `transactions.user_id`
- `transactions(user_id, type)` for payouts
- `favorites.user_id`
- `reading_progress.user_id`

---

## 🔧 Database Functions

### `handle_new_user()`
Trigger function that auto-creates profile and wallet when user signs up.

### `update_series_stats()`
Trigger function that updates series total_chapters count when chapters are added/updated.

### `add_coins_to_wallet(p_user_id, p_coins)`
Function to safely add coins to wallet.

### `deduct_coins_from_wallet(p_user_id, p_coins)`
Function to safely deduct coins with balance check.

---

## 📞 Support

If migrations fail:
1. Check Supabase logs in dashboard
2. Verify constraint names match
3. Check for existing data that violates new constraints
4. Rollback and fix data first if needed

---

Last Updated: October 21, 2025
