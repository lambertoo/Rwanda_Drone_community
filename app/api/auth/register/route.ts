import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePassword, hashPassword } from "@/lib/auth"
import { userRegistrationSchema } from "@/lib/validation"
import { authRateLimit } from "@/lib/rate-limit"
import { generateTokens } from "@/lib/jwt-utils"

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = authRateLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }

    const body = await request.json()

    // Validate input using Zod schema
    const validationResult = userRegistrationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const {
      fullName,
      email,
      password,
    } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create new user with simplified data (no role - user will set it later)
    const newUser = await prisma.user.create({
      data: {
        username: `${email.split('@')[0]}_${Math.random().toString(36).substring(2, 8)}`, // Generate unique username from email
        email,
        fullName,
        password: hashedPassword,
        avatar: `/placeholder.svg?height=40&width=40&text=${fullName.split(" ").map(n => n[0]).join("")}`,
        reputation: 0,
        isVerified: true,
        isActive: true,
        postsCount: 0,
        commentsCount: 0,
        projectsCount: 0,
        eventsCount: 0,
        servicesCount: 0,
        opportunitiesCount: 0,
        specializations: JSON.stringify([]),
        certifications: JSON.stringify([]),
      }
    })

    // Generate JWT tokens for the new user
    const { accessToken, refreshToken } = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role
    })

    // Create response with tokens
    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        isVerified: newUser.isVerified,
        role: newUser.role,
      },
      redirectTo: "/complete-profile"
    })

    // Set HTTP-only cookies for tokens
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/"
    })

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
