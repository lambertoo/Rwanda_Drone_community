import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user liked the post
    const like = await prisma.forumPostLike.findUnique({
      where: {
        userId_postId: {
          userId,
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