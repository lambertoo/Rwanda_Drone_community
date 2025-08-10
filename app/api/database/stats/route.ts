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

    const [users, categories, posts, projects, events] = await Promise.all([
      prisma.user.count(),
      prisma.forumCategory.count(),
      prisma.forumPost.count(),
      prisma.project.count(),
      prisma.event.count(),
    ])

    return NextResponse.json({
      users,
      categories,
      posts,
      projects,
      events,
    })
  } catch (error) {
    console.error("Database stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch database statistics" },
      { status: 500 }
    )
  }
} 