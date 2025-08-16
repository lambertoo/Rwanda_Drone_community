import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function GET(
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

    // Check if user liked the post
    const like = await prisma.forumPostLike.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: id
        }
      }
    })

    return NextResponse.json({
      isLiked: !!like
    })
  } catch (error) {
    console.error('Error checking forum post like status:', error)
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    )
  }
} 