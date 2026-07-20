import { NextRequest, NextResponse } from "next/server"
import { refreshAccessToken, setSecureCookies, verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      )
    }

    // Reject refresh tokens invalidated by logout / password change
    const decoded = verifyToken(refreshToken, "refresh")
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    }
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { tokenVersion: true, isActive: true },
    })
    if (!dbUser || !dbUser.isActive || (decoded.tokenVersion ?? 0) !== dbUser.tokenVersion) {
      return NextResponse.json({ error: "Session expired, please sign in again" }, { status: 401 })
    }

    // Generate new access token
    const newAccessToken = refreshAccessToken(refreshToken)

    if (!newAccessToken) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      )
    }
    
    // Create response with new tokens
    const response = NextResponse.json({
      message: "Token refreshed successfully"
    })
    
    // Set new secure cookies
    return setSecureCookies(response, {
      accessToken: newAccessToken,
      refreshToken: refreshToken // Keep the same refresh token
    })
    
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 