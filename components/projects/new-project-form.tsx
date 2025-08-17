"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, Upload, Eye, Calendar, MapPin, Users, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { createProjectAction, updateProjectAction } from "@/lib/actions"
import { useNotification } from "@/components/ui/notification"

interface TeamMember {
  id: string
  name: string
  role: string
  organization: string
  email: string
  expertise: string
  bio: string
  projectLead: boolean
}

interface ProjectGalleryItem {
  id: string
  url: string
  caption: string
  type: "image" | "video"
}

interface ProjectResource {
  id: string
  title: string
  description: string
  type: "file" | "link" | "video"
  url: string
  size?: string
  fileType?: string
  embedCode?: string
  filePath?: string
}

export default function NewProjectForm({ project, isEdit = false }: { project?: any, isEdit?: boolean }) {
  const router = useRouter()
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
    technologies: [] as string[],
    objectives: [] as string[],
    challenges: [] as string[],
    outcomes: [] as string[],
    thumbnail: "",
  })

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [gallery, setGallery] = useState<ProjectGalleryItem[]>([])
  const [resources, setResources] = useState<ProjectResource[]>([])
  const [currentTech, setCurrentTech] = useState("")
  const [currentObjective, setCurrentObjective] = useState("")
  const [currentChallenge, setCurrentChallenge] = useState("")
  const [currentOutcome, setCurrentOutcome] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const { user, loading: authLoading } = useAuth()
  const { showNotification } = useNotification()
  const [categories, setCategories] = useState<Array<{ value: string, label: string, icon: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    organization: "",
    email: "",
    expertise: "",
    bio: "",
    projectLead: false,
  })

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video",
    url: "",
    file: null as File | null,
    filePath: "", // Track the actual file path for moving
  })

  const [newGalleryItem, setNewGalleryItem] = useState({
    caption: "",
    type: "image" as "image" | "video",
    url: "",
    file: null as File | null,
  })

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Load project data if in edit mode
  useEffect(() => {
    if (isEdit && project) {
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
        overview: project.fullDescription || "",
        methodology: project.methodology || "",
        results: project.results || "",
        technologies: project.technologies || [],
        objectives: project.objectives || [],
        challenges: project.challenges || [],
        outcomes: project.outcomes || [],
        thumbnail: project.thumbnail || "",
      })
      setTeamMembers(project.teamMembers || [])
      setGallery(project.gallery || [])
      setResources(project.resources || [])
    }
  }, [isEdit, project])

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/project-categories')
        if (response.ok) {
          const data = await response.json()
          const formattedCategories = data.categories.map((cat: any) => ({
            value: cat.id,
            label: cat.name,
            icon: cat.icon || "🚁"
          }))
          setCategories(formattedCategories)
        } else {
          console.error('Failed to fetch categories')
          // Fallback to database IDs if API fails
          setCategories([
            { value: "cme0ed4om000csd6otbk9r3ok", label: "Agriculture", icon: "🌾" },
            { value: "cme0ed4om000hsd6o6bk6z6gy", label: "Delivery & Logistics", icon: "📦" },
            { value: "cme0ed4om000fsd6o6uks87km", label: "Mapping & Surveying", icon: "🗺️" },
            { value: "cme0ed4om000dsd6otbk84p04", label: "Photography & Videography", icon: "📸" },
            { value: "cme0ed4om000gsd6oh0ggaq5b", label: "Research & Development", icon: "🔬" },
            { value: "cme0ed4om000esd6oi5l9hlvd", label: "Search & Rescue", icon: "🚨" },
          ])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to database IDs if API fails
        setCategories([
          { value: "cme0ed4om000csd6otbk9r3ok", label: "Agriculture", icon: "🌾" },
          { value: "cme0ed4om000hsd6o6bk6z6gy", label: "Delivery & Logistics", icon: "📦" },
          { value: "cme0ed4om000fsd6o6uks87km", label: "Mapping & Surveying", icon: "🗺️" },
          { value: "cme0ed4om000dsd6otbk84p04", label: "Photography & Videography", icon: "📸" },
          { value: "cme0ed4om000gsd6oh0ggaq5b", label: "Research & Development", icon: "🔬" },
          { value: "cme0ed4om000esd6oi5l9hlvd", label: "Search & Rescue", icon: "🚨" },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const statusOptions = [
    { value: "planning", label: "Planning", color: "bg-blue-100 text-blue-800" },
    { value: "in-progress", label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
    { value: "on-hold", label: "On Hold", color: "bg-gray-100 text-gray-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTechnology = () => {
    if (currentTech.trim() && !formData.technologies.includes(currentTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, currentTech.trim()],
      }))
      setCurrentTech("")
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const addObjective = () => {
    if (currentObjective.trim() && !formData.objectives.includes(currentObjective.trim())) {
      setFormData((prev) => ({
        ...prev,
        objectives: [...prev.objectives, currentObjective.trim()],
      }))
      setCurrentObjective("")
    }
  }

  const removeObjective = (objective: string) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((o) => o !== objective),
    }))
  }

  const addChallenge = () => {
    if (currentChallenge.trim() && !formData.challenges.includes(currentChallenge.trim())) {
      setFormData((prev) => ({
        ...prev,
        challenges: [...prev.challenges, currentChallenge.trim()],
      }))
      setCurrentChallenge("")
    }
  }

  const removeChallenge = (challenge: string) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.filter((c) => c !== challenge),
    }))
  }

  const addOutcome = () => {
    if (currentOutcome.trim() && !formData.outcomes.includes(currentOutcome.trim())) {
      setFormData((prev) => ({
        ...prev,
        outcomes: [...prev.outcomes, currentOutcome.trim()],
      }))
      setCurrentOutcome("")
    }
  }

  const removeOutcome = (outcome: string) => {
    setFormData((prev) => ({
      ...prev,
      outcomes: prev.outcomes.filter((o) => o !== outcome),
    }))
  }

  const addTeamMember = () => {
    if (newTeamMember.name.trim() && newTeamMember.role.trim()) {
      const member: TeamMember = {
        id: Date.now().toString(),
        ...newTeamMember,
      }
      setTeamMembers((prev) => [...prev, member])
      setNewTeamMember({
        name: "",
        role: "",
        organization: "",
        email: "",
        expertise: "",
        bio: "",
        projectLead: false,
      })
    }
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id))
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
      size: undefined, // Size will be available from the upload response if needed
      fileType: undefined, // File type will be available from the upload response if needed
      filePath: newResource.filePath, // Store the file path for moving
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      
      try {
        // Upload file to server with temp structure (will be moved after project creation)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'projects')
        formData.append('entityId', 'temp')
        formData.append('subfolder', 'resources')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setNewResource({ 
            ...newResource, 
            file: null, // Clear file input
            url: result.fileUrl, // Store the uploaded file URL
            filePath: result.fileUrl // Store the file path
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

  const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit for images)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must be less than 5MB")
        return
      }
      
      try {
        // Upload file to server with temp structure (will be moved after project creation)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'projects')
        formData.append('entityId', 'temp')
        formData.append('subfolder', 'images')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (response.ok) {
          const result = await response.json()
          setNewGalleryItem({ 
            ...newGalleryItem, 
            file: null, // Clear file input
            url: result.fileUrl // Store the uploaded file URL
          })
        } else {
          const error = await response.json()
          alert(`Upload failed: ${error.error}`)
        }
      } catch (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image')
      }
    }
  }

  const addGalleryItem = () => {
    if (newGalleryItem.caption && ((newGalleryItem.type === "image" && newGalleryItem.url) || (newGalleryItem.type === "video" && newGalleryItem.url))) {
      const galleryItem: ProjectGalleryItem = {
        id: crypto.randomUUID(),
        caption: newGalleryItem.caption,
        type: newGalleryItem.type,
        url: newGalleryItem.url,
      }
      setGallery((prev) => [...prev, galleryItem])
      // Clear the form after adding gallery item
      setNewGalleryItem({
        caption: "",
        type: "image",
        url: "",
        file: null,
      })
    }
  }

  const removeGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return
    }
    
    setIsSubmitting(true)

    try {
      const projectData = {
        ...formData,
        teamMembers,
        gallery,
        resources,
        thumbnail: formData.thumbnail,
      }

      const formDataToSend = new FormData()
      Object.entries(projectData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value as string)
        }
      })

      // Use server action
      let result
      if (isEdit && project) {
        result = await updateProjectAction(project.id, formDataToSend)
      } else {
        result = await createProjectAction(formDataToSend)
      }
      
      if (result.success && result.project) {
        // Files are already uploaded to the correct project directory structure
        
        showNotification('success', isEdit ? 'Project Updated!' : 'Project Created!', isEdit ? 'Project updated successfully! Redirecting to project page...' : 'Project published successfully! Redirecting to project page...')
        
        // Redirect to the project page after a short delay
        setTimeout(() => {
          router.push(`/projects/${result.project.id}`)
        }, 2000)
      } else {
        showNotification('error', isEdit ? 'Update Failed' : 'Creation Failed', result.error || `Failed to ${isEdit ? 'update' : 'publish'} project. Please try again.`)
      }
    } catch (error) {
      console.error("Error creating project:", error)
      showNotification('error', 'Creation Failed', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find((cat) => cat.value === formData.category)
  const selectedStatus = statusOptions.find((status) => status.value === formData.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Authentication Warning */}
      {!user && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to create a project. Please sign in first.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {isEdit ? 'Edit Project' : 'Share Your Project'}
          </CardTitle>
          <p className="text-muted-foreground">
            {isEdit ? 'Update your drone project information and share the latest developments with the community.' : 'Share your drone project with the Rwanda drone community. Help others learn from your experience and showcase your innovations.'}
          </p>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Project Details</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter your project title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} disabled={loadingCategories}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories ? (
                          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                            <span>⏳</span>
                            Loading categories...
                          </div>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                {category.label}
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of your project (2-3 sentences)"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Project Thumbnail</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            const formData = new FormData()
                            formData.append('file', file)
                            formData.append('type', 'projects')
                            formData.append('entityId', 'projects')
                            formData.append('subfolder', 'images')
                            
                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            })
                            
                            if (response.ok) {
                              const data = await response.json()
                              setFormData(prev => ({ ...prev, thumbnail: data.fileUrl }))
                            }
                          } catch (error) {
                            console.error('Error uploading thumbnail:', error)
                          }
                        }
                      }}
                    />
                    {formData.thumbnail && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border">
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a thumbnail image for your project (recommended: 800x400px)
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Project Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g., Kigali, Rwanda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="e.g., 6 months"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="funding">Funding Source</Label>
                  <Input
                    id="funding"
                    value={formData.funding}
                    onChange={(e) => handleInputChange("funding", e.target.value)}
                    placeholder="e.g., World Bank, Self-funded, Government Grant"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentTech}
                      onChange={(e) => setCurrentTech(e.target.value)}
                      placeholder="Add technology (e.g., DJI Matrice 300)"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
                    />
                    <Button type="button" onClick={addTechnology} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                        {tech}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="overview">Project Overview *</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => handleInputChange("overview", e.target.value)}
                    placeholder="Detailed description of your project, its goals, and significance..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Objectives</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentObjective}
                      onChange={(e) => setCurrentObjective(e.target.value)}
                      placeholder="Add project objective"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addObjective())}
                    />
                    <Button type="button" onClick={addObjective} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.objectives.map((objective, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{objective}</span>
                        <X
                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => removeObjective(objective)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methodology">Methodology</Label>
                  <Textarea
                    id="methodology"
                    value={formData.methodology}
                    onChange={(e) => handleInputChange("methodology", e.target.value)}
                    placeholder="Describe your approach, methods, and processes..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Challenges Faced</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentChallenge}
                      onChange={(e) => setCurrentChallenge(e.target.value)}
                      placeholder="Add challenge"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addChallenge())}
                    />
                    <Button type="button" onClick={addChallenge} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.challenges.map((challenge, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{challenge}</span>
                        <X
                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => removeChallenge(challenge)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="results">Results & Impact</Label>
                  <Textarea
                    id="results"
                    value={formData.results}
                    onChange={(e) => handleInputChange("results", e.target.value)}
                    placeholder="Describe the outcomes, impact, and results of your project..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Key Outcomes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentOutcome}
                      onChange={(e) => setCurrentOutcome(e.target.value)}
                      placeholder="Add key outcome"
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOutcome())}
                    />
                    <Button type="button" onClick={addOutcome} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {formData.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1">{outcome}</span>
                        <X
                          className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                          onClick={() => removeOutcome(outcome)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <p className="text-sm text-muted-foreground">Add team members who contributed to this project</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name *</Label>
                      <Input
                        id="memberName"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Team member name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberRole">Role *</Label>
                      <Input
                        id="memberRole"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Project Lead, Drone Operator"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberOrg">Organization</Label>
                      <Input
                        id="memberOrg"
                        value={newTeamMember.organization}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, organization: e.target.value }))}
                        placeholder="Organization or company"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberExpertise">Expertise</Label>
                      <Input
                        id="memberExpertise"
                        value={newTeamMember.expertise}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, expertise: e.target.value }))}
                        placeholder="e.g., Agricultural Engineering, Data Analysis"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberBio">Bio</Label>
                      <Textarea
                        id="memberBio"
                        value={newTeamMember.bio}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Brief bio or description"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id="projectLead"
                        checked={newTeamMember.projectLead}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, projectLead: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="projectLead" className="text-sm font-medium">
                        This person is the Project Lead
                      </Label>
                    </div>
                    <Button type="button" onClick={addTeamMember} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </div>

                {teamMembers.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Team Members ({teamMembers.length})</h4>
                    <div className="grid gap-4">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-start gap-4 p-4 border rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder-user.jpg" alt={member.name} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold">{member.name}</h5>
                              {member.projectLead && (
                                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                                  Project Lead
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-blue-600">{member.role}</p>
                            {member.organization && (
                              <p className="text-sm text-muted-foreground">{member.organization}</p>
                            )}
                            {member.expertise && <p className="text-sm font-medium mt-1">{member.expertise}</p>}
                            {member.bio && <p className="text-sm mt-1">{member.bio}</p>}
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => removeTeamMember(member.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Gallery</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add images and videos to showcase your project
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Gallery Item */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Add New Gallery Item</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gallery-caption">Caption</Label>
                      <Input
                        id="gallery-caption"
                        value={newGalleryItem.caption}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, caption: e.target.value })}
                        placeholder="Describe this image/video"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gallery-type">Type</Label>
                      <Select value={newGalleryItem.type} onValueChange={(value: "image" | "video") => setNewGalleryItem({ ...newGalleryItem, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newGalleryItem.type === "image" && (
                    <div className="space-y-2">
                      <Label htmlFor="gallery-image">Upload Image</Label>
                      <Input
                        id="gallery-image"
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryImageChange}
                      />
                      <p className="text-xs text-muted-foreground">Maximum file size: 5MB</p>
                    </div>
                  )}

                  {newGalleryItem.type === "video" && (
                    <div className="space-y-2">
                      <Label htmlFor="gallery-video-url">Video URL</Label>
                      <Input
                        id="gallery-video-url"
                        type="url"
                        value={newGalleryItem.url}
                        onChange={(e) => setNewGalleryItem({ ...newGalleryItem, url: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  <Button type="button" onClick={addGalleryItem} disabled={!newGalleryItem.caption || !newGalleryItem.url}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Gallery
                  </Button>
                </div>

                {/* Existing Gallery Items */}
                {gallery.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Gallery ({gallery.length})</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {gallery.map((item) => (
                        <div key={item.id} className="border rounded-lg overflow-hidden">
                          {item.type === "image" && item.url && (
                            <img src={item.url} alt={item.caption} className="w-full h-32 object-cover" />
                          )}
                          {item.type === "video" && item.url && (
                            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-white text-lg">▶</span>
                                </div>
                                <p className="text-xs text-gray-600">Video</p>
                              </div>
                            </div>
                          )}
                          <div className="p-3">
                            <p className="text-sm font-medium">{item.caption}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeGalleryItem(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Project Resources
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add files, links, or embedded content to your project. Files must be less than 10MB.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Resource */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Add New Resource</h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resource-title">Resource Title *</Label>
                      <Input
                        id="resource-title"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="e.g., Final Report, Dataset, Video Demo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resource-type">Resource Type *</Label>
                      <Select value={newResource.type} onValueChange={(value: "file" | "link" | "video") => setNewResource({ ...newResource, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="file">File Upload (PDF, ZIP, etc.)</SelectItem>
                          <SelectItem value="link">External Link</SelectItem>
                          <SelectItem value="video">Video (YouTube, Vimeo, etc.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resource-description">Description *</Label>
                    <Textarea
                      id="resource-description"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Brief description of this resource"
                      rows={2}
                    />
                  </div>

                  {newResource.type === "file" && (
                    <div className="space-y-2">
                      <Label htmlFor="resource-file">Upload File *</Label>
                      <Input
                        id="resource-file"
                        type="file"
                        accept=".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
                    </div>
                  )}

                  {(newResource.type === "link" || newResource.type === "video") && (
                    <div className="space-y-2">
                      <Label htmlFor="resource-url">URL *</Label>
                      <Input
                        id="resource-url"
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder={newResource.type === "video" ? "https://www.youtube.com/watch?v=..." : "https://example.com/resource"}
                      />
                    </div>
                  )}

                  <Button type="button" onClick={addResource} disabled={!newResource.title || !newResource.description || !newResource.url}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                </div>

                {/* Existing Resources */}
                {resources.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Project Resources ({resources.length})</h4>
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-medium">{resource.title}</h5>
                              <Badge variant="outline" className="text-xs">
                                {resource.type}
                              </Badge>
                              {resource.size && (
                                <Badge variant="secondary" className="text-xs">
                                  {resource.size}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{resource.description}</p>
                            {resource.url && (
                              <p className="text-xs text-blue-600 mt-1">{resource.url}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeResource(resource.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Project Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {selectedCategory && <span>{selectedCategory.icon}</span>}
                    <Badge variant="outline">{selectedCategory?.label}</Badge>
                    {selectedStatus && (
                      <Badge variant="secondary" className={selectedStatus.color}>
                        {selectedStatus.label}
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold">{formData.title || "Project Title"}</h1>
                  
                  {formData.thumbnail && (
                    <div className="aspect-[2/1] rounded-lg overflow-hidden border">
                      <img 
                        src={formData.thumbnail} 
                        alt="Project thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <p className="text-lg text-muted-foreground">
                    {formData.description || "Project description will appear here..."}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    {(formData.startDate || formData.endDate) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>
                          {formData.startDate} {formData.endDate && `- ${formData.endDate}`}
                        </span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    {teamMembers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>
                          {teamMembers.length} team member{teamMembers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {formData.technologies.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Technologies Used</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.overview && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Overview</h4>
                      <p className="whitespace-pre-wrap">{formData.overview}</p>
                    </div>
                  )}

                  {formData.objectives.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Objectives</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {formData.objectives.map((objective, index) => (
                          <li key={index}>{objective}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {teamMembers.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Team</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {teamMembers.map((member) => (
                          <div key={member.id} className="flex items-start gap-3 p-3 border rounded">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder-user.jpg" alt={member.name} />
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h5 className="font-semibold text-sm">{member.name}</h5>
                              <p className="text-xs text-blue-600">{member.role}</p>
                              {member.organization && (
                                <p className="text-xs text-muted-foreground">{member.organization}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-6">
          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "details", "team", "gallery", "preview"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1])
                  }
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== "preview" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "details", "team", "gallery", "preview"]
                  const currentIndex = tabs.indexOf(activeTab)
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1])
                  }
                }}
              >
                Next
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting || !formData.title || !formData.description || !formData.category || !formData.status
            }
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Publishing...
              </>
            ) : (
              "Publish Project"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
