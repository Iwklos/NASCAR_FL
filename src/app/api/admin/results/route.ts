import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { raceId, results } = body;

  try {
    // Save race results
    for (const result of results) {
      // Find driver by name or number
      const driver = await prisma.driver.findFirst({
        where: {
          OR: [
            { name: { contains: result.driverName } },
            { number: result.driverNumber },
          ],
        },
      });

      if (driver) {
        await prisma.raceResult.upsert({
          where: {
            raceId_driverId: {
              raceId,
              driverId: driver.id,
            },
          },
          update: {
            position: result.position,
            points: result.points,
          },
          create: {
            raceId,
            driverId: driver.id,
            position: result.position,
            points: result.points,
          },
        });
      }
    }

    // Mark race as completed
    await prisma.race.update({
      where: { id: raceId },
      data: { completed: true },
    });

    // Calculate points for all competitors
    await calculateStandings(raceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing results:", error);
    return NextResponse.json(
      { error: "Failed to process results" },
      { status: 500 }
    );
  }
}

async function calculateStandings(raceId: string) {
  // Get all picks for this race
  const picks = await prisma.pick.findMany({
    where: { raceId },
    include: {
      driverA: true,
      driverB: true,
    },
  });

  const race = await prisma.race.findUnique({ where: { id: raceId } });
  if (!race) return;

  // Get race results
  const results = await prisma.raceResult.findMany({
    where: { raceId },
  });

  // Calculate points for each competitor
  for (const pick of picks) {
    const driverAResult = results.find((r) => r.driverId === pick.driverAId);
    const driverBResult = results.find((r) => r.driverId === pick.driverBId);

    let weekPoints = 0;
    if (driverAResult) weekPoints += driverAResult.points;
    if (driverBResult) weekPoints += driverBResult.points;

    // Double points if lead driver was used
    if (pick.isLeadDriver) {
      weekPoints *= 2;
    }

    // Update standings
    const existingStanding = await prisma.standings.findUnique({
      where: {
        userId_season: {
          userId: pick.userId,
          season: race.season,
        },
      },
    });

    if (existingStanding) {
      const weeklyPoints = existingStanding.weeklyPoints as any;
      weeklyPoints[`race_${race.raceNumber}`] = weekPoints;

      await prisma.standings.update({
        where: {
          userId_season: {
            userId: pick.userId,
            season: race.season,
          },
        },
        data: {
          totalPoints: { increment: weekPoints },
          weeklyPoints: weeklyPoints,
          lastUpdated: new Date(),
        },
      });
    } else {
      await prisma.standings.create({
        data: {
          userId: pick.userId,
          season: race.season,
          totalPoints: weekPoints,
          weeklyPoints: { [`race_${race.raceNumber}`]: weekPoints },
        },
      });
    }
  }
}

