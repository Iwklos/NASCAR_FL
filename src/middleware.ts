import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

// Edge-compatible proxy for Next.js 16
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/picks/:path*", "/standings/:path*", "/admin/:path*"],
};

export default proxy;

