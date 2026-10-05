import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'bn'],
  defaultLocale: 'en'
});

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value || request.cookies.get('token')?.value;

  let role = null;
  if (token) {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      role = JSON.parse(atob(base64))?.role;
    } catch (e) {}
  }

  const pathWithoutLocale = pathname.replace(/^\/(en|bn)(\/|$)/, '/');

  if (!token && (pathWithoutLocale.startsWith('/admin') || pathWithoutLocale.startsWith('/courier') || pathWithoutLocale.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && pathWithoutLocale.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && pathWithoutLocale.startsWith('/courier') && role !== 'COURIER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
    if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'COURIER') return NextResponse.redirect(new URL('/courier', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};