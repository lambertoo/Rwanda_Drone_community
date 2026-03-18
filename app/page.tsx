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
    <div className="space-y-20">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient min-h-[520px] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="relative w-full px-6 sm:px-8 py-20 md:py-32 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md px-4 py-2.5 rounded-full text-sm font-medium mb-8 border border-white/25">
            <Zap className="h-4 w-4" />
            <span>Rwanda's Premier Drone Community</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            Innovating with<br className="hidden md:block" /> Drones in Rwanda
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            The one-stop platform connecting drone pilots, regulators, businesses and innovators shaping the future of drone technology across East Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects">
              <Button size="lg" className="bg-white text-[#002674] hover:bg-white/95 font-semibold shadow-2xl border-0 rounded-lg px-10 h-12">
                Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/15 bg-transparent rounded-lg px-10 h-12 font-semibold">
                Join the Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { icon: Award, value: `${stats.projects}+`, label: "Active Projects", color: "text-[#002674]", bg: "bg-[#002674]/8" },
            { icon: Users, value: `${stats.users}+`, label: "Community Members", color: "text-[#0096FC]", bg: "bg-[#0096FC]/8" },
            { icon: TrendingUp, value: stats.events, label: "Events & Workshops", color: "text-[#002674]", bg: "bg-[#002674]/8" },
            { icon: Globe, value: stats.services, label: "Service Providers", color: "text-[#0096FC]", bg: "bg-[#0096FC]/8" },
          ].map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${bg} rounded-2xl mb-5`}>
                <Icon className={`h-8 w-8 ${color}`} />
              </div>
              <h3 className="text-4xl md:text-5xl font-bold mb-2">{value}</h3>
              <p className="text-muted-foreground text-sm md:text-base font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Projects ── */}
      <section className="py-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-wider mb-3 block">Showcase</p>
            <h2 className="text-4xl font-bold mb-3">Featured Projects</h2>
            <p className="text-muted-foreground text-base font-light max-w-2xl">Discover innovative drone projects making impact across Rwanda</p>
          </div>
          <Link href="/projects" className="hidden md:block">
            <Button variant="outline" size="sm" className="rounded-lg">View All <ChevronRight className="h-4 w-4" /></Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project) => {
            let technologies: string[] = []
            try { technologies = project.technologies ? JSON.parse(project.technologies) : [] } catch {}
            return (
              <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                <div className="overflow-hidden rounded-2xl hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 bg-card border border-border/40">
                  <div className="aspect-video bg-gradient-to-br from-[#002674]/10 to-[#0096FC]/10 relative overflow-hidden">
                    <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/95 text-[#002674] text-xs font-semibold backdrop-blur-sm border-0 rounded-lg px-3 py-1.5">
                        {getCategoryIcon(project.category?.name)} {project.category?.name || 'Uncategorized'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-2 group-hover:text-[#0096FC] transition-colors line-clamp-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {technologies.slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs rounded-md">{t}</Badge>)}
                      {technologies.length > 2 && <Badge variant="outline" className="text-xs rounded-md">+{technologies.length - 2}</Badge>}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={project.author.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs bg-brand-gradient text-white">{project.author.fullName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{project.author.fullName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{project.viewsCount}</span>
                        <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{project.likesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
      <section className="py-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-wider mb-3 block">Community</p>
            <h2 className="text-4xl font-bold mb-3">Recent Discussions</h2>
            <p className="text-muted-foreground text-base font-light">Join the conversation and share your expertise</p>
          </div>
          <Link href="/forum" className="hidden md:block"><Button variant="outline" size="sm" className="rounded-lg">View Forum <ChevronRight className="h-4 w-4" /></Button></Link>
        </div>

        <div className="grid gap-5">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/forum/${post.category.name.toLowerCase()}/${post.id}`} className="block group">
              <div className="rounded-2xl hover:shadow-xl transition-all border border-border/40 hover:-translate-y-0.5 bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs mb-3 rounded-md">{post.category.name}</Badge>
                    <h3 className="font-semibold text-lg group-hover:text-[#0096FC] transition-colors line-clamp-2 mb-3">{post.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatar || ""} />
                        <AvatarFallback className="text-[10px] bg-brand-gradient text-white">{post.author.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{post.author.fullName}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{post._count.comments}</span>
                      <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{post.viewsCount}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5 justify-end"><Clock className="h-3 w-3" />{formatDate(post.createdAt)}</p>
                  </div>
                </div>
              </div>
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
      <section className="py-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-semibold text-[#0096FC] uppercase tracking-wider mb-3 block">Calendar</p>
            <h2 className="text-4xl font-bold mb-3">Upcoming Events</h2>
            <p className="text-muted-foreground text-base font-light">Don't miss these exciting drone community events</p>
          </div>
          <Link href="/events" className="hidden md:block"><Button variant="outline" size="sm" className="rounded-lg">View All <ChevronRight className="h-4 w-4" /></Button></Link>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="block group">
              <div className="rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-1 border border-border/40 bg-card">
                <div className="h-2 bg-brand-gradient" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{getCategoryIcon(event.category)}</span>
                    <Badge variant="outline" className="text-xs rounded-md">{event.category || 'General'}</Badge>
                  </div>
                  <h3 className="font-bold text-lg mb-5 group-hover:text-[#0096FC] transition-colors line-clamp-2">{event.title}</h3>
                  <div className="space-y-3 text-sm text-muted-foreground mb-6 pb-6 border-b border-border/30">
                    <div className="flex items-center gap-3"><Calendar className="h-4 w-4 flex-shrink-0 text-[#002674]" /><span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span></div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 flex-shrink-0 text-[#0096FC]" /><span>{event.location}</span></div>
                    <div className="flex items-center gap-3"><Users className="h-4 w-4 flex-shrink-0 text-[#002674]" /><span>{event._count.rsvps} registered</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#002674] dark:text-[#0096FC] text-lg">
                      {event.price === 0 ? "Free" : `${event.price.toLocaleString()} ${event.currency}`}
                    </span>
                    <Button size="sm" className="rounded-lg">Register</Button>
                  </div>
                </div>
              </div>
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
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-12 md:p-16 text-center my-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/8 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70 mb-4 block">Get Started</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Share Your Innovation?</h2>
          <p className="text-white/85 text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Join thousands of drone pilots, engineers, and innovators building Rwanda's drone future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/projects/new">
              <Button size="lg" className="bg-white text-[#002674] hover:bg-white/95 font-semibold shadow-2xl border-0 rounded-lg px-10 h-12">
                Share Your Project <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="border-2 border-white/50 text-white hover:bg-white/15 bg-transparent rounded-lg px-10 h-12 font-semibold">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
