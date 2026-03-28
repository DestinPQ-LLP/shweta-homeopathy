import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');

export const config = {
  matcher: ['/admin/:path*'],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the login page and its API through
  if (pathname === '/admin/login') return NextResponse.next();

  const token = req.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    res.cookies.delete('admin_token');
    return res;
  }
}
