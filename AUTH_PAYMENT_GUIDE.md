# Authentication & Payment Integration Guide

## Overview
This document describes the complete authentication, premium content unlock, and coin purchase system integrated with Supabase database and Razorpay payments.

## Features Implemented

### 1. Authentication System ✅

#### Login & Signup Pages
- **Location**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`
- **Features**:
  - Email/password authentication
  - Google OAuth integration
  - Form validation with error display
  - Automatic redirect to dashboard after login
  - Welcome bonus (100 coins) for new users

#### Auth Actions
- **Location**: `src/app/(auth)/actions.ts`
- **Functions**:
  - `signUp()`: Creates user account, profile, and wallet
  - `signIn()`: Email/password login
  - `signOut()`: Logout user
  - `signInWithGoogle()`: Google OAuth flow

#### OAuth Callback Handler
- **Location**: `src/app/auth/callback/route.ts`
- **Purpose**: Handles OAuth redirects from Google
- **Actions**:
  - Exchange authorization code for session
  - Create profile and wallet for new OAuth users
  - Redirect to library page

### 2. Premium Content Unlock System ✅

#### Unlock Modal Component
- **Location**: `src/components/modals/unlock-premium-modal.tsx`
- **Features**:
  - Shows chapter details and coin cost
  - Displays user's current coin balance
  - Handles unlock confirmation
  - Shows insufficient coins warning
  - Success animation after unlock
  - Automatic page reload after unlock

#### Unlock Actions
- **Location**: `src/app/actions/unlock-actions.ts`
- **Functions**:
  - `unlockChapter()`: Process chapter unlock transaction
    - Validates user authentication
    - Checks coin balance
    - Prevents duplicate unlocks
    - Deducts coins from wallet
    - Creates unlock record
    - Records transaction history
    - Includes rollback on failure
  - `checkChapterUnlocked()`: Check if chapter is already unlocked

#### Integration with Chapter Reader
- **Location**: `src/app/read/[seriesId]/[chapterNumber]/page.tsx`
- **Changes**:
  - Added `UnlockPremiumModal` component
  - Shows modal when user clicks "Unlock Chapter"
  - Displays user's coin balance
  - Link to coin purchase page

### 3. Coin Purchase System ✅

#### Coin Purchase Page
- **Location**: `src/app/coins/purchase/page.tsx`
- **Features**:
  - 5 coin packages with different prices
  - Bonus coins for larger packages
  - Popular and Best Value badges
  - Visual package selection
  - Real-time balance display
  - Razorpay payment integration
  - Payment success redirect

#### Coin Packages
```javascript
{
  id: 'starter',
  coins: 100,
  price: 99,
  bonus: 0
},
{
  id: 'basic',
  coins: 500,
  price: 449,
  bonus: 50
},
{
  id: 'popular',
  coins: 1000,
  price: 849,
  bonus: 150,
  popular: true
},
{
  id: 'premium',
  coins: 2000,
  price: 1599,
  bonus: 400
},
{
  id: 'ultimate',
  coins: 5000,
  price: 3799,
  bonus: 1200,
  bestValue: true
}
```

#### Coin Actions
- **Location**: `src/app/actions/coin-actions.ts`
- **Functions**:
  - `getUserWallet()`: Fetch user's wallet and balance
  - `createCoinPurchase()`: Create Razorpay order for coin purchase
  - `verifyPayment()`: Verify Razorpay payment signature and process coins
    - Validates payment signature using HMAC SHA256
    - Updates payment status
    - Adds coins to user wallet
    - Records transaction in database

#### Payment Verification API
- **Location**: `src/app/api/payment/verify/route.ts`
- **Purpose**: Handles payment verification callback from frontend
- **Security**: Validates Razorpay signature before processing

## Database Integration

### Tables Used

#### 1. profiles
- Stores user profile information
- Created automatically on signup
- Fields: id, email, display_name, avatar_url, role

#### 2. wallets
- Stores user coin balances
- Created automatically on signup with 100 coin welcome bonus
- Fields: user_id, coin_balance

#### 3. unlocked_chapters
- Tracks which chapters users have unlocked
- Prevents duplicate purchases
- Fields: user_id, chapter_id, unlocked_at

#### 4. transactions
- Records all coin transactions (purchases and unlocks)
- Fields: user_id, amount, transaction_type, description, status

#### 5. payments
- Stores Razorpay payment records
- Fields: user_id, amount, payment_method, razorpay_order_id, razorpay_payment_id, razorpay_signature, status

## Razorpay Integration

### Configuration
Environment variables in `.env`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RVMUo3Od2yyAPT
RAZORPAY_KEY_SECRET=xBKdz1p1ktEJ22jTrzo5rFFI
```

### Payment Flow
1. User selects coin package on `/coins/purchase`
2. Frontend calls `createCoinPurchase()` server action
3. Server creates Razorpay order with order notes (user_id, coins)
4. Razorpay checkout modal opens on frontend
5. User completes payment
6. Payment handler calls `/api/payment/verify`
7. Server verifies signature and processes coins
8. User redirected to library with success message

