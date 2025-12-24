# NASCAR Fantasy League App - Product Requirements Document (PRD)

## Project Overview
Build a NASCAR fantasy league web application where competitors select drivers from two groups (A & B) each week, with points awarded based on race results. The app includes admin tools for managing races, drivers, and results processing.

---

## PHASE 1: Initial Setup

### 1.1 Create Next.js Project
```bash
npx create-next-app@latest nascar-fantasy --typescript --tailwind --app --src-dir
cd nascar-fantasy
```

### 1.2 Install Dependencies
```bash
npm install prisma @prisma/client next-auth@beta bcryptjs zod react-hook-form @hookform/resolvers date-fns xlsx
npm install -D @types/bcryptjs @types/node

npx prisma init
npx shadcn@latest init
npx shadcn@latest add button form input table select card label toast dialog dropdown-menu badge separator tabs alert
```

### 1.3 Environment Setup
Create `.env` file:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## PHASE 2: Database Schema

### 2.1 Create Prisma Schema
File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  teamName      String   @unique
  isAdmin       Boolean  @default(false)
  createdAt     DateTime @default(now())
  
  picks         Pick[]
  leadDriver    LeadDriver?
  standings     Standings[]
}

model Driver {
  id            String   @id @default(cuid())
  name          String
  number        String
  group         String
  season        Int
  active        Boolean  @default(true)
  
  picksA        Pick[]   @relation("DriverA")
  picksB        Pick[]   @relation("DriverB")
  leadDrivers   LeadDriver[]
  results       RaceResult[]
}

model LeadDriver {
  id            String   @id @default(cuid())
  userId        String   @unique
  driverId      String
  season        Int
  timesUsed     Int      @default(0)
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  driver        Driver   @relation(fields: [driverId], references: [id])
  
  @@unique([userId, season])
}

model Race {
  id            String   @id @default(cuid())
  name          String
  track         String
  date          DateTime
  season        Int
  raceNumber    Int
  completed     Boolean  @default(false)
  resultsFileUrl String?
  
  picks         Pick[]
  results       RaceResult[]
  
  @@unique([season, raceNumber])
}

model Pick {
  id            String   @id @default(cuid())
  userId        String
  raceId        String
  driverAId     String
  driverBId     String
  isLeadDriver  Boolean  @default(false)
  submittedAt   DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  race          Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)
  driverA       Driver   @relation("DriverA", fields: [driverAId], references: [id])
  driverB       Driver   @relation("DriverB", fields: [driverBId], references: [id])
  
  @@unique([userId, raceId])
}

model RaceResult {
  id            String   @id @default(cuid())
  raceId        String
  driverId      String
  position      Int
  points        Int
  
  race          Race     @relation(fields: [raceId], references: [id], onDelete: Cascade)
  driver        Driver   @relation(fields: [driverId], references: [id])
  
  @@unique([raceId, driverId])
}

model Standings {
  id            String   @id @default(cuid())
  userId        String
  season        Int
  totalPoints   Int
  weeklyPoints  Json
  lastUpdated   DateTime @default(now())
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, season])
}
```

### 2.2 Run Migration
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## PHASE 3: Authentication

### 3.1 Auth Requirements
- NextAuth v5 with credentials provider
- Password hashing with bcrypt
- JWT session strategy
- Admin role support
- TypeScript type definitions

### 3.2 Required Files
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/db.ts` - Prisma client singleton
- `src/app/api/auth/[...nextauth]/route.ts` - Auth API handler
- `src/types/next-auth.d.ts` - TypeScript types

---

## PHASE 4: Core API Routes

### 4.1 Drivers API
**Endpoint**: `/api/drivers`
- **GET**: List drivers (filter by group, season)
- **POST**: Create driver (admin only)

**Endpoint**: `/api/drivers/[id]`
- **PATCH**: Update driver (admin only)

### 4.2 Races API
**Endpoint**: `/api/races`
- **GET**: List races (filter by season)
- **POST**: Create race (admin only)

**Endpoint**: `/api/races/[id]`
- **PATCH**: Update race (admin only)

### 4.3 Picks API
**Endpoint**: `/api/picks`
- **GET**: Get user's picks (or all picks for a race)
- **POST**: Submit picks with validations:
  - Check deadline hasn't passed
  - Validate lead driver usage (max 6 times)
  - Ensure one pick per race per user

### 4.4 Standings API
**Endpoint**: `/api/standings`
- **GET**: Get standings for a season

### 4.5 Admin Results API
**Endpoint**: `/api/admin/results`
- **POST**: Upload race results
  - Parse CSV/Excel file
  - Save results to database
  - Calculate points for all competitors
  - Update standings

---

## PHASE 5: Key UI Pages

### 5.1 Login Page (`/login`)
- Email and password form
- Error handling
- Redirect to dashboard on success

### 5.2 Dashboard Page (`/dashboard`)
- Welcome message with user's team name
- Next race information
- Pick status (submitted or not)
- Quick link to submit picks

### 5.3 Picks Submission Page (`/picks`)
- Race selection dropdown
- Group A driver selection
- Group B driver selection
- Lead driver toggle checkbox
- Submit button with validation
- Show deadline information

### 5.4 Standings Page (`/standings`)
- Table showing all competitors
- Rank, team name, total points
- Ordered by points descending

---

## PHASE 6: Admin Pages

### 6.1 Admin Race Management (`/admin/races`)
- Table of all races
- Add new race form (name, track, date, season, race number)
- Edit existing races
- Mark races as completed
- Delete races

### 6.2 Admin Driver Management (`/admin/drivers`)
- Tabs for Group A and Group B
- Table of drivers in each group
- Add new driver form (name, number, group, season)
- Edit drivers
- Activate/deactivate drivers

