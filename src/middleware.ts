import { auth } from "@/lib/auth";

export default auth((req) => {
  // Add any custom middleware logic here if needed
  return;
});

export const config = {
  matcher: ["/dashboard/:path*", "/picks/:path*", "/standings/:path*", "/admin/:path*"],
};

