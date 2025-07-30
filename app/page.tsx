import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar, Briefcase, BookOpen, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const stats = [
    { label: "Active Members", value: "1,247", icon: Users, color: "text-blue-600" },
    { label: "Forum Posts", value: "3,456", icon: MessageSquare, color: "text-green-600" },
    { label: "Upcoming Events", value: "12", icon: Calendar, color: "text-purple-600" },
    { label: "Job Listings", value: "28", icon: Briefcase, color: "text-orange-600" },
  ]

  const featuredProjects = [
    {
      id: "1",
      title: "Agricultural Monitoring in Musanze",
      author: "AgriDrone_RW",
      category: "Agriculture",
      image: "/placeholder.svg?height=200&width=300&text=Agricultural+Drone+Monitoring",
      likes: 45,
      views: 234,
    },
    {
      id: "2",
      title: "Kigali City Aerial Photography",
      author: "SkyView_Photo",
      category: "Photography",
      image: "/placeholder.svg?height=200&width=300&text=Kigali+Aerial+Photography",
      likes: 67,
      views: 456,
    },
    {
      id: "3",
      title: "Construction Site Mapping",
      author: "BuildTech_RW",
      category: "Construction",
      image: "/placeholder.svg?height=200&width=300&text=Construction+Site+Mapping",
      likes: 32,
      views: 189,
    },
  ]

  const upcomingEvents = [
    {
      id: "1",
      title: "Drone Safety Training Workshop",
      date: "March 15, 2024",
      location: "Kigali Convention Centre",
      type: "Training",
    },
    {
      id: "2",
      title: "Agricultural Drone Demo",
      date: "March 20, 2024",
      location: "Musanze Agricultural Center",
      type: "Demo",
    },
    {
      id: "3",
      title: "Rwanda Drone Racing Championship",
      date: "March 25, 2024",
      location: "Nyamirambo Stadium",
      type: "Competition",
    },
  ]

  const recentPosts = [
    {
      title: "RCAA Drone Registration Process - Step by Step Guide",
      author: "DroneExpert_RW",
      category: "Regulations",
      replies: 23,
      time: "2 hours ago",
    },
    {
      title: "Best Drones for Agricultural Mapping in Rwanda",
      author: "AgriTech_Pilot",
      category: "Agriculture",
      replies: 15,
      time: "4 hours ago",
    },
    {
      title: "Weather Conditions for Flying in Musanze",
      author: "MountainPilot",
      category: "Flying Tips",
      replies: 12,
      time: "6 hours ago",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Welcome to Rwanda Drone Community</h1>
          <p className="text-xl mb-6 opacity-90">
            Connect with drone enthusiasts, professionals, and businesses across Rwanda. Share knowledge, find services,
            and stay updated with the latest in drone technology.
          </p>
          <div className="flex gap-4">
            <Button size="lg" variant="secondary">
              Join Community
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Explore Services
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Featured Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Link href="/projects">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {featuredProjects.map((project, index) => (
              <Link key={index} href={`/projects/${project.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {project.category}
                    </Badge>
                    <h3 className="font-semibold mb-2 hover:text-blue-600 transition-colors">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">by {project.author}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {project.likes} likes
                      </span>
                      <span>{project.views} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <Link key={index} href={`/events/${event.id}`}>
                  <div className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 p-2 rounded-r cursor-pointer transition-colors">
                    <h4 className="font-semibold text-sm hover:text-blue-600">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {event.type}
                    </Badge>
                  </div>
                </Link>
              ))}
              <Link href="/events">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Forum Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="font-semibold text-sm line-clamp-2">{post.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>by {post.author}</span>
                    <span>•</span>
                    <span>{post.replies} replies</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
              ))}
              <Link href="/forum">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Join Discussion
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/services">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Find Drone Services
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  RCAA Regulations
                </Button>
              </Link>
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
