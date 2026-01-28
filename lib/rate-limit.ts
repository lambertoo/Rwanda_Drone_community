import { NextRequest, NextResponse } from "next/server"

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message?: string
}

/**
 * Extract client IP for rate limiting. Prefer CF-Connecting-IP (Cloudflare),
 * then first X-Forwarded-For client, then X-Real-IP, then request.ip.
 * Trims and takes first segment to avoid spoofing via appended IPs.
 */
function getClientIp(request: NextRequest): string {
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) return cf.trim().split(',')[0].trim()
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.trim().split(',')[0].trim()
  const xri = request.headers.get('x-real-ip')
  if (xri) return xri.trim().split(',')[0].trim()
  const ip = request.ip
  if (ip) return ip
  return 'unknown'
}

export function rateLimit(config: RateLimitConfig) {
  return function (request: NextRequest) {
    const ip = getClientIp(request)
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
  maxRequests: 10, // 10 attempts per window (brute-force protection)
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many authentication attempts. Please try again in 15 minutes."
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