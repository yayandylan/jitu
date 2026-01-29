import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Ambil token/session dari Cookie (asumsi nama cookienya 'token')
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Proteksi Halaman Admin
  if (pathname.startsWith('/admin')) {
    // Jika tidak ada token, tendang ke halaman login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Nanti di sini bisa ditambah pengecekan Role Admin via JWT
    // Tapi untuk awal, pengecekan token sudah cukup aman.
  }

  return NextResponse.next();
}

// 3. Tentukan halaman mana saja yang dijaga oleh Middleware
export const config = {
  matcher: [
    '/admin/:path*', // Menjaga semua folder di dalam /admin
    '/api/admin/:path*' // Menjaga semua API admin agar tidak bisa ditembak dari luar
  ],
};