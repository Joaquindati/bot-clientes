import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from login/register pages
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  // Redirect unauthenticated users to login page
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
