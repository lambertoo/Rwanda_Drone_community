import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MessageSquare, Users, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"

export default function ForumPage() {
  const categories = [
    {
      id: "regulations",
      title: "Regulations & Legal",
      description: "Discuss RCAA regulations, legal requirements, and compliance for drone operations in Rwanda",
      icon: "⚖️",
      posts: 156,
      members: 89,
      lastPost: {
        title: "RCAA Registration Process Update",
        author: "DroneExpert_RW",
        time: "2 hours ago",
      },
    },
    {
      id: "maintenance",
      title: "Repairs & Maintenance",
      description: "Get help with drone repairs, maintenance tips, and technical troubleshooting",
      icon: "🔧",
      posts: 234,
      members: 145,
      lastPost: {
        title: "DJI Mini 3 Pro Gimbal Repair Guide",
        author: "TechRepair_RW",
        time: "4 hours ago",
      },
    },
    {
      id: "flying-tips",
      title: "Flying Tips & Techniques",
      description: "Share flying experiences, techniques, and safety tips for better drone operations",
      icon: "✈️",
      posts: 189,
      members: 167,
      lastPost: {
        title: "Best Flying Spots Around Kigali",
        author: "KigaliPilot",
        time: "6 hours ago",
      },
    },
    {
      id: "jobs",
      title: "Jobs & Opportunities",
      description: "Find drone-related job opportunities and freelance projects in Rwanda",
      icon: "💼",
      posts: 78,
      members: 234,
      lastPost: {
        title: "Freelance Photography Rates Discussion",
        author: "AerialPhoto_RW",
        time: "1 day ago",
      },
    },
    {
      id: "events",
      title: "Events & Meetups",
      description: "Organize and discover drone community events, workshops, and meetups",
      icon: "📅",
      posts: 45,
      members: 123,
      lastPost: {
        title: "Drone Racing Event - March 25th",
        author: "RaceOrganizer_RW",
        time: "2 days ago",
      },
    },
    {
      id: "agriculture",
      title: "Agricultural Applications",
      description: "Discuss drone applications in agriculture, crop monitoring, and precision farming",
      icon: "🌾",
      posts: 167,
      members: 98,
      lastPost: {
        title: "Crop Monitoring Results - Musanze",
        author: "AgriDrone_RW",
        time: "3 days ago",
      },
    },
    {
      id: "photography",
      title: "Photography & Videography",
      description: "Share aerial photography tips, showcase work, and discuss camera equipment",
      icon: "📸",
      posts: 298,
      members: 201,
      lastPost: {
        title: "Sunset Photography Tips",
        author: "SkyView_Photo",
        time: "5 hours ago",
      },
    },
    {
      id: "general",
      title: "General Discussion",
      description: "General drone discussions, news, and community conversations",
      icon: "💬",
      posts: 345,
      members: 278,
      lastPost: {
        title: "New Drone Technology Trends 2024",
        author: "TechEnthusiast_RW",
        time: "1 hour ago",
      },
    },
  ]

  const recentPosts = [
    {
      id: "1",
      title: "Complete Guide to RCAA Drone Registration in Rwanda - Updated 2024",
      author: {
        name: "Jean Claude Uwimana",
        username: "DroneExpert_RW",
        avatar: "/placeholder-user.jpg",
        isVerified: true,
      },
      category: "Regulations",
      replies: 23,
      views: 1234,
      time: "2 hours ago",
      tags: ["RCAA", "Registration", "Legal"],
    },
    {
      id: "2",
      title: "DJI Mini 3 Pro Gimbal Repair - Step by Step Guide",
      author: {
        name: "Marie Mukamana",
        username: "TechRepair_RW",
        avatar: "/placeholder-user.jpg",
        isVerified: false,
      },
      category: "Maintenance",
      replies: 15,
      views: 567,
      time: "4 hours ago",
      tags: ["DJI", "Repair", "Gimbal"],
    },
    {
      id: "3",
      title: "Best Flying Locations Around Kigali - Updated List 2024",
      author: {
        name: "David Nkurunziza",
        username: "KigaliPilot",
        avatar: "/placeholder-user.jpg",
        isVerified: false,
      },
      category: "Flying Tips",
      replies: 28,
      views: 789,
      time: "6 hours ago",
      tags: ["Kigali", "Locations", "Safety"],
    },
  ]

  const trendingTopics = [
    { tag: "RCAA", posts: 45 },
    { tag: "DJI", posts: 67 },
    { tag: "Photography", posts: 89 },
    { tag: "Agriculture", posts: 34 },
    { tag: "Racing", posts: 23 },
    { tag: "Repair", posts: 56 },
  ]

  return (
    <div className="space-y-6">
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search discussions, topics, or users..." className="pl-10" />
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/forum/${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                              {category.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {category.posts}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {category.members}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Latest: </span>
                            <span className="font-medium hover:text-blue-600">{category.lastPost.title}</span>
                            <span className="text-muted-foreground"> by {category.lastPost.author}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{category.lastPost.time}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {recentPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback>
                      {post.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium">{post.author.name}</span>
                          {post.author.isVerified && (
                            <Badge className="text-xs bg-blue-100 text-blue-800">Verified</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">in {post.category}</span>
                          <span className="text-sm text-muted-foreground">• {post.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {post.views}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending Topics
              </CardTitle>
              <CardDescription>Popular discussion topics this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">#{topic.tag}</span>
                    </div>
                    <Badge variant="secondary">{topic.posts} posts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
