import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;

  // Protected routes list
  const protectedRoutes = ['/dashboard'];

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If visiting a protected route WITHOUT token → block
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If token exists but invalid → block
  if (token) {
    try {
      verifyToken(token);
    } catch (err) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Enable middleware on these routes
export const config = {
  matcher: ['/dashboard/:path*'],
};
