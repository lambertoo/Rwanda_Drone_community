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
} from "lucide-react"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getHomePageData() {
  // Skip database queries during build time
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return {
      featuredProjects: [],
      recentPosts: [],
      upcomingEvents: [],
      stats: { projects: 0, users: 0, events: 0, services: 0 }
    }
  }
  try {
    // Get featured projects (isFeatured = true AND isApproved = true, limit 3)
    const featuredProjects = await prisma.project.findMany({
      where: { 
        isFeatured: true,
        isApproved: true
      },
      take: 3,
      include: {
        author: {
          select: {
            fullName: true,
            organization: true,
            avatar: true,
          }
        },
        category: {
          select: {
            name: true,
            icon: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get recent forum posts (limit 3, only approved posts)
    const recentPosts = await prisma.forumPost.findMany({
      where: { isApproved: true },
      take: 3,
      include: {
        author: {
          select: {
            fullName: true,
            avatar: true,
            reputation: true,
          }
        },
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get upcoming events (limit 3, future dates, published AND approved)
    const upcomingEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date()
        },
        isPublished: true,
        isApproved: true
      },
      take: 3,
      include: {
        _count: {
          select: {
            rsvps: true
          }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    // Get statistics (only approved/published content for public visibility)
    const stats = await Promise.all([
      prisma.project.count({ where: { isApproved: true } }),
      prisma.user.count(),
      prisma.event.count({ where: { isPublished: true, isApproved: true } }),
      prisma.service.count({ where: { isApproved: true } })
    ])

    return {
      featuredProjects,
      recentPosts,
      upcomingEvents,
      stats: {
        projects: stats[0],
        users: stats[1],
        events: stats[2],
        services: stats[3]
      }
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return {
      featuredProjects: [],
      recentPosts: [],
      upcomingEvents: [],
      stats: { projects: 0, users: 0, events: 0, services: 0 }
    }
  }
}

export default async function HomePage() {
  const { featuredProjects, recentPosts, upcomingEvents, stats } = await getHomePageData()

  const getCategoryIcon = (category: string | null | undefined) => {
    if (!category) return "🚁"
    
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-16">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-gradient min-h-[480px] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative w-full px-8 py-16 md:py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
            <Zap className="h-4 w-4" />
            Rwanda's Premier Drone Community
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Innovating with Drones<br className="hidden md:block" /> in Rwanda
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            The one-stop platform connecting drone pilots, regulators, businesses and innovators
            shaping the future of drone technology across East Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <Button size="lg" className="bg-white text-[#002674] hover:bg-white/90 font-bold shadow-xl border-0 rounded-full px-8">
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-2 border-white/60 text-white hover:bg-white/10 bg-transparent rounded-full px-8">
                Join the Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Award, value: `${stats.projects}+`, label: "Active Projects", color: "text-[#002674]", bg: "bg-[#002674]/8" },
          { icon: Users, value: `${stats.users}+`, label: "Community Members", color: "text-[#0096FC]", bg: "bg-[#0096FC]/8" },
          { icon: TrendingUp, value: stats.events, label: "Events & Workshops", color: "text-[#002674]", bg: "bg-[#002674]/8" },
          { icon: Globe, value: stats.services, label: "Service Providers", color: "text-[#0096FC]", bg: "bg-[#0096FC]/8" },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <Card key={label} className="text-center hover:shadow-lg transition-all duration-300 border-border/60 hover:-translate-y-0.5">
            <CardContent className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${bg} rounded-xl mb-4`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="text-3xl font-extrabold mb-1">{value}</h3>
              <p className="text-muted-foreground text-sm">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── Featured Projects ── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-widest mb-1">Showcase</p>
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <p className="text-muted-foreground mt-1">Discover innovative drone projects making impact across Rwanda</p>
          </div>
          <Link href="/projects">
            <Button variant="outline" size="sm">View All <ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => {
            let technologies: string[] = []
            try { technologies = project.technologies ? JSON.parse(project.technologies) : [] } catch {}
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border-border/60">
                  <div className="aspect-video bg-gradient-to-br from-[#002674]/10 to-[#0096FC]/10 relative overflow-hidden">
                    <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-[#002674] text-xs font-semibold backdrop-blur-sm border-0">
                        {getCategoryIcon(project.category?.name)} {project.category?.name || 'Uncategorized'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-bold text-base mb-1.5 group-hover:text-[#0096FC] transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {technologies.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                      {technologies.length > 2 && <Badge variant="outline" className="text-xs">+{technologies.length - 2}</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={project.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs bg-brand-gradient text-white">{project.author.fullName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{project.author.fullName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{project.viewsCount}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{project.likesCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
          {featuredProjects.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No featured projects yet. Be the first to share yours!</p>
              <Link href="/projects/new" className="mt-4 inline-block"><Button size="sm">Share a Project</Button></Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Recent Forum Discussions ── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-widest mb-1">Community</p>
            <h2 className="text-3xl font-bold">Recent Discussions</h2>
            <p className="text-muted-foreground mt-1">Join the conversation and share your expertise</p>
          </div>
          <Link href="/forum"><Button variant="outline" size="sm">View Forum <ChevronRight className="h-4 w-4" /></Button></Link>
        </div>

        <div className="grid gap-3">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/forum/${post.category.name.toLowerCase()}/${post.id}`} className="block group">
              <Card className="hover:shadow-md transition-all border-border/60 hover:border-[#0096FC]/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="text-xs mb-2">{post.category.name}</Badge>
                      <h3 className="font-semibold group-hover:text-[#0096FC] transition-colors truncate">{post.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={post.author.avatar || ""} />
                          <AvatarFallback className="text-[9px] bg-brand-gradient text-white">{post.author.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <span>{post.author.fullName}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" />{post._count.comments}</span>
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{post.viewsCount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end"><Clock className="h-3 w-3" />{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {recentPosts.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No discussions yet. Start the first one!</p>
                <Link href="/forum/new" className="mt-3 inline-block"><Button size="sm">Start Discussion</Button></Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-widest mb-1">Calendar</p>
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <p className="text-muted-foreground mt-1">Don't miss these exciting drone community events</p>
          </div>
          <Link href="/events"><Button variant="outline" size="sm">View All <ChevronRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block group">
              <Card className="hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5 border-border/60 overflow-hidden">
                <div className="h-1.5 bg-brand-gradient" />
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{getCategoryIcon(event.category)}</span>
                    <Badge variant="outline" className="text-xs">{event.category || 'General'}</Badge>
                  </div>
                  <h3 className="font-bold text-base mb-3 group-hover:text-[#0096FC] transition-colors line-clamp-2">{event.title}</h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#002674]" />{formatDate(event.startDate)} at {formatTime(event.startDate)}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#0096FC]" />{event.location}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#002674]" />{event._count.rsvps} registered</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#002674] dark:text-[#0096FC]">
                      {event.price === 0 ? "Free" : `${event.price.toLocaleString()} ${event.currency}`}
                    </span>
                    <Button size="sm">Register</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {upcomingEvents.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-brand-gradient text-white p-10 md:p-14 text-center">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">Get Started</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Share Your Innovation?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of drone pilots, engineers, and innovators building Rwanda's drone future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects/new">
              <Button size="lg" className="bg-white text-[#002674] hover:bg-white/90 font-bold shadow-xl border-0 rounded-full px-8">
                Share Your Project <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-2 border-white/60 text-white hover:bg-white/10 bg-transparent rounded-full px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
