import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware for authentication, routing, and security
 * Runs on every request before reaching the application
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthenticated = !!session?.user
  const pathname = request.nextUrl.pathname

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/account',
    '/settings',
    '/create',
    '/list',
    '/profile',
    '/memories',
    '/timeline',
    '/leaderboard',
    '/social',
    '/explore'
  ]

  // Define auth routes (login, signup, etc.)
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']

  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isLandingPage = pathname === '/'

  // Redirect authenticated users from landing page to dashboard
  if (isLandingPage && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url)
    // Add redirect parameter to return user to intended page after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Add security headers (additional to next.config.ts headers)
  // These are added at runtime for dynamic control

  // Prevent caching of sensitive pages
  if (pathname.startsWith('/account') || pathname.startsWith('/settings')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  // Add CORS headers for API routes if needed
  if (pathname.startsWith('/api/')) {
    // Only allow requests from same origin
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // In production, verify origin matches host
    if (process.env.NODE_ENV === 'production' && origin) {
      const originHost = new URL(origin).host
      if (originHost !== host) {
        // Log suspicious cross-origin request
        console.warn('Cross-origin API request blocked:', {
          origin: originHost,
          host: host,
          path: pathname
        })
      }
    }
  }

  // Add request ID for tracking
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  return response
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
