import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Video, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export default function ResourcesPage() {
  const regulations = [
    {
      title: "RCAA Drone Registration Guidelines",
      description: "Complete guide for registering your drone with Rwanda Civil Aviation Authority",
      type: "PDF",
      size: "2.4 MB",
      downloads: 1247,
      updated: "March 2024",
    },
    {
      title: "Commercial Drone Operations Manual",
      description: "Requirements and procedures for commercial drone operations in Rwanda",
      type: "PDF",
      size: "3.1 MB",
      downloads: 892,
      updated: "February 2024",
    },
    {
      title: "Airspace Restrictions Map",
      description: "Interactive map showing no-fly zones and restricted airspace",
      type: "PDF",
      size: "5.2 MB",
      downloads: 2156,
      updated: "March 2024",
    },
  ]

  const safetyGuides = [
    {
      title: "Pre-Flight Safety Checklist",
      description: "Essential safety checks before every drone flight",
      type: "PDF",
      size: "1.2 MB",
      downloads: 3421,
      updated: "January 2024",
    },
    {
      title: "Weather Conditions Guide",
      description: "Understanding weather conditions for safe drone operations",
      type: "PDF",
      size: "2.8 MB",
      downloads: 1876,
      updated: "February 2024",
    },
    {
      title: "Emergency Procedures Manual",
      description: "What to do when things go wrong during flight",
      type: "PDF",
      size: "1.9 MB",
      downloads: 1543,
      updated: "March 2024",
    },
  ]

  const templates = [
    {
      title: "Flight Log Template",
      description: "Standard template for recording flight activities",
      type: "Excel",
      size: "0.5 MB",
      downloads: 2847,
      updated: "January 2024",
    },
    {
      title: "Risk Assessment Form",
      description: "Template for assessing flight risks and mitigation strategies",
      type: "Word",
      size: "0.8 MB",
      downloads: 1923,
      updated: "February 2024",
    },
    {
      title: "Maintenance Log",
      description: "Track your drone maintenance and repairs",
      type: "Excel",
      size: "0.6 MB",
      downloads: 1456,
      updated: "March 2024",
    },
  ]

  const tutorials = [
    {
      title: "Getting Started with Drone Photography",
      description: "Learn the basics of aerial photography and composition",
      type: "Video",
      duration: "15 min",
      views: 5432,
      updated: "March 2024",
      thumbnail: "/placeholder.svg?height=120&width=200&text=Photography+Tutorial",
    },
    {
      title: "Agricultural Drone Applications",
      description: "How to use drones for crop monitoring and precision agriculture",
      type: "Video",
      duration: "22 min",
      views: 3876,
      updated: "February 2024",
      thumbnail: "/placeholder.svg?height=120&width=200&text=Agriculture+Tutorial",
    },
    {
      title: "Drone Mapping Fundamentals",
      description: "Introduction to photogrammetry and 3D mapping",
      type: "Video",
      duration: "28 min",
      views: 4521,
      updated: "January 2024",
      thumbnail: "/placeholder.svg?height=120&width=200&text=Mapping+Tutorial",
    },
  ]

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-5 w-5 text-red-600" />
      case "Video":
        return <Video className="h-5 w-5 text-blue-600" />
      case "Excel":
        return <FileText className="h-5 w-5 text-green-600" />
      case "Word":
        return <FileText className="h-5 w-5 text-blue-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources & Downloads</h1>
          <p className="text-muted-foreground">
            Essential documents, guides, and tutorials for drone operators in Rwanda
          </p>
        </div>
        <Button>Suggest Resource</Button>
      </div>

      <Tabs defaultValue="regulations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="space-y-4">
          <div className="grid gap-4">
            {regulations.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-50 rounded-lg">{getFileIcon(resource.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{resource.size}</span>
                        <span>•</span>
                        <span>{resource.downloads} downloads</span>
                        <span>•</span>
                        <span>Updated {resource.updated}</span>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <div className="grid gap-4">
            {safetyGuides.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-50 rounded-lg">{getFileIcon(resource.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{resource.size}</span>
                        <span>•</span>
                        <span>{resource.downloads} downloads</span>
                        <span>•</span>
                        <span>Updated {resource.updated}</span>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4">
            {templates.map((resource, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-50 rounded-lg">{getFileIcon(resource.type)}</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                        <Badge variant="outline">{resource.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{resource.size}</span>
                        <span>•</span>
                        <span>{resource.downloads} downloads</span>
                        <span>•</span>
                        <span>Updated {resource.updated}</span>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
                  <img
                    src={tutorial.thumbnail || "/placeholder.svg"}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {tutorial.duration}
                    </span>
                    <span>{tutorial.views} views</span>
                  </div>
                  <div className="text-xs text-muted-foreground">Updated {tutorial.updated}</div>
                  <Button className="w-full">Watch Tutorial</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Featured Resource */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">New: RCAA Drone Registration Made Easy</h3>
              <p className="text-muted-foreground mb-4">
                Step-by-step video guide to register your drone with Rwanda Civil Aviation Authority. Includes all
                required forms and documentation.
              </p>
              <Button>Watch Now</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