### 6.3 Admin Results Upload (`/admin/results`)
- Race selection dropdown
- File upload (CSV/Excel)
- Preview results before processing
- Column mapping (driver name/number, position, points)
- Process button to save results and calculate standings

**CSV Format Expected**:
```csv
Position,Driver Number,Driver Name,Points
1,11,Denny Hamlin,40
2,5,Kyle Larson,35
```

---

## PHASE 7: Final Polish

### 7.1 Layout with Navigation
- Navigation bar with logo
- Links: Dashboard, Picks, Standings, Schedule
- Admin dropdown menu (if user is admin)
- User name display
- Logout button
- Responsive mobile menu

### 7.2 Middleware for Protection
File: `src/middleware.ts`
- Protect routes: `/dashboard`, `/picks`, `/admin/*`
- Redirect unauthenticated users to `/login`

### 7.3 Seed Script
File: `prisma/seed.ts`
- Create admin user (email: admin@nascar.com, password: admin123)
- Create sample competitor users
- Add drivers to Groups A and B
- Add sample race schedule
- Initialize standings

---

## BUILD ORDER FOR CURSOR AGENT

### Step 1: Foundation
1. Set up project structure and install dependencies
2. Create Prisma schema and run migrations
3. Set up authentication (auth.ts, API route, types)
4. Create basic layout with navigation

### Step 2: Core APIs
1. Drivers API (GET, POST)
2. Races API (GET, POST)
3. Picks API (GET, POST with validations)
4. Standings API (GET)

### Step 3: User Pages
1. Login page
2. Dashboard page
3. Picks submission page
4. Standings page

### Step 4: Admin Pages
1. Admin race management
2. Admin driver management
3. Admin results upload and processing

### Step 5: Polish
1. Add navigation to layout
2. Add middleware protection
3. Create seed script
4. Test all flows end-to-end

---

## TESTING CHECKLIST

### User Flow
- [ ] Login as competitor
- [ ] View dashboard with next race
- [ ] Submit picks (Group A, Group B, lead driver toggle)
- [ ] View standings
- [ ] Try to submit picks after deadline (should fail)

### Admin Flow
- [ ] Login as admin
- [ ] Add new race
- [ ] Add new driver
- [ ] Upload race results
- [ ] Verify standings update correctly

### Lead Driver Logic
- [ ] Select lead driver at season start
- [ ] Use lead driver in a week
- [ ] Verify usage count increments
- [ ] Try to use after 6 times (should fail)

### Deadline Enforcement
- [ ] Submit picks before deadline (should work)
- [ ] Try to edit picks after deadline (should fail)

---

## KEY BUSINESS RULES

### Scoring System
- **Base Points**: Points earned by driver based on finishing position
- **Lead Driver Bonus**: When activated, competitor earns 2x points for that week
- **Lead Driver Limit**: Can only be used 6 times per season
- **Weekly Total**: Sum of Group A driver + Group B driver points (doubled if lead driver used)

### Pick Submission Rules
- Must select one driver from Group A
- Must select one driver from Group B
- One submission per race per user
- Cannot edit after deadline (midnight before race)
- Lead driver toggle optional

### Driver Groups
- **Group A**: Top-tier drivers (typically former champions, consistent winners)
- **Group B**: Mid-tier drivers (competitive but less dominant)
- Groups balanced for fair competition

### Admin Responsibilities
- Maintain accurate driver roster
- Update race schedule
- Upload results after each race
- Monitor for any issues or corrections needed

---

## DEPLOYMENT INSTRUCTIONS

### 1. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Deploy to Vercel
1. Connect repository to Vercel
2. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Deploy

### 3. Production Setup
1. Run migrations on production database
2. Run seed script to create admin user
3. Add current season drivers
4. Add race schedule
5. Invite competitors to create accounts

---

## TECHNICAL REQUIREMENTS

### Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js v5
- **UI**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS

### Code Quality Standards
- TypeScript strict mode enabled
- Proper error handling on all API routes
- Input validation on client and server
- DRY principles
- Modular code organization
- Responsive design (mobile-first)
- Loading states and error messages
- Security best practices

### Performance Requirements
- Fast page loads (< 2s)
- Optimized database queries
- Proper indexing on frequently queried fields
- Image optimization
- Code splitting

---

## FUTURE ENHANCEMENTS (Out of Scope for Initial Build)

- [ ] Mobile app (React Native)
- [ ] Real-time race tracking
- [ ] Live leaderboard updates during races
- [ ] Email notifications for deadlines
- [ ] Historical stats and analytics
- [ ] Private leagues with custom rules
- [ ] Social features (comments, trash talk)
- [ ] Integration with NASCAR official API
- [ ] Fantasy draft mode
- [ ] Playoff bracket predictions

---

## SUCCESS CRITERIA

The application is considered complete when:

1. ✅ All 7 phases implemented
2. ✅ All user flows working end-to-end
3. ✅ All admin tools functional
4. ✅ Proper authentication and authorization
5. ✅ Database properly structured
6. ✅ Responsive design on all devices
7. ✅ Comprehensive documentation
8. ✅ Seed data for testing
9. ✅ Production deployment ready
10. ✅ All business rules enforced

---

## SUPPORT & MAINTENANCE

### Regular Tasks
- Update driver rosters each season
- Add new race schedules
- Monitor for bugs or issues
- Back up database regularly
- Update dependencies periodically

### User Support
- Provide login credentials
- Answer questions about rules
- Handle pick submission issues
- Process any corrections needed

---

**Document Version**: 1.0  
**Last Updated**: December 24, 2025  
**Status**: ✅ Complete - All Requirements Implemented

