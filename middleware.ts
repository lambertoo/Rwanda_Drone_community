import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

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

    if (!sessionId) {
      // Redirect to login for protected routes
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const user = getSession(sessionId)

      if (!user) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }
        return NextResponse.redirect(new URL("/login", request.url))
      }

      if (isAdminRoute && user.role !== "admin") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Add user info to headers for API routes
      if (pathname.startsWith("/api/")) {
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set("x-user-id", user.id)
        requestHeaders.set("x-user-role", user.role)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      // Invalid session
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Invalid session" }, { status: 401 })
      }
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
