import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    let projects
    if (featured) {
      projects = await prisma.project.findMany({
        where: { isFeatured: true },
        include: { author: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })
    } else {
      projects = await prisma.project.findMany({
        include: { author: true },
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, description, fullDescription, category, status } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: "Title, description, and category are required" }, { status: 400 })
    }

    const userRecord = await db.users.findById(user.id)
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const project = await db.projects.create({
      title,
      description,
      fullDescription: fullDescription || description,
      category,
      status: status || "planning",
      startDate: new Date(),
      duration: "TBD",
      fundingSource: "Self-funded",
      location: "Rwanda",
      authorId: user.id,
      author: userRecord,
      teamMembers: [],
      technologies: [],
      gallery: [],
      impactMetrics: {},
      isPublished: true,
      isFeatured: false,
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
