import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user from server-side
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user already liked the comment
    const existingLike = await prisma.forumCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: user.id,
          commentId: id
        }
      }
    })

    if (existingLike) {
      // Unlike the comment
      await prisma.forumCommentLike.delete({
        where: {
          userId_commentId: {
            userId: user.id,
            commentId: id
          }
        }
      })

      // Decrease likes count
      const updatedComment = await prisma.forumComment.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: false,
        likesCount: updatedComment.likesCount
      })
    } else {
      // Like the comment
      await prisma.forumCommentLike.create({
        data: {
          userId: user.id,
          commentId: id
        }
      })

      // Increase likes count
      const updatedComment = await prisma.forumComment.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: true,
        likesCount: updatedComment.likesCount
      })
    }
  } catch (error) {
    console.error('Error toggling forum comment like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 