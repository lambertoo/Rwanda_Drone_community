import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const like = await prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: id,
        },
      },
    })

    return NextResponse.json({ isLiked: !!like })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    )
  }
} 