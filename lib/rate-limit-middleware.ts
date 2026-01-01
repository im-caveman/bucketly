import { NextRequest, NextResponse } from 'next/server'
import { strictRateLimit, moderateRateLimit } from '@/lib/rate-limit'

// Rate limiting middleware for API routes
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname
  
  // Skip rate limiting for health checks
  if (pathname === '/api/health') {
    return await handler()
  }
  
  // Apply different rate limits based on route sensitivity
  let rateLimiter = moderateRateLimit
  
  if (pathname.includes('/auth/') || pathname.includes('/api/')) {
    rateLimiter = strictRateLimit
  }
  
  // Check rate limit
  const rateLimitResponse = rateLimiter(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }
  
  // Proceed with the actual handler
  return await handler()
}