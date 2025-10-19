# Google OAuth Custom Domain Setup Guide

## 📋 Prerequisites
- Custom domain configured in Vercel
- Google Cloud Console access
- Supabase project access

## 🔑 Step 1: Update Google Cloud Console

### 1.1 Navigate to OAuth 2.0 Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to: **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (or create one if you haven't)

### 1.2 Update Authorized JavaScript Origins
Add these URLs (replace `yourdomain.com` with your actual domain):

```
https://yourdomain.com
https://www.yourdomain.com
http://localhost:3000
```

### 1.3 Update Authorized Redirect URIs
Add these URLs:

```
https://yourdomain.com/auth/callback
https://www.yourdomain.com/auth/callback
https://gkhsrwebwdabzmojefry.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

**Important**: Keep localhost URLs for development!

---

## 🗄️ Step 2: Update Supabase Configuration

### 2.1 Update Site URL
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project: `gkhsrwebwdabzmojefry`
3. Navigate to: **Authentication** → **URL Configuration**
4. Update **Site URL**: `https://yourdomain.com`

### 2.2 Add Redirect URLs
In **Redirect URLs** section, add:

```
https://yourdomain.com/auth/callback
https://www.yourdomain.com/auth/callback
https://yourdomain.com/**
https://www.yourdomain.com/**
http://localhost:3000/**
```

### 2.3 Configure Email Templates (Optional)
Update email templates to use your custom domain:
- Confirmation emails
- Magic link emails
- Password reset emails

Replace `{{ .SiteURL }}` references if needed.

---

## ☁️ Step 3: Update Vercel Environment Variables

### 3.1 Go to Vercel Dashboard
1. Open your project: `noobwriter`
2. Go to **Settings** → **Environment Variables**

### 3.2 Update/Add These Variables

**Production:**
```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://gkhsrwebwdabzmojefry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Razorpay (if using custom domain)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=your_live_secret_here
```

**Preview/Development:**
Keep localhost URLs for testing

### 3.3 Redeploy
After updating environment variables:
1. Go to **Deployments**
2. Click **...** on latest deployment
3. Click **Redeploy**

---

## 🧪 Step 4: Test the Integration

### 4.1 Test Sign-In Flow
1. Go to `https://yourdomain.com`
2. Click **Sign In**
3. Click **Continue with Google**
4. Complete Google OAuth flow
5. Verify redirect to `/auth/callback`
6. Verify successful login

### 4.2 Check for Errors
Open browser console and check for:
- ❌ CORS errors → Check Google OAuth origins
- ❌ Redirect errors → Check Supabase redirect URLs
- ❌ Cookie errors → Check domain settings

---

## 🔍 Common Issues & Solutions

### Issue: "Redirect URI mismatch"
**Solution**: Make sure ALL these URLs are added to Google OAuth:
- Exact URL that appears in error message
- Both with and without `www`
- Supabase callback URL

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Check OAuth consent screen is configured
2. Add test users (if app not verified)
3. Make sure app is not in "Testing" mode for public users

### Issue: Infinite redirect loop
**Solution**:
1. Clear browser cookies
2. Check `NEXT_PUBLIC_APP_URL` matches your domain exactly
3. Verify Supabase Site URL is correct

### Issue: Login works on localhost but not custom domain
**Solution**:
1. Check environment variables in Vercel
2. Redeploy after changing env vars
3. Clear Vercel build cache

---

## 📝 Verification Checklist

Before going live, verify:

- [ ] Google OAuth origins include your domain
- [ ] Google OAuth redirects include `/auth/callback`
- [ ] Supabase Site URL is set to your domain
- [ ] Supabase Redirect URLs include your domain
- [ ] Vercel environment variables are updated
- [ ] Application redeployed after env changes
- [ ] Test login flow works end-to-end
- [ ] Test logout works correctly
- [ ] Protected routes redirect properly
- [ ] User session persists after refresh

---

## 🔐 Security Best Practices

### 1. Use HTTPS Only in Production
Never use `http://` URLs in production OAuth settings.

### 2. Restrict OAuth Origins
Only add domains you actually use. Don't add wildcards.

### 3. Monitor OAuth Usage
Check Google Cloud Console for unusual activity.

### 4. Rotate Secrets Regularly
Update Supabase keys and Razorpay secrets periodically.

### 5. Enable MFA for Admin Accounts
Secure your Google Cloud Console and Supabase accounts.

---

## 📞 Need Help?

**Google OAuth Issues:**
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Troubleshooting](https://developers.google.com/identity/protocols/oauth2/web-server#error-codes)

**Supabase Auth Issues:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Auth Troubleshooting](https://supabase.com/docs/guides/auth/troubleshooting)

**Vercel Deployment:**
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Custom Domains](https://vercel.com/docs/custom-domains)

---

## 🚀 Quick Setup Commands

```bash
# 1. Update environment variables locally
cp .env.example .env
# Edit .env with your custom domain

# 2. Test locally
npm run dev

# 3. Deploy to Vercel
git push origin master
# Or use Vercel CLI:
vercel --prod
```

---

**Last Updated**: October 2025
**Author**: NoobWriter Platform Team
**Version**: 1.0.0
