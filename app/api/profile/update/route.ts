import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      username,
      role,
      organization,
      bio,
      location,
      pilotLicense,
      experience,
      website,
      phone,
    } = body

    // Validate required fields
    if (!username || !role || !phone) {
      return NextResponse.json(
        { error: 'Username, role, and phone number are required' },
        { status: 400 }
      )
    }

    // Check if username is already taken by another user
    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        id: { not: user.id }
      }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Security: Prevent users from assigning admin or regulator roles
    if (role === 'admin' || role === 'regulator') {
      return NextResponse.json(
        { error: 'Admin and Regulator roles cannot be self-assigned' },
        { status: 403 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        role,
        organization,
        bio,
        location,
        pilotLicense,
        experience,
        website,
        phone,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        organization: true,
        bio: true,
        location: true,
        pilotLicense: true,
        experience: true,
        website: true,
        phone: true,
        isVerified: true,
      }
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 