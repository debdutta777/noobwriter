# NoobWriter Platform - Development Setup Guide

## Quick Start

This guide will help you set up the NoobWriter platform for local development.

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15
- React 19 RC
- Supabase client libraries
- Razorpay SDK
- UI components (Radix UI)
- Tailwind CSS
- TypeScript

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Fill in project details:
   - Name: NoobWriter
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

### Get Your Credentials

Once your project is created:

1. Go to Project Settings > API
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push migrations to create tables
supabase db push
```

Your project ref is in the Project Settings > General.

## Step 3: Set Up Razorpay

### Create a Razorpay Account

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for an account
3. Complete KYC verification (for live mode)
4. For testing, use Test Mode

### Get API Keys

1. Go to Settings > API Keys
2. Generate keys for Test Mode
3. Copy:
   - **Key ID** → `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

### Set Up Webhooks (after deploying)

1. Go to Settings > Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhook/razorpay`
3. Generate webhook secret → `RAZORPAY_WEBHOOK_SECRET`
4. Select events:
   - payment.captured
   - payment.failed
   - refund.created

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
copy .env.example .env
```

Fill in all the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=NoobWriter
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the Application

### Create a Test User

1. Click "Sign Up" on the homepage
2. Enter email and password
3. Check your email for verification link (if enabled)
4. Complete profile setup

### Test Coin Purchase

1. Sign in as a test user
2. Navigate to coin purchase page
3. Use Razorpay test cards:
   - **Success**: 4111 1111 1111 1111
   - **Failure**: 4000 0000 0000 0002
   - CVV: Any 3 digits
   - Expiry: Any future date

### Create Test Content

1. Switch profile role to 'writer' in Supabase:
   ```sql
   UPDATE profiles SET role = 'writer' WHERE email = 'your@email.com';
   ```
2. Access writer dashboard
3. Create a test series
4. Add chapters

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check

# Supabase commands
npm run supabase:start   # Start local Supabase
npm run supabase:stop    # Stop local Supabase
npm run supabase:status  # Check status
```

## Project Structure Overview

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (main)/            # Main app pages
│   │   ├── browse/        # Browse series
│   │   ├── series/        # Series details
│   │   ├── read/          # Chapter reader
│   │   ├── write/         # Writer dashboard
│   │   ├── dashboard/     # User dashboard
│   │   └── admin/         # Admin console
│   ├── api/               # API routes
│   │   ├── payment/       # Payment endpoints
│   │   └── webhook/       # Webhook handlers
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── reader/           # Reader components
│   ├── writer/           # Writer components
│   └── admin/            # Admin components
├── lib/                  # Utilities
│   ├── supabase/         # Supabase client
│   ├── razorpay/         # Razorpay config
│   └── utils.ts          # Helpers
├── hooks/                # Custom hooks
└── types/                # TypeScript types
```

## Common Issues

### Issue: "Cannot find module '@supabase/ssr'"
**Solution**: Run `npm install` to install all dependencies.

### Issue: "Failed to create order"
**Solution**: Check Razorpay credentials in `.env` file.

### Issue: Database connection error
**Solution**: Verify Supabase URL and keys are correct.

### Issue: TypeScript errors
**Solution**: Run `npm run type-check` to see all errors. Make sure dependencies are installed.

## Next Steps

1. **Customize the UI**: Modify components in `src/components/`
2. **Add Features**: Extend the platform with new features
3. **Configure Storage**: Set up Supabase Storage for images
4. **Set Up Email**: Configure SendGrid for notifications
5. **Add Analytics**: Integrate PostHog or similar
6. **Deploy**: Deploy to Vercel for production

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

## Getting Help

- GitHub Issues: Report bugs and request features
- Discord: Join our developer community
- Email: dev@noobwriter.com

---

Happy coding! 🚀
