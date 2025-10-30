import { NextResponse } from 'next/server';

export function middleware(req) {
  if (req.nextUrl.pathname === '/manifest.webmanifest') {
    return NextResponse.next();
  }

  return NextResponse.next();
}
