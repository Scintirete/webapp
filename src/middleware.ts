import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - ../public (static files)
    // - ../api (API routes)
    // - ../_next (internal Next.js files)
    '/((?!api|_next|favicon.ico|screenshots|logo.png|manager-ui.png).*)'
  ]
};