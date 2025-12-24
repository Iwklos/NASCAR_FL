import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");
  const season = searchParams.get("season");

  const drivers = await prisma.driver.findMany({
    where: {
      ...(group && { group }),
      ...(season && { season: parseInt(season) }),
      active: true,
    },
    orderBy: { number: "asc" },
  });

  return NextResponse.json(drivers);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  
  const driver = await prisma.driver.create({
    data: {
      name: body.name,
      number: body.number,
      group: body.group,
      season: body.season,
    },
  });

  return NextResponse.json(driver);
}

