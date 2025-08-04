import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch comments with replies
    const comments = await prisma.forumComment.findMany({
      where: {
        postId: id,
        parentId: null // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            isVerified: true,
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                username: true,
                avatar: true,
                isVerified: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      comments: comments
    })
  } catch (error) {
    console.error('Error fetching forum comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
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
    const { content, userId, parentId } = await request.json()

    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Content and user ID are required' },
        { status: 400 }
      )
    }

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        content,
        postId: id,
        authorId: userId,
        parentId: parentId || null
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            username: true,
            avatar: true,
            isVerified: true,
          }
        }
      }
    })

    // Update post reply count if it's a top-level comment
    if (!parentId) {
      await prisma.forumPost.update({
        where: { id },
        data: {
          repliesCount: {
            increment: 1
          },
          lastReplyAt: new Date()
        }
      })
    }

    return NextResponse.json({
      comment: comment
    })
  } catch (error) {
    console.error('Error creating forum comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
