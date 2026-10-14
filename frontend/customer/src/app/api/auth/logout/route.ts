import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CUSTOMER_COOKIE } from '@/lib/constants';

export async function POST() {
  const cookieStore = await cookies();

  // Delete all authentication and session cookies on server
  cookieStore.delete(CUSTOMER_COOKIE);
  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('tavonza_customer_session_id');

  const response = NextResponse.json({
    success: true,
    message: 'Logged out and cookies cleared successfully',
  });

  // Explicitly add Set-Cookie headers with expired date to purge httpOnly cookies in the browser
  const expiredCookieOptions = {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    sameSite: 'lax' as const,
  };

  response.cookies.set(CUSTOMER_COOKIE, '', expiredCookieOptions);
  response.cookies.set('access_token', '', expiredCookieOptions);
  response.cookies.set('refresh_token', '', expiredCookieOptions);
  response.cookies.set('tavonza_customer_session_id', '', expiredCookieOptions);

  return response;
}
