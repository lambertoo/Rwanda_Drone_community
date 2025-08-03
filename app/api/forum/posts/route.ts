import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    let posts
    if (categoryId) {
      posts = await prisma.forumPost.findMany({
        where: { categoryId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              role: true,
              isVerified: true,
            }
          },
          category: true,
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })
    } else {
      posts = await prisma.forumPost.findMany({
        include: {
          author: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              role: true,
              isVerified: true,
            }
          },
          category: true,
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })
    }

    // Transform the data to match expected format
    const transformedPosts = posts.map(post => ({
      ...post,
      repliesCount: post._count.comments,
      tags: post.tags ? JSON.parse(post.tags) : [],
    }))

    return NextResponse.json({ posts: transformedPosts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const { title, content, categoryId, tags } = await request.json()

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
    }

    // Verify category exists
    const category = await prisma.forumCategory.findUnique({
      where: { id: categoryId }
    })
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Verify user exists
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id }
    })
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Create the post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        authorId: user.id,
        tags: JSON.stringify(tags || []),
        viewsCount: 0,
        repliesCount: 0,
        isPinned: false,
        isLocked: false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true,
            isVerified: true,
          }
        },
        category: true,
      }
    })

    // Update user's post count
    await prisma.user.update({
      where: { id: user.id },
      data: { postsCount: { increment: 1 } }
    })

    // Update category's post count
    await prisma.forumCategory.update({
      where: { id: categoryId },
      data: { 
        postCount: { increment: 1 },
        lastPostAt: new Date()
      }
    })

    return NextResponse.json({ 
      post: {
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        repliesCount: 0
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
