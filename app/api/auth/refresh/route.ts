import { NextRequest, NextResponse } from "next/server"
import { refreshAccessToken, setSecureCookies } from "@/lib/jwt-utils"

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