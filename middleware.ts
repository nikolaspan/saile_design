import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    // Cast req to access nextauth property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (req as any).nextauth?.token;
    const { pathname } = req.nextUrl;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Normalize role to lowercase for consistent comparison
    const role = (token.role as string).toLowerCase();

    if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith("/dashboard/concierge") && role !== "concierge") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    if (pathname.startsWith("/dashboard/b2b") && role !== "b2b") {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    // Prevent logged-in users from accessing login page
    if (pathname === "/login" && token) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
    return NextResponse.next();
  },
  { pages: { signIn: "/login" } }
);

export const config = {
  matcher: ["/dashboard/:path*", "/login"]
};
