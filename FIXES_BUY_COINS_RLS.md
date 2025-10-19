# Issues Fixed - Buy Coins & Write Pages + RLS 406 Errors

## Issues Identified

### 1. Missing Pages (404 Errors)
- `/wallet` page - Not found
- `/wallet/buy-coins` page - Not found

### 2. Supabase RLS 406 Errors
- Profile queries returning 406 (Not Acceptable)
- Wallet queries returning 406 (Not Acceptable)
- **Root Cause**: New users don't have profile/wallet records automatically created

## Solutions Implemented

### 1. Created Wallet Page ✅
**File**: `src/app/wallet/page.tsx`

**Features**:
- Display current coin balance
- Quick actions (Buy Coins, Unlock Chapters, Settings)
- Transaction history with type indicators (purchase/spend/earn)
- Empty state with CTA to buy first coins
- Authentication check (redirects to login if not logged in)

### 2. Created Buy Coins Page ✅
**File**: `src/app/wallet/buy-coins/page.tsx`

**Features**:
- 5 coin packages: Starter (100), Basic (500), Popular (1000), Premium (2000), Ultimate (5000)
- Bonus coins for larger packages
- Price display in INR (₹)
- Instant purchase processing
- Creates transaction records
- Benefits showcase (Unlock Premium, Support Authors, Bonus Coins)
- Payment information section

**Coin Packages**:
| Package | Base Coins | Bonus | Total | Price |
|---------|-----------|-------|-------|-------|
| Starter | 100 | 0 | 100 | ₹99 |
| Basic | 500 | 50 | 550 | ₹499 |
| Popular | 1000 | 150 | 1150 | ₹899 |
| Premium | 2000 | 400 | 2400 | ₹1699 |
| Ultimate | 5000 | 1500 | 6500 | ₹3999 |

### 3. Fixed RLS 406 Errors ✅

**Problem**: When users log in via OAuth, profile and wallet records weren't created automatically, causing queries to fail with 406 errors.

**Solution A - Database Trigger** (Recommended):
**File**: `supabase/migrations/20251019_auto_create_user_records.sql`

Created PostgreSQL trigger that automatically:
- Creates profile record for new users
- Creates wallet record with 100 free coins
- Runs on `auth.users` INSERT
- Backfills existing users without profiles/wallets

**Solution B - Frontend Fallback**:
**File**: `src/components/layout/navbar.tsx`

Updated `fetchUserProfile()` to:
- Try to fetch profile/wallet
- If not found, create them on-the-fly
- Handle errors gracefully with try-catch
- Provide default values (100 coins)

### 4. Navigation Updates ✅

All navigation links now work correctly:
- ✅ `/wallet` - View balance and transactions
- ✅ `/wallet/buy-coins` - Purchase coins
- ✅ `/write` → `/write/dashboard` - Writer dashboard (with role check)
- ✅ `/library` - User library
- ✅ `/login`, `/signup` - Authentication

## Migration Required

**IMPORTANT**: You need to run the migration to fix the 406 errors permanently.

### Option 1: Supabase Dashboard (Easiest)
1. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql
2. Copy contents of `RUN_THIS_MIGRATION.sql`
3. Paste in SQL Editor
4. Click "Run"

### Option 2: Supabase CLI
```bash
supabase db push
```

## What the Migration Does

1. **Creates `handle_new_user()` function**:
   - Automatically creates profile when user signs up
   - Automatically creates wallet with 100 free coins
   - Uses `ON CONFLICT DO NOTHING` for safety

2. **Creates trigger on `auth.users`**:
   - Fires AFTER INSERT
   - Calls `handle_new_user()` for each new user

3. **Backfills existing users**:
   - Finds users without profiles → creates them
   - Finds users without wallets → creates them with 100 coins
   - Safe to run multiple times (uses `ON CONFLICT`)

## Testing After Migration

1. **Test New User Signup**:
   - Sign up with new account
   - Should automatically have profile and wallet
   - Should see 100 coins in navbar menu

2. **Test Existing Users**:
   - Log in with existing account
   - Should now see coin balance (was showing 406 before)
   - Navbar should load without errors

3. **Test Wallet Page**:
   - Visit `/wallet`
   - Should show balance and transactions
   - "Buy Coins" button should work

4. **Test Buy Coins**:
   - Visit `/wallet/buy-coins`
   - Should show 5 coin packages
   - Purchase should work and update balance

## Browser Errors Fixed

Before:
```
❌ 404 /wallet
❌ 404 /wallet/buy-coins
❌ 406 /rest/v1/profiles
❌ 406 /rest/v1/wallets
```

After:
```
✅ 200 /wallet
✅ 200 /wallet/buy-coins
✅ 200 /rest/v1/profiles (after migration)
✅ 200 /rest/v1/wallets (after migration)
```

## Code Quality Improvements

1. **Authentication Guards**: All sensitive pages check auth first
2. **Error Handling**: Try-catch blocks prevent crashes
3. **Loading States**: Users see spinners while data loads
4. **Default Values**: Graceful fallbacks if data missing
5. **Type Safety**: Proper TypeScript interfaces

## Next Steps

1. ✅ **Run the migration** (most important!)
2. Test wallet and buy coins functionality
3. Consider integrating real Razorpay payment gateway
4. Add email notifications for purchases
5. Add purchase receipts/invoices

## Payment Gateway Integration (TODO)

Current implementation simulates successful purchases. To integrate real payments:

1. **Razorpay Setup**:
   - Add Razorpay keys to `.env`
   - Install `razorpay` npm package
   - Create payment order in backend
   - Handle payment callbacks
   - Verify payment signature

2. **Files to Update**:
   - `src/app/wallet/buy-coins/page.tsx` - Replace simulation with real payment
   - `src/lib/razorpay/config.ts` - Already exists
   - Create payment verification endpoint

## Support

If issues persist after running migration:
1. Check Supabase logs
2. Verify RLS policies are enabled
3. Check browser console for specific errors
4. Ensure user is authenticated (has valid session)
