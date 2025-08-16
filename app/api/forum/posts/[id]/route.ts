import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/auth-middleware"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch post data from database
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            isVerified: true,
            reputation: true,
            postsCount: true,
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching forum post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { title, content, tags } = await request.json()

    // Get authenticated user
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get the post to check ownership and permissions
    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user can edit the post (creator or admin)
    const canEdit = user.id === post.authorId || user.role === 'admin'
    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this post' },
        { status: 403 }
      )
    }

    // Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Update the post
    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        tags: tags || [],
        updatedAt: new Date()
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Post updated successfully',
      post: updatedPost
    })
  } catch (error) {
    console.error('Error updating forum post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}
