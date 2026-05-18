import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';
import { NextResponse, type NextRequest } from 'next/server';

const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always',
});

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // 1. Run i18n middleware first to handle locale redirects
  const response = intlMiddleware(request);

  // 2. Auth logic: extract locale and sub-path
  const token = request.cookies.get('accessToken');
  const path = request.nextUrl.pathname;

  const localeMatch = path.match(/^\/([a-z]{2})(\/.*)?$/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const subPath = localeMatch ? (localeMatch[2] || '/') : path;

  const isAuthPage = subPath.startsWith('/login') || subPath.startsWith('/register');
  const isDashboardPage = subPath.startsWith('/dashboard');

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
