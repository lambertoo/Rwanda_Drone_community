import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromRequest, verifyToken, JWTPayload } from './jwt-utils'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Authentication middleware for API routes
export async function requireAuth(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  try {
    // Extract token from request
    const token = extractTokenFromRequest(req)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Verify token
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    })
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }
    
    // Return user data for the route handler
    return { user: decoded }
    
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Role-based access control middleware
export async function requireRole(req: NextRequest, allowedRoles: string[]): Promise<{ user: JWTPayload } | NextResponse> {
  try {
    // First authenticate the user
    const authResult = await requireAuth(req)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    
    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return { user }
    
  } catch (error) {
    console.error('Role-based auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 500 }
    )
  }
}

// Admin-only middleware
export async function requireAdmin(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(req, ['admin', 'superadmin'])
}

// Superadmin-only middleware
export async function requireSuperAdmin(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(req, ['superadmin'])
}

// Pilot-only middleware
export async function requirePilot(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(req, ['pilot', 'admin'])
}

// Service provider middleware
export async function requireServiceProvider(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(req, ['service_provider', 'admin'])
}

// Regulator middleware
export async function requireRegulator(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireRole(req, ['regulator', 'admin'])
}

// Admin token verification (alias for requireAdmin)
export async function verifyAdminToken(req: NextRequest): Promise<{ user: JWTPayload } | NextResponse> {
  return requireAdmin(req)
}

// Optional authentication middleware (returns user if authenticated, null if not)
export async function optionalAuth(req: NextRequest): Promise<{ user: JWTPayload | null }> {
  try {
    const token = extractTokenFromRequest(req)
    
    if (!token) {
      return { user: null }
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return { user: null }
    }
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    })
    
    if (!user || !user.isActive) {
      return { user: null }
    }
    
    return { user: decoded }
    
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    return { user: null }
  }
}

// Helper function to get user from request
export async function getUserFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  try {
    const token = extractTokenFromRequest(req)
    if (!token) return null
    
    const decoded = verifyToken(token)
    return decoded
  } catch {
    return null
  }
}

// Function to get authenticated user for server actions
export async function getAuthenticatedUser(): Promise<any> {
  try {
    // For server actions, we need to get the token from cookies
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()
    
    // Get the access token from cookies
    const accessToken = cookieStore.get('accessToken')?.value
    const authToken = cookieStore.get('auth-token')?.value
    
    // Use accessToken first, fallback to auth-token
    const token = accessToken || authToken
    
    if (!token) {
      throw new Error('No authentication token found')
    }
    
    // Verify the token
    const decoded = verifyToken(token)
    if (!decoded) {
      throw new Error('Invalid or expired token')
    }
    
    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        avatar: true,
        organization: true,
        pilotLicense: true,
        specializations: true,
        certifications: true,
        joinedAt: true,
        lastActive: true,
        reputation: true,
        bio: true,
        location: true,
        website: true,
        phone: true,
        experience: true
      }
    })
    
    if (!user) {
      throw new Error('User not found')
    }
    
    if (!user.isActive) {
      throw new Error('User account is inactive')
    }
    
    return user
    
  } catch (error) {
    console.error('getAuthenticatedUser error:', error)
    throw error
  }
} 