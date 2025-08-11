import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePassword, hashPassword } from "@/lib/auth"
import { userRegistrationSchema } from "@/lib/validation"
import { authRateLimit } from "@/lib/rate-limit"

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
      username,
      password,
      role,
      organization,
      bio,
      location,
      pilotLicense,
      experience,
      website,
      phone,
    } = validationResult.data

    // Security: Prevent registration with admin or regulator roles
    if (role === 'admin' || role === 'regulator') {
      return NextResponse.json(
        { error: "Admin and Regulator roles cannot be assigned during registration" },
        { status: 403 }
      )
    }

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

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword, // Store hashed password
        avatar: `/placeholder.svg?height=40&width=40&text=${fullName.split(" ").map(n => n[0]).join("")}`,
        bio,
        location,
        organization,
        pilotLicense,
        experience,
        role,
        website,
        phone,
        reputation: 0,
        isVerified: true,
        isActive: true,
        postsCount: 0,
        commentsCount: 0,
        projectsCount: 0,
        specializations: JSON.stringify([]),
        certifications: JSON.stringify([]),
      }
    })

    return NextResponse.json({
      message: "Registration successful",
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
