import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Bypass static files, internal Next.js requests, favicon, assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // images, fonts, icons, etc.
  ) {
    return NextResponse.next();
  }

  const qrParam = searchParams.get('qr');
  const qrCookie = request.cookies.get('tavonza_qr_token')?.value;
  const effectiveQr = qrParam || qrCookie;

  const hasAuth =
    request.cookies.has('access_token') ||
    request.cookies.has('customer_session');

  // 2. Unauthenticated flows
  if (!hasAuth) {
    // 2A. Root landing "/" -> redirect to "/login"
    if (pathname === '/') {
      const loginUrl = new URL('/login', request.url);
      if (effectiveQr) {
        loginUrl.searchParams.set('qr', effectiveQr);
      }
      searchParams.forEach((val, key) => {
        if (key !== 'qr') loginUrl.searchParams.set(key, val);
      });
      const redirectRes = NextResponse.redirect(loginUrl);
      if (effectiveQr) {
        redirectRes.cookies.set('tavonza_qr_token', effectiveQr, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
        });
      }
      return redirectRes;
    }

    const isAuthRoute =
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/verify-otp' ||
      pathname === '/forgot-password' ||
      pathname === '/create-password' ||
      pathname === '/reset-password';

    // 2B. Auth pages: ensure ?qr=[token] is present on the URL if known
    if (isAuthRoute) {
      if (effectiveQr && !searchParams.has('qr')) {
        const dest = new URL(request.url);
        dest.searchParams.set('qr', effectiveQr);
        const redirectRes = NextResponse.redirect(dest);
        redirectRes.cookies.set('tavonza_qr_token', effectiveQr, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
        return redirectRes;
      }
    } else {
      // 2C. Protected routes accessed without authentication -> redirect to /login
      const loginUrl = new URL('/login', request.url);
      if (effectiveQr) {
        loginUrl.searchParams.set('qr', effectiveQr);
      }
      const redirectRes = NextResponse.redirect(loginUrl);
      if (effectiveQr) {
        redirectRes.cookies.set('tavonza_qr_token', effectiveQr, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        });
      }
      return redirectRes;
    }
  } else {
    // 3. Authenticated flows
    // If logged-in customer attempts to access login or register, redirect to menu
    if (pathname === '/login' || pathname === '/register') {
      const menuUrl = new URL('/menu', request.url);
      if (effectiveQr) {
        menuUrl.searchParams.set('qr', effectiveQr);
      }
      return NextResponse.redirect(menuUrl);
    }
  }

  // 4. Default: allow request and ensure QR cookie is preserved
  const response = NextResponse.next();
  if (qrParam) {
    response.cookies.set('tavonza_qr_token', qrParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png (favicon file)
     * - public assets with extensions (png, jpg, svg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
