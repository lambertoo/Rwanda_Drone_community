import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, TrendingUp, MessageSquare, Eye, Heart, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="px-8 py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Welcome to Rwanda Drone Community</h1>
            <p className="mt-4 text-lg text-blue-100">
              Connect with drone enthusiasts, professionals, and businesses across Rwanda. Share knowledge, collaborate
              on projects, and advance the drone industry together.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button size="lg" variant="secondary">
                Join Community
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Explore Projects
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projects</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Forum Posts</p>
                <p className="text-2xl font-bold">2,156</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Events</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Projects</h2>
          <Button variant="outline" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              id: "1",
              title: "Agricultural Monitoring System",
              description:
                "AI-powered drone system for crop health monitoring and precision agriculture across Rwanda's farming regions.",
              category: "Agriculture",
              status: "Active",
              image: "/placeholder.svg?height=200&width=400&text=Agricultural+Monitoring",
              author: "Dr. Jean Baptiste",
              likes: 45,
              views: 1200,
            },
            {
              id: "2",
              title: "Wildlife Conservation Tracking",
              description:
                "Drone-based wildlife monitoring system for Akagera National Park using thermal imaging and AI detection.",
              category: "Conservation",
              status: "Completed",
              image: "/placeholder.svg?height=200&width=400&text=Wildlife+Conservation",
              author: "Sarah Mukamana",
              likes: 67,
              views: 890,
            },
            {
              id: "3",
              title: "Emergency Medical Delivery",
              description:
                "Autonomous drone network for delivering medical supplies to remote areas in partnership with health centers.",
              category: "Healthcare",
              status: "In Progress",
              image: "/placeholder.svg?height=200&width=400&text=Medical+Delivery",
              author: "Emmanuel Nkurunziza",
              likes: 89,
              views: 1500,
            },
          ].map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{project.category}</Badge>
                    <Badge
                      variant={
                        project.status === "Completed"
                          ? "default"
                          : project.status === "Active"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {project.author}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        <span>{project.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{project.views}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Forum Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Forum Activity</h2>
          <Button variant="outline" asChild>
            <Link href="/forum">Visit Forum</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              title: "Best practices for drone photography in Rwanda",
              category: "General Discussion",
              author: "Marie Claire",
              replies: 12,
              lastActivity: "2 hours ago",
              isPinned: true,
            },
            {
              title: "New regulations update - January 2024",
              category: "Regulations",
              author: "Admin",
              replies: 8,
              lastActivity: "4 hours ago",
              isPinned: false,
            },
            {
              title: "Seeking collaboration for mapping project",
              category: "Technical Support",
              author: "Patrick Uwimana",
              replies: 5,
              lastActivity: "6 hours ago",
              isPinned: false,
            },
            {
              title: "Upcoming drone racing event in Kigali",
              category: "Events",
              author: "Racing Club Rwanda",
              replies: 23,
              lastActivity: "1 day ago",
              isPinned: false,
            },
          ].map((post, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
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
                    <h3 className="font-semibold line-clamp-2 mb-2">{post.title}</h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.replies}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <Button variant="outline" asChild>
            <Link href="/events">View All Events</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Drone Technology Workshop",
              date: "March 15, 2024",
              time: "9:00 AM - 5:00 PM",
              location: "Kigali Convention Centre",
              attendees: 45,
              maxAttendees: 60,
            },
            {
              title: "Agricultural Drone Demonstration",
              date: "March 22, 2024",
              time: "2:00 PM - 4:00 PM",
              location: "Nyagatare District",
              attendees: 23,
              maxAttendees: 30,
            },
            {
              title: "Regulatory Compliance Seminar",
              date: "April 5, 2024",
              time: "10:00 AM - 12:00 PM",
              location: "Online Event",
              attendees: 78,
              maxAttendees: 100,
            },
          ].map((event, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                <CardDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {event.attendees}/{event.maxAttendees} attendees
                  </div>
                  <Button size="sm">Register</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
