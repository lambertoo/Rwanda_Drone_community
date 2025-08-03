import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// READ - Get a single project
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        author: true,
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.project.update({
      where: { id: params.id },
      data: { viewsCount: { increment: 1 } }
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE - Update a project
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: { author: true }
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existingProject.authorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      fullDescription,
      category,
      status,
      location,
      duration,
      startDate,
      endDate,
      funding,
      technologies,
      objectives,
      challenges,
      outcomes,
      teamMembers,
      gallery,
      isFeatured
    } = body

    // Map status values to Prisma enum
    const mappedStatus = status === "in-progress" ? "in_progress" : 
                        status === "on-hold" ? "on_hold" : 
                        status === "cancelled" ? "cancelled" : status

    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description,
        fullDescription,
        category,
        status: mappedStatus,
        location,
        duration,
        startDate,
        endDate,
        funding,
        technologies: JSON.stringify(technologies || []),
        objectives: JSON.stringify(objectives || []),
        challenges: JSON.stringify(challenges || []),
        outcomes: JSON.stringify(outcomes || []),
        teamMembers: JSON.stringify(teamMembers || []),
        gallery: JSON.stringify(gallery || []),
        isFeatured: isFeatured || false,
        updatedAt: new Date(),
      },
      include: {
        author: true,
      }
    })

    return NextResponse.json({ project: updatedProject })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a project
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if project exists and user owns it
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: { author: true }
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (existingProject.authorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the project
    await prisma.project.delete({
      where: { id: params.id }
    })

    // Update user's project count
    await prisma.user.update({
      where: { id: existingProject.authorId },
      data: { projectsCount: { decrement: 1 } }
    })

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
