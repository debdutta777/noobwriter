# Quick Reference Guide - NoobWriter Platform

Last Updated: October 19, 2025

---

## 🚀 Quick Start Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript

# Database (Supabase CLI)
supabase link --project-ref gkhsrwebwdabzmojefry   # Link to remote project
supabase db push                                    # Push migrations
supabase db pull                                    # Pull remote schema
supabase functions deploy <name>                    # Deploy edge function
```

---

## 📁 Project Structure

```
Noobwriter/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── api/               # API routes (payment, webhooks)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   └── providers/         # Context providers
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   └── razorpay/          # Razorpay config
│   ├── types/
│   │   └── database.ts        # Database types
│   └── middleware.ts          # Auth middleware
├── supabase/
│   └── migrations/            # Database migrations
├── .vscode/                   # VS Code settings
├── .env                       # Environment variables (not committed)
├── .env.example               # Environment template
├── mcp.json                   # MCP config (not committed)
├── mcp.json.example           # MCP template
└── *.md                       # Documentation
```

---

## 🔑 Environment Variables Reference

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gkhsrwebwdabzmojefry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RVMUo3Od2yyAPT
RAZORPAY_KEY_SECRET=xBKdz1p1ktEJ22jTrzo5rFFI
RAZORPAY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NoobWriter

# SMTP (ZeptoMail)
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT_SSL=465
SMTP_PORT_TLS=587
SMTP_DOMAIN=noobwriter.in
SMTP_USERNAME=emailapikey
SMTP_PASSWORD=PHtE6r1fRb3qjG579UUH...
FROM_EMAIL=noreply@noobwriter.in
```

---

## 🗄️ Database Schema Quick Reference

### Tables (12)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | User accounts | id, email, username, role |
| `series` | Novel/manga series | id, author_id, title, content_type |
| `chapters` | Individual chapters | id, series_id, is_premium, coin_price |
| `manga_pages` | Manga page images | id, chapter_id, page_number, image_url |
| `wallets` | User coin balances | user_id, coin_balance |
| `transactions` | Payment history | user_id, type, amount, payment_status |
| `chapter_unlocks` | Unlocked chapters | user_id, chapter_id |
| `comments` | Chapter comments | user_id, chapter_id, content |
| `ratings` | Series ratings | user_id, series_id, rating |
| `favorites` | User bookmarks | user_id, series_id |
| `reading_progress` | Reading progress | user_id, chapter_id, progress_percentage |
| `subscriptions` | Recurring subs | user_id, plan_id, status |

### Functions

```sql
-- Add coins to user wallet
SELECT add_coins_to_wallet('<user_id>', <coin_amount>);

-- Deduct coins (returns boolean)
SELECT deduct_coins_from_wallet('<user_id>', <coin_amount>);
```

---

## 💰 Razorpay Coin Packages

| Package | Price | Coins | Bonus |
|---------|-------|-------|-------|
| Starter | ₹99 | 100 | - |
| Basic | ₹299 | 330 | 10% |
| Popular | ₹799 | 879 | 10% |
| Premium | ₹1,799 | 2,159 | 20% |
| Ultimate | ₹3,799 | 4,939 | 30% |

---

## 🔐 Authentication Flow

### Sign Up
```typescript
// src/app/(auth)/actions.ts
await signUp(formData)
// Creates user + profile + wallet (100 bonus coins)
```

### Sign In
```typescript
await signIn(formData)
// Redirects to homepage or error page
```

### OAuth (Google)
```typescript
await signInWithGoogle()
// Redirects to Google, then callback
```

### Protected Routes
```typescript
// src/middleware.ts
// Auto-refreshes session on every request
```

---

## 💳 Payment Flow

### 1. Create Order
```typescript
POST /api/payment
Body: { packageId: 'basic_pack' }
Response: { orderId, amount, currency, key }
```

### 2. Open Razorpay Checkout
```typescript
const rzp = new Razorpay({
  key: NEXT_PUBLIC_RAZORPAY_KEY_ID,
  order_id: orderId,
  handler: (response) => {
    // Verify payment
  }
})
rzp.open()
```

### 3. Verify Payment
```typescript
PUT /api/payment
Body: {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}
// Adds coins to wallet via RPC
```

### 4. Webhook (Optional)
```typescript
POST /api/webhook/razorpay
// Handles payment.captured, payment.failed, refund.created
```

---

## 🎨 UI Component Usage

### Button
```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Icon</Button>
<Button variant="link">Link</Button>
<Button variant="premium">Unlock with Coins</Button>
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Input
```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" placeholder="you@example.com" />
```

### Toast
```tsx
import { toast } from 'sonner'

toast.success('Success message')
toast.error('Error message')
toast.info('Info message')
```

---

## 🛠️ Common Development Tasks

### Add a New Page
```bash
# 1. Create file
src/app/my-page/page.tsx

# 2. Export component
export default function MyPage() {
  return <div>My Page</div>
}

# 3. Access at http://localhost:3000/my-page
```

### Add a New API Route
```bash
# 1. Create file
src/app/api/my-route/route.ts

# 2. Export handler
export async function GET(request: Request) {
  return Response.json({ data: 'Hello' })
}

# 3. Access at http://localhost:3000/api/my-route
```

### Query Database (Client)
```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('series')
  .select('*')
  .eq('content_type', 'novel')
```

### Query Database (Server)
```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single()
```

### Server Action
```tsx
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function myAction(formData: FormData) {
  const supabase = await createClient()
  // ... perform mutation
  revalidatePath('/my-page')
}
```

---

## 🐛 Debugging Tips

### Check TypeScript Errors
```bash
npm run type-check
```

### Check Supabase Connection
```typescript
const { data, error } = await supabase.auth.getUser()
console.log('User:', data, 'Error:', error)
```

### Check Razorpay Test Mode
- Always use `rzp_test_` keys for development
- Test cards: https://razorpay.com/docs/payments/payments/test-card-details/

### Check MCP Server
```bash
# List all tables
"show me all tables in the database"

# Query specific table
"list all users from profiles table"
```

### View Database Logs
- Supabase Dashboard → Logs → Database
- Check for RLS policy violations

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and features |
| `PROJECT_STATUS.md` | Detailed project status and progress |
| `SETUP.md` | Local development setup guide |
| `GETTING_STARTED.md` | Quick start guide |
| `API_DOCS.md` | API endpoint reference |
| `DEPLOYMENT.md` | Production deployment guide |
| `MCP_SETUP.md` | MCP server configuration |
| `QUICK_REFERENCE.md` | This file - quick commands and tips |

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Razorpay Dashboard:** https://dashboard.razorpay.com
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Razorpay Docs:** https://razorpay.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Radix UI:** https://radix-ui.com

---

## ❓ Common Issues & Solutions

### Issue: "Module not found"
```bash
# Solution: Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Supabase auth not working
```bash
# Solution: Check middleware and RLS policies
# Verify auth.users table has entries
```

### Issue: Payment verification fails
```bash
# Solution: Check Razorpay webhook signature
# Verify RAZORPAY_KEY_SECRET in .env
```

### Issue: TypeScript errors in database.ts
```bash
# Solution: Regenerate types from Supabase
supabase gen types typescript --project-id gkhsrwebwdabzmojefry > src/types/database.ts
```

---

**For detailed information, see full documentation files listed above.**
