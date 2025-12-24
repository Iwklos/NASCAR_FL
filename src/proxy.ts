import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

// Equivalent to middleware, but using the new Proxy convention in Next 16
export const { auth: proxy } = NextAuth(authConfig);

export const config = {
  matcher: ["/dashboard/:path*", "/picks/:path*", "/standings/:path*", "/admin/:path*"],
};

export default proxy;

