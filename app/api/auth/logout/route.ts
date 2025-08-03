import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookies
    const sessionId = request.cookies.get("session-id")?.value

    if (sessionId) {
      // Delete the session
      deleteSession(sessionId)
    }

    const response = NextResponse.json({ message: "Logout successful" })

    // Clear the session cookie
    response.cookies.set("session-id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
