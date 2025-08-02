import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { createSession, validatePassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, username, fullName, password } = await request.json()

    if (!email || !username || !fullName || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!validatePassword(password)) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUserByEmail = await db.users.findByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    const existingUserByUsername = await db.users.findByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    // Create new user
    const newUser = await db.users.create({
      email,
      username,
      fullName,
      avatar: "/placeholder-user.jpg",
      bio: "",
      location: "",
      website: "",
      reputation: 0,
      isVerified: false,
      role: "member",
      lastActive: new Date(),
      postsCount: 0,
      commentsCount: 0,
      projectsCount: 0,
    })

    // Create session
    const sessionId = createSession({
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      avatar: newUser.avatar,
      role: newUser.role,
      isVerified: newUser.isVerified,
    })

    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        avatar: newUser.avatar,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    })

    // Set HTTP-only cookie
    response.cookies.set("session-id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
