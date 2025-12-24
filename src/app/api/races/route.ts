import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");

  const races = await prisma.race.findMany({
    where: season ? { season: parseInt(season) } : {},
    orderBy: { date: "asc" },
  });

  return NextResponse.json(races);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  const race = await prisma.race.create({
    data: {
      name: body.name,
      track: body.track,
      date: new Date(body.date),
      season: body.season,
      raceNumber: body.raceNumber,
    },
  });

  return NextResponse.json(race);
}

