# NASCAR Fantasy League - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Database

1. **Option A: Use Local PostgreSQL**
   ```bash
   # Install PostgreSQL if not already installed
   # Create a database named 'nascar_fantasy'
   createdb nascar_fantasy
   ```

2. **Option B: Use Cloud Database (Recommended)**
   - Get a free PostgreSQL database from:
     - [Supabase](https://supabase.com) (Recommended)
     - [Neon](https://neon.tech)
     - [Railway](https://railway.app)

3. **Update `.env` file** with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
   ```

### Step 2: Generate Secret Key

In WSL terminal:
```bash
cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy

# Generate a secure secret
wsl openssl rand -base64 32
```

Copy the output and update `.env`:
```env
NEXTAUTH_SECRET="paste-the-generated-key-here"
```

### Step 3: Initialize Database

```bash
# Run migrations
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma migrate dev --name init"

# Generate Prisma Client
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma generate"

# Seed database with sample data
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma db seed"
```

### Step 4: Start Development Server

```bash
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npm run dev"
```

### Step 5: Test the Application

Open browser and go to: **http://localhost:3000**

**Login with these credentials:**
- **Admin**: `admin@nascar.com` / `admin123`
- **User 1**: `user1@example.com` / `password123`
- **User 2**: `user2@example.com` / `password123`

## 🧪 Testing Checklist

### As Admin (admin@nascar.com)
- [ ] Login successfully
- [ ] Navigate to Admin > Manage Races
- [ ] Add a new race
- [ ] Navigate to Admin > Manage Drivers
- [ ] Add a new driver to Group A or B
- [ ] View standings page

### As Competitor (user1@example.com)
- [ ] Login successfully
- [ ] View dashboard (see next race)
- [ ] Navigate to Make Picks
- [ ] Select a race
- [ ] Choose drivers from Group A and B
- [ ] Submit picks
- [ ] View standings

### Admin Results Upload
- [ ] Create a test CSV file:
  ```csv
  Position,Driver Number,Driver Name,Points
  1,5,Kyle Larson,40
  2,9,Chase Elliott,35
  3,11,Denny Hamlin,34
  4,24,William Byron,33
  5,20,Christopher Bell,32
  ```
- [ ] Go to Admin > Upload Results
- [ ] Select a race
- [ ] Upload the CSV
- [ ] Verify standings are updated

## 📝 Default Users Created by Seed

| Email | Password | Role | Team Name |
|-------|----------|------|-----------|
| admin@nascar.com | admin123 | Admin | Admin Team |
| user1@example.com | password123 | User | Speed Demons |
| user2@example.com | password123 | User | Track Masters |

## 🔧 Common Issues

### Issue: Database connection failed
**Solution**: 
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Test connection: `wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma db pull"`

### Issue: NextAuth error
**Solution**:
- Ensure NEXTAUTH_SECRET is set in .env
- Clear browser cookies
- Restart dev server

### Issue: Can't submit picks
**Solution**:
- Check if race deadline has passed (must be before race date)
- Ensure you've selected both Group A and B drivers
- Check browser console for errors

## 📊 Database Management

### View database in browser:
```bash
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma studio"
```

### Reset database (WARNING: Deletes all data):
```bash
wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && npx prisma migrate reset"
```

## 🌐 Production Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   wsl bash -c "cd /mnt/c/Users/Main/.cursor/projects/Iwklos-NASCAR-FL/nascar-fantasy && git add . && git commit -m 'Initial commit' && git push"
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (your production URL)

3. **Run migrations on production**
   ```bash
   # In Vercel dashboard, go to your project settings
   # Add a deploy command or run manually:
   npx prisma migrate deploy
   npx prisma db seed
   ```

## 🎯 Next Steps

1. **Customize for your league**:
   - Update drivers for current season
   - Add your league's race schedule
   - Create accounts for all competitors

2. **Add real driver data**:
   - Go to Admin > Manage Drivers
   - Add all current season drivers
   - Organize into appropriate groups

3. **Set up race schedule**:
   - Go to Admin > Manage Races
   - Add all races for the season
   - Set correct dates and race numbers

4. **Invite competitors**:
   - Share login URL
   - Each competitor creates an account
   - Provide instructions on making picks

## 📚 Documentation

- **Full README**: See `README.md` for complete documentation
- **API Documentation**: See API routes section in README
- **Prisma Docs**: https://www.prisma.io/docs

## 🆘 Need Help?

- Check the browser console for errors
- Check the terminal/server logs
- Review the README.md file
- Inspect the database with `npx prisma studio`

---

**You're all set! Enjoy your NASCAR Fantasy League! 🏁**

