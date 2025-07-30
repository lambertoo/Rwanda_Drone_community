import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Eye, ThumbsUp, Search, Plus } from "lucide-react"
import Link from "next/link"

export default function ForumPage() {
  const categories = [
    {
      name: "Regulations",
      posts: 156,
      color: "bg-red-100 text-red-800",
      description: "RCAA regulations, licensing, and legal requirements for drone operations in Rwanda",
      slug: "regulations",
    },
    {
      name: "Repairs & Maintenance",
      posts: 89,
      color: "bg-blue-100 text-blue-800",
      description: "Technical support, repair guides, and maintenance tips for your drones",
      slug: "repairs-maintenance",
    },
    {
      name: "Flying Tips",
      posts: 234,
      color: "bg-green-100 text-green-800",
      description: "Flight techniques, weather considerations, and safety practices",
      slug: "flying-tips",
    },
    {
      name: "Jobs & Opportunities",
      posts: 67,
      color: "bg-purple-100 text-purple-800",
      description: "Career opportunities, freelance gigs, and business partnerships",
      slug: "jobs-opportunities",
    },
    {
      name: "Events",
      posts: 45,
      color: "bg-orange-100 text-orange-800",
      description: "Community meetups, workshops, competitions, and training sessions",
      slug: "events",
    },
    {
      name: "Agriculture",
      posts: 123,
      color: "bg-emerald-100 text-emerald-800",
      description: "Agricultural applications, crop monitoring, and precision farming",
      slug: "agriculture",
    },
    {
      name: "Photography/Videography",
      posts: 178,
      color: "bg-pink-100 text-pink-800",
      description: "Aerial photography, cinematography techniques, and creative projects",
      slug: "photography-videography",
    },
    {
      name: "General Discussion",
      posts: 298,
      color: "bg-gray-100 text-gray-800",
      description: "Open discussions about drone technology, news, and community topics",
      slug: "general-discussion",
    },
  ]

  const recentPosts = [
    {
      title: "RCAA Drone Registration Process - Step by Step Guide",
      author: "DroneExpert_RW",
      category: "Regulations",
      replies: 23,
      views: 456,
      likes: 12,
      time: "2 hours ago",
      isPinned: true,
    },
    {
      title: "Best Drones for Agricultural Mapping in Rwanda's Terrain",
      author: "AgriTech_Pilot",
      category: "Agriculture",
      replies: 15,
      views: 234,
      likes: 8,
      time: "4 hours ago",
      isPinned: false,
    },
    {
      title: "Drone Photography Workshop Results - Kigali",
      author: "PhotoDrone_RW",
      category: "Photography/Videography",
      replies: 8,
      views: 123,
      likes: 15,
      time: "6 hours ago",
      isPinned: false,
    },
    {
      title: "Weather Conditions for Flying in Musanze District",
      author: "MountainPilot",
      category: "Flying Tips",
      replies: 12,
      views: 189,
      likes: 6,
      time: "8 hours ago",
      isPinned: false,
    },
    {
      title: "Looking for Drone Repair Services in Huye",
      author: "StudentPilot",
      category: "Repairs & Maintenance",
      replies: 5,
      views: 67,
      likes: 3,
      time: "12 hours ago",
      isPinned: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect, share knowledge, and get help from the Rwanda drone community
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search forum posts..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {recentPosts.map((post, index) => (
            <Card key={index} className={post.isPinned ? "border-blue-200 bg-blue-50/50" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <Badge variant="secondary" className="text-xs">
                          Pinned
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.replies}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Link key={index} href={`/forum/${category.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <Badge className={category.color}>{category.posts}</Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">{category.description}</CardDescription>
                    <CardDescription className="text-xs text-muted-foreground">
                      {category.posts} posts in this category
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <p className="text-muted-foreground">Most popular posts this week</p>
          {recentPosts
            .sort((a, b) => b.likes - a.likes)
            .map((post, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>by {post.author}</span>
                        <span>{post.time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
