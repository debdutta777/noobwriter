# NoobWriter Platform

A comprehensive WebNovel + Manga publishing platform built with Next.js 15, Supabase, and Razorpay.

## 🚀 Features

### For Readers
- **Vast Library**: Browse thousands of webnovels and manga across all genres
- **Reading Modes**: Optimized text reader for novels and page-based/webtoon viewer for manga
- **Premium Content**: Unlock chapters with coins or subscribe for unlimited access
- **Social Features**: Comments, ratings, reviews, and follow favorite authors
- **Personalized Experience**: Reading history, progress tracking, and recommendations

### For Writers
- **Publishing Tools**: Chapter editor with autosave, Markdown support, and scheduling
- **Manga Pipeline**: Upload episodes with page ordering and preview
- **Monetization**: Set chapter prices, manage discounts, and track revenue
- **Analytics Dashboard**: Views, retention, revenue breakdown, and reader demographics
- **Community Engagement**: Respond to comments, fan messages, and polls

### Platform Features
- **Coin Economy**: Purchase coins via Razorpay with regional pricing
- **Subscriptions**: Multiple tiers with recurring billing
- **Admin Console**: Content moderation, user management, and analytics
- **Multi-language Support**: Internationalization ready
- **Dark Mode**: Full theme support

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **Framer Motion** - Animations
- **TanStack Query** - Data fetching and caching

### Backend
- **Next.js API Routes** - Backend for frontend
- **Supabase** - Authentication, database, and storage
- **Supabase Edge Functions** - Serverless functions
- **Razorpay** - Payment processing

### Database
- **PostgreSQL** (Supabase) - Main database
- **Row Level Security** - Data access control

### Additional Services
- **Typesense/Algolia** - Search indexing (optional)
- **SendGrid** - Email notifications (optional)
- **PostHog** - Analytics (optional)
- **Sentry** - Error tracking (optional)

## 📦 Installation

### Prerequisites
- Node.js 18.17.0 or higher
- npm or yarn package manager
- Supabase account
- Razorpay account

### Setup Steps

1. **Clone and Install Dependencies**
```bash
cd Noobwriter
npm install
```

2. **Configure Environment Variables**
```bash
copy .env.example .env
```

Edit `.env` with your credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Your Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay key secret
- `RAZORPAY_WEBHOOK_SECRET` - Your Razorpay webhook secret

3. **Set Up Supabase**

Install Supabase CLI:
```bash
npm install -g supabase
```

Link to your project:
```bash
supabase link --project-ref your-project-ref
```

Run migrations:
```bash
supabase db push
```

4. **Configure Razorpay Webhooks**

In your Razorpay dashboard, add webhook URL:
```
https://your-domain.com/api/webhook/razorpay
```

Subscribe to events:
- `payment.captured`
- `payment.failed`
- `refund.created`

5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
Noobwriter/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication routes
│   │   ├── (main)/              # Main app routes
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # UI components
│   │   ├── providers/           # Context providers
│   │   ├── reader/              # Reader components
│   │   ├── writer/              # Writer components
│   │   └── admin/               # Admin components
│   ├── lib/                     # Utility libraries
│   │   ├── supabase/            # Supabase client
│   │   ├── razorpay/            # Razorpay config
│   │   └── utils.ts             # Helper functions
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript types
│   └── middleware.ts            # Next.js middleware
├── supabase/
│   └── migrations/              # Database migrations
├── public/                      # Static assets
├── .env                         # Environment variables
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User profiles and authentication
- **series** - Novels and manga series
- **chapters** - Chapter content
- **manga_pages** - Manga page images
- **wallets** - User coin balances
- **transactions** - Payment and coin transactions
- **chapter_unlocks** - Unlocked premium chapters
- **comments** - User comments
- **ratings** - Series ratings and reviews
- **favorites** - Bookmarked series
- **reading_progress** - Reading history
- **subscriptions** - Active subscriptions

## 💳 Payment Flow

### Coin Purchase
1. User selects coin package
2. Frontend calls `/api/payment` to create Razorpay order
3. Razorpay Checkout opens
4. User completes payment
5. Frontend verifies payment with `/api/payment` (PUT)
6. Coins added to user wallet
7. Webhook confirms transaction

### Chapter Unlock
1. User attempts to read premium chapter
2. System checks if chapter is unlocked
3. If not, prompts coin purchase or unlock
4. Coins deducted from wallet
5. Chapter access granted
6. Transaction recorded

## 🔐 Security

- **Row Level Security (RLS)** - All Supabase tables protected
- **API Route Protection** - Authentication middleware
- **Payment Verification** - Signature validation for Razorpay
- **Webhook Security** - Secret verification
- **Content Moderation** - Automated and manual review
- **Rate Limiting** - API and action throttling

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Environment Variables Required
- All variables from `.env.example`
- `NEXT_PUBLIC_APP_URL` - Your production URL

### Post-Deployment
1. Configure Razorpay webhook with production URL
2. Set up Supabase production project
3. Run database migrations
4. Configure CDN for image storage
5. Set up monitoring and analytics

## 📱 Features Roadmap

### Phase 1 - Core Platform (Current)
- [x] Authentication system
- [x] Series browsing
- [x] Chapter reading (novel)
- [x] Coin purchase with Razorpay
- [x] Basic writer dashboard
- [ ] User profile management

### Phase 2 - Manga Support
- [ ] Manga viewer (page-based)
- [ ] Manga viewer (webtoon scroll)
- [ ] Image upload and optimization
- [ ] Manga analytics

### Phase 3 - Community Features
- [ ] Comments and replies
- [ ] Ratings and reviews
- [ ] User following
- [ ] Notifications

### Phase 4 - Monetization
- [ ] Subscription tiers
- [ ] Tipping system
- [ ] Discount campaigns
- [ ] Author payouts

### Phase 5 - Advanced Features
- [ ] Recommendation engine
- [ ] Multi-language support
- [ ] Mobile apps
- [ ] Advanced analytics

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For support, email support@noobwriter.com or join our Discord community.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- Razorpay for payment processing
- Vercel for hosting
- Open source community

---

**Built with ❤️ for writers and readers worldwide**
