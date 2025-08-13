import { NextRequest, NextResponse } from "next/server"

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

export function rateLimit(config: RateLimitConfig) {
  return function (request: NextRequest) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Get current rate limit data for this IP
    const current = rateLimitStore.get(ip)
    
    if (!current || current.resetTime < now) {
      // First request or window expired
      rateLimitStore.set(ip, { count: 1, resetTime: now + config.windowMs })
      return null // Allow request
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: config.message || "Too many requests. Please try again later.",
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString()
          }
        }
      )
    }

    // Increment count and allow request
    current.count++
    rateLimitStore.set(ip, current)
    return null // Allow request
  }
}

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) {
      rateLimitStore.delete(ip)
    }
  }
}, 5 * 60 * 1000)

// Predefined rate limit configurations
export const authRateLimit = rateLimit({
  maxRequests: 30, // 30 requests
  windowMs: 30 * 60 * 1000, // 30 minutes
  message: "Too many authentication attempts. Please try again in 30 minutes."
})

export const generalRateLimit = rateLimit({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // 1 minute
  message: "Too many requests. Please slow down."
})

export const uploadRateLimit = rateLimit({
  maxRequests: 10, // 10 uploads
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many file uploads. Please try again later."
}) 