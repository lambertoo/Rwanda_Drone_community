import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Eye, MessageSquare, Search, Filter, Plus } from "lucide-react"

export default function ProjectsPage() {
  const projects = [
    {
      title: "Agricultural Monitoring in Musanze",
      author: "AgriDrone_RW",
      category: "Agriculture",
      description:
        "Comprehensive crop monitoring project using multispectral imaging to assess crop health and optimize irrigation in potato farms across Musanze district.",
      image: "/placeholder.svg?height=300&width=400&text=Agricultural+Monitoring",
      likes: 45,
      views: 234,
      comments: 12,
      tags: ["Agriculture", "Multispectral", "Crop Health", "Irrigation"],
      featured: true,
      date: "March 10, 2024",
    },
    {
      title: "Kigali City Aerial Photography Series",
      author: "SkyView_Photo",
      category: "Photography",
      description:
        "Stunning aerial photography showcasing Kigali's urban development and architectural beauty from unique perspectives.",
      image: "/placeholder.svg?height=300&width=400&text=Kigali+Aerial+Photography",
      likes: 67,
      views: 456,
      comments: 23,
      tags: ["Photography", "Urban", "Architecture", "Kigali"],
      featured: true,
      date: "March 8, 2024",
    },
    {
      title: "Construction Site Progress Mapping",
      author: "BuildTech_RW",
      category: "Construction",
      description:
        "3D mapping and progress monitoring of a major construction project in Kigali using photogrammetry techniques.",
      image: "/placeholder.svg?height=300&width=400&text=Construction+Mapping",
      likes: 32,
      views: 189,
      comments: 8,
      tags: ["Construction", "3D Mapping", "Photogrammetry", "Progress Monitoring"],
      featured: false,
      date: "March 5, 2024",
    },
    {
      title: "Wildlife Conservation Monitoring",
      author: "EcoWatch_Rwanda",
      category: "Conservation",
      description:
        "Using thermal imaging drones to monitor wildlife populations in Akagera National Park for conservation efforts.",
      image: "/placeholder.svg?height=300&width=400&text=Wildlife+Monitoring",
      likes: 89,
      views: 567,
      comments: 34,
      tags: ["Conservation", "Wildlife", "Thermal Imaging", "Akagera"],
      featured: true,
      date: "March 3, 2024",
    },
    {
      title: "Solar Panel Inspection Project",
      author: "SolarTech_RW",
      category: "Energy",
      description:
        "Automated inspection of solar panel installations using AI-powered image analysis to detect defects and optimize performance.",
      image: "/placeholder.svg?height=300&width=400&text=Solar+Panel+Inspection",
      likes: 28,
      views: 145,
      comments: 6,
      tags: ["Solar Energy", "AI", "Inspection", "Renewable Energy"],
      featured: false,
      date: "February 28, 2024",
    },
    {
      title: "Disaster Response Mapping",
      author: "EmergencyDrones_RW",
      category: "Emergency",
      description: "Rapid response mapping for flood assessment and emergency planning in rural communities.",
      image: "/placeholder.svg?height=300&width=400&text=Disaster+Response",
      likes: 56,
      views: 298,
      comments: 18,
      tags: ["Emergency Response", "Flood Mapping", "Disaster Management"],
      featured: false,
      date: "February 25, 2024",
    },
  ]

  const categories = ["All", "Agriculture", "Photography", "Construction", "Conservation", "Energy", "Emergency"]

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

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter((project) => project.featured)
              .map((project, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-blue-200"
                >
                  <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <CardDescription className="mt-1">by {project.author}</CardDescription>
                      </div>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
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
                      <span>{project.date}</span>
                    </div>

                    <Button className="w-full">View Project</Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {projects
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((project, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-24 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex-shrink-0">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">by {project.author}</p>
                          </div>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          <span className="text-sm text-muted-foreground">{project.date}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4">
            {projects
              .sort((a, b) => b.likes - a.likes)
              .map((project, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-24 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex-shrink-0">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">by {project.author}</p>
                          </div>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 text-red-600">
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
                          <span className="text-sm text-muted-foreground">{project.date}</span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(1).map((category, index) => {
              const categoryProjects = projects.filter((p) => p.category === category)
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="secondary">{categoryProjects.length}</Badge>
                    </CardTitle>
                    <CardDescription>{categoryProjects.length} projects in this category</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
