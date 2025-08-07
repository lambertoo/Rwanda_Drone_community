import { cookies } from "next/headers"
import { UserRole } from "@prisma/client"

export interface AuthUser {
  id: string
  username: string
  email: string
  fullName: string
  role: UserRole
  isVerified: boolean
}

// In-memory session store (for development)
const sessions = new Map<string, AuthUser>()

export function createSession(user: AuthUser): string {
  const sessionId = Math.random().toString(36).substring(2)
  sessions.set(sessionId, user)
  return sessionId
}

export function getSession(sessionId: string): AuthUser | null {
  return sessions.get(sessionId) || null
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
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

export function canPostJobs(user: AuthUser | null): boolean {
  return user?.role === "service_provider" || user?.role === "pilot"
}

export function canApplyJobs(user: AuthUser | null): boolean {
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
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session-id")?.value
  
  if (sessionId) {
    return getSession(sessionId)
  }
  
  return null
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
