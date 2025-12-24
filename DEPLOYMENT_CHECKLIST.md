# Vercel Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Environment Variables Required in Vercel

Make sure these are set in your Vercel project settings:

```env
# Database (Required)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# NextAuth v5 (Required)
AUTH_SECRET="your-generated-secret-here"

# Optional: Only needed if you have auth issues
AUTH_URL="https://your-domain.vercel.app"
AUTH_TRUST_HOST="true"
```

**Important Notes:**
- NextAuth v5 uses `AUTH_SECRET` instead of `NEXTAUTH_SECRET`
- NextAuth v5 uses `AUTH_URL` instead of `NEXTAUTH_URL`
- For Vercel, `AUTH_TRUST_HOST=true` is recommended

### 2. Generate AUTH_SECRET

Run this command locally:
```bash
openssl rand -base64 32
```

Copy the output and add it to Vercel environment variables.

### 3. Database Setup

**Option A: Use Vercel Postgres (Recommended)**
1. Go to your Vercel project
2. Navigate to Storage tab
3. Create a Postgres database
4. Vercel will automatically set `DATABASE_URL`

**Option B: External Database (Neon, Supabase, etc.)**
1. Get connection string from your provider
2. Add as `DATABASE_URL` in Vercel environment variables
3. Make sure connection pooling is enabled for better performance

### 4. Prisma Configuration

The project is already configured with:
- ✅ `postinstall` script that runs `prisma generate`
- ✅ Edge-compatible middleware (no Prisma in Edge runtime)
- ✅ Dynamic Prisma imports where needed

### 5. Build Configuration

Vercel should automatically detect:
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (see above)

### Step 3: Deploy
Click "Deploy" and wait for the build to complete.

### Step 4: Run Database Migrations
After first deployment, you need to run migrations:

**Option 1: Using Vercel CLI (Recommended)**
```bash
npm i -g vercel
vercel login
vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

**Option 2: Using GitHub Actions**
Add a workflow file (see below)

**Option 3: Manual via Prisma Studio**
Connect to your production database and create tables manually.

## 🔍 Common Issues & Solutions

### Issue 1: "Module not found: Prisma Client"
**Solution:** The `postinstall` script should handle this, but if it fails:
- Check that `prisma` is in `dependencies` (not `devDependencies`)
- Manually run build command in Vercel dashboard

### Issue 2: "AUTH_SECRET is not set"
**Solution:** Add `AUTH_SECRET` to Vercel environment variables
- Go to Project Settings > Environment Variables
- Add `AUTH_SECRET` with your generated value
- Redeploy

### Issue 3: "Database connection error"
**Solution:** 
- Verify `DATABASE_URL` is correct
- Check database allows connections from Vercel IPs
- For Neon/Supabase: Use connection pooling URL
- Make sure SSL is enabled (add `?sslmode=require` if needed)

### Issue 4: "Middleware compilation error"
**Solution:** Already fixed! The middleware is now Edge-compatible and doesn't import Prisma directly.

### Issue 5: "Session not persisting"
**Solution:**
- Make sure `AUTH_SECRET` is set
- Add `AUTH_TRUST_HOST=true` for Vercel
- Clear browser cookies and try again

### Issue 6: NextAuth callback URL errors
**Solution:**
- Set `AUTH_URL` to your production URL: `https://your-app.vercel.app`
- Or enable `AUTH_TRUST_HOST=true` to auto-detect

## 🧪 Post-Deployment Testing

After deployment, test these features:

### Authentication
- [ ] Can access login page
- [ ] Can login with credentials
- [ ] Session persists across page reloads
- [ ] Can logout successfully
- [ ] Protected routes redirect to login

### User Features
- [ ] Dashboard loads correctly
- [ ] Can view race schedule
- [ ] Can submit picks
- [ ] Can view standings
- [ ] Navigation works correctly

### Admin Features (if admin user exists)
- [ ] Can access admin pages
- [ ] Can manage drivers
- [ ] Can manage races
- [ ] Can upload results

## 📊 Database Seeding (Production)

If you need sample data in production:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma db seed
```

Or create an admin user manually via Prisma Studio:
```typescript
// Password: admin123 (hashed)
{
  email: "admin@nascar.com",
  password: "$2a$10$YourHashedPasswordHere",
  teamName: "Admin",
  isAdmin: true
}
```

Generate password hash locally:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

## 🔐 Security Checklist

- [ ] `AUTH_SECRET` is set and is a strong random string
- [ ] `DATABASE_URL` uses SSL connection
- [ ] No sensitive data in git repository
- [ ] `.env` files are in `.gitignore`
- [ ] Admin credentials are changed from defaults
- [ ] Database has proper access controls

## 📝 Environment Variables Summary

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ Yes | - | Random 32-char string |
| `AUTH_URL` | ⚠️ Recommended | Auto | Your production URL |
| `AUTH_TRUST_HOST` | ⚠️ Recommended | false | Set to `true` for Vercel |

## 🎯 Next Steps After Deployment

1. **Test thoroughly** - Go through all features
2. **Monitor logs** - Check Vercel dashboard for errors
3. **Setup domain** - Add custom domain in Vercel settings
4. **Enable analytics** - Consider Vercel Analytics/Speed Insights
5. **Backup database** - Setup regular backups for production data

## 🆘 Still Having Issues?

1. Check Vercel build logs for specific errors
2. Check runtime logs in Vercel dashboard
3. Verify all environment variables are set correctly
4. Try redeploying after clearing build cache
5. Check this repository's Issues for common problems

---

**Happy Deploying! 🏁**

