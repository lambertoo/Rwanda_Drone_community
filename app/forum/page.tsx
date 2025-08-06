"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

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
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [user, setUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState("newest")
  const [filterCategory, setFilterCategory] = useState("all")
  const [groupBy, setGroupBy] = useState("none")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
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
      events: "📅",
      regulations: "📋",
      jobs: "💼",
    }
    return icons[slug] || "📝"
  }

  // Sorting function
  const sortPosts = (posts: ForumPost[], sortType: string) => {
    switch (sortType) {
      case "newest":
        return [...posts].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      case "oldest":
        return [...posts].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      case "mostLiked":
        return [...posts].sort((a, b) => b.likes - a.likes)
      case "mostViewed":
        return [...posts].sort((a, b) => b.views - a.views)
      case "mostReplied":
        return [...posts].sort((a, b) => b.replies - a.replies)
      default:
        return posts
    }
  }

  // Filtering function
  const filterPosts = (posts: ForumPost[], category: string) => {
    if (category === "all") return posts
    return posts.filter(post => post.categorySlug === category)
  }

  // Grouping function
  const groupPosts = (posts: ForumPost[], groupType: string) => {
    if (groupType === "none") return { "All Posts": posts }
    
    const grouped: { [key: string]: ForumPost[] } = {}
    
    switch (groupType) {
      case "category":
        posts.forEach(post => {
          if (!grouped[post.category]) {
            grouped[post.category] = []
          }
          grouped[post.category].push(post)
        })
        break
      case "author":
        posts.forEach(post => {
          if (!grouped[post.author.name]) {
            grouped[post.author.name] = []
          }
          grouped[post.author.name].push(post)
        })
        break
      case "time":
        posts.forEach(post => {
          const timeGroup = post.time.includes("Just now") ? "Today" : 
                           post.time.includes("hours ago") ? "Today" : 
                           post.time.includes("day ago") ? "Yesterday" : "Older"
          if (!grouped[timeGroup]) {
            grouped[timeGroup] = []
          }
          grouped[timeGroup].push(post)
        })
        break
    }
    
    return grouped
  }

  // Get filtered and sorted posts
  const getFilteredPosts = () => {
    let posts = [...recentPosts]
    posts = filterPosts(posts, filterCategory)
    posts = sortPosts(posts, sortBy)
    return posts
  }

  // Get grouped posts
  const getGroupedPosts = () => {
    const filteredPosts = getFilteredPosts()
    return groupPosts(filteredPosts, groupBy)
  }

  // Get posts for selected category or all posts


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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostLiked">Most Liked</option>
              <option value="mostViewed">Most Viewed</option>
              <option value="mostReplied">Most Replied</option>
            </select>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="all">All Categories</option>
              <option value="general">General Discussion</option>
              <option value="jobs">Jobs & Opportunities</option>
              <option value="regulations">Regulations & Legal</option>
              <option value="events">Events & Meetups</option>
              <option value="showcase">Showcase</option>
              <option value="technical">Technical Support</option>
            </select>
            
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
            >
              <option value="none">No Grouping</option>
              <option value="category">Group by Category</option>
              <option value="author">Group by Author</option>
              <option value="time">Group by Time</option>
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1"
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="w-full h-0.5 bg-current"></div>
                  <div className="w-full h-0.5 bg-current"></div>
                  <div className="w-full h-0.5 bg-current"></div>
                </div>
                List
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-full h-full bg-current rounded-sm"></div>
                  <div className="w-full h-full bg-current rounded-sm"></div>
                  <div className="w-full h-full bg-current rounded-sm"></div>
                  <div className="w-full h-full bg-current rounded-sm"></div>
                </div>
                Grid
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {getFilteredPosts().length} posts found
            </div>
          </div>
        </div>
        {/* Posts */}
        <div className="space-y-4">
          {Object.entries(getGroupedPosts()).map(([groupName, groupPosts]) => (
            <div key={groupName}>
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold mb-3 text-muted-foreground">
                  {groupName} ({groupPosts.length})
                </h3>
              )}
              
              {viewMode === "list" ? (
                // List View
                <div className="space-y-4">
                  {groupPosts
                    .filter(post => 
                      searchTerm === "" || 
                      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (Array.isArray(post.tags) && post.tags.some(tag => 
                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                      ))
                    )
                    .map((post) => (
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
              ) : (
                // Grid View
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {groupPosts
                    .filter(post => 
                      searchTerm === "" || 
                      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      post.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (Array.isArray(post.tags) && post.tags.some(tag => 
                        tag.toLowerCase().includes(searchTerm.toLowerCase())
                      ))
                    )
                    .map((post) => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>
                                  {post.author.name.split(" ").map((n) => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{post.author.name}</p>
                                <p className="text-xs text-muted-foreground">{post.time}</p>
                              </div>
                              {post.author.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            
                            <div>
                              <Link
                                href={`/forum/${post.categorySlug}/${post.id}`}
                                className="font-semibold hover:underline line-clamp-2 text-sm"
                              >
                                {post.title}
                              </Link>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                in {post.category}
                              </p>
                            </div>
                            
                            {Array.isArray(post.tags) && post.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {post.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {post.replies}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {post.views}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
