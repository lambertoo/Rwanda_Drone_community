import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import { requireAuth } from "@/lib/auth-middleware"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    const userId = auth.user.userId

    const { id, commentId } = await params

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

      // Get updated likes count + author for notification
      const updatedComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likesCount: true, authorId: true },
      })
      likesCount = updatedComment?.likesCount || 0

      // Notify comment author
      if (updatedComment && updatedComment.authorId !== userId) {
        const actor = await prisma.user.findUnique({ where: { id: userId }, select: { fullName: true } })
        createNotification({
          userId: updatedComment.authorId,
          type: "like",
          title: "New like on your comment",
          body: `${actor?.fullName || 'Someone'} liked your comment`,
          link: `/projects/${id}`,
          data: { actorId: userId, commentId },
        })
      }
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