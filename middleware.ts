import { type NextRequest, NextResponse } from "next/server"
import { addSecurityHeaders } from "@/lib/security-headers"

// Protected routes that require authentication
const protectedRoutes = ["/admin", "/complete-profile"]

// Routes that require admin access
const adminRoutes = ["/admin"]

// Routes that should redirect users without roles to complete-profile
const roleRequiredRoutes = ["/", "/forum", "/projects", "/events", "/services", "/opportunities", "/resources", "/profile"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes, and auth pages
  if (pathname.startsWith("/_next/") || 
      pathname.startsWith("/api/") || 
      pathname === "/health" ||
      pathname === "/login" ||
      pathname === "/register") {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for auth token cookie
    const authToken = request.cookies.get("accessToken")?.value
    
    if (!authToken) {
      // No auth token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // For main app routes, we'll let the client-side handle role checking
  // This is more reliable than trying to decode JWT tokens in middleware
  
  // Add security headers to all responses
  const response = NextResponse.next()
  return addSecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
