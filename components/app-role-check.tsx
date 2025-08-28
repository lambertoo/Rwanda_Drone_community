"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Routes that require a role to be assigned
const roleRequiredRoutes = [
  "/",
  "/forum",
  "/projects", 
  "/events",
  "/services",
  "/opportunities",
  "/resources",
  "/profile"
]

// Routes that should be accessible without a role
const roleOptionalRoutes = [
  "/login",
  "/register",
  "/complete-profile"
]

export function AppRoleCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // Skip role checking for auth pages and complete-profile
    if (roleOptionalRoutes.some(route => pathname.startsWith(route))) {
      return
    }

    // If user is not authenticated, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // If user is authenticated but has no role, redirect to complete-profile
    if (user.role === null) {
      router.push("/complete-profile")
      return
    }
  }, [user, isLoading, pathname, router])

  // For auth pages, always render children without any checks
  if (roleOptionalRoutes.some(route => pathname.startsWith(route))) {
    return <>{children}</>
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, don't render children for protected routes
  if (!user) {
    return null
  }

  // If user has no role and trying to access protected routes, don't render children
  if (user.role === null && roleRequiredRoutes.some(route => pathname.startsWith(route))) {
    return null
  }

  return <>{children}</>
} 