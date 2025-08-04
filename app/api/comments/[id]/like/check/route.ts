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
        { error: 'UserId is required' },
        { status: 400 }
      )
    }

    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId: id,
        },
      },
    })

    return NextResponse.json({ isLiked: !!like })
  } catch (error) {
    console.error('Error checking comment like status:', error)
    return NextResponse.json(
      { error: 'Failed to check comment like status' },
      { status: 500 }
    )
  }
} 