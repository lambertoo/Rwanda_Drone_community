import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageSquare, Eye, ThumbsUp, Search, Plus, ArrowLeft, Clock, User } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    category: string
  }
}

export default function ForumCategoryPage({ params }: PageProps) {
  const categoryName = decodeURIComponent(params.category).replace(/-/g, " ")

  const categoryPosts = {
    Regulations: [
      {
        title: "RCAA Drone Registration Process - Step by Step Guide",
        author: "DroneExpert_RW",
        replies: 23,
        views: 456,
        likes: 12,
        time: "2 hours ago",
        isPinned: true,
        content: "Complete guide on how to register your drone with RCAA including required documents and fees.",
        lastReply: "DroneNewbie_RW",
        lastReplyTime: "30 minutes ago",
      },
      {
        title: "New RCAA Regulations for Commercial Drone Operations 2024",
        author: "CommercialPilot_RW",
        replies: 18,
        views: 342,
        likes: 9,
        time: "5 hours ago",
        isPinned: false,
        content: "Discussion about the updated commercial drone operation regulations.",
        lastReply: "BusinessDrone_RW",
        lastReplyTime: "1 hour ago",
      },
      {
        title: "Flying Permissions for Tourist Areas",
        author: "TourismDrone",
        replies: 12,
        views: 189,
        likes: 7,
        time: "1 day ago",
        isPinned: false,
        content: "How to get permissions for drone flights in tourist areas and national parks.",
        lastReply: "ParkRanger_RW",
        lastReplyTime: "3 hours ago",
      },
    ],
    "Repairs & Maintenance": [
      {
        title: "Looking for Drone Repair Services in Huye",
        author: "StudentPilot",
        replies: 5,
        views: 67,
        likes: 3,
        time: "12 hours ago",
        isPinned: false,
        content: "My DJI Mini crashed and needs repair. Any recommendations in Huye area?",
        lastReply: "TechRepair_RW",
        lastReplyTime: "2 hours ago",
      },
      {
        title: "DIY Propeller Replacement Guide",
        author: "DroneFixIt",
        replies: 15,
        views: 234,
        likes: 18,
        time: "2 days ago",
        isPinned: true,
        content: "Step-by-step guide for replacing damaged propellers on various drone models.",
        lastReply: "BeginnerPilot",
        lastReplyTime: "4 hours ago",
      },
      {
        title: "Battery Maintenance Tips for Rwanda's Climate",
        author: "PowerTech_RW",
        replies: 8,
        views: 156,
        likes: 11,
        time: "3 days ago",
        isPinned: false,
        content: "How to maintain drone batteries in Rwanda's humid climate conditions.",
        lastReply: "WeatherPilot",
        lastReplyTime: "1 day ago",
      },
    ],
    "Flying Tips": [
      {
        title: "Weather Conditions for Flying in Musanze District",
        author: "MountainPilot",
        replies: 12,
        views: 189,
        likes: 6,
        time: "8 hours ago",
        isPinned: false,
        content: "Best practices for flying drones in mountainous terrain around Musanze.",
        lastReply: "VolcanoPilot",
        lastReplyTime: "1 hour ago",
      },
      {
        title: "Flying During Rwanda's Rainy Season - Safety Tips",
        author: "SeasonalFlyer",
        replies: 20,
        views: 345,
        likes: 14,
        time: "1 day ago",
        isPinned: true,
        content: "Essential safety tips for drone operations during the rainy season.",
        lastReply: "SafetyFirst_RW",
        lastReplyTime: "3 hours ago",
      },
    ],
  }

  const posts = categoryPosts[categoryName as keyof typeof categoryPosts] || []

  const getCategoryDescription = (category: string) => {
    const descriptions = {
      Regulations: "RCAA regulations, licensing, and legal requirements for drone operations in Rwanda",
      "Repairs & Maintenance": "Technical support, repair guides, and maintenance tips for your drones",
      "Flying Tips": "Flight techniques, weather considerations, and safety practices",
      "Jobs & Opportunities": "Career opportunities, freelance gigs, and business partnerships",
      Events: "Community meetups, workshops, competitions, and training sessions",
      Agriculture: "Agricultural applications, crop monitoring, and precision farming",
      "Photography/Videography": "Aerial photography, cinematography techniques, and creative projects",
      "General Discussion": "Open discussions about drone technology, news, and community topics",
    }
    return descriptions[category as keyof typeof descriptions] || "Forum category discussions"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/forum">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{categoryName}</h1>
          <p className="text-muted-foreground">{getCategoryDescription(categoryName)}</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search in ${categoryName}...`} className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Posts ({posts.length})</h2>
          <div className="text-sm text-muted-foreground">Sorted by: Most Recent</div>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
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
                      </div>
                      <h3 className="font-semibold text-lg hover:text-blue-600 cursor-pointer mb-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>by {post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.time}</span>
                        </div>
                        {post.lastReply && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>
                              Last reply by {post.lastReply} {post.lastReplyTime}
                            </span>
                          </div>
                        )}
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
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">Be the first to start a discussion in this category!</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
