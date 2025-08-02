import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  TrendingUp,
  Award,
  Zap,
  Globe,
  ChevronRight,
  Eye,
  Heart,
  Clock,
  Star,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  // Mock data for featured projects
  const featuredProjects = [
    {
      id: "1",
      title: "Agricultural Monitoring System",
      description:
        "Comprehensive drone-based crop monitoring and analysis system for smallholder farmers in Musanze District.",
      category: "Agriculture",
      status: "Completed",
      location: "Musanze District, Rwanda",
      lead: {
        name: "Dr. Agnes Mukamana",
        organization: "University of Rwanda",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 1234,
        likes: 89,
        comments: 23,
      },
      technologies: ["DJI Matrice 300", "Multispectral Imaging", "AI Analytics"],
      image: "/placeholder.svg?height=200&width=300&text=Agricultural+Monitoring",
    },
    {
      id: "3",
      title: "Wildlife Conservation Monitoring",
      description:
        "Anti-poaching surveillance and wildlife population monitoring in Akagera National Park using advanced drone technology.",
      category: "Environmental",
      status: "Completed",
      location: "Akagera National Park, Rwanda",
      lead: {
        name: "Sarah Uwimana",
        organization: "Rwanda Development Board",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 2156,
        likes: 145,
        comments: 34,
      },
      technologies: ["Fixed-wing Drones", "Night Vision", "GPS Tracking"],
      image: "/placeholder.svg?height=200&width=300&text=Wildlife+Conservation",
    },
    {
      id: "5",
      title: "Medical Supply Delivery Network",
      description:
        "Last-mile medical supply delivery to remote health centers using autonomous drone delivery systems.",
      category: "Delivery",
      status: "In Progress",
      location: "Northern Province, Rwanda",
      lead: {
        name: "Dr. Marie Uwimana",
        organization: "Ministry of Health",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 1456,
        likes: 98,
        comments: 27,
      },
      technologies: ["Cargo Drones", "GPS Navigation", "Cold Chain"],
      image: "/placeholder.svg?height=200&width=300&text=Medical+Delivery",
    },
  ]

  // Mock data for recent forum posts
  const recentPosts = [
    {
      id: "1",
      title: "Best practices for drone maintenance in humid conditions?",
      category: "Technical Discussion",
      author: {
        name: "Jean Baptiste Nzeyimana",
        avatar: "/placeholder-user.jpg",
        reputation: 1250,
      },
      replies: 12,
      views: 234,
      lastActivity: "2 hours ago",
      tags: ["maintenance", "humidity", "best-practices"],
    },
    {
      id: "2",
      title: "New RCAA regulations for commercial drone operations",
      category: "Regulations & Compliance",
      author: {
        name: "Marie Uwimana",
        avatar: "/placeholder-user.jpg",
        reputation: 890,
      },
      replies: 8,
      views: 156,
      lastActivity: "4 hours ago",
      tags: ["regulations", "commercial", "RCAA"],
    },
    {
      id: "3",
      title: "Successful crop monitoring project in Nyagatare",
      category: "Project Showcase",
      author: {
        name: "Emmanuel Habimana",
        avatar: "/placeholder-user.jpg",
        reputation: 567,
      },
      replies: 15,
      views: 342,
      lastActivity: "6 hours ago",
      tags: ["agriculture", "success-story", "monitoring"],
    },
  ]

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: "1",
      title: "Rwanda Drone Summit 2024",
      date: "2024-03-15",
      time: "09:00",
      location: "Kigali Convention Centre",
      category: "Conference",
      attendees: 245,
      price: 50000,
    },
    {
      id: "2",
      title: "Drone Photography Workshop",
      date: "2024-03-22",
      time: "14:00",
      location: "University of Rwanda",
      category: "Workshop",
      attendees: 32,
      price: 15000,
    },
    {
      id: "3",
      title: "Agricultural Drone Training",
      date: "2024-03-28",
      time: "08:00",
      location: "Musanze District",
      category: "Training",
      attendees: 18,
      price: 25000,
    },
  ]

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "agriculture":
        return "🌾"
      case "environmental":
        return "🌍"
      case "delivery":
        return "📦"
      case "conference":
        return "🎤"
      case "workshop":
        return "🛠️"
      case "training":
        return "🎓"
      default:
        return "🚁"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-yellow-100 text-yellow-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              Welcome to Rwanda's Premier Drone Community
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent mb-6">
              Innovating with Drones in Rwanda
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Join Rwanda's leading drone community. Share projects, learn from experts, participate in events, and help
              shape the future of drone technology in East Africa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/projects">
                <Button size="lg" className="text-lg px-8 py-3">
                  Explore Projects
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/forum">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  Join Discussions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid md:grid-cols-4 gap-6">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4">
              <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">150+</h3>
            <p className="text-muted-foreground">Active Projects</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">2,500+</h3>
            <p className="text-muted-foreground">Community Members</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">85%</h3>
            <p className="text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg mb-4">
              <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">12</h3>
            <p className="text-muted-foreground">Districts Covered</p>
          </CardContent>
        </Card>
      </section>

      {/* Featured Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <p className="text-muted-foreground mt-2">Discover innovative drone projects making impact across Rwanda</p>
          </div>
          <Link href="/projects">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              View All Projects
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block group">
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 relative overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                      {getCategoryIcon(project.category)} {project.category}
                    </Badge>
                    <Badge variant="secondary" className={`${getStatusColor(project.status)} backdrop-blur-sm`}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.technologies.slice(0, 2).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {project.technologies.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.technologies.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                        <AvatarFallback className="text-xs">
                          {project.lead.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{project.lead.name}</p>
                        <p className="text-xs text-muted-foreground">{project.lead.organization}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {project.stats.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {project.stats.likes}
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
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Recent Discussions</h2>
            <p className="text-muted-foreground mt-2">Join the conversation and share your expertise</p>
          </div>
          <Link href="/forum">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              View All Discussions
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/forum/general/${post.id}`} className="block group">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {post.category}
                        </Badge>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h3 className="font-semibold group-hover:text-blue-600 transition-colors mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                            <AvatarFallback className="text-xs">
                              {post.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{post.author.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{post.author.reputation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.replies}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.views}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.lastActivity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground mt-2">Don't miss these exciting drone community events</p>
          </div>
          <Link href="/events">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              View All Events
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block group">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(event.category)}</span>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>{event.attendees} registered</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-600">
                      {event.price === 0 ? "Free" : `${event.price.toLocaleString()} RWF`}
                    </span>
                    <Button size="sm" variant="outline">
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
        <div className="px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Innovation?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of drone enthusiasts, researchers, and professionals building the future of drone technology
            in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects/new">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Share Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
