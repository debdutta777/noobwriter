# Deployment Guide - NoobWriter Platform

This guide covers deploying the NoobWriter platform to production.

## Prerequisites

Before deploying, ensure you have:

- [ ] Production Supabase project set up
- [ ] Razorpay account (Live mode activated with KYC)
- [ ] Vercel account (or your preferred hosting)
- [ ] Custom domain (optional)
- [ ] SendGrid account for emails (optional)
- [ ] Analytics account (PostHog/Amplitude)

## Step 1: Prepare Production Environment

### 1.1 Supabase Production Setup

1. **Create Production Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project for production
   - Choose appropriate region (close to your users)

2. **Run Migrations**
   ```bash
   supabase link --project-ref your-production-ref
   supabase db push
   ```

3. **Configure Storage**
   - Create buckets:
     - `covers` - For series cover images
     - `chapters` - For manga pages
     - `avatars` - For user avatars
   - Set appropriate policies for each bucket

4. **Set Up Authentication**
   - Enable Email provider
   - Configure Google OAuth:
     - Add authorized redirect URLs
     - Add your production domain
   - Set up email templates
   - Configure SMTP (or use Supabase's)

5. **Configure Row Level Security**
   - Verify all RLS policies are active
   - Test with different user roles

### 1.2 Razorpay Production Setup

1. **Complete KYC**
   - Submit business documents
   - Wait for approval (1-3 days)

2. **Get Live API Keys**
   - Go to Settings > API Keys
   - Generate Live Mode keys
   - **NEVER commit these to Git**

3. **Configure Webhooks**
   - URL: `https://your-domain.com/api/webhook/razorpay`
   - Secret: Generate and save securely
   - Events:
     - ☑️ payment.captured
     - ☑️ payment.failed
     - ☑️ refund.created
     - ☑️ subscription.charged
     - ☑️ subscription.cancelled

4. **Set Up Payment Gateway**
   - Configure checkout preferences
   - Add logo and branding
   - Set up payment methods
   - Configure currency and region

## Step 2: Deploy to Vercel

### 2.1 Connect Repository

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/noobwriter.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure project:
   - **Framework**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: .next

### 2.2 Configure Environment Variables

Add all variables in Vercel dashboard:

```env
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Razorpay (Live Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx

# App Configuration
NEXT_PUBLIC_APP_URL=https://noobwriter.com
NEXT_PUBLIC_APP_NAME=NoobWriter

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@noobwriter.com

# Analytics (Optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Tracking (Optional)
SENTRY_DSN=https://xxx@sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx

# Search (Typesense)
TYPESENSE_API_KEY=xxx
TYPESENSE_HOST=xxx.typesense.net

# CDN (Optional)
NEXT_PUBLIC_CDN_URL=https://cdn.noobwriter.com
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for build to complete (~5 minutes)
3. Vercel will provide a `.vercel.app` URL
4. Test the deployment thoroughly

## Step 3: Configure Custom Domain

### 3.1 Add Domain to Vercel

1. Go to Project Settings > Domains
2. Add your domain: `noobwriter.com`
3. Add www subdomain: `www.noobwriter.com`

### 3.2 Update DNS Records

Add these records in your domain registrar:

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 3.3 Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:
```env
NEXT_PUBLIC_APP_URL=https://noobwriter.com
```

### 3.4 Update OAuth Redirects

In Supabase:
- Add `https://noobwriter.com/auth/callback` to redirect URLs

In Razorpay:
- Update webhook URL to `https://noobwriter.com/api/webhook/razorpay`

## Step 4: Post-Deployment Configuration

### 4.1 Verify Integrations

- [ ] Test user registration
- [ ] Test email verification
- [ ] Test Google OAuth login
- [ ] Test coin purchase with real payment
- [ ] Test webhook delivery
- [ ] Test chapter unlocking
- [ ] Test image uploads

### 4.2 Set Up Monitoring

1. **Vercel Analytics**
   - Automatic with Vercel deployment
   - View in Vercel dashboard

2. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **PostHog (Product Analytics)**
   - Already integrated via environment variables
   - Create dashboards in PostHog

### 4.3 Configure CDN

1. **Supabase Storage CDN**
   - Already enabled by default
   - Use signed URLs for private content

2. **Cloudflare (Optional)**
   - Add site to Cloudflare
   - Enable caching rules
   - Set up image transformations

### 4.4 Set Up Cron Jobs

For scheduled tasks, create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## Step 5: Performance Optimization

### 5.1 Enable Caching

In `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/images/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

### 5.2 Image Optimization

- Use Next.js Image component everywhere
- Configure image domains in `next.config.js`
- Set up responsive images

### 5.3 Database Optimization

In Supabase:
- Enable connection pooling
- Set up read replicas (for high traffic)
- Add appropriate indexes
- Configure query caching

## Step 6: Security Hardening

### 6.1 Environment Security

- [ ] Rotate all secrets
- [ ] Enable 2FA on all accounts
- [ ] Use different passwords everywhere
- [ ] Store secrets in secure vault

### 6.2 Application Security

- [ ] Enable CORS properly
- [ ] Set up CSP headers
- [ ] Implement rate limiting
- [ ] Add CAPTCHA for sensitive operations
- [ ] Enable Vercel's DDoS protection

### 6.3 Database Security

- [ ] Verify RLS policies
- [ ] Enable audit logging
- [ ] Set up automated backups
- [ ] Configure point-in-time recovery

## Step 7: Launch Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Error tracking configured
- [ ] Analytics tracking verified
- [ ] Payment flow tested
- [ ] Email delivery tested
- [ ] SSL certificate active
- [ ] SEO meta tags added
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Contact/support page

### Launch Day

- [ ] Clear all test data
- [ ] Verify production data
- [ ] Monitor error rates
- [ ] Watch server metrics
- [ ] Check payment webhooks
- [ ] Verify email delivery
- [ ] Test from multiple devices

### Post-Launch

- [ ] Monitor user signups
- [ ] Track payment conversions
- [ ] Review error logs
- [ ] Gather user feedback
- [ ] Plan hotfixes if needed

## Step 8: Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time > 500ms
- Error rate > 1%
- Database CPU > 80%
- Payment success rate < 95%

### Scaling Strategies

1. **Database**
   - Upgrade Supabase plan
   - Enable read replicas
   - Implement caching (Redis)

2. **Application**
   - Vercel auto-scales automatically
   - Consider Enterprise plan for high traffic
   - Implement edge caching

3. **Storage**
   - Use CDN for all static assets
   - Implement image compression
   - Use WebP format

## Rollback Procedure

If something goes wrong:

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   - Use Supabase point-in-time recovery
   - Restore to before deployment

3. **Communication**
   - Post status update
   - Notify users via email
   - Update social media

## Maintenance

### Daily
- Check error logs
- Monitor payment success rate
- Review user feedback

### Weekly
- Analyze performance metrics
- Review security alerts
- Update dependencies

### Monthly
- Database backup verification
- Security audit
- Cost optimization review

## Support & Resources

- **Vercel Support**: vercel.com/support
- **Supabase Support**: supabase.com/support
- **Razorpay Support**: razorpay.com/support
- **Community**: Discord / GitHub Discussions

## Emergency Contacts

Prepare a list of:
- DevOps engineer
- Database administrator
- Payment gateway support
- Legal counsel (for payment issues)

---

**Remember**: Always test deployments in staging environment first!

Good luck with your launch! 🚀
