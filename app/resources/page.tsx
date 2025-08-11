"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download, FileText, Video, Shield, AlertTriangle, CheckCircle, Plus, Upload, FileUp } from "lucide-react"
import { NewResourceForm } from "@/components/resources/new-resource-form"
import { useToast } from "@/hooks/use-toast"

interface Resource {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  fileSize?: string
  fileUpload?: string
  category: string
  isRegulation: boolean
  downloads: number
  views: number
  uploadedAt: string
  uploadedBy: {
    id: string
    username: string
    fullName: string
    avatar: string
    role: string
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/resources")
      if (response.ok) {
        const data = await response.json()
        setResources(data.resources)
      } else {
        console.error("Failed to fetch resources")
      }
    } catch (error) {
      console.error("Error fetching resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (resourceId: string, resource: Resource) => {
    try {
      // Track download
      await fetch(`/api/resources/${resourceId}/download`, {
        method: "POST"
      })

      // Open file in new tab or download
      if (resource.fileUrl.startsWith('http')) {
        window.open(resource.fileUrl, '_blank')
      } else {
        // For uploaded files, trigger download
        const link = document.createElement('a')
        link.href = resource.fileUrl
        link.download = resource.fileUpload || resource.title
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, downloads: r.downloads + 1 }
          : r
      ))

      toast({
        title: "Download started",
        description: "Your download should begin shortly",
      })
    } catch (error) {
      console.error("Error downloading resource:", error)
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleResourceAdded = () => {
    setIsAddDialogOpen(false)
    fetchResources()
    toast({
      title: "Resource added successfully!",
      description: "Your resource is now available to the community",
    })
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "REGULATIONS":
        return <Shield className="h-4 w-4" />
      case "SAFETY":
        return <AlertTriangle className="h-4 w-4" />
      case "TEMPLATES":
        return <FileText className="h-4 w-4" />
      case "TUTORIALS":
        return <Video className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case "Video":
        return <Video className="h-4 w-4" />
      case "Audio":
        return <FileText className="h-4 w-4" />
      case "Image":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryResources = (category: string) => {
    if (category === "all") return resources
    return resources.filter(r => r.category === category.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources & Downloads</h1>
          <p className="text-muted-foreground">
            Essential documents, guides, and tutorials for drone operators in Rwanda
          </p>
        </div>
        
        {currentUser && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Share Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Share New Resource
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Share valuable resources with the drone community
                </p>
              </DialogHeader>
              <NewResourceForm 
                onSuccess={handleResourceAdded}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All
          </TabsTrigger>
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

        {["all", "regulations", "safety", "templates", "tutorials"].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getCategoryResources(category).map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {resource.description}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={resource.isRegulation ? "destructive" : "secondary"}
                        className="ml-2 flex-shrink-0"
                      >
                        {resource.isRegulation ? "Regulation" : resource.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {getFileTypeIcon(resource.fileType)}
                        {resource.fileType}
                      </span>
                      {resource.fileSize && (
                        <span>{resource.fileSize}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {resource.downloads} downloads
                      </span>
                      <span>{resource.views} views</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>By {resource.uploadedBy.fullName}</span>
                      <span>•</span>
                      <span>{new Date(resource.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handleDownload(resource.id, resource)}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {getCategoryResources(category).length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-500">
                  {category === "all" 
                    ? "No resources have been shared yet." 
                    : `No ${category} resources available.`
                  }
                </p>
                {currentUser && (
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Share First Resource
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
