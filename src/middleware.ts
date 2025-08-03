import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'zh'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Use prefix for non-default locales only
  localePrefix: 'as-needed',

  // Disable automatic locale detection to always default to 'en'
  localeDetection: false
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - ../public (static files)
    // - ../api (API routes)
    // - ../_next (internal Next.js files)
    '/((?!api|_next|favicon.ico).*)'
  ]
};