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
} from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  // Mock projects data
  const projects = [
    {
      id: "1",
      title: "Agricultural Monitoring System - Musanze District",
      description:
        "Comprehensive drone-based crop monitoring and analysis system for smallholder farmers in Musanze District, focusing on potato and maize cultivation optimization.",
      category: "Agriculture",
      status: "Completed",
      location: "Musanze District, Rwanda",
      duration: "6 months",
      startDate: "January 2024",
      endDate: "June 2024",
      lead: {
        name: "Dr. Agnes Mukamana",
        role: "Project Lead",
        organization: "University of Rwanda - Agriculture",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 1234,
        likes: 89,
        comments: 23,
      },
      technologies: ["DJI Matrice 300", "Multispectral Imaging", "AI Analytics"],
      featured: true,
    },
    {
      id: "2",
      title: "Emergency Response Drone Network",
      description:
        "Rapid deployment drone system for emergency response and disaster management across Kigali Province.",
      category: "Emergency Response",
      status: "In Progress",
      location: "Kigali Province, Rwanda",
      duration: "12 months",
      startDate: "March 2024",
      endDate: "March 2025",
      lead: {
        name: "Jean Claude Niyonzima",
        role: "Operations Manager",
        organization: "Rwanda National Police",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 856,
        likes: 67,
        comments: 15,
      },
      technologies: ["DJI Mini 3", "Thermal Cameras", "Real-time Streaming"],
      featured: false,
    },
    {
      id: "3",
      title: "Wildlife Conservation Monitoring",
      description:
        "Anti-poaching surveillance and wildlife population monitoring in Akagera National Park using advanced drone technology.",
      category: "Environmental",
      status: "Completed",
      location: "Akagera National Park, Rwanda",
      duration: "8 months",
      startDate: "June 2023",
      endDate: "February 2024",
      lead: {
        name: "Sarah Uwimana",
        role: "Conservation Specialist",
        organization: "Rwanda Development Board",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 2156,
        likes: 145,
        comments: 34,
      },
      technologies: ["Fixed-wing Drones", "Night Vision", "GPS Tracking"],
      featured: true,
    },
    {
      id: "4",
      title: "Urban Planning & Mapping Initiative",
      description:
        "3D mapping and urban development planning for Kigali's expansion using high-resolution drone surveys.",
      category: "Mapping",
      status: "Planning",
      location: "Kigali City, Rwanda",
      duration: "10 months",
      startDate: "May 2024",
      endDate: "March 2025",
      lead: {
        name: "Emmanuel Habimana",
        role: "Urban Planner",
        organization: "City of Kigali",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 634,
        likes: 42,
        comments: 8,
      },
      technologies: ["LiDAR", "Photogrammetry", "GIS Integration"],
      featured: false,
    },
    {
      id: "5",
      title: "Medical Supply Delivery Network",
      description:
        "Last-mile medical supply delivery to remote health centers using autonomous drone delivery systems.",
      category: "Delivery",
      status: "In Progress",
      location: "Northern Province, Rwanda",
      duration: "18 months",
      startDate: "January 2024",
      endDate: "July 2025",
      lead: {
        name: "Dr. Marie Uwimana",
        role: "Health Systems Specialist",
        organization: "Ministry of Health",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 1456,
        likes: 98,
        comments: 27,
      },
      technologies: ["Cargo Drones", "GPS Navigation", "Cold Chain"],
      featured: true,
    },
    {
      id: "6",
      title: "Educational Drone Training Program",
      description:
        "Comprehensive drone education and training program for students and professionals across Rwanda's technical schools.",
      category: "Education",
      status: "Completed",
      location: "Multiple Locations, Rwanda",
      duration: "12 months",
      startDate: "February 2023",
      endDate: "February 2024",
      lead: {
        name: "Patrick Nkurunziza",
        role: "Training Coordinator",
        organization: "Rwanda Polytechnic",
        avatar: "/placeholder-user.jpg",
      },
      stats: {
        views: 987,
        likes: 76,
        comments: 19,
      },
      technologies: ["Training Simulators", "Educational Drones", "VR Training"],
      featured: false,
    },
  ]

  const categories = [
    { value: "all", label: "All Categories", count: projects.length },
    { value: "agriculture", label: "Agriculture", count: 1 },
    { value: "emergency", label: "Emergency Response", count: 1 },
    { value: "environmental", label: "Environmental", count: 1 },
    { value: "mapping", label: "Mapping & Surveying", count: 1 },
    { value: "delivery", label: "Delivery & Logistics", count: 1 },
    { value: "education", label: "Education & Training", count: 1 },
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "planning", label: "Planning" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "on-hold", label: "On Hold" },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in progress":
        return "bg-yellow-100 text-yellow-800"
      case "planning":
        return "bg-blue-100 text-blue-800"
      case "on-hold":
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

  const featuredProjects = projects.filter((project) => project.featured)
  const recentProjects = projects.slice(0, 3)

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
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
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
                <p className="text-2xl font-bold">{projects.filter((p) => p.status === "Completed").length}</p>
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
                <p className="text-2xl font-bold">{projects.filter((p) => p.status === "In Progress").length}</p>
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
                <p className="text-2xl font-bold">{new Set(projects.map((p) => p.lead.organization)).size}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
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
                <Input placeholder="Search projects by title, description, or technology..." className="pl-10" />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all">
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
              <Select defaultValue="all">
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
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{getCategoryIcon(project.category)}</span>
                        <Badge variant="outline">{project.category}</Badge>
                        <Badge variant="secondary" className={getStatusColor(project.status)}>
                          {project.status}
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
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
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
                          {project.status}
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
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
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
                          {project.status}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
