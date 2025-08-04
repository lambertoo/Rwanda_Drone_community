import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const trending = searchParams.get('trending') === 'true'

    // Build query based on parameters
    let orderBy: any = { createdAt: 'desc' }
    if (trending) {
      orderBy = [
        { likesCount: 'desc' },
        { viewsCount: 'desc' },
        { createdAt: 'desc' }
      ]
    }

    // Fetch posts from database
    const posts = await prisma.forumPost.findMany({
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
      tags: post.tags ? JSON.parse(post.tags) : [],
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

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "1 day ago"
  return `${Math.floor(diffInHours / 24)} days ago`
}
