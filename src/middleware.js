// middleware.js
import { NextResponse } from 'next/server';
// import { getSession } from './lib/auth'; // You should not need this in middleware for simple redirect logic

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log('[MW] pathname:', pathname);

  // Protect every /admin/* route except /admin/login and /admin/register
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/register') {

    // Retrieves the session token (a Cookie object)
    const sessionToken = request.cookies.get('session_token');

    console.log('[MW] session token:', sessionToken);

    if (!sessionToken) {
      console.log('[MW] no session → redirecting to /admin/login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    console.log('[MW] session found → continue');
    return NextResponse.next();
  }

  // If user is already logged in and tries to access login/register, redirect to admin
  if (pathname === '/admin/login' || pathname === '/admin/register') {
    const sessionToken = request.cookies.get('session_token');

    if (sessionToken) {
      console.log('[MW] already logged in → redirecting to /admin');
      // Get the referrer or fallback to /admin
      const referer = request.headers.get('referer');
      let redirectUrl = '/admin';

      // If there's a referrer and it's from the same origin, use it
      if (referer) {
        try {
          const refererUrl = new URL(referer);
          const currentUrl = new URL(request.url);

          // Only redirect to referrer if it's from same origin and not login/register
          if (refererUrl.origin === currentUrl.origin &&
            !refererUrl.pathname.includes('/login') &&
            !refererUrl.pathname.includes('/register')) {
            redirectUrl = refererUrl.pathname;
          }
        } catch (error) {
          // If referrer parsing fails, stick with /admin
          console.log('[MW] referrer parsing failed, using /admin');
        }
      }

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};