// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const isAdmin = req.nextUrl.pathname.startsWith('/admin')

    // Handle reseller ref parameter
    const ref = req.nextUrl.searchParams.get('ref')
    if (ref && isValidResellerRef(ref)) {
      // Valid reseller ref - allow the request to proceed
      // The ResellerProvider will handle the locking logic on client side
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

// Helper function to validate reseller ref
function isValidResellerRef(ref: string): boolean {
  const validRefs = ['RESELLER-A', 'RESELLER-B', 'RESELLER-C']
  return validRefs.includes(ref)
}

export const config = {
  matcher: ['/admin/:path*'],
}