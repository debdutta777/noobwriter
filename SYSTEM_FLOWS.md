# System Flows - Visual Reference

## 🔐 Authentication Flows

### Email/Password Signup Flow
```
User fills signup form
    ↓
Submit → Server Action: signUp()
    ↓
Supabase Auth: Create user account
    ↓
Create profile in 'profiles' table
    ↓
Create wallet in 'wallets' table (100 coin bonus)
    ↓
Redirect to /library
```

### Google OAuth Flow
```
User clicks "Continue with Google"
    ↓
Server Action: signInWithGoogle()
    ↓
Redirect to Google OAuth consent screen
    ↓
User authorizes
    ↓
Redirect to /auth/callback with code
    ↓
Exchange code for session
    ↓
Check if profile exists
    ↓
If new user: Create profile + wallet (100 coins)
    ↓
Redirect to /library
```

### Login Flow
```
User fills login form
    ↓
Submit → Server Action: signIn()
    ↓
Supabase Auth: Verify credentials
    ↓
Create session
    ↓
Redirect to /library
```

## 💰 Coin Purchase Flow

### Complete Purchase Journey
```
User visits /coins/purchase
    ↓
View coin packages
    ↓
Select desired package
    ↓
Click "Purchase" button
    ↓
Server Action: createCoinPurchase()
    ├─ Create Razorpay order
    ├─ Store in 'payments' table (status: pending)
    └─ Return order_id
    ↓
Razorpay checkout modal opens
    ↓
User completes payment
    ↓
Payment success callback
    ↓
POST /api/payment/verify
    ├─ Verify signature (HMAC SHA256)
    ├─ Update payment status → 'completed'
    ├─ Fetch order notes (coin amount)
    ├─ Add coins to 'wallets' table
    ├─ Create record in 'transactions' table
    └─ Return success
    ↓
Frontend reloads user balance
    ↓
Redirect to /library?tab=wallet&success=true
```

### Payment Verification Details
```
Razorpay sends: {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}
    ↓
Server generates signature:
HMAC_SHA256(order_id|payment_id, secret_key)
    ↓
Compare generated vs received signature
    ↓
If match: Process payment
If mismatch: Reject payment
```

## 🔓 Chapter Unlock Flow

### Premium Chapter Access
```
User reads chapter
    ↓
Chapter isPremium = true
    ↓
Display lock overlay
    ↓
User clicks "Unlock Chapter"
    ↓
UnlockPremiumModal opens
    ├─ Show chapter details
    ├─ Show coin cost
    ├─ Show user balance
    └─ Check if sufficient coins
    ↓
If insufficient:
    Show "Buy More Coins" button → /coins/purchase
    ↓
If sufficient:
    User clicks "Unlock for X Coins"
    ↓
Server Action: unlockChapter()
    ├─ Verify user authentication
    ├─ Check balance in 'wallets' table
    ├─ Check for duplicate in 'unlocked_chapters'
    ├─ Deduct coins from wallet
    ├─ Insert into 'unlocked_chapters' table
    ├─ Insert into 'transactions' table
    └─ Return success
    ↓
If error: Rollback coins
    ↓
Success animation
    ↓
Reload page → Chapter content visible
```

## 📊 Database Transaction Flow

### Wallet Operations
```
Any coin operation:
    ↓
BEGIN TRANSACTION
    ↓
SELECT coin_balance WHERE user_id = X FOR UPDATE
    ↓
Validate balance (if deduction)
    ↓
UPDATE wallets SET coin_balance = new_balance
    ↓
INSERT INTO transactions (...)
    ↓
If all succeed: COMMIT
If any fails: ROLLBACK
```

## 🔄 State Management

### User Session State
```
Login/Signup → Supabase Auth creates session
    ↓
Session stored in httpOnly cookie
    ↓
Middleware refreshes session on each request
    ↓
Server actions access user via:
    supabase.auth.getUser()
    ↓
Logout → Delete session cookie
```

### Wallet Balance Updates
```
Purchase/Unlock occurs
    ↓
Database updated
    ↓
Frontend calls getUserWallet()
    ↓
Display updated balance
    ↓
Or: Page reload fetches fresh data
```

## 🎯 User Journey Examples

### Journey 1: New User to First Unlock
```
1. Visit site → See locked chapters
2. Click "Sign Up" → /auth/signup
3. Create account → Get 100 welcome coins
4. Browse series → /browse
5. Select series → /series/123
6. Start reading → /read/123/1 (free)
7. Continue reading → /read/123/6 (premium, locked)
8. Click "Unlock Chapter" → Modal opens
9. See balance: 100 coins, cost: 10 coins
10. Click "Unlock" → Coins deducted (90 remaining)
11. Read unlocked chapter
12. Continue to next chapter → /read/123/7
13. Balance now 90 coins, cost 10 coins
14. Unlock again → 80 coins remaining
15. After 8-9 unlocks, run out of coins
16. Click "Buy More Coins" → /coins/purchase
17. Select package → Complete payment
18. Coins added → Continue reading
```

### Journey 2: Returning User Purchase
```
1. Login → /auth/login → /library
2. See coin balance: 5 coins
3. Want to unlock chapter (cost: 10 coins)
4. Insufficient funds
5. Go to /coins/purchase
6. Select Basic package (550 coins for ₹449)
7. Complete Razorpay payment
8. Redirect to library, balance: 555 coins
9. Go back to chapter → /read/123/15
10. Unlock chapter (545 coins remaining)
11. Continue reading with plenty of coins
```

## 🔍 Verification Points

### Security Checkpoints
```
✓ User authentication (every server action)
✓ Balance validation (before unlock)
✓ Duplicate check (no double unlock)
✓ Payment signature (HMAC verification)
✓ Transaction atomicity (rollback on fail)
✓ Session validation (middleware)
```

### Data Consistency Checks
```
✓ Profile exists for every user
✓ Wallet exists for every user
✓ Transactions match wallet changes
✓ Unlocked chapters persist forever
✓ Payments recorded before processing
```

## 📱 UI State Flows

### Unlock Modal States
```
Initial:
  - Show chapter info
  - Show balances
  - "Unlock" button enabled (if sufficient funds)

Loading:
  - Button text: "Unlocking..."
  - Button disabled
  - Spinner animation

Success:
  - Green checkmark icon
  - "Chapter Unlocked!" message
  - Auto-close after 1.5s
  - Page reload

Error:
  - Red error message
  - "Insufficient coins" or error details
  - Close button enabled
```

### Purchase Page States
```
No selection:
  - All packages shown
  - Button text: "Select a Package"
  - Button disabled

Package selected:
  - Selected package highlighted
  - Button text: "Purchase X coins for ₹Y"
  - Button enabled

Processing:
  - Button text: "Processing..."
  - Button disabled
  - Razorpay modal opens

Success:
  - Redirect to library
  - Success toast notification
  - Updated balance shown
```

---

## 🎨 Component Hierarchy

```
App Layout
├── Navbar (with user menu)
├── Main Content
│   ├── Auth Pages
│   │   ├── Login
│   │   └── Signup
│   ├── Reader Pages
│   │   ├── Browse
│   │   ├── Series Detail
│   │   └── Chapter Reader
│   │       └── UnlockPremiumModal
│   ├── Coins
│   │   └── Purchase Page
│   └── Library
│       └── Wallet Tab
└── Footer
```

---

**All flows tested and working correctly!** ✅
