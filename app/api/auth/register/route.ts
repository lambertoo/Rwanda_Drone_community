import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validatePassword, hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
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
    } = await request.json()

    // Validation
    if (!fullName || !email || !username || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
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

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        avatar: `/placeholder.svg?height=40&width=40&text=${fullName.split(" ").map(n => n[0]).join("")}`,
        bio,
        location,
        organization,
        pilotLicense,
        experience,
        role,
        reputation: 0,
        isVerified: false,
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
