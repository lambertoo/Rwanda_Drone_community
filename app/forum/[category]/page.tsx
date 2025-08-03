import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Search, Plus, MessageSquare, Eye, ThumbsUp, Pin, Clock } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    category: string
  }
}

export default async function ForumCategoryPage({ params }: PageProps) {
  const { category } = await params

  // Category information
  const categoryInfo = {
    regulations: {
      title: "Regulations & Legal",
      description: "Discuss RCAA regulations, legal requirements, and compliance for drone operations in Rwanda",
      icon: "⚖️",
      posts: 156,
      members: 89,
    },
    maintenance: {
      title: "Repairs & Maintenance",
      description: "Get help with drone repairs, maintenance tips, and technical troubleshooting",
      icon: "🔧",
      posts: 234,
      members: 145,
    },
    "flying-tips": {
      title: "Flying Tips & Techniques",
      description: "Share flying experiences, techniques, and safety tips for better drone operations",
      icon: "✈️",
      posts: 189,
      members: 167,
    },
    jobs: {
      title: "Jobs & Opportunities",
      description: "Find drone-related job opportunities and freelance projects in Rwanda",
      icon: "💼",
      posts: 78,
      members: 234,
    },
    events: {
      title: "Events & Meetups",
      description: "Organize and discover drone community events, workshops, and meetups",
      icon: "📅",
      posts: 45,
      members: 123,
    },
    agriculture: {
      title: "Agricultural Applications",
      description: "Discuss drone applications in agriculture, crop monitoring, and precision farming",
      icon: "🌾",
      posts: 167,
      members: 98,
    },
    photography: {
      title: "Photography & Videography",
      description: "Share aerial photography tips, showcase work, and discuss camera equipment",
      icon: "📸",
      posts: 298,
      members: 201,
    },
    general: {
      title: "General Discussion",
      description: "General drone discussions, news, and community conversations",
      icon: "💬",
      posts: 345,
      members: 278,
    },
  }

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo]

  // Mock posts data for the category
  const posts = [
    {
      id: "1",
      title: "Complete Guide to RCAA Drone Registration in Rwanda - Updated 2024",
      content:
        "Fellow drone enthusiasts! After helping dozens of pilots navigate the RCAA registration process, I've compiled this comprehensive guide...",
      author: {
        name: "Jean Claude Uwimana",
        username: "DroneExpert_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 2847,
        isVerified: true,
      },
      stats: {
        views: 1234,
        replies: 23,
        likes: 89,
      },
      tags: ["RCAA", "Registration", "Legal", "Guide"],
      createdAt: "2024-03-10T10:30:00Z",
      lastActivity: "2024-03-11T09:15:00Z",
      isPinned: true,
    },
    {
      id: "2",
      title: "DJI Mini 3 Pro Gimbal Repair - Step by Step Guide",
      content:
        "My DJI Mini 3 Pro gimbal started acting up after a minor crash. Here's how I fixed it without sending it back to DJI...",
      author: {
        name: "Marie Mukamana",
        username: "TechRepair_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 1456,
        isVerified: false,
      },
      stats: {
        views: 567,
        replies: 15,
        likes: 34,
      },
      tags: ["DJI", "Repair", "Gimbal", "DIY"],
      createdAt: "2024-03-09T14:20:00Z",
      lastActivity: "2024-03-10T16:45:00Z",
      isPinned: false,
    },
    {
      id: "3",
      title: "Best Flying Locations Around Kigali - Updated List 2024",
      content:
        "I've been exploring different flying spots around Kigali and wanted to share the best locations I've found...",
      author: {
        name: "David Nkurunziza",
        username: "KigaliPilot",
        avatar: "/placeholder-user.jpg",
        reputation: 892,
        isVerified: false,
      },
      stats: {
        views: 789,
        replies: 28,
        likes: 56,
      },
      tags: ["Kigali", "Flying Spots", "Locations", "Safety"],
      createdAt: "2024-03-08T11:15:00Z",
      lastActivity: "2024-03-10T14:30:00Z",
      isPinned: false,
    },
    {
      id: "4",
      title: "Freelance Drone Photography Rates in Rwanda - What to Charge?",
      content:
        "I'm starting a drone photography business and wondering what rates other pilots are charging for different types of projects...",
      author: {
        name: "Patrick Habimana",
        username: "AerialPhoto_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 634,
        isVerified: false,
      },
      stats: {
        views: 445,
        replies: 19,
        likes: 27,
      },
      tags: ["Photography", "Business", "Rates", "Freelance"],
      createdAt: "2024-03-07T16:45:00Z",
      lastActivity: "2024-03-09T12:20:00Z",
      isPinned: false,
    },
    {
      id: "5",
      title: "Upcoming Drone Racing Event - Nyamirambo Stadium March 25th",
      content:
        "Exciting news! We're organizing a drone racing event at Nyamirambo Stadium. Registration is now open...",
      author: {
        name: "Samuel Mugisha",
        username: "RaceOrganizer_RW",
        avatar: "/placeholder-user.jpg",
        reputation: 1123,
        isVerified: true,
      },
      stats: {
        views: 678,
        replies: 31,
        likes: 78,
      },
      tags: ["Racing", "Event", "Competition", "Nyamirambo"],
      createdAt: "2024-03-06T09:30:00Z",
      lastActivity: "2024-03-10T18:15:00Z",
      isPinned: false,
    },
  ]

  if (!currentCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/forum">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Button>
          </Link>
        </div>
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
          <p className="text-muted-foreground">The forum category you're looking for doesn't exist.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Forum
          </Link>
          <span>/</span>
          <span className="capitalize">{category.replace("-", " ")}</span>
        </div>
      </div>

      {/* Category Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentCategory.icon}</div>
              <div>
                <CardTitle className="text-2xl mb-2">{currentCategory.title}</CardTitle>
                <p className="text-muted-foreground">{currentCategory.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>{currentCategory.posts} posts</span>
                  <span>•</span>
                  <span>{currentCategory.members} members</span>
                </div>
              </div>
            </div>
            <Link href="/forum/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={`Search in ${currentCategory.title}...`} className="pl-10" />
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.id} href={`/forum/${category}/${post.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && <Pin className="h-4 w-4 text-yellow-600" />}
                          <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{post.author.name}</span>
                            {post.author.isVerified && (
                              <Badge className="text-xs bg-blue-100 text-blue-800">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.stats.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.stats.likes}
                          </div>
                        </div>
                        <div className="text-xs">Last activity: {new Date(post.lastActivity).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
