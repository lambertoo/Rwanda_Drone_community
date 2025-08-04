"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Eye,
  Heart,
  MessageSquare,
  Upload,
  TrendingUp,
  Award,
  Clock,
  Loader,
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
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(project =>
        project.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter(project =>
        project.status.toLowerCase() === selectedStatus.toLowerCase()
      )
    }

    setFilteredProjects(filtered)
  }, [projects, searchTerm, selectedCategory, selectedStatus])

  // Calculate real statistics
  const totalProjects = projects.length
  const completedProjects = projects.filter(p => p.status.toLowerCase() === "completed").length
  const inProgressProjects = projects.filter(p => p.status.toLowerCase() === "in_progress").length
  const onHoldProjects = projects.filter(p => p.status.toLowerCase() === "on_hold").length
  const uniqueOrganizations = new Set(projects.map(p => p.lead.organization)).size

  // Get unique categories with counts
  const categories = [
    { value: "all", label: "All Categories", count: totalProjects },
    ...Array.from(new Set(projects.map(p => p.category))).map(category => ({
      value: category.toLowerCase(),
      label: category,
      count: projects.filter(p => p.category.toLowerCase() === category.toLowerCase()).length
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
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "on_hold":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Showcase</h1>
          <p className="text-muted-foreground mt-2">Discover innovative drone projects from the Rwanda community</p>
        </div>
        <div className="flex gap-2">
          <Link href="/projects/new">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Share Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProjects}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedProjects}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressProjects}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueOrganizations}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onHoldProjects}</p>
                <p className="text-sm text-muted-foreground">On Hold</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search projects by title, description, or technology..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                  setSelectedStatus("all")
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Projects ({filteredProjects.length})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({featuredProjects.length})</TabsTrigger>
          <TabsTrigger value="recent">Recent ({recentProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{getCategoryIcon(project.category)}</span>
                          <Badge variant="outline">{project.category}</Badge>
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {project.statusDisplay}
                          </Badge>
                          {project.featured && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <Link href={`/projects/${project.id}`} className="block group">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {project.startDate} - {project.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>Led by {project.lead.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {project.stats.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {project.stats.comments}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                            <AvatarFallback>
                              {project.lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="font-medium text-sm">{project.lead.name}</p>
                            <p className="text-xs text-muted-foreground">{project.lead.organization}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          {featuredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No featured projects found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{getCategoryIcon(project.category)}</span>
                          <Badge variant="outline">{project.category}</Badge>
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {project.statusDisplay}
                          </Badge>
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        </div>

                        <Link href={`/projects/${project.id}`} className="block group">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-muted-foreground mb-4">{project.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {project.startDate} - {project.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>Led by {project.lead.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {project.stats.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {project.stats.comments}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                            <AvatarFallback>
                              {project.lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="font-medium text-sm">{project.lead.name}</p>
                            <p className="text-xs text-muted-foreground">{project.lead.organization}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          {recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recent projects found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {recentProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{getCategoryIcon(project.category)}</span>
                          <Badge variant="outline">{project.category}</Badge>
                          <Badge variant="secondary" className={getStatusColor(project.status)}>
                            {project.statusDisplay}
                          </Badge>
                          {project.featured && (
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              Featured
                            </Badge>
                          )}
                        </div>

                        <Link href={`/projects/${project.id}`} className="block group">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                            {project.title}
                          </h3>
                        </Link>

                        <p className="text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span>
                              {project.startDate} - {project.endDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-600" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>Led by {project.lead.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {project.stats.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {project.stats.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {project.stats.comments}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={project.lead.avatar || "/placeholder.svg"} alt={project.lead.name} />
                            <AvatarFallback>
                              {project.lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-right">
                            <p className="font-medium text-sm">{project.lead.name}</p>
                            <p className="text-xs text-muted-foreground">{project.lead.organization}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
