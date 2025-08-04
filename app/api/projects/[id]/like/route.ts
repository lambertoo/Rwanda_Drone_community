import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    // Check if user already liked the project
    const existingLike = await prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike the project
      await prisma.projectLike.delete({
        where: {
          userId_projectId: {
            userId,
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
          userId,
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