import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id, commentId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if user has liked this comment
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId,
        userId,
      },
    })

    const isLiked = !!existingLike

    return NextResponse.json({ isLiked })
  } catch (error) {
    console.error('Error checking comment like:', error)
    return NextResponse.json(
      { error: 'Failed to check comment like' },
      { status: 500 }
    )
  }
} 