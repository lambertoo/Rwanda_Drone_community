import { NextRequest, NextResponse } from "next/server"
import { clearSecureCookies, extractTokenFromRequest, verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Invalidate the refresh token server-side by bumping tokenVersion, so a
    // captured token can't be replayed after logout.
    const token = extractTokenFromRequest(request)
    const decoded = token ? verifyToken(token) : null
    if (decoded?.userId) {
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { tokenVersion: { increment: 1 } },
      }).catch(() => {})
    }

    const response = NextResponse.json({
      message: "Logout successful"
    })

    // Clear all secure cookies
    return clearSecureCookies(response)
    
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
