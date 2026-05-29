import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all /analyst routes
  if (pathname.startsWith('/analyst')) {
    // Check for JWT in cookie (set by backend as httpOnly cookie named 'beacon_jwt')
    const jwt = request.cookies.get('beacon_jwt')?.value
    if (jwt === undefined || jwt === '') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/analyst/:path*'],
}
