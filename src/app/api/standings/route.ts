import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const season = searchParams.get("season");

  if (!season) {
    return NextResponse.json({ error: "Season required" }, { status: 400 });
  }

  const standings = await prisma.standings.findMany({
    where: { season: parseInt(season) },
    include: {
      user: {
        select: { teamName: true },
      },
    },
    orderBy: { totalPoints: "desc" },
  });

  return NextResponse.json(standings);
}

