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

    // Check if user already liked the comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike the comment
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId: id,
          },
        },
      })

      // Decrease likes count
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: false,
        likesCount: updatedComment.likesCount,
      })
    } else {
      // Like the comment
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: id,
        },
      })

      // Increase likes count
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: true,
        likesCount: updatedComment.likesCount,
      })
    }
  } catch (error) {
    console.error('Error handling comment like:', error)
    return NextResponse.json(
      { error: 'Failed to handle comment like' },
      { status: 500 }
    )
  }
} 