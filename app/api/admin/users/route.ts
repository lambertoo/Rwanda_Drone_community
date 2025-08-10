import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"
import { hashPassword } from "@/lib/auth"
import { userRegistrationSchema } from "@/lib/validation"

// GET: Retrieve all users (admin only)
export async function GET() {
  try {
    // Check authentication
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        reputation: true,
        joinedAt: true,
        lastActive: true,
        organization: true,
        location: true,
        bio: true,
        pilotLicense: true,
        experience: true,
        website: true,
        phone: true,
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST: Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
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

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or username already exists" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        fullName,
        password: hashedPassword,
        avatar: `/placeholder.svg?height=40&width=40&text=${fullName.split(" ").map(n => n[0]).join("")}`,
        bio,
        location,
        organization,
        pilotLicense,
        experience,
        website,
        phone,
        role,
        reputation: 0,
        isVerified: true, // Admin-created users are verified by default
        isActive: true,   // Admin-created users are active by default
        postsCount: 0,
        commentsCount: 0,
        projectsCount: 0,
        specializations: JSON.stringify([]),
        certifications: JSON.stringify([]),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: "User created successfully",
      user: newUser
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// PATCH: Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, role, isVerified, isActive } = body

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Validate role if provided
    if (role && !['hobbyist', 'pilot', 'student', 'service_provider', 'admin', 'regulator'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Prevent admin from removing their own admin role
    if (userId === user.id && role && role !== 'admin') {
      return NextResponse.json(
        { error: "Cannot remove your own admin role" },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(typeof isVerified === 'boolean' && { isVerified }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
} 