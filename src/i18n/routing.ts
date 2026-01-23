import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['es', 'en', 'pt'],

    // Used when no locale matches
    defaultLocale: 'es',

    // Prefix default locale (false means /es/dashboard -> /dashboard)
    // Let's keep it true for clarity or false for cleaner URLs on default.
    // Usually 'as-needed' is best but let's stick to simple first.
    // 'always' puts prefix always.
    localePrefix: 'always'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
