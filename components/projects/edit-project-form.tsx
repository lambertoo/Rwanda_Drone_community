"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, X, Loader2, CheckCircle } from "lucide-react"

interface ProjectResource {
  id: string
  title: string
  description: string
  type: "file" | "link" | "video"
  url: string
}

export default function EditProjectForm() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    status: "",
    location: "",
    duration: "",
    startDate: "",
    endDate: "",
    funding: "",
    overview: "",
    methodology: "",
    results: "",
    thumbnail: "",
  })

  const [resources, setResources] = useState<ProjectResource[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [loadingProject, setLoadingProject] = useState(true)

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video",
    url: "",
    file: null as File | null,
  })

  // Load project data on component mount
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId)
    }
  }, [projectId])

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      if (response.ok) {
        const project = await response.json()
        
        // Pre-fill form data
        setFormData({
          title: project.title || "",
          description: project.description || "",
          category: project.categoryId || "",
          status: project.status || "",
          location: project.location || "",
          duration: project.duration || "",
          startDate: project.startDate || "",
          endDate: project.endDate || "",
          funding: project.funding || "",
          overview: project.fullDescription || project.description || "",
          methodology: project.methodology || "",
          results: project.results || "",
          thumbnail: project.thumbnail || "",
        })

        // Parse and set resources
        if (project.resources) {
          try {
            const resourcesData = typeof project.resources === 'string' ? JSON.parse(project.resources) : project.resources
            setResources(Array.isArray(resourcesData) ? resourcesData : [])
          } catch (error) {
            console.error("Error parsing resources:", error)
            setResources([])
          }
        }

        setLoadingProject(false)
      } else {
        throw new Error("Failed to fetch project")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setNotification({ type: 'error', message: 'Failed to load project data' })
      setLoadingProject(false)
    }
  }

  // File upload handler for resources (same as gallery images)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'resource')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setNewResource({ 
            ...newResource, 
            file: null,
            url: result.fileUrl
          })
        } else {
          const error = await response.json()
          alert(`Upload failed: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload file')
      }
    }
  }

  const addResource = () => {
    if (!newResource.title || !newResource.description || !newResource.url) {
      return
    }

    const resource: ProjectResource = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      type: newResource.type,
      url: newResource.url,
    }

    setResources([...resources, resource])
    setNewResource({
      title: "",
      description: "",
      type: "file",
      url: "",
      file: null,
    })
  }

  const removeResource = (id: string) => {
    setResources(resources.filter(resource => resource.id !== id))
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setNotification(null)

    try {
      const projectData = {
        ...formData,
        resources,
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        setNotification({ 
          type: 'success', 
          message: 'Project updated successfully! Redirecting to project page...' 
        })
        
        setTimeout(() => {
          router.push(`/projects/${projectId}`)
        }, 2000)
      } else {
        setNotification({ 
          type: 'error', 
          message: result.error || 'Failed to update project. Please try again.' 
        })
      }
    } catch (error) {
      console.error("Error updating project:", error)
      setNotification({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to update project. Please try again.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update your project information</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-400" />}
              {notification.type === 'error' && <div className="h-5 w-5 text-red-400">✕</div>}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter project title"
                    required
                  />
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Input
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      placeholder="Project status"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overview">Project Overview *</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Provide a comprehensive overview of your project"
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Resources</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add documents, presentations, and other files related to your project
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Resource */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Add New Resource</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-title">Resource Title *</Label>
                      <Input
                        id="resource-title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Enter resource title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="resource-type">Resource Type</Label>
                      <Select value={newResource.type} onValueChange={(value: "file" | "link" | "video") => setNewResource({ ...newResource, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="file">File</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-description">Description</Label>
                    <Textarea
                      id="resource-description"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Describe this resource"
                      rows={2}
                    />
                  </div>

                    <div className="space-y-2">
                    <Label htmlFor="resource-file">Upload File</Label>
                      <Input
                        id="resource-file"
                        type="file"
                        onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.xls,.xlsx,.txt,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif"
                      />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOC, PPT, ZIP, XLS, TXT, Media files (max 10MB)
                    </p>
                    </div>

                  <Button type="button" onClick={addResource} disabled={!newResource.title || !newResource.url}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Resource
                  </Button>
                </div>

                {/* Existing Resources */}
                {resources.length > 0 && (
                    <div className="space-y-3">
                    <h4 className="font-medium">Current Resources</h4>
                    {resources.map((resource, index) => (
                      <div key={resource.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{resource.title}</h5>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{resource.description}</p>
                            <p className="text-xs text-gray-500">{resource.type} • {resource.url}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResource(resource.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Project'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 