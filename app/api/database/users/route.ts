import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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