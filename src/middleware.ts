/**
 * Multi-Tenant Middleware
 *
 * Handles:
 * - Authentication checks
 * - Tenant context injection
 * - Role-based access control
 * - Protected route enforcement
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/blog',
  '/changelog',
  '/api/auth',
]

// Admin-only routes (platform_admin role required)
const ADMIN_ROUTES = [
  '/admin',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }

    // Check if user is authenticated
    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Check admin routes
    if (isAdminRoute(pathname) && token.role !== 'platform_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // For tenant routes, ensure user has a tenant (except platform admins)
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/tenant')) {
      if (token.role !== 'platform_admin' && !token.tenantId) {
        return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url))
      }
    }

    // Add tenant context to headers for API routes
    const requestHeaders = new Headers(req.headers)
    if (token.tenantId) {
      requestHeaders.set('x-tenant-id', token.tenantId)
    }
    requestHeaders.set('x-user-id', token.id)
    requestHeaders.set('x-user-role', token.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

// Configure which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
}
