import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    })

    let isLiked: boolean
    let likesCount: number

    if (existingLike) {
      // Unlike: remove the like
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      })
      isLiked = false
      
      // Decrease likes count
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      })
      
      // Get updated likes count
      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likesCount: true },
      })
      likesCount = updatedComment?.likesCount || 0
    } else {
      // Like: create new like
      await prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      })
      isLiked = true
      
      // Increase likes count
      await prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      })
      
      // Get updated likes count
      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likesCount: true },
      })
      likesCount = updatedComment?.likesCount || 0
    }

    return NextResponse.json({ isLiked, likesCount })
  } catch (error) {
    console.error('Error toggling comment like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    )
  }
} 