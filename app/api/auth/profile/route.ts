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
        bio: true,
        location: true,
        website: true,
        phone: true,
        role: true,
        isVerified: true,
        isActive: true,
        organization: true,
        pilotLicense: true,
        experience: true,
        specializations: true,
        certifications: true,
        settings: true,
        joinedAt: true,
        lastActive: true,
        googleId: true,
        googleRefreshToken: true,
      }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }
    
    // Don't expose raw tokens — just booleans
    const { googleRefreshToken, ...safeProfile } = userProfile
    return NextResponse.json({
      user: {
        ...safeProfile,
        googleLinked: !!userProfile.googleId,
        googleSheetsConnected: !!googleRefreshToken,
      }
    })
    
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult
    const body = await request.json()
    const allowed = ["fullName","bio","location","website","phone","organization","pilotLicense","pilotLicenseType","pilotLicenseExpiry","caaRegistrationNumber","insuranceProvider","insuranceExpiry","experience","specializations","certifications"]
    const data: Record<string, any> = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key] === "" ? null : body[key]
    }
    const updatedUser = await prisma.user.update({ where: { id: user.userId }, data })
    return NextResponse.json({ message: "Profile updated", user: updatedUser })
  } catch (error) {
    console.error("Profile patch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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