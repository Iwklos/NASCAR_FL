# 🚨 Vercel 404 Error Fix

## Problem
Getting Vercel's 404 page on all routes means the app is crashing at runtime, usually due to **missing environment variables**.

## ✅ Solution: Add Environment Variables in Vercel

### Step 1: Generate AUTH_SECRET

Run this locally to generate a secure random string:

```bash
openssl rand -base64 32
```

Copy the output.

### Step 2: Add Environment Variables in Vercel

Go to your Vercel project:
**Project Settings → Environment Variables**

Add these **4 required variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db?sslmode=require` | Your PostgreSQL connection string |
| `AUTH_SECRET` | Paste the generated secret from Step 1 | 32+ character random string |
| `AUTH_TRUST_HOST` | `true` | Required for Vercel deployments |
| `AUTH_URL` | `https://nascar.klosdigital.com` | Your production domain |

### Step 3: Database Setup

**Option A: Vercel Postgres (Easiest)**
1. In Vercel dashboard: Storage → Create Database → Postgres
2. `DATABASE_URL` will be auto-set
3. Connect to your project
4. Run migrations (see below)

**Option B: External Database (Neon, Supabase, etc.)**
1. Create a PostgreSQL database
2. Get the connection string (with `?sslmode=require` or `?ssl=true`)
3. Add as `DATABASE_URL` in Vercel
4. Run migrations (see below)

### Step 4: Run Database Migrations

After setting up the database, you need to create the tables.

**Using Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
npx prisma migrate deploy
```

**Or manually connect to your database:**
```bash
# Set DATABASE_URL locally to your production database
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
npx prisma db seed  # Optional: adds sample data
```

### Step 5: Redeploy

After adding environment variables:
1. Go to Vercel Deployments
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Or push a new commit to trigger deployment

## 🧪 Testing the Fix

### 1. Check Health Endpoint
Visit: `https://nascar.klosdigital.com/api/health`

You should see:
```json
{
  "status": "healthy",
  "checks": {
    "databaseUrl": true,
    "authSecret": true,
    "database": true
  },
  "errors": []
}
```

If you see errors, they'll tell you exactly what's missing.

### 2. Test Login Page
Visit: `https://nascar.klosdigital.com/login`

Should load without errors.

### 3. Test Root Page
Visit: `https://nascar.klosdigital.com`

Should redirect to login or dashboard.

## 🔍 Common Issues

### Issue: "DATABASE_URL is not set"
**Solution:** Add `DATABASE_URL` in Vercel environment variables, then redeploy.

### Issue: "AUTH_SECRET is not set"
**Solution:** Generate with `openssl rand -base64 32`, add to Vercel, redeploy.

### Issue: "Database connection failed"
**Solutions:**
- Ensure database URL includes SSL parameter: `?sslmode=require` or `?ssl=true`
- Check that database allows connections from Vercel IPs (usually 0.0.0.0/0)
- For Neon/Supabase: use the "pooled" or "connection string" URL
- Test connection locally: `npx prisma db pull` with same DATABASE_URL

### Issue: "Prisma Client not generated"
This should auto-fix with the `postinstall` script, but if not:
- Ensure `prisma` is in `dependencies` (not `devDependencies`) in package.json ✅ Already correct
- Redeploy to trigger fresh build

### Issue: Still getting 404
- Check Vercel build logs for errors
- Check Vercel runtime logs (Functions tab)
- Visit `/api/health` to see specific errors
- Verify domain is attached to the correct project

## 📋 Quick Checklist

Before redeploying, verify in Vercel:

- [ ] `DATABASE_URL` is set and includes SSL param
- [ ] `AUTH_SECRET` is set (32+ chars)
- [ ] `AUTH_TRUST_HOST` is set to `true`
- [ ] `AUTH_URL` is set to your domain
- [ ] Database tables exist (run migrations)
- [ ] All env vars are set for "Production" environment
- [ ] Domain is attached to the project

## 🎯 After Deployment Works

Once the site loads:

1. **Seed the database** (if using empty database):
```bash
vercel env pull .env.production
npx prisma db seed
```

2. **Login with seed credentials**:
   - Admin: `admin@nascar.com` / `admin123`
   - User: `user1@example.com` / `password123`

3. **Change admin password** for security

## 💡 What Changed in This Fix

1. Added error boundaries to catch and display runtime errors gracefully
2. Made root page resilient to auth failures
3. Added `/api/health` endpoint to diagnose issues
4. Improved error messages to show exactly what's missing

## 🆘 Still Not Working?

1. Visit `/api/health` and share the output
2. Check Vercel runtime logs (Project → Logs)
3. Share the error message from the error page
4. Verify all 4 environment variables are set correctly

---

**Once environment variables are set, the 404 will be fixed!** 🎉