### Security Features
- Server-side signature verification using HMAC SHA256
- Payment status tracking in database
- Transaction rollback on failure
- Prevents duplicate processing

## User Flows

### New User Registration Flow
1. User visits `/auth/signup`
2. Enters email, password, display name
3. Or clicks "Continue with Google"
4. Profile created in Supabase Auth
5. Profile record created in `profiles` table
6. Wallet created with 100 welcome bonus coins
7. Redirected to `/library`

### Login Flow
1. User visits `/auth/login`
2. Enters email and password
3. Or clicks "Continue with Google"
4. Authenticated via Supabase Auth
5. Redirected to `/library`

### Premium Chapter Unlock Flow
1. User encounters locked chapter on reader page
2. Clicks "Unlock Chapter" button
3. Modal shows chapter cost and user balance
4. If sufficient coins:
   - User confirms unlock
   - Coins deducted from wallet
   - Chapter unlocked permanently
   - Page reloads to show content
5. If insufficient coins:
   - "Buy More Coins" button shown
   - Redirects to `/coins/purchase`

### Coin Purchase Flow
1. User visits `/coins/purchase`
2. Views available packages with bonuses
3. Selects desired package
4. Clicks "Purchase" button
5. Razorpay checkout modal opens
6. User completes payment
7. Payment verified on backend
8. Coins added to wallet
9. Transaction recorded
10. Redirected to library with success message

## Testing

### Test Credentials
**Supabase**: Already configured in `.env`

**Razorpay Test Mode**: 
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- Test payments won't charge real money

### Manual Testing Checklist

#### Authentication
- [ ] Sign up with email/password creates profile and wallet
- [ ] Login with email/password works
- [ ] Google OAuth creates profile and wallet
- [ ] Error messages display correctly
- [ ] Redirects work after auth

#### Premium Unlock
- [ ] Locked chapters show lock overlay
- [ ] Unlock modal opens with correct info
- [ ] Sufficient coins allows unlock
- [ ] Insufficient coins shows warning
- [ ] Unlock processes correctly
- [ ] Balance updates after unlock
- [ ] Chapter stays unlocked after reload

#### Coin Purchase
- [ ] All packages display correctly
- [ ] Package selection works
- [ ] Balance shows correctly
- [ ] Razorpay modal opens
- [ ] Payment processes successfully
- [ ] Coins added to wallet
- [ ] Transaction recorded
- [ ] Redirect works after payment

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx           # Login page
│   │   ├── signup/page.tsx          # Signup page
│   │   └── actions.ts               # Auth server actions
│   ├── auth/
│   │   └── callback/route.ts        # OAuth callback handler
│   ├── actions/
│   │   ├── unlock-actions.ts        # Chapter unlock logic
│   │   └── coin-actions.ts          # Coin purchase logic
│   ├── api/
│   │   └── payment/
│   │       └── verify/route.ts      # Payment verification API
│   ├── coins/
│   │   └── purchase/page.tsx        # Coin purchase page
│   └── read/
│       └── [seriesId]/
│           └── [chapterNumber]/page.tsx  # Chapter reader (updated)
└── components/
    └── modals/
        └── unlock-premium-modal.tsx # Unlock modal component
```

## Next Steps

### Recommended Enhancements
1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement forgot password functionality
3. **Wallet History**: Show detailed transaction history on library page
4. **Refund System**: Handle payment refunds through Razorpay
5. **Webhooks**: Add Razorpay webhooks for better payment tracking
6. **Daily Rewards**: Implement daily login coin rewards
7. **Subscription Plans**: Add monthly subscription options
8. **Gift Coins**: Allow users to gift coins to others
9. **Coin Expiry**: Add expiry dates for promotional coins
10. **Purchase Receipts**: Send email receipts for purchases

### Database Optimizations
1. Add indexes on frequently queried fields
2. Implement read replicas for better performance
3. Add database triggers for wallet updates
4. Set up automatic backups

### Security Enhancements
1. Rate limiting on auth endpoints
2. CAPTCHA for signup
3. Two-factor authentication
4. Payment fraud detection
5. Webhook signature verification

## Troubleshooting

### Common Issues

**OAuth Redirect Not Working**
- Check `NEXT_PUBLIC_APP_URL` in `.env`
- Verify OAuth redirect URL in Supabase dashboard
- Ensure callback route exists at `/auth/callback`

**Payment Verification Failing**
- Verify `RAZORPAY_KEY_SECRET` is correct
- Check signature generation logic
- Review Razorpay dashboard for payment status

**Coins Not Added After Payment**
- Check transaction status in `payments` table
- Verify order notes contain coin amount
- Check wallet updates in database

**Chapter Unlock Failing**
- Verify user authentication
- Check coin balance in wallet
- Review `unlocked_chapters` table for duplicates
- Check transaction logs

## Support

For issues or questions:
1. Check Supabase logs for database errors
2. Review browser console for frontend errors
3. Check Razorpay dashboard for payment issues
4. Review transaction history in database
