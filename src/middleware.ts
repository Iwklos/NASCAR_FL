export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/picks/:path*", "/standings/:path*", "/admin/:path*"],
};

