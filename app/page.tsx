import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar, Briefcase, BookOpen, Camera } from "lucide-react"

export default function HomePage() {
  const stats = [
    { label: "Active Members", value: "1,247", icon: Users },
    { label: "Forum Posts", value: "3,892", icon: MessageSquare },
    { label: "Upcoming Events", value: "12", icon: Calendar },
    { label: "Job Listings", value: "28", icon: Briefcase },
  ]

  const recentPosts = [
    {
      title: "New RCAA Drone Registration Guidelines 2024",
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
      title: "Drone Photography Workshop - Kigali",
      author: "PhotoDrone_RW",
      category: "Events",
      replies: 8,
      time: "6 hours ago",
    },
  ]

  const upcomingEvents = [
    {
      title: "Drone Safety Training",
      date: "March 15, 2024",
      location: "Kigali Convention Centre",
      type: "Training",
    },
    {
      title: "Agricultural Drone Demo",
      date: "March 20, 2024",
      location: "Musanze District",
      type: "Demo",
    },
    {
      title: "Drone Racing Competition",
      date: "March 25, 2024",
      location: "Nyamirambo Stadium",
      type: "Competition",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-8 md:p-12">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Rwanda Drone Community</h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            Connecting drone enthusiasts, professionals, and businesses across the Land of a Thousand Hills
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Join Community</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              asChild
            >
              <Link href="/forum">Explore Forum</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6 text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Recent Forum Posts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Discussions
            </CardTitle>
            <CardDescription>Latest conversations in the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPosts.map((post, index) => (
              <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium hover:text-blue-600 cursor-pointer">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>by {post.author}</span>
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{post.replies} replies</div>
                    <div>{post.time}</div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/forum">View All Discussions</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Don't miss these drone community events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      <div>{event.location}</div>
                      <div>{event.date}</div>
                    </div>
                  </div>
                  <Badge variant="outline">{event.type}</Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Explore the Platform</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/services">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Services Directory
                </CardTitle>
                <CardDescription>Find drone service providers across Rwanda</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/resources">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Resources & Guides
                </CardTitle>
                <CardDescription>Regulations, safety guides, and tutorials</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" asChild>
            <Link href="/projects">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Project Showcase
                </CardTitle>
                <CardDescription>Discover amazing drone projects from the community</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
