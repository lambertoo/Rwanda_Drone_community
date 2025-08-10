import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

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

    // Check if user has admin or regulator role
    if (user.role !== 'admin' && user.role !== 'regulator') {
      return NextResponse.json(
        { error: "Insufficient permissions" },
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
        joinedAt: true,
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        joinedAt: user.joinedAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error("Database users error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
} 