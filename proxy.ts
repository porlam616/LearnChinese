import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const sessionValue = req.cookies.get('lc_session')?.value;
  const isLoggedIn = !!sessionValue && Number.isFinite(Number(sessionValue));
  const { pathname } = req.nextUrl;

  const isPublic = pathname === '/login' || pathname.startsWith('/api/login');

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
