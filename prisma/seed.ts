import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nascar.com' },
    update: {},
    create: {
      email: 'admin@nascar.com',
      password: hashedPassword,
      teamName: 'Admin Team',
      isAdmin: true,
    },
  });
  console.log('✅ Created admin user');

  // Create sample competitor users
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', 10),
      teamName: 'Speed Demons',
      isAdmin: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', 10),
      teamName: 'Track Masters',
      isAdmin: false,
    },
  });
  console.log('✅ Created sample users');

  // Group A Drivers (Top-tier)
  const driversGroupA = [
    { name: 'Kyle Larson', number: '5' },
    { name: 'Chase Elliott', number: '9' },
    { name: 'Martin Truex Jr.', number: '19' },
    { name: 'Denny Hamlin', number: '11' },
    { name: 'William Byron', number: '24' },
    { name: 'Christopher Bell', number: '20' },
    { name: 'Tyler Reddick', number: '45' },
    { name: 'Kyle Busch', number: '8' },
  ];

  for (const driver of driversGroupA) {
    await prisma.driver.upsert({
      where: {
        number_season: {
          number: driver.number,
          season: 2024,
        },
      },
      update: {},
      create: {
        name: driver.name,
        number: driver.number,
        group: 'A',
        season: 2024,
        active: true,
      },
    });
  }
  console.log('✅ Created Group A drivers');

  // Group B Drivers (Mid-tier)
  const driversGroupB = [
    { name: 'Bubba Wallace', number: '23' },
    { name: 'Ross Chastain', number: '1' },
    { name: 'Daniel Suarez', number: '99' },
    { name: 'Chase Briscoe', number: '14' },
    { name: 'Alex Bowman', number: '48' },
    { name: 'AJ Allmendinger', number: '16' },
    { name: 'Ryan Blaney', number: '12' },
    { name: 'Brad Keselowski', number: '6' },
  ];

  for (const driver of driversGroupB) {
    await prisma.driver.upsert({
      where: {
        number_season: {
          number: driver.number,
          season: 2024,
        },
      },
      update: {},
      create: {
        name: driver.name,
        number: driver.number,
        group: 'B',
        season: 2024,
        active: true,
      },
    });
  }
  console.log('✅ Created Group B drivers');

  // Create sample race schedule
  const races = [
    { name: 'Daytona 500', track: 'Daytona International Speedway', date: new Date('2024-02-18'), raceNumber: 1 },
    { name: 'Pennzoil 400', track: 'Las Vegas Motor Speedway', date: new Date('2024-03-03'), raceNumber: 2 },
    { name: 'Shriners Children\'s 500', track: 'Phoenix Raceway', date: new Date('2024-03-10'), raceNumber: 3 },
    { name: 'Coca-Cola 600', track: 'Charlotte Motor Speedway', date: new Date('2024-05-26'), raceNumber: 4 },
    { name: 'Hollywood Casino 400', track: 'Kansas Speedway', date: new Date('2024-09-29'), raceNumber: 5 },
  ];

  for (const race of races) {
    await prisma.race.upsert({
      where: {
        season_raceNumber: {
          season: 2024,
          raceNumber: race.raceNumber,
        },
      },
      update: {},
      create: {
        name: race.name,
        track: race.track,
        date: race.date,
        season: 2024,
        raceNumber: race.raceNumber,
        completed: false,
      },
    });
  }
  console.log('✅ Created sample races');

  // Create standings for sample users
  await prisma.standings.upsert({
    where: {
      userId_season: {
        userId: user1.id,
        season: 2024,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      season: 2024,
      totalPoints: 0,
      weeklyPoints: {},
    },
  });

  await prisma.standings.upsert({
    where: {
      userId_season: {
        userId: user2.id,
        season: 2024,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      season: 2024,
      totalPoints: 0,
      weeklyPoints: {},
    },
  });
  console.log('✅ Created initial standings');

  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@nascar.com / admin123');
  console.log('   User 1: user1@example.com / password123');
  console.log('   User 2: user2@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

