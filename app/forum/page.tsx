"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Users, TrendingUp, Plus, Heart, Share2, Eye, Loader } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface ForumCategory {
  id: string
  title: string
  description: string
  icon: string
  posts: number
  members: number
  lastPost: {
    title: string
    author: string
    time: string
  } | null
}

interface ForumPost {
  id: string
  title: string
  author: {
    name: string
    username: string
    avatar: string
    isVerified: boolean
  }
  category: string
  categorySlug: string
  replies: number
  views: number
  likes: number
  time: string
  tags: string[]
}

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [recentPosts, setRecentPosts] = useState<ForumPost[]>([])
  const [trendingPosts, setTrendingPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/forum/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.categories)
        }

        // Fetch recent posts
        const recentPostsResponse = await fetch('/api/forum/posts?limit=5')
        if (recentPostsResponse.ok) {
          const recentPostsData = await recentPostsResponse.json()
          setRecentPosts(recentPostsData.posts)
        }

        // Fetch trending posts
        const trendingPostsResponse = await fetch('/api/forum/posts?trending=true&limit=5')
        if (trendingPostsResponse.ok) {
          const trendingPostsData = await trendingPostsResponse.json()
          setTrendingPosts(trendingPostsData.posts)
        }
      } catch (error) {
        console.error('Error fetching forum data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
      }
    }

    fetchData()
  }, [])

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

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("Please log in to like posts")
      return
    }

    try {
      const response = await fetch(`/api/forum/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        // Refresh posts to get updated like counts
        const recentPostsResponse = await fetch('/api/forum/posts?limit=5')
        if (recentPostsResponse.ok) {
          const recentPostsData = await recentPostsResponse.json()
          setRecentPosts(recentPostsData.posts)
        }
      }
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleShare = async (postId: string, title: string, categorySlug: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this forum post: ${title}`,
          url: `${window.location.origin}/forum/${categorySlug}/${postId}`,
        })
      } catch (error) {
        console.error("Error sharing post:", error)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(`${window.location.origin}/forum/${categorySlug}/${postId}`)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading forum...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">Connect, learn, and share with the Rwanda drone community</p>
        </div>
        <Link href="/forum/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search discussions, topics, or users..."
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={`/forum/${category.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {category.posts}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {category.members}
                        </span>
                      </div>
                      {category.lastPost && (
                        <div className="text-right">
                          <p className="font-medium text-foreground truncate">
                            {category.lastPost.title}
                          </p>
                          <p className="text-xs">
                            by {category.lastPost.author} • {category.lastPost.time}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-4">
            {recentPosts.map((post) => (
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
                          href={`/forum/${post.categorySlug}/${post.id}`}
                          className="font-semibold hover:underline truncate"
                        >
                          {post.title}
                        </Link>
                        {post.author.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {post.author.name}</span>
                        <span>in {post.category}</span>
                        <span>{post.replies} replies</span>
                        <span>{post.views} views</span>
                        <span>{post.time}</span>
                      </div>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Reddit-like Actions */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <Link
                          href={`/forum/${post.categorySlug}/${post.id}`}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                        <button
                          onClick={() => handleShare(post.id, post.title, post.categorySlug)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="space-y-4">
            {trendingPosts.map((post) => (
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
                          href={`/forum/${post.categorySlug}/${post.id}`}
                          className="font-semibold hover:underline truncate"
                        >
                          {post.title}
                        </Link>
                        {post.author.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          Trending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {post.author.name}</span>
                        <span>in {post.category}</span>
                        <span>{post.replies} replies</span>
                        <span>{post.views} views</span>
                        <span>{post.time}</span>
                      </div>
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Reddit-like Actions */}
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <Link
                          href={`/forum/${post.categorySlug}/${post.id}`}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-600 transition-colors"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                        <button
                          onClick={() => handleShare(post.id, post.title, post.categorySlug)}
                          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-purple-600 transition-colors"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
