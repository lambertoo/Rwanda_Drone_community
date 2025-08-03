import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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