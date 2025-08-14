import { NextRequest, NextResponse } from "next/server"
import { clearSecureCookies } from "@/lib/jwt-utils"

export async function POST(request: NextRequest) {
  try {
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
