"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Eye,
  Heart,
  MessageSquare,
  Upload,
  Award,
  Users,
  CheckCircle2,
  FolderOpen,
  Plus,
} from "lucide-react"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

interface Project {
  id: string
  title: string
  description: string
  category: string
  status: string
  statusDisplay: string
  location: string
  duration: string
  startDate: string
  endDate: string
  lead: {
    name: string
    role: string
    organization: string
    avatar: string
  }
  stats: {
    views: number
    likes: number
    comments: number
  }
  technologies: string[]
  featured: boolean
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects)
          setFilteredProjects(data.projects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(searchTerm.toLowerCase())
        const descriptionMatch = project.description.toLowerCase().includes(searchTerm.toLowerCase())

        // Handle technologies as either array or string
        let technologiesMatch = false
        if (Array.isArray(project.technologies)) {
          technologiesMatch = project.technologies.some(tech =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
        } else if (typeof project.technologies === 'string') {
          technologiesMatch = (project.technologies as string).toLowerCase().includes(searchTerm.toLowerCase())
        }

        return titleMatch || descriptionMatch || technologiesMatch
      })
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(project =>
        project.category && project.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(project =>
        project.status && project.status.toLowerCase() === selectedStatus.toLowerCase()
      )
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, selectedCategory, selectedStatus])

  // Calculate real statistics
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status && p.status.toLowerCase() === "completed").length
  const inProgressProjects = projects.filter(p => p.status && p.status.toLowerCase() === "in_progress").length
  const onHoldProjects = projects.filter(p => p.status && p.status.toLowerCase() === "on_hold").length
  const uniqueOrganizations = new Set(projects.map(p => p.lead.organization).filter(Boolean)).size

  // Get unique categories with counts
  const categories = [
    { value: "all", label: "All Categories", count: totalProjects },
    ...Array.from(new Set(projects.map(p => p.category).filter(Boolean))).map(category => ({
      value: category ? category.toLowerCase() : 'uncategorized',
      label: category || 'Uncategorized',
      count: projects.filter(p => p.category && p.category.toLowerCase() === (category ? category.toLowerCase() : 'uncategorized')).length
    }))
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "planning", label: "Planning" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On Hold" },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
      case "planning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
      case "on_hold":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getCategoryIcon = (category: string) => {
    if (!category) return "🚁"

    switch (category.toLowerCase()) {
      case "agriculture":
        return "🌾"
      case "emergency response":
        return "🚨"
      case "environmental":
        return "🌍"
      case "mapping":
        return "🗺️"
      case "delivery":
        return "📦"
      case "education":
        return "🎓"
      default:
        return "🚁"
    }
  }

  const featuredProjects = filteredProjects.filter((project) => project.featured)
  const recentProjects = filteredProjects.slice(0, 3)

  // Derive displayed list from active tab
  const displayedProjects =
    activeTab === "featured"
      ? featuredProjects
      : activeTab === "recent"
      ? recentProjects
      : filteredProjects

  const TAB_OPTIONS = [
    { value: "featured", label: "Featured", count: featuredProjects.length },
    { value: "recent", label: "Recent", count: recentProjects.length },
    { value: "all", label: "All", count: filteredProjects.length },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
        {/* Hero skeleton */}
        <div className="bg-brand-gradient rounded-2xl h-48 animate-pulse" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/40 p-5 h-24 animate-pulse" />
          ))}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border/40 p-5 animate-pulse space-y-4 h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">

      {/* ── Hero ── */}
      <div className="relative bg-brand-gradient rounded-2xl overflow-hidden px-8 py-12 md:py-16">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-8 right-40 h-20 w-20 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[#009FDA]">
              Community Showcase
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Community Showcase
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-xl">
              Explore drone projects built by Rwanda's most innovative pilots and operators.
            </p>
          </div>
          <Link href="/projects/new" className="shrink-0">
            <Button className="bg-white text-[#003366] font-semibold hover:bg-white/90 rounded-xl px-6 shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Share Project
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#003366]/10 dark:bg-[#009FDA]/10 shrink-0">
            <Award className="h-5 w-5 text-[#003366] dark:text-[#009FDA]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gradient">{totalProjects}</p>
            <p className="text-sm text-muted-foreground">Total Projects</p>
          </div>
        </div>
        {/* Completed */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gradient">{completedProjects}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
        </div>
        {/* Organizations */}
        <div className="bg-card rounded-2xl border border-border/40 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[#003366]/10 dark:bg-[#009FDA]/10 shrink-0">
            <Users className="h-5 w-5 text-[#003366] dark:text-[#009FDA]" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gradient">{uniqueOrganizations}</p>
            <p className="text-sm text-muted-foreground">Organizations</p>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by title, description, or technology..."
            className="pl-10 rounded-full border-border/60 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pill tab filters */}
        <div className="flex gap-1.5 flex-wrap">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab.value
                  ? "bg-[#003366] text-white border-[#003366] shadow-sm"
                  : "bg-background text-muted-foreground border-border/50 hover:border-[#009FDA]/50 hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.value ? "text-white/70" : "text-muted-foreground"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category select */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] rounded-full border-border/60">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Card grid ── */}
      {displayedProjects.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="p-5 rounded-full bg-[#003366]/10 dark:bg-[#009FDA]/10">
            <FolderOpen className="h-10 w-10 text-[#009FDA]" />
          </div>
          <h3 className="text-lg font-semibold">No projects found</h3>
          <p className="text-muted-foreground max-w-sm text-sm">
            Try adjusting your filters or search term. Be the first to share a project!
          </p>
          <Link href="/projects/new">
            <Button className="btn-gradient rounded-xl mt-2">
              <Upload className="h-4 w-4 mr-2" />
              Share a Project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedProjects.map((project) => {
            const techs = Array.isArray(project.technologies) ? project.technologies : []

            return (
              <div
                key={project.id}
                className="group bg-card rounded-2xl border border-border/40 hover:border-[#009FDA]/30 hover:shadow-xl transition-all flex flex-col overflow-hidden"
              >
                {/* Cover / thumbnail area */}
                <div className="relative h-32 bg-gradient-to-br from-[#003366]/80 to-[#009FDA]/60 flex items-center justify-center">
                  <span className="text-4xl select-none">{getCategoryIcon(project.category)}</span>
                  {/* Category badge overlay */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white/20 text-white backdrop-blur-sm">
                    {project.category || "Uncategorized"}
                  </span>
                  {project.featured && (
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-yellow-400/90 text-yellow-900">
                      Featured
                    </span>
                  )}
                  {/* Status badge bottom-right */}
                  <span className={`absolute bottom-3 right-3 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.statusDisplay}
                  </span>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Title */}
                  <Link href={`/projects/${project.id}`} className="block mb-1">
                    <h3 className="font-bold text-base line-clamp-2 group-hover:text-[#009FDA] transition-colors">
                      {project.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  {techs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {techs.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-0.5 text-xs rounded-full border border-border/60 text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {techs.length > 3 && (
                        <span className="px-2.5 py-0.5 text-xs rounded-full border border-border/60 text-muted-foreground">
                          +{techs.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom: organizer + engagement */}
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                      {/* Organizer */}
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarImage src={project.lead.avatar || "/placeholder-user.jpg"} alt={project.lead.name} />
                          <AvatarFallback className="text-xs bg-[#003366]/10 text-[#003366] dark:bg-[#009FDA]/10 dark:text-[#009FDA]">
                            {project.lead.name?.split(" ").map((n) => n[0]).join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{project.lead.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{project.lead.organization}</p>
                        </div>
                      </div>

                      {/* Engagement metrics */}
                      <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
                        <span className="flex items-center gap-0.5">
                          <Eye className="h-3.5 w-3.5" />
                          {project.stats.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Heart className="h-3.5 w-3.5" />
                          {project.stats.likes}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {project.stats.comments}
                        </span>
                      </div>
                    </div>

                    {/* View Project button */}
                    <Link href={`/projects/${project.id}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg border-[#009FDA]/30 text-[#003366] dark:text-[#009FDA] hover:bg-[#009FDA]/10 hover:border-[#009FDA] text-xs h-8 transition-colors"
                      >
                        View Project
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── CTA banner ── */}
      <div className="relative bg-brand-gradient rounded-2xl overflow-hidden p-8 text-center">
        <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white mb-2">
            Built something amazing with drones?
          </h3>
          <p className="text-white/75 text-sm mb-5 max-w-md mx-auto">
            Share your project with Rwanda's drone community and inspire the next generation
            of innovators.
          </p>
          <Link href="/projects/new">
            <Button className="bg-white text-[#003366] font-semibold hover:bg-white/90 rounded-xl px-6 shadow-lg">
              <Upload className="h-4 w-4 mr-2" />
              Share Your Project
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
