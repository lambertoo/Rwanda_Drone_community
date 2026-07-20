import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export interface RateLimitConfig {
  bucket: string
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

// DB-backed so the counter is shared across all Vercel serverless instances
// (an in-memory Map resets on every cold start and isn't shared, making it
// trivially bypassable). Fails OPEN: if the limiter DB call errors we allow
// the request rather than lock every user out on a transient DB issue.
export function rateLimit(config: RateLimitConfig) {
  return async function (request: NextRequest): Promise<NextResponse | null> {
    const key = `${config.bucket}:${getClientIp(request)}`
    const windowStart = new Date(Date.now() - config.windowMs)

    try {
      const count = await prisma.rateLimitHit.count({
        where: { key, createdAt: { gte: windowStart } },
      })

      if (count >= config.maxRequests) {
        const retryAfter = Math.ceil(config.windowMs / 1000)
        return NextResponse.json(
          { error: config.message || "Too many requests. Please try again later.", retryAfter },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        )
      }

      await prisma.rateLimitHit.create({ data: { key } })

      // Opportunistic cleanup on the first hit of a window, keyed to this key
      // only, so the table doesn't grow without bound.
      if (count === 0) {
        prisma.rateLimitHit
          .deleteMany({ where: { key, createdAt: { lt: windowStart } } })
          .catch(() => {})
      }

      return null
    } catch (error) {
      console.error('Rate limiter DB error (failing open):', error)
      return null
    }
  }
}

// Predefined rate limit configurations
export const authRateLimit = rateLimit({
  bucket: 'auth',
  maxRequests: 10, // 10 attempts per window (brute-force protection)
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many authentication attempts. Please try again in 15 minutes.",
})

export const generalRateLimit = rateLimit({
  bucket: 'general',
  maxRequests: 100,
  windowMs: 60 * 1000,
  message: "Too many requests. Please slow down.",
})

export const uploadRateLimit = rateLimit({
  bucket: 'upload',
  maxRequests: 10,
  windowMs: 60 * 60 * 1000,
  message: "Too many file uploads. Please try again later.",
})
