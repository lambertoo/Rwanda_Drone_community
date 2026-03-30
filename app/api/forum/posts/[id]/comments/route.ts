import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"
import { createNotification } from "@/lib/notifications"

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
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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
    const { content, parentId } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Get authenticated user from server-side
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Create the comment
    const comment = await prisma.forumComment.create({
      data: {
        content,
        postId: id,
        authorId: user.id,
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

    // Notify post author about new comment
    const post = await prisma.forumPost.findUnique({ where: { id }, select: { authorId: true, title: true } })
    if (post && post.authorId !== user.id) {
      createNotification({
        userId: post.authorId,
        type: "reply",
        title: "New comment on your post",
        body: `${user.fullName} commented on "${post.title}"`,
        link: `/forum`,
        data: { actorId: user.id, postId: id },
      })
    }
    // If it's a reply, also notify the parent comment author
    if (parentId) {
      const parent = await prisma.forumComment.findUnique({ where: { id: parentId }, select: { authorId: true } })
      if (parent && parent.authorId !== user.id && parent.authorId !== post?.authorId) {
        createNotification({
          userId: parent.authorId,
          type: "reply",
          title: "New reply to your comment",
          body: `${user.fullName} replied to your comment`,
          link: `/forum`,
          data: { actorId: user.id, postId: id },
        })
      }
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
