# Admin Role Setup Guide

## 🔐 Setting Up Admin Access

The `/admin/exchanges` page is now protected and requires **admin role** to access.

---

## 📝 How to Make Yourself Admin

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry
   ```

2. **Navigate to Table Editor**
   - Click "Table Editor" in left sidebar
   - Select "profiles" table

3. **Find Your Profile**
   - Search for your email or username
   - Click on your row

4. **Update Role**
   - Find the `role` column
   - Change value from `reader` or `writer` to **`admin`**
   - Click save

5. **Done!**
   - Refresh the page
   - Go to `/admin/exchanges`
   - You should now have access

---

### Method 2: Using SQL Editor

1. **Open SQL Editor** in Supabase Dashboard

2. **Run this query** (replace with your email):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```

3. **Verify:**
   ```sql
   SELECT email, role FROM profiles WHERE role = 'admin';
   ```

---

## 🛡️ Security Features Implemented

### Frontend Protection:
- ✅ Checks user authentication
- ✅ Verifies admin role from profiles table
- ✅ Redirects non-admins to homepage
- ✅ Shows "Access Denied" message
- ✅ Prevents unauthorized access

### Backend Protection:
All admin functions now check role:
- ✅ `getPendingExchanges()` - requires admin
- ✅ `confirmExchangePayment()` - requires admin
- ✅ `rejectExchangeRequest()` - requires admin

### Error Messages:
- Non-authenticated: Redirected to login
- Not admin: "Access denied: Admin role required"

---

## 👥 User Roles

The system has 3 roles:

| Role | Can Access | Description |
|------|-----------|-------------|
| **reader** | Public pages, library | Default for all users |
| **writer** | `/write/*` pages | Can create and publish content |
| **admin** | `/admin/*` pages | Can manage exchange requests |

**Note:** A user can be both `writer` and need separate admin flag, but current system uses single role.

---

## 🔄 Role Management

### Making Other Users Admin:

```sql
-- Make specific user admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';

-- Make user writer
UPDATE profiles
SET role = 'writer'
WHERE email = 'user@example.com';

-- Make user reader (default)
UPDATE profiles
SET role = 'reader'
WHERE email = 'user@example.com';
```

### List All Admins:

```sql
SELECT 
  email, 
  display_name, 
  role,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at ASC;
```

---

## 🚨 What Happens for Non-Admins

### If Regular User Tries to Access `/admin/exchanges`:

1. **Authentication Check**
   - If not logged in → Redirected to `/login`

2. **Role Check**
   - If logged in but not admin → Redirected to homepage
   - Shows toast message: "Access denied: Admin role required"
   - Shows Lock icon with "Access Denied" card

3. **API Protection**
   - Backend functions check role
   - Return error: "Access denied: Admin role required"
   - No data exposed to non-admins

---

## 🧪 Testing Admin Access

### Test as Non-Admin:
1. Create/login as regular user
2. Try to access: `https://yoursite.com/admin/exchanges`
3. Should see "Access Denied" message
4. Should be redirected to homepage

### Test as Admin:
1. Update your profile role to 'admin'
2. Visit: `https://yoursite.com/admin/exchanges`
3. Should see admin panel with pending exchanges
4. Should be able to confirm/reject payments

---

## 📊 Database Schema

### Profiles Table:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT,
    display_name TEXT,
    role TEXT DEFAULT 'reader' CHECK (role IN ('reader', 'writer', 'admin')),
    -- ... other fields
);
```

### Role Constraint:
- Only accepts: `'reader'`, `'writer'`, `'admin'`
- Default: `'reader'`
- Can be updated anytime

---

## 🔐 Security Best Practices

### ✅ Recommendations:

1. **Limit Admin Accounts**
   - Only make trusted users admin
   - Keep count minimal (1-3 admins)

2. **Regular Audits**
   ```sql
   SELECT * FROM profiles WHERE role = 'admin';
   ```

3. **Monitor Admin Actions**
   - All confirmations recorded with metadata
   - Check `transactions` table for audit trail

4. **Protect Your Admin Account**
   - Use strong password
   - Enable 2FA in Supabase Auth
   - Don't share credentials

5. **Revoke Access When Needed**
   ```sql
   UPDATE profiles
   SET role = 'reader'
   WHERE email = 'former-admin@example.com';
   ```

---

## 🆘 Troubleshooting

### Problem: "Access Denied" even though I'm admin

**Solution:**
1. Check your role in database:
   ```sql
   SELECT role FROM profiles WHERE email = 'your-email@example.com';
   ```
2. If not 'admin', update it:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
3. Clear browser cache and cookies
4. Logout and login again
5. Try accessing `/admin/exchanges` again

### Problem: Can't update role in Supabase

**Cause:** RLS policies may prevent updates

**Solution:**
1. Go to SQL Editor
2. Run update query directly (bypasses RLS)
3. Or temporarily disable RLS on profiles table

### Problem: Page keeps redirecting

**Cause:** Auth state not loading properly

**Solution:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check `.env` file has correct credentials
4. Try incognito mode

---

## 📱 Admin Panel Access Flow

```
User visits /admin/exchanges
         ↓
   Check Authentication
         ↓
   Not logged in? → Redirect to /login
         ↓
   Logged in → Get profile
         ↓
   Check role === 'admin'?
         ↓
   No → Show "Access Denied"
         ↓
   Yes → Load admin panel
         ↓
   Show pending exchanges
```

---

## 🎯 Quick Commands

### Make yourself admin:
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';
```

### Verify admin access:
```sql
SELECT email, role 
FROM profiles 
WHERE role = 'admin';
```

### Test in browser:
```
https://yoursite.com/admin/exchanges
```

---

## ✅ Checklist

Before accessing admin panel:

- [ ] Supabase project is running
- [ ] Your account exists in profiles table
- [ ] Your role is set to 'admin'
- [ ] You're logged in to the website
- [ ] Browser cache is cleared (if issues)

---

**You're all set! Just update your role to 'admin' in the database and you'll have full access to the exchange management panel.** 🚀
