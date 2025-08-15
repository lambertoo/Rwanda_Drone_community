import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const comments = await prisma.comment.findMany({
      where: {
        projectId: id,
        parentId: null, // Only get top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      comments 
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch comments' 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { content, parentId } = await request.json()

    // Get authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content is required' 
        },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        projectId: id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json({ 
      success: true,
      comment 
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create comment' 
      },
      { status: 500 }
    )
  }
} 