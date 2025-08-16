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

    // Check if user already liked the post
    const existingLike = await prisma.forumPostLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: id
        }
      }
    })

    if (existingLike) {
      // Unlike the post
      await prisma.forumPostLike.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: id
          }
        }
      })

      // Decrease likes count
      const updatedPost = await prisma.forumPost.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: false,
        likesCount: updatedPost.likesCount
      })
    } else {
      // Like the post
      await prisma.forumPostLike.create({
        data: {
          userId: user.id,
          postId: id
        }
      })

      // Increase likes count
      const updatedPost = await prisma.forumPost.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        isLiked: true,
        likesCount: updatedPost.likesCount
      })
    }
  } catch (error) {
    console.error('Error toggling forum post like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 