import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const raceId = searchParams.get("raceId");

  if (raceId) {
    const picks = await prisma.pick.findMany({
      where: { raceId },
      include: {
        user: { select: { teamName: true } },
        driverA: true,
        driverB: true,
      },
    });
    return NextResponse.json(picks);
  }

  const userPicks = await prisma.pick.findMany({
    where: { userId: session.user.id },
    include: {
      race: true,
      driverA: true,
      driverB: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(userPicks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  // Check if race deadline has passed
  const race = await prisma.race.findUnique({
    where: { id: body.raceId },
  });

  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  const deadline = new Date(race.date);
  deadline.setHours(0, 0, 0, 0); // Midnight before race

  if (new Date() > deadline) {
    return NextResponse.json({ error: "Deadline has passed" }, { status: 400 });
  }

  // Check lead driver usage if applicable
  if (body.isLeadDriver) {
    const leadDriver = await prisma.leadDriver.findUnique({
      where: { userId: session.user.id },
    });

    if (!leadDriver) {
      return NextResponse.json({ error: "No lead driver selected" }, { status: 400 });
    }

    if (leadDriver.timesUsed >= 6) {
      return NextResponse.json({ error: "Lead driver limit reached" }, { status: 400 });
    }
  }

  const pick = await prisma.pick.upsert({
    where: {
      userId_raceId: {
        userId: session.user.id,
        raceId: body.raceId,
      },
    },
    update: {
      driverAId: body.driverAId,
      driverBId: body.driverBId,
      isLeadDriver: body.isLeadDriver,
    },
    create: {
      userId: session.user.id,
      raceId: body.raceId,
      driverAId: body.driverAId,
      driverBId: body.driverBId,
      isLeadDriver: body.isLeadDriver,
    },
  });

  // Update lead driver usage if used
  if (body.isLeadDriver) {
    await prisma.leadDriver.update({
      where: { userId: session.user.id },
      data: { timesUsed: { increment: 1 } },
    });
  }

  return NextResponse.json(pick);
}

