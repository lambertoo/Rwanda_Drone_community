import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Eye, MessageSquare, ArrowLeft, Calendar, MapPin, User, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const projectId = params.id

  // Mock project data - in real app, this would come from a database
  const projectDetails = {
    "1": {
      title: "Agricultural Monitoring in Musanze",
      author: "AgriDrone_RW",
      category: "Agriculture",
      description:
        "Comprehensive crop monitoring project using multispectral imaging to assess crop health and optimize irrigation in potato farms across Musanze district.",
      fullDescription:
        "This project demonstrates the use of advanced multispectral imaging technology for precision agriculture in Rwanda's mountainous terrain. Over a period of 6 months, we monitored 15 potato farms across Musanze district, collecting data on crop health, soil moisture, and irrigation efficiency. The project resulted in a 25% increase in crop yield and 30% reduction in water usage.",
      image: "/placeholder.svg?height=400&width=800&text=Agricultural+Monitoring",
      likes: 45,
      views: 234,
      comments: 12,
      tags: ["Agriculture", "Multispectral", "Crop Health", "Irrigation"],
      featured: true,
      date: "March 10, 2024",
      location: "Musanze District, Rwanda",
      duration: "6 months",
      equipment: [
        "DJI Matrice 300 RTK",
        "MicaSense RedEdge-MX Multispectral Camera",
        "RTK Ground Station",
        "Soil Moisture Sensors",
      ],
      objectives: [
        "Monitor crop health using NDVI analysis",
        "Optimize irrigation schedules",
        "Identify pest and disease outbreaks early",
        "Increase overall crop yield",
      ],
      methodology:
        "We conducted weekly flights over each farm using a systematic grid pattern. Multispectral images were processed using specialized software to generate NDVI maps, which were then analyzed to identify areas of stress or disease. Ground truth data was collected using soil moisture sensors and manual crop assessments.",
      results: [
        "25% increase in average crop yield",
        "30% reduction in water usage",
        "Early detection of blight in 3 farms",
        "Improved irrigation efficiency across all monitored farms",
      ],
      challenges: [
        "Weather conditions affecting flight schedules",
        "Calibrating sensors for high-altitude conditions",
        "Training local farmers on data interpretation",
        "Ensuring data accuracy across different soil types",
      ],
      gallery: [
        "/placeholder.svg?height=300&width=400&text=NDVI+Map",
        "/placeholder.svg?height=300&width=400&text=Crop+Health+Analysis",
        "/placeholder.svg?height=300&width=400&text=Irrigation+Mapping",
        "/placeholder.svg?height=300&width=400&text=Yield+Comparison",
      ],
      downloads: [
        { name: "Project Report (PDF)", size: "2.5 MB", type: "pdf" },
        { name: "NDVI Analysis Data", size: "15.2 MB", type: "csv" },
        { name: "Flight Logs", size: "890 KB", type: "log" },
      ],
      team: [
        { name: "Jean Claude Uwimana", role: "Project Lead", expertise: "Agricultural Engineering" },
        { name: "Marie Mukamana", role: "Data Analyst", expertise: "Remote Sensing" },
        { name: "David Nkurunziza", role: "Drone Pilot", expertise: "UAV Operations" },
      ],
    },
    "2": {
      title: "Kigali City Aerial Photography Series",
      author: "SkyView_Photo",
      category: "Photography",
      description:
        "Stunning aerial photography showcasing Kigali's urban development and architectural beauty from unique perspectives.",
      fullDescription:
        "A comprehensive aerial photography project documenting Kigali's rapid urban transformation. This series captures the city's modern architecture, green spaces, and cultural landmarks from breathtaking aerial perspectives, showcasing Rwanda's capital as a model of sustainable urban development in Africa.",
      image: "/placeholder.svg?height=400&width=800&text=Kigali+Aerial+Photography",
      likes: 67,
      views: 456,
      comments: 23,
      tags: ["Photography", "Urban", "Architecture", "Kigali"],
      featured: true,
      date: "March 8, 2024",
      location: "Kigali, Rwanda",
      duration: "3 months",
      equipment: ["DJI Air 2S", "DJI Mini 3 Pro", "Polarizing Filters", "Extra Batteries and Memory Cards"],
      objectives: [
        "Document Kigali's urban development",
        "Showcase architectural diversity",
        "Highlight green spaces and sustainability",
        "Create a visual narrative of the city",
      ],
      methodology:
        "Systematic aerial photography sessions conducted during golden hour and blue hour for optimal lighting. Multiple flight patterns were used including orbital shots, reveal shots, and straight-line passes to capture different perspectives of each location.",
      results: [
        "50+ high-resolution aerial photographs",
        "Featured in Rwanda Tourism Board campaign",
        "Exhibition at Kigali Cultural Center",
        "Social media engagement of 10K+ interactions",
      ],
      challenges: [
        "Obtaining flight permissions for city center",
        "Weather conditions and seasonal lighting",
        "Avoiding restricted airspace",
        "Coordinating with air traffic control",
      ],
      gallery: [
        "/placeholder.svg?height=300&width=400&text=Kigali+Skyline",
        "/placeholder.svg?height=300&width=400&text=Convention+Center",
        "/placeholder.svg?height=300&width=400&text=Green+Spaces",
        "/placeholder.svg?height=300&width=400&text=Urban+Architecture",
      ],
      downloads: [
        { name: "High-Res Photo Collection", size: "125 MB", type: "zip" },
        { name: "Project Documentation", size: "3.2 MB", type: "pdf" },
        { name: "Behind the Scenes Video", size: "45 MB", type: "mp4" },
      ],
      team: [
        { name: "Patrick Habimana", role: "Lead Photographer", expertise: "Aerial Photography" },
        { name: "Grace Uwimana", role: "Photo Editor", expertise: "Post-Processing" },
        { name: "Samuel Mugisha", role: "Drone Operator", expertise: "Technical Operations" },
      ],
    },
  }

  const project = projectDetails[projectId as keyof typeof projectDetails]

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
        </div>
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
          <img src={project.image || "/placeholder.svg"} alt={project.title} className="w-full h-full object-cover" />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{project.category}</Badge>
                {project.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
              </div>
              <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
              <CardDescription className="text-lg">by {project.author}</CardDescription>
            </div>
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
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="methodology">Method</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{project.fullDescription}</p>

                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div className="text-sm text-muted-foreground">{project.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-sm text-muted-foreground">{project.location}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Objectives</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {project.equipment.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="methodology" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{project.methodology}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Challenges Faced</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {project.results.map((result, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.gallery.map((image, index) => (
                      <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {project.team.map((member, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{member.name}</h4>
                          <p className="text-sm text-blue-600">{member.role}</p>
                          <p className="text-sm text-muted-foreground">{member.expertise}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Published: {project.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>Author: {project.author}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{project.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Downloads */}
          <Card>
            <CardHeader>
              <CardTitle>Downloads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.downloads.map((download, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{download.name}</div>
                    <div className="text-xs text-muted-foreground">{download.size}</div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-transparent" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Like Project
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Share Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
