"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

interface RoleCheckProps {
  children: React.ReactNode
  requireRole?: boolean
  redirectTo?: string
}

export function RoleCheck({ children, requireRole = true, redirectTo = "/complete-profile" }: RoleCheckProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // If user is not authenticated, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // If role is required and user doesn't have one, redirect to complete-profile
    if (requireRole && user.role === null) {
      router.push(redirectTo)
      return
    }

    // If user already has a role and tries to access complete-profile, redirect to home
    if (user.role !== null && redirectTo === "/complete-profile") {
      router.push("/")
      return
    }
  }, [user, isLoading, requireRole, redirectTo, router])

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

  // If user is not authenticated, don't render children
  if (!user) {
    return null
  }

  // If role is required and user doesn't have one, don't render children
  if (requireRole && user.role === null) {
    return null
  }

  // If user already has a role and tries to access complete-profile, don't render children
  if (user.role !== null && redirectTo === "/complete-profile") {
    return null
  }

  return <>{children}</>
} 