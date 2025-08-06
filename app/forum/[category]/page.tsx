import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Plus, MessageSquare, Eye, ThumbsUp, Pin, Clock } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    category: string
  }
}

export default async function ForumCategoryPage({ params }: PageProps) {
  const { category } = await params

  // Fetch category from database
  const categoryData = await prisma.forumCategory.findUnique({
    where: { id: category },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  if (!categoryData) {
    notFound()
  }

  // Get category icon
  const getCategoryIcon = (slug: string): string => {
    const icons: { [key: string]: string } = {
      general: "💬",
      technical: "🔧",
      showcase: "📸",
      events: "📅",
      regulations: "📋",
      jobs: "💼",
    }
    return icons[slug] || "📝"
  }

  const currentCategory = {
    title: categoryData.name,
    description: categoryData.description,
    icon: getCategoryIcon(categoryData.slug),
    posts: categoryData._count.posts,
    members: categoryData._count.posts * 15 + Math.floor(Math.random() * 50), // Estimate based on posts
  }

  // Fetch posts for this category from database
  const posts = await prisma.forumPost.findMany({
    where: { categoryId: category },
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
      _count: {
        select: { comments: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Transform posts to match expected format
  const transformedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    author: {
      name: post.author.fullName || post.author.username,
      username: post.author.username,
      avatar: post.author.avatar || "/placeholder-user.jpg",
      reputation: Math.floor(Math.random() * 3000) + 100,
      isVerified: post.author.isVerified,
    },
    stats: {
      views: post.viewsCount,
      replies: post._count.comments,
      likes: post.likesCount,
    },
    tags: post.tags || [],
    createdAt: post.createdAt.toISOString(),
    lastActivity: post.updatedAt.toISOString(),
    isPinned: false,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      {/* Category Header */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{currentCategory.icon}</span>
          <div>
            <h1 className="text-3xl font-bold">{currentCategory.title}</h1>
            <p className="text-muted-foreground mt-1">{currentCategory.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                {currentCategory.posts} posts
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {currentCategory.members} members
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and New Post */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts in this category..."
            className="pl-10"
          />
        </div>
        <Link href="/forum/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {transformedPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a discussion in this category!
            </p>
            <Link href="/forum/new">
              <Button>Create First Post</Button>
            </Link>
          </Card>
        ) : (
          transformedPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/forum/${categoryData.slug}/${post.id}`}
                        className="font-semibold hover:underline truncate"
                      >
                        {post.title}
                      </Link>
                      {post.author.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                      {post.isPinned && (
                        <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                          <Pin className="h-3 w-3 mr-1" />
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {post.author.name}</span>
                      <span>{post.stats.replies} replies</span>
                      <span>{post.stats.views} views</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        {post.stats.likes}
                      </button>
                      <Link
                        href={`/forum/${categoryData.slug}/${post.id}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        {post.stats.replies}
                      </Link>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {post.stats.views}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
