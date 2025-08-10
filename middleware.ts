import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { addSecurityHeaders } from "@/lib/security-headers"

// Protected routes that require authentication
const protectedRoutes = ["/admin"]

// Routes that require admin access
const adminRoutes = ["/admin"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionId = request.cookies.get("session-id")?.value

    // For development, allow access if session exists or if it's a page request (not API)
    if (!sessionId && !pathname.startsWith("/api/")) {
      // Allow page access in development (session will be checked client-side)
      const response = NextResponse.next()
      return addSecurityHeaders(response)
    }

    if (!sessionId) {
      // Redirect to login for protected routes
      if (pathname.startsWith("/api/")) {
        const errorResponse = NextResponse.json({ error: "Authentication required" }, { status: 401 })
        return addSecurityHeaders(errorResponse)
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const user = getSession(sessionId)

      if (!user) {
        if (pathname.startsWith("/api/")) {
          const errorResponse = NextResponse.json({ error: "Invalid session" }, { status: 401 })
          return addSecurityHeaders(errorResponse)
        }
        return NextResponse.redirect(new URL("/login", request.url))
      }

      if (isAdminRoute && user.role !== "admin") {
        if (pathname.startsWith("/api/")) {
          const errorResponse = NextResponse.json({ error: "Admin access required" }, { status: 403 })
          return addSecurityHeaders(errorResponse)
        }
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Add user info to headers for API routes
      if (pathname.startsWith("/api/")) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", user.id)
        requestHeaders.set("x-user-role", user.role)

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
        return addSecurityHeaders(response)
      }
    } catch (error) {
      // Invalid session
      if (pathname.startsWith("/api/")) {
        const errorResponse = NextResponse.json({ error: "Invalid session" }, { status: 401 })
        return addSecurityHeaders(errorResponse)
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // For all other routes, add security headers
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
