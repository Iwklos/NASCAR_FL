# NASCAR Fantasy League App

A full-featured NASCAR fantasy league web application built with Next.js 14, Prisma, NextAuth, and shadcn/ui.

## Features

### For Competitors
- 🏎️ **Weekly Picks**: Select one driver from Group A and one from Group B each race week
- 🌟 **Lead Driver**: Choose a special driver at season start (can be used up to 6 times for 2x points)
- 📊 **Live Standings**: Track your points and ranking throughout the season
- 📅 **Race Schedule**: View upcoming races and deadlines
- ✅ **Pick Tracking**: See your submitted picks and history

### For Admins
- 👥 **Driver Management**: Add, edit, and manage drivers in Groups A & B
- 🏁 **Race Management**: Create and manage race schedule
- 📤 **Results Upload**: Upload CSV race results and auto-calculate points
- ⚙️ **Complete Control**: Full administrative access to all league features

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)
- Git

### Installation

1. **Clone and navigate to the project**
```bash
cd nascar-fantasy
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory (already exists, but update values):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nascar_fantasy?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

To generate a secure `NEXTAUTH_SECRET`, run:
```bash
openssl rand -base64 32
```

4. **Set up the database**

Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

Generate Prisma Client:
```bash
npx prisma generate
```

5. **Seed the database**

Populate with sample data (admin user, drivers, races):
```bash
npx prisma db seed
```

This creates:
- **Admin account**: `admin@nascar.com` / `admin123`
- **Sample users**: `user1@example.com` / `password123`, `user2@example.com` / `password123`
- Sample drivers in Groups A and B
- Sample race schedule for 2024

6. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nascar-fantasy/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── drivers/   # Driver CRUD
│   │   │   ├── races/     # Race CRUD
│   │   │   ├── picks/     # Pick submission
│   │   │   ├── standings/ # Standings retrieval
│   │   │   └── admin/     # Admin endpoints
│   │   ├── admin/         # Admin pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── login/         # Login page
│   │   ├── picks/         # Pick submission page
│   │   ├── standings/     # Standings page
│   │   ├── layout.tsx     # Root layout with navigation
│   │   └── page.tsx       # Home (redirects)
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   └── navigation.tsx # Nav bar component
│   ├── lib/
│   │   ├── auth.ts        # NextAuth configuration
│   │   └── db.ts          # Prisma client
│   ├── types/
│   │   └── next-auth.d.ts # NextAuth types
│   └── middleware.ts      # Route protection
├── .env                   # Environment variables
└── package.json
```

## Usage

### For Competitors

1. **Login** at `/login` with your credentials
2. **View Dashboard** to see next race and your pick status
3. **Make Picks** at `/picks` before race deadline (midnight before race)
4. **Check Standings** at `/standings` to see your ranking
5. **Use Lead Driver** strategically (max 6 times, earns 2x points)

### For Admins

1. **Login** with admin credentials
2. Access admin menu in navigation bar:
   - **Manage Races**: Add/edit races, mark as completed
   - **Manage Drivers**: Add/edit drivers in Groups A & B
   - **Upload Results**: Upload CSV results to calculate points

#### CSV Format for Results Upload

```csv
Position,Driver Number,Driver Name,Points
1,11,Denny Hamlin,40
2,5,Kyle Larson,35
3,9,Chase Elliott,34
...
```

## Database Schema

- **User**: Competitor accounts with team names
- **Driver**: NASCAR drivers organized into Groups A & B
- **Race**: Race schedule with dates and tracks
- **Pick**: Weekly driver selections by competitors
- **LeadDriver**: Lead driver selection and usage tracking
- **RaceResult**: Race finishing positions and points
- **Standings**: Season points totals and weekly breakdown

## Scoring System

- **Base Points**: Points earned by each driver based on finishing position
- **Lead Driver Bonus**: 2x points when activated (max 6 times per season)
- **Weekly Total**: Sum of Group A + Group B driver points (doubled if lead driver used)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Run migrations and seed on production database

### Production Checklist

- [ ] Update `DATABASE_URL` with production database
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npx prisma db seed`
- [ ] Test admin login and all flows

## API Routes

### Public
- `GET /api/drivers` - List drivers (filtered by group/season)
- `GET /api/races` - List races (filtered by season)

### Authenticated
- `GET /api/picks` - Get user's picks
- `POST /api/picks` - Submit picks
- `GET /api/standings` - View standings

### Admin Only
- `POST /api/drivers` - Create driver
- `PATCH /api/drivers/[id]` - Update driver
- `POST /api/races` - Create race
- `PATCH /api/races/[id]` - Update race
- `POST /api/admin/results` - Upload race results

## Development

### Running Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Prisma Studio (database GUI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (destructive!)
npx prisma migrate reset
```

### Database Operations

```bash
# View data in browser
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate

# Create and apply migration
npx prisma migrate dev

# Apply migrations in production
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database credentials and permissions

### NextAuth Errors
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma Client
- Check for TypeScript errors with `npm run lint`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues or questions, contact the league administrator.

---

**Happy Racing! 🏁**
