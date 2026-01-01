import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for API routes
// For production, consider using Redis or a dedicated service
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
}

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_CONFIG, ...config }
  
  return function (request: NextRequest) {
    const ip = getClientIP(request)
    const now = Date.now()
    
    // Clean up expired entries
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key)
      }
    }
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(ip)
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs }
      rateLimitStore.set(ip, entry)
    }
    
    // Increment request count
    entry.count++
    
    // Set rate limit headers
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
      'X-RateLimit-Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
    }
    
    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
          retryAfter: headers['X-RateLimit-Retry-After']
        },
        { 
          status: 429,
          headers
        }
      )
    }
    
    return null // No rate limit violation
  }
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return 'unknown' // request.ip is deprecated in Next.js 13+
}

// Higher-level rate limits for sensitive endpoints
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 requests per minute
})

export const moderateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 30 // 30 requests per minute
})

export const lenientRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100 // 100 requests per minute
})