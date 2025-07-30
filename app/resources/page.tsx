import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, ExternalLink, BookOpen, Shield, GraduationCap } from "lucide-react"

export default function ResourcesPage() {
  const regulations = [
    {
      title: "RCAA Drone Registration Guidelines 2024",
      description: "Complete guide for registering your drone with Rwanda Civil Aviation Authority",
      type: "PDF",
      size: "2.3 MB",
      downloads: 1247,
      updated: "March 2024",
    },
    {
      title: "Commercial Drone Operation License",
      description: "Requirements and application process for commercial drone operations",
      type: "PDF",
      size: "1.8 MB",
      downloads: 892,
      updated: "February 2024",
    },
    {
      title: "No-Fly Zones Map Rwanda",
      description: "Interactive map showing restricted airspace and no-fly zones",
      type: "Interactive Map",
      size: "N/A",
      downloads: 2156,
      updated: "March 2024",
    },
    {
      title: "Drone Import Regulations",
      description: "Customs and import requirements for bringing drones into Rwanda",
      type: "PDF",
      size: "1.2 MB",
      downloads: 634,
      updated: "January 2024",
    },
  ]

  const safetyGuides = [
    {
      title: "Pre-Flight Safety Checklist",
      description: "Essential safety checks before every drone flight",
      type: "Checklist",
      size: "0.5 MB",
      downloads: 3421,
      updated: "March 2024",
    },
    {
      title: "Weather Conditions for Safe Flying",
      description: "Understanding weather patterns and safe flying conditions in Rwanda",
      type: "Guide",
      size: "1.1 MB",
      downloads: 1876,
      updated: "February 2024",
    },
    {
      title: "Emergency Procedures Manual",
      description: "What to do when things go wrong during flight",
      type: "Manual",
      size: "2.1 MB",
      downloads: 1543,
      updated: "March 2024",
    },
    {
      title: "Battery Safety and Maintenance",
      description: "Proper care and handling of drone batteries",
      type: "Guide",
      size: "0.8 MB",
      downloads: 2187,
      updated: "February 2024",
    },
  ]

  const tutorials = [
    {
      title: "Getting Started with Drone Photography",
      description: "Complete beginner's guide to aerial photography",
      type: "Video Series",
      duration: "2.5 hours",
      level: "Beginner",
      views: 5432,
    },
    {
      title: "Agricultural Drone Mapping Techniques",
      description: "Advanced techniques for crop monitoring and analysis",
      type: "Video Tutorial",
      duration: "45 minutes",
      level: "Intermediate",
      views: 2876,
    },
    {
      title: "Drone Maintenance and Repair",
      description: "DIY maintenance and common repair procedures",
      type: "Video Series",
      duration: "3 hours",
      level: "Intermediate",
      views: 3421,
    },
    {
      title: "Flight Planning with Mission Software",
      description: "Using software tools for automated flight planning",
      type: "Tutorial",
      duration: "1 hour",
      level: "Advanced",
      views: 1987,
    },
  ]

  const templates = [
    {
      title: "Flight Log Template",
      description: "Standard flight log for recording drone operations",
      type: "Excel",
      size: "0.2 MB",
      downloads: 4521,
    },
    {
      title: "Risk Assessment Form",
      description: "Pre-flight risk assessment template",
      type: "PDF Form",
      size: "0.3 MB",
      downloads: 2876,
    },
    {
      title: "Maintenance Schedule",
      description: "Drone maintenance tracking spreadsheet",
      type: "Excel",
      size: "0.4 MB",
      downloads: 1987,
    },
    {
      title: "Client Project Proposal",
      description: "Professional proposal template for drone services",
      type: "Word",
      size: "0.6 MB",
      downloads: 1543,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resources & Downloads</h1>
        <p className="text-muted-foreground">Essential resources, guides, and tools for the Rwanda drone community</p>
      </div>

      <Tabs defaultValue="regulations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Safety Guides
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="regulations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Regulations & Legal Documents</h2>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ExternalLink className="h-4 w-4" />
              Visit RCAA Website
            </Button>
          </div>

          <div className="grid gap-4">
            {regulations.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{item.type}</Badge>
                        <span>{item.size}</span>
                        <span>{item.downloads} downloads</span>
                        <span>Updated {item.updated}</span>
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
          <h2 className="text-xl font-semibold">Safety Guides & Procedures</h2>

          <div className="grid gap-4">
            {safetyGuides.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Badge variant="outline">{item.type}</Badge>
                        <span>{item.size}</span>
                        <span>{item.downloads} downloads</span>
                        <span>Updated {item.updated}</span>
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
          <h2 className="text-xl font-semibold">Video Tutorials & Courses</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {tutorials.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <GraduationCap className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                      <p className="text-sm text-muted-foreground">Video Tutorial</p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{item.level}</Badge>
                    <span>{item.duration}</span>
                    <span>{item.views} views</span>
                  </div>
                  <Button className="w-full">Watch Tutorial</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <h2 className="text-xl font-semibold">Templates & Forms</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {templates.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <Badge variant="outline">{item.type}</Badge>
                        <span>{item.size}</span>
                        <span>{item.downloads} downloads</span>
                      </div>
                      <Button size="sm" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
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
