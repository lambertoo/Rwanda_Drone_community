import { NextResponse } from "next/server"

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  )

  // HSTS (HTTP Strict Transport Security) - only for HTTPS
  // response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

  return response
}

export function addSecurityHeadersToResponse(response: Response): Response {
  const newResponse = new Response(response.body, response)
  
  // Basic security headers
  newResponse.headers.set('X-Frame-Options', 'DENY')
  newResponse.headers.set('X-Content-Type-Options', 'nosniff')
  newResponse.headers.set('X-XSS-Protection', '1; mode=block')
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  newResponse.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  )

  return newResponse
}

// Helper function to create a response with security headers
export function secureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response)
}

// Helper function to create an error response with security headers
export function secureErrorResponse(error: string, status: number = 400): NextResponse {
  const response = NextResponse.json({ error }, { status })
  return addSecurityHeaders(response)
} 