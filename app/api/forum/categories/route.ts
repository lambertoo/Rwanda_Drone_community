import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch categories from database
    const categories = await prisma.forumCategory.findMany({
      include: {
        _count: {
          select: { posts: true }
        },
        posts: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                username: true,
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform categories to match expected format
    const transformedCategories = categories.map(category => ({
      id: category.id,
      title: category.name,
      description: category.description,
      icon: getCategoryIcon(category.slug),
      posts: category._count.posts,
      members: Math.floor(Math.random() * 200) + 50, // Mock member count for now
      lastPost: category.posts[0] ? {
        title: category.posts[0].title,
        author: category.posts[0].author.fullName || category.posts[0].author.username,
        time: formatTimeAgo(category.posts[0].createdAt),
      } : null,
    }))

    return NextResponse.json({
      categories: transformedCategories
    })
  } catch (error) {
    console.error('Error fetching forum categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

function getCategoryIcon(slug: string): string {
  const icons: { [key: string]: string } = {
    general: "💬",
    technical: "🔧",
    showcase: "📸",
  }
  return icons[slug] || "📝"
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInHours < 48) return "1 day ago"
  return `${Math.floor(diffInHours / 24)} days ago`
}
