// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// PERBAIKAN: Menggunakan type assertion untuk mengakses nextauth yang disuntikkan oleh withAuth
export default withAuth(
  function middleware(req: NextRequest) {
    const authReq = req as any; // Cast ke any untuk mengakses properti yang disuntikkan
    const token = authReq.nextauth.token;
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    // Handle reseller ref parameter
    const ref = req.nextUrl.searchParams.get('ref')
    
    if (ref) {
      return NextResponse.next()
    }

    // Redirect ke login jika tidak ada token untuk admin
    if (isAdmin && !token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Helper function to validate reseller ref (dihapus karena validasi dilakukan di client/API)
// function isValidResellerRef(ref: string): boolean { ... }

export const config = {
  matcher: ['/admin/:path*'],
}