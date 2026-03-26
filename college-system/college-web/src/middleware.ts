import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_DASHBOARD: Record<string, string> = {
  SUPER_ADMIN: "/principal/dashboard",
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  PARENT: "/parent/dashboard",
  STUDENT: "/student/dashboard",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("access-token")?.value;
  const userRole = request.cookies.get("user-role")?.value;

  const isAuthenticated = !!(accessToken && userRole);

  // 1. Root path behavior
  if (pathname === "/") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/login", request.url));
    }
    // Allow unauthenticated users to see the landing page
    return NextResponse.next();
  }

  // 2. Login path behavior
  if (pathname.startsWith("/login")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Not logged in behavior for protected routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Role-based route protection
  if (pathname.startsWith("/principal") && userRole !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
  }

  if (pathname.startsWith("/admin") && !["SUPER_ADMIN", "ADMIN"].includes(userRole)) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
  }

  if (pathname.startsWith("/teacher") && userRole !== "TEACHER") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
  }

  if (pathname.startsWith("/parent") && userRole !== "PARENT") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
  }

  if (pathname.startsWith("/student") && userRole !== "STUDENT") {
    return NextResponse.redirect(new URL(ROLE_DASHBOARD[userRole] || "/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     * - public images (.png, .svg, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
