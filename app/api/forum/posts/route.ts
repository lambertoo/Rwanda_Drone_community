import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const trending = searchParams.get('trending') === 'true'
    const adminMode = searchParams.get('admin') === 'true'

    // Build query based on parameters
    let orderBy: any = { createdAt: 'desc' }
    if (trending) {
      orderBy = [
        { likesCount: 'desc' },
        { viewsCount: 'desc' },
        { createdAt: 'desc' }
      ]
    }

    // Fetch posts from database (only approved posts for public access)
    const posts = await prisma.forumPost.findMany({
      where: {
        ...(adminMode ? {} : { isApproved: true })
      },
      take: limit,
      orderBy: orderBy,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            isVerified: true,
          }
        },
        category: {
          select: {
            name: true,
            slug: true,
          }
        },
        _count: {
          select: { comments: true }
        }
      }
    })

    // Transform posts to match expected format
    const transformedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      author: {
        name: post.author.fullName || post.author.username,
        username: post.author.username,
        avatar: post.author.avatar || "/placeholder-user.jpg",
        isVerified: post.author.isVerified,
      },
      category: post.category.name,
      categorySlug: post.category.slug,
      replies: post._count.comments,
      views: post.viewsCount,
      likes: post.likesCount,
      time: formatTimeAgo(post.createdAt),
      tags: post.tags || [],
    }))

    return NextResponse.json({
      posts: transformedPosts
    })
  } catch (error) {
    console.error('Error fetching forum posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create a new forum post
export async function POST(request: Request) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    const { user } = authResult
    const body = await request.json()
    
    const { title, content, categoryId, tags } = body

    // Validate required fields
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.length < 10 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.length < 20 || content.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be between 20 and 10,000 characters' },
        { status: 400 }
      )
    }

    // Create the forum post
    const post = await prisma.forumPost.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        categoryId: categoryId,
        authorId: user.userId,
        tags: tags || []
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            isVerified: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    // Update user's posts count
    await prisma.user.update({
      where: { id: user.userId },
      data: { postsCount: { increment: 1 } }
    })

    return NextResponse.json({ post }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating forum post:', error)
    return NextResponse.json(
      { error: 'Failed to create forum post' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "1 day ago"
  return `${Math.floor(diffInHours / 24)} days ago`
}
