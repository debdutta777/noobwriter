# NoobWriter - Changelog

All notable changes and updates to the NoobWriter platform.

---

## [Latest] - October 21, 2025

### 🔧 Database Schema Fixes

#### Fixed: Recipient Wallet Auto-Creation
- Changed `.single()` to `.maybeSingle()` in wallet queries
- Improved wallet creation logic to handle missing wallets gracefully
- Fixed in: `src/app/actions/wallet-actions.ts`

#### Fixed: Library Data Fetching
- Rewrote `getUserLibrary()` with explicit Supabase joins
- Fixed favorites query returning wrong structure
- Fixed reading progress missing proper series/chapter data
- Added proper cover image fetching
- Fixed in: `src/app/actions/reader-actions.ts`

#### Added: Payout System
- Exchange rate: 300 coins = ₹100
- Minimum payout: 3000 coins
- Created `src/app/actions/payout-actions.ts`
- Created `/write/earnings` page
- Added payout history tracking
- Status tracking: pending, processing, completed, rejected

#### Updated: Signup Bonus
- Reduced from 100 coins → 5 coins for new users
- Updated in all 4 locations:
  - `src/app/(auth)/actions.ts`
  - `src/app/auth/callback/route.ts`
  - `src/components/layout/navbar.tsx`
  - `src/app/page.tsx`
- Database trigger needs migration (see DATABASE.md)

---

## [Previous] - October 19, 2025

### ✅ Analytics Integration
- Added Vercel Analytics (`@vercel/analytics@1.5.0`)
- Added Speed Insights (`@vercel/speed-insights@1.0.12`)
- Integrated in root layout

### 🐛 Bug Fixes

#### Fixed: Chapter Navigation
- Changed `.single()` to `.maybeSingle()` for prev/next chapter queries
- Fixed table name: `unlocked_chapters` → `chapter_unlocks`
- No more "Chapter not found" errors

#### Fixed: Library Data
- Removed hardcoded "147 chapters" value
- Added real `chaptersRead` query
- Fixed coin balance display
- Fixed reading progress count

#### Fixed: Signup CTA
- Made homepage async
- Added user authentication check
- Conditionally render "Get Started Free" only for logged-out users

---

## [Initial Features]

### 💰 Tipping System
- Created `TipButton` component with modal UI
- Preset amounts: 10, 50, 100, 200, 500, 1000 coins
- Custom amount input
- Balance checking
- Auto wallet creation for recipients
- Server action: `sendTip()` in `wallet-actions.ts`

### 📚 Library System
- Favorites toggle functionality
- Reading progress tracking
- Transaction history
- Chapters read counter
- Server actions:
  - `toggleFavorite()`
  - `checkIsFavorited()`
  - `getUserLibrary()`

### 🔒 Premium Chapter Unlocks
- Unlock with coins
- Author receives payment
- Transaction recording
- Auto wallet creation for authors
- Server action: `unlockPremiumChapter()`

### 🎨 UI Enhancements
- Purple/blue/pink gradient theme throughout
- Enhanced homepage with gradients
- Library page with colorful stat cards
- Series detail page improvements
- Chapter reader tip section

---

## Database Migrations Required

See `DATABASE.md` for:
- Transaction types constraint update (CRITICAL)
- Signup bonus trigger update
- How to apply migrations

---

## Known Issues

None currently. All features tested and working.

---

## Upcoming Features

### Admin Dashboard
- View pending payouts
- Approve/reject payout requests
- User management
- Content moderation

### Payment Integration
- Razorpay Payout API
- Automatic payment processing
- Bank account verification

### Enhanced Features
- Email notifications
- PDF export for payout history
- Tax information (TDS, GST)
- Bulk payout processing
