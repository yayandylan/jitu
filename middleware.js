import { NextResponse } from 'next/server';

export function middleware(request) {
  // Nanti kita isi logika proteksi route di sini
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};