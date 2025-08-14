import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    
    // Get fresh user data from database
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        organization: true,
        pilotLicense: true,
        experience: true,
        specializations: true,
        certifications: true,
        joinedAt: true,
        lastActive: true
      }
    })
    
    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user: userProfile
    })
    
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    const body = await request.json()
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        fullName: body.fullName,
        organization: body.organization,
        pilotLicense: body.pilotLicense,
        experience: body.experience,
        specializations: body.specializations,
        certifications: body.certifications
      },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
        isVerified: true,
        isActive: true,
        organization: true,
        pilotLicense: true,
        experience: true,
        specializations: true,
        certifications: true,
        joinedAt: true,
        lastActive: true
      }
    })
    
    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    })
    
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 