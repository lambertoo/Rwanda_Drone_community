import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Users, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function ForumPage() {
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

  // Fetch recent posts from database
  const recentPosts = await prisma.forumPost.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
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
        }
      },
      _count: {
        select: { comments: true }
      }
    }
  })

  // Transform recent posts to match expected format
  const transformedRecentPosts = recentPosts.map(post => ({
    id: post.id,
    title: post.title,
    author: {
      name: post.author.fullName || post.author.username,
      username: post.author.username,
      avatar: post.author.avatar || "/placeholder-user.jpg",
      isVerified: post.author.isVerified,
    },
    category: post.category.name,
    replies: post._count.comments,
    views: post.viewsCount,
    time: formatTimeAgo(post.createdAt),
    tags: post.tags ? JSON.parse(post.tags) : [],
  }))

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
            {transformedCategories.map((category) => (
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
            {transformedRecentPosts.map((post) => (
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
                          href={`/forum/post/${post.id}`}
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
                      {post.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">RCAA Registration Process</p>
                    <p className="text-sm text-muted-foreground">156 posts • 2.3k views</p>
                  </div>
                  <Badge variant="secondary">Hot</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">DJI Mini 3 Pro Tips</p>
                    <p className="text-sm text-muted-foreground">89 posts • 1.8k views</p>
                  </div>
                  <Badge variant="secondary">Trending</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Agricultural Drone Applications</p>
                    <p className="text-sm text-muted-foreground">234 posts • 3.1k views</p>
                  </div>
                  <Badge variant="secondary">Popular</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
