import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user already liked the project
    const existingLike = await prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike the project
      await prisma.projectLike.delete({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: id,
          },
        },
      })

      // Decrease likes count
      const updatedProject = await prisma.project.update({
        where: { id: id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: false,
        likesCount: updatedProject.likesCount,
      })
    } else {
      // Like the project
      await prisma.projectLike.create({
        data: {
          userId: user.id,
          projectId: id,
        },
      })

      // Increase likes count
      const updatedProject = await prisma.project.update({
        where: { id: id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: true,
        likesCount: updatedProject.likesCount,
      })
    }
  } catch (error) {
    console.error('Error handling like:', error)
    return NextResponse.json(
      { error: 'Failed to handle like' },
      { status: 500 }
    )
  }
} 