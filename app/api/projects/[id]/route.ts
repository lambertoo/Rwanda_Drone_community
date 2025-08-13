import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { requireAuth } from "@/lib/auth-middleware"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        category: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.project.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const user = await requireAuth()

    const { id } = params
    const body = await request.json()

    // Update the project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        fullDescription: body.overview,
        status: body.status,
        location: body.location,
        duration: body.duration,
        startDate: body.startDate,
        endDate: body.endDate,
        funding: body.funding,
        methodology: body.methodology,
        results: body.results,
        technologies: body.technologies,
        objectives: body.objectives,
        challenges: body.challenges,
        outcomes: body.outcomes,
        teamMembers: body.teamMembers,
        gallery: body.gallery,
        resources: body.resources,
        thumbnail: body.thumbnail,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully"
    })

  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    )
  }
}
