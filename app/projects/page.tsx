import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Eye, MessageSquare, Search, Filter, Plus } from "lucide-react"

export default function ProjectsPage() {
  const projects = [
    {
      title: "Volcanoes National Park Aerial Survey",
      author: "ConservationDrone_RW",
      category: "Conservation",
      description:
        "Comprehensive aerial mapping of Volcanoes National Park to monitor wildlife habitats and track gorilla populations.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 45,
      views: 1234,
      comments: 12,
      tags: ["Conservation", "Wildlife", "Mapping", "National Park"],
      featured: true,
      date: "March 10, 2024",
    },
    {
      title: "Kigali Smart City Development Monitoring",
      author: "UrbanPlanner_RW",
      category: "Urban Planning",
      description:
        "Time-lapse documentation of Kigali's urban development projects using drone photography over 12 months.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 38,
      views: 987,
      comments: 8,
      tags: ["Urban Planning", "Time-lapse", "Development", "Kigali"],
      featured: true,
      date: "March 8, 2024",
    },
    {
      title: "Coffee Plantation Health Assessment",
      author: "AgriTech_Specialist",
      category: "Agriculture",
      description: "Using multispectral imaging to assess coffee plant health across plantations in Southern Province.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 29,
      views: 756,
      comments: 15,
      tags: ["Agriculture", "Coffee", "Multispectral", "Health Assessment"],
      featured: false,
      date: "March 5, 2024",
    },
    {
      title: "Lake Kivu Water Quality Monitoring",
      author: "EnvironmentalTech",
      category: "Environmental",
      description:
        "Regular drone-based water quality monitoring of Lake Kivu using specialized sensors and sampling equipment.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 33,
      views: 892,
      comments: 6,
      tags: ["Environmental", "Water Quality", "Lake Kivu", "Monitoring"],
      featured: false,
      date: "March 3, 2024",
    },
    {
      title: "Traditional Wedding Aerial Cinematography",
      author: "SkyWeddings_RW",
      category: "Photography",
      description: "Stunning aerial cinematography of traditional Rwandan wedding ceremonies in rural villages.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 67,
      views: 1543,
      comments: 23,
      tags: ["Photography", "Wedding", "Traditional", "Cinematography"],
      featured: true,
      date: "February 28, 2024",
    },
    {
      title: "Solar Farm Installation Progress",
      author: "RenewableEnergy_RW",
      category: "Energy",
      description:
        "Documenting the construction progress of Rwanda's largest solar farm installation in Eastern Province.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 24,
      views: 634,
      comments: 9,
      tags: ["Energy", "Solar", "Construction", "Progress Monitoring"],
      featured: false,
      date: "February 25, 2024",
    },
    {
      title: "Nyungwe Forest Canopy Research",
      author: "ForestResearcher",
      category: "Research",
      description:
        "Scientific research project using drones to study forest canopy structure and biodiversity in Nyungwe National Park.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 41,
      views: 1098,
      comments: 18,
      tags: ["Research", "Forest", "Biodiversity", "Nyungwe"],
      featured: false,
      date: "February 20, 2024",
    },
    {
      title: "Flood Assessment in Nyagatare",
      author: "DisasterResponse_RW",
      category: "Emergency Response",
      description:
        "Rapid flood damage assessment using drone imagery to support emergency response efforts in Nyagatare District.",
      image: "/placeholder.svg?height=300&width=400",
      likes: 52,
      views: 1876,
      comments: 31,
      tags: ["Emergency Response", "Flood", "Assessment", "Nyagatare"],
      featured: true,
      date: "February 15, 2024",
    },
  ]

  const categories = [
    "All Categories",
    "Agriculture",
    "Conservation",
    "Urban Planning",
    "Photography",
    "Environmental",
    "Energy",
    "Research",
    "Emergency Response",
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Agriculture":
        return "bg-green-100 text-green-800"
      case "Conservation":
        return "bg-emerald-100 text-emerald-800"
      case "Urban Planning":
        return "bg-blue-100 text-blue-800"
      case "Photography":
        return "bg-pink-100 text-pink-800"
      case "Environmental":
        return "bg-teal-100 text-teal-800"
      case "Energy":
        return "bg-yellow-100 text-yellow-800"
      case "Research":
        return "bg-purple-100 text-purple-800"
      case "Emergency Response":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Showcase</h1>
          <p className="text-muted-foreground">Discover amazing drone projects from the Rwanda community</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Share Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
        <Select defaultValue="All Categories">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Featured Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects
            .filter((project) => project.featured)
            .map((project, index) => (
              <Card key={index} className="overflow-hidden border-2 border-blue-200 hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                    <div className="text-xs text-muted-foreground">{project.date}</div>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {project.author}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {project.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {project.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {project.comments}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All Projects */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                  <div className="text-xs text-muted-foreground">{project.date}</div>
                </div>
                <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>by {project.author}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {project.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {project.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {project.comments}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
