"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Shield, User, Users, Calendar, FileText, Briefcase, Settings } from "lucide-react"
import Link from "next/link"
import { UserRole } from "@prisma/client"
import { useAuth } from "@/lib/auth-context"

// Define user type that matches our JWT payload and API response
interface AuthenticatedUser {
  id: string
  email: string
  username: string
  fullName: string
  role: UserRole
  isVerified?: boolean
  isActive?: boolean
  avatar?: string
  organization?: string
  pilotLicense?: string
  experience?: string
  specializations?: any
  certifications?: any
}

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermissions?: string[]
  fallback?: React.ReactNode
  showLoginPrompt?: boolean
}

export function AuthGuard({ 
  children, 
  requiredRole, 
  requiredPermissions = [], 
  fallback,
  showLoginPrompt = true 
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  // Enhanced debug logging
  console.log("AuthGuard - Current state:", { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null, 
    loading, 
    requiredRole,
    hasUser: !!user,
    userRole: user?.role,
    timestamp: new Date().toISOString()
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Check if user has required role
  if (requiredRole && user?.role !== requiredRole) {
    console.log("AuthGuard - User role mismatch, showing access restricted") // Debug log
    if (fallback) return <>{fallback}</>
    
    if (!showLoginPrompt) return null

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            This page requires {getRoleDisplayName(requiredRole)} permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              You need to be logged in as a {getRoleDisplayName(requiredRole)} to access this content.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if user is logged in (when no specific role is required)
  if (!user) {
    console.log("AuthGuard - User not logged in, showing login prompt") // Debug log
    if (fallback) return <>{fallback}</>
    
    if (!showLoginPrompt) return null

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Login Required
          </CardTitle>
          <CardDescription>
            You need to be logged in to access this content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This feature requires authentication. Please log in to continue.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Check if user has required permissions (only if permissions are specified)
  if (requiredPermissions.length > 0 && !user) {
    console.log("AuthGuard - User not found, showing login prompt") // Debug log
    if (fallback) return <>{fallback}</>
    
    if (!showLoginPrompt) return null

    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Login Required
          </CardTitle>
          <CardDescription>
            You need to be logged in to access this content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This feature requires authentication. Please log in to continue.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  console.log("AuthGuard - User authenticated, rendering children") // Debug log
  return <>{children}</>
}

// Helper function to get role display name
function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    admin: "Admin",
    hobbyist: "Hobbyist", 
    pilot: "Pilot",
    regulator: "Regulator",
    student: "Student",
    service_provider: "Service Provider"
  }
  return roleNames[role] || role
}

// Permission-based components
export function AdminOnly({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin">
      {children}
    </AuthGuard>
  )
}

export function LoggedInOnly({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  )
}

export function PilotOnly({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="pilot">
      {children}
    </AuthGuard>
  )
}

export function ServiceProviderOnly({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="service_provider">
      {children}
    </AuthGuard>
  )
}

export function RegulatorOnly({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="regulator">
      {children}
    </AuthGuard>
  )
}

// Conditional rendering components
export function IfLoggedIn({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard showLoginPrompt={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function IfAdmin({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" showLoginPrompt={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function IfPilot({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="pilot" showLoginPrompt={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

export function IfServiceProvider({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="service_provider" showLoginPrompt={false} fallback={fallback}>
      {children}
    </AuthGuard>
  )
} 