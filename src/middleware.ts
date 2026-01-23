import { auth } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const publicPages = ["/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Check if the path is a public page (ignoring locale)
  const pathname = nextUrl.pathname;
  // If path is root '/', it will be redirected by intlMiddleware, so we can skip custom auth checks for now
  // and let intlMiddleware handle the redirect to /[locale].
  // But wait, if we are at '/', we don't know the locale yet. Next-intl detects it.

  // If we are already at /[locale]/..., we can check auth.
  const segments = pathname.split('/');
  const locale = segments[1];
  const isLocalePrefix = routing.locales.includes(locale as any);

  // If no locale prefix (e.g. /), let intlMiddleware handle it first
  if (!isLocalePrefix && pathname !== '/') {
    // This might be some other static asset or unwrapped path
  }

  // Get path without locale for auth checking
  const pathWithoutLocale = isLocalePrefix
    ? '/' + segments.slice(2).join('/')
    : pathname;

  // Clean up trailing slash
  const cleanPath = pathWithoutLocale === '/' ? '/' : pathWithoutLocale.replace(/\/$/, "");

  const isPublicPage = publicPages.includes(cleanPath);

  // If logged in and accessing public auth pages (login/register), redirect to dashboard
  if (isLoggedIn && isPublicPage) {
    const targetLocale = isLocalePrefix ? locale : routing.defaultLocale; // Use default if unknown, though intlMiddleware usually handles this
    return NextResponse.redirect(new URL(`/${targetLocale}`, nextUrl.origin));
  }

  // If not logged in and accessing private pages (everything else), redirect to login
  if (!isLoggedIn && !isPublicPage) {
    // If it's just root '/', allow intlMiddleware to redirect to /es first.
    // The redirect will come back as /es, then we check auth.
    if (pathname !== '/') {
      const targetLocale = isLocalePrefix ? locale : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${targetLocale}/login`, nextUrl.origin));
    }
  }

  // Handle internationalization
  return intlMiddleware(req);
});

export const config = {
  // Skip all internal paths
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
