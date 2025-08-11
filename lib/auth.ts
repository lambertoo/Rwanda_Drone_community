import { cookies } from "next/headers"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { verifyToken } from "./jwt"

export interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  role: UserRole
  isVerified: boolean
}

// Secure session management using JWT tokens
export function createSession(user: AuthUser): string {
  // For now, we'll use a simple session ID, but in production
  // this should be replaced with proper JWT token generation
  const sessionId = crypto.randomUUID()
  return sessionId
}

export function getSession(sessionId: string): AuthUser | null {
  // This function is deprecated - use getCurrentUser() instead
  // which properly validates JWT tokens
  console.warn('getSession() is deprecated. Use getCurrentUser() instead.')
  return null
}

export function deleteSession(sessionId: string): void {
  // This function is deprecated - sessions are now stateless
  console.warn('deleteSession() is deprecated. Sessions are now stateless.')
}

// Role-based authorization functions
export function canAccessAdmin(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

export function canManageUsers(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

export function canApproveContent(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator"
}

export function canDeleteAnyContent(user: AuthUser | null): boolean {
  return user?.role === "admin"
}

export function canPostAnnouncements(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator"
}

export function canCreateEvents(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator"
}

export function canCreateResources(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator"
}

export function canPostForum(user: AuthUser | null): boolean {
  return user !== null && user.role !== "visitor"
}

export function canCreateProjects(user: AuthUser | null): boolean {
  return user !== null && ["hobbyist", "pilot", "student", "service_provider", "admin", "regulator"].includes(user.role)
}

export function canCreateServices(user: AuthUser | null): boolean {
  return user?.role === "service_provider" || user?.role === "pilot"
}

export function canPostOpportunities(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator" || user?.role === "hobbyist" || user?.role === "pilot" || user?.role === "service_provider"
}

export function canApplyOpportunities(user: AuthUser | null): boolean {
  return user?.role === "pilot" || user?.role === "student"
}

export function canRSVPEvents(user: AuthUser | null): boolean {
  return user !== null && ["hobbyist", "pilot", "student", "service_provider"].includes(user.role)
}

export function canEditOwnContent(user: AuthUser | null, contentAuthorId: string): boolean {
  return user !== null && (user.id === contentAuthorId || user.role === "admin")
}

export function canViewAnalytics(user: AuthUser | null): boolean {
  return user?.role === "admin" || user?.role === "regulator"
}

export function canDownloadResources(user: AuthUser | null): boolean {
  return user !== null
}

export function canViewContent(user: AuthUser | null): boolean {
  return true // Visitors can view most content
}

export function canCreateTutorials(user: AuthUser | null): boolean {
  return user?.role === "pilot"
}

export function canUploadPortfolio(user: AuthUser | null): boolean {
  return user?.role === "service_provider"
}

// Helper function to get current user from cookies
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    
    if (!token) {
      return null
    }
    
    // Verify JWT token
    const payload = verifyToken(token)
    if (!payload) {
      return null
    }
    
    // Return user data from token payload
    return {
      id: payload.userId,
      username: payload.username,
      email: payload.email,
      fullName: payload.username, // We'll need to get this from database if needed
      role: payload.role as UserRole,
      isVerified: false, // We'll need to get this from database if needed
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Helper function to check if user is logged in
export function isLoggedIn(user: AuthUser | null): boolean {
  return user !== null
}

// Helper function to get user role display name
export function getRoleDisplayName(role: UserRole): string {
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

export function validatePassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}
