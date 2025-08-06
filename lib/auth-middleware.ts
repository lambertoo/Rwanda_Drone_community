import { cookies } from "next/headers"
import { verifyToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

export interface AuthenticatedUser {
  id: string
  email: string
  username: string
  fullName: string
  role: string
  isVerified: boolean
  avatar?: string
  organization?: string
  pilotLicense?: string
  experience?: string
  specializations?: any
  certifications?: any
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload) {
      return null
    }

    // Get fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        isVerified: true,
        avatar: true,
        organization: true,
        pilotLicense: true,
        experience: true,
        specializations: true,
        certifications: true,
      }
    })

    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting authenticated user:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
} 