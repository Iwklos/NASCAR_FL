import { NextResponse } from "next/server";

// Minimal test endpoint - doesn't need database or auth
export async function GET() {
  return NextResponse.json({
    status: "App is running!",
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      hasAuthSecret: !!process.env.AUTH_SECRET,
    }
  });
}

