import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  const isAuthenticated = !!token;

  // If the user is authenticated and tries to access login/register, redirect to dashboard
  if (isAuthenticated && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If the user is not authenticated and tries to access a protected route, redirect to login
  if (!isAuthenticated && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
