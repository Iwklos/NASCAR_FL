import { NextResponse } from "next/server";

export async function GET() {
  const checks: {
    status: string;
    timestamp: string;
    environment: string | undefined;
    checks: {
      databaseUrl: boolean;
      authSecret: boolean;
      authTrustHost: string | undefined;
      authUrl: string | undefined;
      database?: boolean;
    };
    errors: string[];
  } = {
    status: "checking",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      databaseUrl: !!process.env.DATABASE_URL,
      authSecret: !!process.env.AUTH_SECRET,
      authTrustHost: process.env.AUTH_TRUST_HOST,
      authUrl: process.env.AUTH_URL,
    },
    errors: [],
  };

  // Check required env vars
  if (!process.env.DATABASE_URL) {
    checks.errors.push("DATABASE_URL is not set");
  }
  if (!process.env.AUTH_SECRET) {
    checks.errors.push("AUTH_SECRET is not set");
  }

  // Try database connection
  try {
    const { prisma } = await import("@/lib/db");
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
  } catch (error) {
    checks.checks.database = false;
    checks.errors.push(
      `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }

  // Set overall status
  checks.status = checks.errors.length === 0 ? "healthy" : "unhealthy";

  return NextResponse.json(checks, {
    status: checks.errors.length === 0 ? 200 : 503,
  });
}

