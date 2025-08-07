"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, Upload, Eye, Calendar, MapPin, Users, Edit } from "lucide-react"
import { updateProjectAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface TeamMember {
  id: string
  name: string
  role: string
  organization: string
  email: string
  expertise: string
  bio: string
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
}

interface Project {
  id: string
  title: string
  description: string
  fullDescription?: string
  category?: {
    id: string
    name: string
  }
  categoryId?: string
  status: string
  location?: string
  duration?: string
  startDate?: string
  endDate?: string
  funding?: string
  technologies: string[]
  objectives: string[]
  challenges: string[]
  outcomes: string[]
  teamMembers: TeamMember[]
  gallery: ProjectGalleryItem[]
  resources?: any[]
  author: {
    id: string
    fullName: string
  }
}

interface EditProjectFormProps {
  project: Project
}

export default function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    category: project.category?.id || project.categoryId || "",
    status: project.status,
    location: project.location || "",
    duration: project.duration || "",
    startDate: project.startDate || "",
    endDate: project.endDate || "",
    funding: project.funding || "",
    overview: project.fullDescription || "",
  })

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(project.teamMembers)
  const [gallery, setGallery] = useState<ProjectGalleryItem[]>(project.gallery)
  const [resources, setResources] = useState<any[]>(project.resources || [])
  const [currentTech, setCurrentTech] = useState("")
  const [currentObjective, setCurrentObjective] = useState("")
  const [currentChallenge, setCurrentChallenge] = useState("")
  const [currentOutcome, setCurrentOutcome] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [categories, setCategories] = useState<Array<{ value: string, label: string, icon: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    role: "",
    organization: "",
    email: "",
    expertise: "",
    bio: "",
  })

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video",
    url: "",
    file: null as File | null,
  })

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
    if (currentTech.trim() && !project.technologies.includes(currentTech.trim())) {
      project.technologies.push(currentTech.trim())
      setCurrentTech("")
    }
  }

  const removeTechnology = (tech: string) => {
    project.technologies = project.technologies.filter((t) => t !== tech)
  }

  const addObjective = () => {
    if (currentObjective.trim() && !project.objectives.includes(currentObjective.trim())) {
      project.objectives.push(currentObjective.trim())
      setCurrentObjective("")
    }
  }

  const removeObjective = (objective: string) => {
    project.objectives = project.objectives.filter((o) => o !== objective)
  }

  const addChallenge = () => {
    if (currentChallenge.trim() && !project.challenges.includes(currentChallenge.trim())) {
      project.challenges.push(currentChallenge.trim())
      setCurrentChallenge("")
    }
  }

  const removeChallenge = (challenge: string) => {
    project.challenges = project.challenges.filter((c) => c !== challenge)
  }

  const addOutcome = () => {
    if (currentOutcome.trim() && !project.outcomes.includes(currentOutcome.trim())) {
      project.outcomes.push(currentOutcome.trim())
      setCurrentOutcome("")
    }
  }

  const removeOutcome = (outcome: string) => {
    project.outcomes = project.outcomes.filter((o) => o !== outcome)
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
      })
    }
  }

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id))
  }

  const addResource = () => {
    if (!newResource.title || !newResource.description || (!newResource.url && !newResource.file)) {
      return
    }

    const resource = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      type: newResource.type,
      url: newResource.url || "",
      size: newResource.file ? `${(newResource.file.size / 1024 / 1024).toFixed(2)} MB` : undefined,
      fileType: newResource.file ? newResource.file.type : undefined,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB")
        return
      }
      setNewResource({ ...newResource, file })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Get user from localStorage
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      alert("Please log in to edit a project")
      setIsSubmitting(false)
      return
    }

    const user = JSON.parse(userStr)
    if (!user.id) {
      alert("Invalid user session")
      setIsSubmitting(false)
      return
    }

    try {
      const projectData = {
        ...formData,
        teamMembers,
        gallery,
        resources,
      }

      const formDataToSend = new FormData()
      Object.entries(projectData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value))
        } else {
          formDataToSend.append(key, value as string)
        }
      })
      formDataToSend.append("userId", user.id)

      await updateProjectAction(project.id, formDataToSend)
    } catch (error) {
      console.error("Error updating project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find((cat) => cat.value === formData.category)
  const selectedStatus = statusOptions.find((status) => status.value === formData.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Project
          </CardTitle>
          <p className="text-muted-foreground">
            Update your drone project information and details.
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
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories ? (
                          <div className="p-2 text-sm text-muted-foreground">Loading categories...</div>
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
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of your project"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
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
                      placeholder="Project location"
                    />
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
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      placeholder="e.g., 6 months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funding">Funding Source</Label>
                    <Input
                      id="funding"
                      value={formData.funding}
                      onChange={(e) => handleInputChange("funding", e.target.value)}
                      placeholder="e.g., Self-funded, Grant, etc."
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
                  <Label htmlFor="overview">Full Description</Label>
                  <Textarea
                    id="overview"
                    value={formData.overview}
                    onChange={(e) => handleInputChange("overview", e.target.value)}
                    placeholder="Detailed project overview"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.role} • {member.organization}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTeamMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Add Team Member</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name *</Label>
                      <Input
                        id="memberName"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberRole">Role *</Label>
                      <Input
                        id="memberRole"
                        value={newTeamMember.role}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, role: e.target.value }))}
                        placeholder="e.g., Project Lead, Developer"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberOrg">Organization</Label>
                      <Input
                        id="memberOrg"
                        value={newTeamMember.organization}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, organization: e.target.value }))}
                        placeholder="Organization"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberEmail">Email</Label>
                      <Input
                        id="memberEmail"
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberExpertise">Expertise</Label>
                      <Input
                        id="memberExpertise"
                        value={newTeamMember.expertise}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, expertise: e.target.value }))}
                        placeholder="Areas of expertise"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberBio">Bio</Label>
                      <Textarea
                        id="memberBio"
                        value={newTeamMember.bio}
                        onChange={(e) => setNewTeamMember((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Brief bio"
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addTeamMember}
                    className="mt-4"
                    disabled={!newTeamMember.name.trim() || !newTeamMember.role.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Gallery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gallery upload functionality will be available here</p>
                </div>
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
                  <Button type="button" onClick={addResource} disabled={!newResource.title || !newResource.description || (!newResource.url && !newResource.file)}>
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
                <CardTitle>Project Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-2">{formData.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{selectedCategory?.label}</Badge>
                    <Badge className={selectedStatus?.color}>{selectedStatus?.label}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{formData.description}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Location:</span> {formData.location || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {formData.duration || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Funding:</span> {formData.funding || "Not specified"}
                    </div>
                    <div>
                      <span className="font-medium">Team Members:</span> {teamMembers.length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Project"}
          </Button>
        </div>
      </form>
    </div>
  )
} 