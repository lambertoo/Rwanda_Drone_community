"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Users, Plus, X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface Speaker {
  id: string
  name: string
  title: string
  bio: string
  company: string
  avatar: string
}

interface AgendaItem {
  id: string
  title: string
  description: string
  startTime: string
  endTime: string
  speaker: string
  type: "presentation" | "workshop" | "panel" | "break" | "networking"
}

interface EventCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
}

export default function NewEventForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Basic Information
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [location, setLocation] = useState("")
  const [venue, setVenue] = useState("")
  const [capacity, setCapacity] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RWF")
  const [registrationDeadline, setRegistrationDeadline] = useState("")

  // Event Details
  const [fullDescription, setFullDescription] = useState("")
  const [requirements, setRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isFree, setIsFree] = useState(true)
  const [isPublic, setIsPublic] = useState(true)
  const [allowRegistration, setAllowRegistration] = useState(true)

  // Speakers
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    title: "",
    bio: "",
    company: "",
    avatar: "",
  })

  // Agenda
  const [agenda, setAgenda] = useState<AgendaItem[]>([])
  const [newAgendaItem, setNewAgendaItem] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    speaker: "",
    type: "presentation" as const,
  })

  // Flyer upload
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null)

  // Gallery
  const [gallery, setGallery] = useState<string[]>([])

  // Registration Fields
  const [registrationFields, setRegistrationFields] = useState<Array<{
    id: string
    label: string
    type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date' | 'file' | 'url'
    required: boolean
    options?: string[]
    placeholder?: string
    fileTypes?: string
    conditionalLogic?: {
      showWhen: string | null
      operator: string | null
      value: string | null
      action: 'show' | 'hide' | 'require' | 'jump_to'
    }
  }>>([
    { id: '1', label: 'Full Name', type: 'text', required: true, placeholder: 'Enter your full name' },
    { id: '2', label: 'Email', type: 'email', required: true, placeholder: 'Enter your email address' },
    { id: '3', label: 'Phone Number', type: 'phone', required: false, placeholder: 'Enter your phone number' }
  ])
  const [newField, setNewField] = useState({
    label: '',
    type: 'text' as const,
    required: false,
    options: [] as string[],
    placeholder: '',
    fileTypes: '',
    conditionalLogic: {
      showWhen: null as string | null,
      operator: null as string | null,
      value: null as string | null,
      action: 'show' as 'show' | 'hide' | 'require' | 'jump_to'
    }
  })
  const [showAddField, setShowAddField] = useState(false)

  // Form Sections
  const [formSections, setFormSections] = useState<Array<{
    id: string
    title: string
    description?: string
    fields: Array<{
      id: string
      label: string
      type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'number' | 'date' | 'file' | 'url'
      required: boolean
      options?: string[]
      placeholder?: string
      fileTypes?: string
      conditionalLogic?: {
        showWhen: string | null
        operator: string | null
        value: string | null
        action: 'show' | 'hide' | 'require' | 'jump_to'
      }
    }>
  }>>([])
  const [newSection, setNewSection] = useState({
    title: '',
    description: ''
  })
  const [showAddSection, setShowAddSection] = useState(false)
  const [activeSection, setActiveSection] = useState(-1)

  // Helper function to get all fields for conditional logic
  const getAllFields = () => [
    ...registrationFields,
    ...formSections.flatMap(section => section.fields)
  ]

  // Fetch event categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/event-categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load event categories",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load event categories",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addSpeaker = () => {
    if (newSpeaker.name && newSpeaker.title) {
      const speaker: Speaker = {
        id: Date.now().toString(),
        ...newSpeaker,
        avatar: newSpeaker.avatar || "/placeholder.svg?height=100&width=100&text=Speaker",
      }
      setSpeakers([...speakers, speaker])
      setNewSpeaker({ name: "", title: "", bio: "", company: "", avatar: "" })
    }
  }

  const removeSpeaker = (id: string) => {
    setSpeakers(speakers.filter((s) => s.id !== id))
  }

  const addAgendaItem = () => {
    if (newAgendaItem.title && newAgendaItem.startTime && newAgendaItem.endTime) {
      const item: AgendaItem = {
        id: Date.now().toString(),
        ...newAgendaItem,
      }
      setAgenda([...agenda, item])
      setNewAgendaItem({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        speaker: "",
        type: "presentation",
      })
    }
  }

  const removeAgendaItem = (id: string) => {
    setAgenda(agenda.filter((a) => a.id !== id))
  }

  const handleFlyerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPG, PNG, GIF, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setFlyerFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFlyerPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFlyer = () => {
    setFlyerFile(null)
    setFlyerPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create an event",
          variant: "destructive",
        })
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      
      // Add event data
      formData.append('title', title)
      formData.append('description', description)
      formData.append('fullDescription', fullDescription || description)
      formData.append('categoryId', categoryId || '')
      formData.append('startDate', `${startDate}T${startTime}:00`)
      formData.append('endDate', endDate ? `${endDate}T${endTime}:00` : `${startDate}T${endTime}:00`)
      formData.append('location', location)
      formData.append('venue', venue || location)
      formData.append('capacity', capacity || '')
      formData.append('price', isFree ? '0' : (price || '0'))
      formData.append('currency', currency)
      formData.append('registrationDeadline', registrationDeadline ? `${registrationDeadline}T23:59:59` : '')
      formData.append('requirements', JSON.stringify(requirements))
      formData.append('tags', JSON.stringify(tags))
      formData.append('speakers', JSON.stringify(speakers.map(s => s.name)))
      formData.append('agenda', JSON.stringify(agenda))
      formData.append('gallery', JSON.stringify([]))
        
        // Prepare registration form data with conditional logic
        const allFields = getAllFields()
        
        // Add conditional logic fields to each field
        const enhancedFields = allFields.map(field => ({
          ...field,
          conditionalLogic: {
            showWhen: null, // Field to watch
            operator: null, // is, is_not, contains, etc.
            value: null, // Value to compare against
            action: 'show' // show, hide, require, jump_to
          }
        }))
        
        formData.append('requirements', JSON.stringify(enhancedFields))
        formData.append('isPublished', 'true')
        formData.append('isFeatured', 'false')


      // Add flyer file if uploaded
      if (flyerFile) {
        formData.append('flyer', flyerFile)
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Success!",
          description: "Event created successfully. Redirecting to events page...",
          variant: "default",
        })

        // Redirect to events page after a short delay
        setTimeout(() => {
          router.push("/events")
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }
    } catch (error) {
      console.error("Error creating event:", error)
      
      let errorMessage = "Failed to create event"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isBasicValid = title && description && categoryId && startDate && startTime && location
  const canProceed = (tab: string) => {
    switch (tab) {
      case "details":
        return isBasicValid
      case "speakers":
        return isBasicValid
      case "agenda":
        return isBasicValid
      case "registration":
        return isBasicValid
      case "preview":
        return isBasicValid
      default:
        return true
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details" disabled={!canProceed("details")}>
            Details
          </TabsTrigger>
          <TabsTrigger value="speakers" disabled={!canProceed("speakers")}>
            Speakers
          </TabsTrigger>
          <TabsTrigger value="agenda" disabled={!canProceed("agenda")}>
            Agenda
          </TabsTrigger>
          <TabsTrigger value="registration" disabled={!canProceed("registration")}>
            Registration
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!canProceed("preview")}>
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Short Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your event"
                    rows={3}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">{description.length}/200 characters</p>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required disabled={loadingCategories}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or region"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Specific venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Maximum attendees"
                    min="1"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    max={startDate}
                  />
                </div>
              </div>

              {/* Flyer Upload */}
              <div className="md:col-span-2">
                <Label htmlFor="flyer">Event Flyer</Label>
                <div className="mt-2">
                  {flyerPreview ? (
                    <div className="relative">
                      <img
                        src={flyerPreview}
                        alt="Flyer preview"
                        className="w-full max-w-md h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeFlyer}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <Label htmlFor="flyer-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                          Upload flyer image
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG, PNG, GIF up to 5MB
                        </p>
                      </div>
                      <Input
                        id="flyer-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFlyerUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
                <Label htmlFor="isFree">This is a free event</Label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RWF">RWF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Additional information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed description of your event"
                  rows={6}
                />
              </div>

              <div>
                <Label>Requirements</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeRequirement(index)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="isPublic">Make this event public</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="allowRegistration" checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                  <Label htmlFor="allowRegistration">Allow online registration</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speakers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Speakers</CardTitle>
              <CardDescription>Add speakers for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="speakerName">Name</Label>
                  <Input
                    id="speakerName"
                    value={newSpeaker.name}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                    placeholder="Speaker name"
                  />
                </div>
                <div>
                  <Label htmlFor="speakerTitle">Title</Label>
                  <Input
                    id="speakerTitle"
                    value={newSpeaker.title}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, title: e.target.value })}
                    placeholder="Job title"
                  />
                </div>
                <div>
                  <Label htmlFor="speakerCompany">Company</Label>
                  <Input
                    id="speakerCompany"
                    value={newSpeaker.company}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, company: e.target.value })}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="speakerAvatar">Avatar URL</Label>
                  <Input
                    id="speakerAvatar"
                    value={newSpeaker.avatar}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, avatar: e.target.value })}
                    placeholder="Profile image URL"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="speakerBio">Bio</Label>
                  <Textarea
                    id="speakerBio"
                    value={newSpeaker.bio}
                    onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
                    placeholder="Speaker biography"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={addSpeaker} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Speaker
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <img
                      src={speaker.avatar || "/placeholder.svg?height=60&width=60&text=Speaker"}
                      alt={speaker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{speaker.name}</h4>
                      <p className="text-sm text-muted-foreground">{speaker.title}</p>
                      {speaker.company && <p className="text-sm text-muted-foreground">{speaker.company}</p>}
                      {speaker.bio && <p className="text-sm mt-2">{speaker.bio}</p>}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSpeaker(speaker.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Agenda</CardTitle>
              <CardDescription>Create a schedule for your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label htmlFor="agendaTitle">Session Title</Label>
                  <Input
                    id="agendaTitle"
                    value={newAgendaItem.title}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                    placeholder="Session title"
                  />
                </div>
                <div>
                  <Label htmlFor="agendaStartTime">Start Time</Label>
                  <Input
                    id="agendaStartTime"
                    type="time"
                    value={newAgendaItem.startTime}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="agendaEndTime">End Time</Label>
                  <Input
                    id="agendaEndTime"
                    type="time"
                    value={newAgendaItem.endTime}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, endTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="agendaType">Type</Label>
                  <Select
                    value={newAgendaItem.type}
                    onValueChange={(value) => setNewAgendaItem({ ...newAgendaItem, type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="panel">Panel Discussion</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="agendaSpeaker">Speaker</Label>
                  <Select
                    value={newAgendaItem.speaker}
                    onValueChange={(value) => setNewAgendaItem({ ...newAgendaItem, speaker: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select speaker" />
                    </SelectTrigger>
                    <SelectContent>
                      {speakers.map((speaker) => (
                        <SelectItem key={speaker.id} value={speaker.name}>
                          {speaker.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="agendaDescription">Description</Label>
                  <Textarea
                    id="agendaDescription"
                    value={newAgendaItem.description}
                    onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                    placeholder="Session description"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="button" onClick={addAgendaItem} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Agenda Item
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {agenda
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="text-sm font-mono">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        {item.speaker && <p className="text-sm text-muted-foreground">Speaker: {item.speaker}</p>}
                      </div>
                      <Badge variant="outline">{item.type}</Badge>
                      <Button type="button" variant="outline" size="sm" onClick={() => removeAgendaItem(item.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Registration Form</CardTitle>
              <CardDescription>Create a custom form for event participants with sections and fields</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Form Sections</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowAddSection(!showAddSection)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {showAddSection && (
                  <Card className="p-4 border-dashed">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sectionTitle">Section Title</Label>
                        <Input
                          id="sectionTitle"
                          value={newSection.title}
                          onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                          placeholder="e.g., Personal Information"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sectionDescription">Section Description</Label>
                        <Input
                          id="sectionDescription"
                          value={newSection.description}
                          onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button 
                        type="button" 
                        onClick={() => {
                          if (newSection.title) {
                            setFormSections([...formSections, { ...newSection, id: Date.now().toString(), fields: [] }])
                            setNewSection({ title: '', description: '' })
                            setShowAddSection(false)
                          }
                        }}
                      >
                        Add Section
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddSection(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Existing Sections */}
                {formSections.map((section, sectionIndex) => (
                  <Card key={section.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          {section.description && (
                            <CardDescription>{section.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setActiveSection(sectionIndex)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Field
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              const updatedSections = [...formSections]
                              updatedSections.splice(sectionIndex, 1)
                              setFormSections(updatedSections)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Fields in this section */}
                      <div className="space-y-3">
                        {section.fields.map((field, fieldIndex) => (
                          <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{field.label}</span>
                                {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                                <Badge variant="outline" className="text-xs">{field.type}</Badge>
                                {field.conditionalLogic && field.conditionalLogic.showWhen && (
                                  <Badge variant="destructive" className="text-xs">Conditional</Badge>
                                )}
                              </div>
                              {field.placeholder && (
                                <p className="text-sm text-muted-foreground">{field.placeholder}</p>
                              )}
                            </div>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const updatedSections = [...formSections]
                                updatedSections[sectionIndex].fields.splice(fieldIndex, 1)
                                setFormSections(updatedSections)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        {section.fields.length === 0 && (
                          <p className="text-center text-muted-foreground py-4">
                            No fields in this section yet. Click "Add Field" to get started.
                          </p>
                        )}
                      </div>

                      {/* Add Field Form for this section */}
                      {activeSection === sectionIndex && (
                        <Card className="mt-4 p-4 border-dashed">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="fieldLabel">Field Label</Label>
                              <Input
                                id="fieldLabel"
                                value={newField.label}
                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                placeholder="e.g., Company Name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="fieldType">Field Type</Label>
                              <Select 
                                value={newField.type} 
                                onValueChange={(value: any) => setNewField({ ...newField, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Text</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="phone">Phone</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="date">Date</SelectItem>
                                  <SelectItem value="select">Dropdown</SelectItem>
                                  <SelectItem value="textarea">Text Area</SelectItem>
                                  <SelectItem value="checkbox">Checkbox</SelectItem>
                                  <SelectItem value="radio">Radio Buttons</SelectItem>
                                  <SelectItem value="file">File Upload</SelectItem>
                                  <SelectItem value="url">URL</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                              <Input
                                id="fieldPlaceholder"
                                value={newField.placeholder}
                                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                placeholder="Optional placeholder text"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="fieldRequired"
                                checked={newField.required}
                                onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                              />
                              <Label htmlFor="fieldRequired">Required field</Label>
                            </div>
                          </div>

                          {/* Conditional Logic Section */}
                          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                            <h4 className="font-medium mb-3">Conditional Logic</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Show when field</Label>
                                <Select 
                                  value={newField.conditionalLogic?.showWhen || ''} 
                                  onValueChange={(value) => setNewField({ 
                                    ...newField, 
                                    conditionalLogic: { 
                                      ...newField.conditionalLogic, 
                                      showWhen: value 
                                    } 
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAllFields().map(field => (
                                      <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Operator</Label>
                                <Select 
                                  value={newField.conditionalLogic?.operator || ''} 
                                  onValueChange={(value) => setNewField({ 
                                    ...newField, 
                                    conditionalLogic: { 
                                      ...newField.conditionalLogic, 
                                      operator: value 
                                    } 
                                  })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select operator" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="is">is</SelectItem>
                                    <SelectItem value="is_not">is not</SelectItem>
                                    <SelectItem value="contains">contains</SelectItem>
                                    <SelectItem value="does_not_contain">does not contain</SelectItem>
                                    <SelectItem value="is_empty">is empty</SelectItem>
                                    <SelectItem value="is_not_empty">is not empty</SelectItem>
                                    <SelectItem value="greater_than">greater than</SelectItem>
                                    <SelectItem value="less_than">less than</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Value</Label>
                                <Input
                                  value={newField.conditionalLogic?.value || ''}
                                  onChange={(e) => setNewField({ 
                                    ...newField, 
                                    conditionalLogic: { 
                                      ...newField.conditionalLogic, 
                                      value: e.target.value 
                                    } 
                                  })}
                                  placeholder="Value to compare"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <Label>Action</Label>
                              <Select 
                                value={newField.conditionalLogic?.action || 'show'} 
                                onValueChange={(value) => setNewField({ 
                                  ...newField, 
                                  conditionalLogic: { 
                                    ...newField.conditionalLogic, 
                                    action: value 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="show">Show field</SelectItem>
                                  <SelectItem value="hide">Hide field</SelectItem>
                                  <SelectItem value="require">Make required</SelectItem>
                                  <SelectItem value="jump_to">Jump to section</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Field-specific options */}
                          {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                            <div className="mt-4">
                              <Label>Options (one per line)</Label>
                              <Textarea
                                value={newField.options?.join('\n') || ''}
                                onChange={(e) => setNewField({ 
                                  ...newField, 
                                  options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                })}
                                placeholder="Option 1&#10;Option 2&#10;Option 3"
                                rows={3}
                              />
                            </div>
                          )}

                          {newField.type === 'file' && (
                            <div className="mt-4">
                              <Label>File Types</Label>
                              <Input
                                value={newField.fileTypes || ''}
                                onChange={(e) => setNewField({ ...newField, fileTypes: e.target.value })}
                                placeholder="e.g., .pdf, .doc, .jpg (optional)"
                              />
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button 
                              type="button" 
                              onClick={() => {
                                if (newField.label) {
                                  const updatedSections = [...formSections]
                                  updatedSections[sectionIndex].fields.push({ 
                                    ...newField, 
                                    id: Date.now().toString(),
                                    conditionalLogic: newField.conditionalLogic || {
                                      showWhen: null,
                                      operator: null,
                                      value: null,
                                      action: 'show'
                                    }
                                  })
                                  setFormSections(updatedSections)
                                  setNewField({ 
                                    label: '', 
                                    type: 'text', 
                                    required: false, 
                                    options: [], 
                                    placeholder: '', 
                                    fileTypes: '',
                                    conditionalLogic: {
                                      showWhen: null,
                                      operator: null,
                                      value: null,
                                      action: 'show'
                                    }
                                  })
                                  setActiveSection(-1)
                                }
                              }}
                            >
                              Add Field
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setActiveSection(-1)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Default fields if no sections */}
                {formSections.length === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Registration Fields</h3>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowAddField(!showAddField)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>

                    {showAddField && (
                      <Card className="p-4 border-dashed">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fieldLabel">Field Label</Label>
                            <Input
                              id="fieldLabel"
                              value={newField.label}
                              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                              placeholder="e.g., Company Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="fieldType">Field Type</Label>
                            <Select 
                              value={newField.type} 
                              onValueChange={(value: any) => setNewField({ ...newField, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="textarea">Text Area</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="radio">Radio Buttons</SelectItem>
                                <SelectItem value="file">File Upload</SelectItem>
                                <SelectItem value="url">URL</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                            <Input
                              id="fieldPlaceholder"
                              value={newField.placeholder}
                              onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                              placeholder="Optional placeholder text"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="fieldRequired"
                              checked={newField.required}
                              onCheckedChange={(checked) => setNewField({ ...newField, required: checked })}
                            />
                            <Label htmlFor="fieldRequired">Required field</Label>
                          </div>
                        </div>

                        {/* Conditional Logic Section */}
                        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                          <h4 className="font-medium mb-3">Conditional Logic</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Show when field</Label>
                              <Select 
                                value={newField.conditionalLogic?.showWhen || ''} 
                                onValueChange={(value) => setNewField({ 
                                  ...newField, 
                                  conditionalLogic: { 
                                    ...newField.conditionalLogic, 
                                    showWhen: value 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAllFields().map(field => (
                                    <SelectItem key={field.id} value={field.id}>{field.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Operator</Label>
                              <Select 
                                value={newField.conditionalLogic?.operator || ''} 
                                onValueChange={(value) => setNewField({ 
                                  ...newField, 
                                  conditionalLogic: { 
                                    ...newField.conditionalLogic, 
                                    operator: value 
                                  } 
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="is">is</SelectItem>
                                  <SelectItem value="is_not">is not</SelectItem>
                                  <SelectItem value="contains">contains</SelectItem>
                                  <SelectItem value="does_not_contain">does not contain</SelectItem>
                                  <SelectItem value="is_empty">is empty</SelectItem>
                                  <SelectItem value="is_not_empty">is not empty</SelectItem>
                                  <SelectItem value="greater_than">greater than</SelectItem>
                                  <SelectItem value="less_than">less than</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Value</Label>
                              <Input
                                value={newField.conditionalLogic?.value || ''}
                                onChange={(e) => setNewField({ 
                                  ...newField, 
                                  conditionalLogic: { 
                                    ...newField.conditionalLogic, 
                                    value: e.target.value 
                                  } 
                                })}
                                placeholder="Value to compare"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <Label>Action</Label>
                            <Select 
                              value={newField.conditionalLogic?.action || 'show'} 
                              onValueChange={(value) => setNewField({ 
                                ...newField, 
                                conditionalLogic: { 
                                  ...newField.conditionalLogic, 
                                  action: value 
                                } 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="show">Show field</SelectItem>
                                <SelectItem value="hide">Hide field</SelectItem>
                                <SelectItem value="require">Make required</SelectItem>
                                <SelectItem value="jump_to">Jump to section</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Field-specific options */}
                        {(newField.type === 'select' || newField.type === 'radio' || newField.type === 'checkbox') && (
                          <div className="mt-4">
                            <Label>Options (one per line)</Label>
                            <Textarea
                              value={newField.options?.join('\n') || ''}
                              onChange={(e) => setNewField({ 
                                ...newField, 
                                options: e.target.value.split('\n').filter(opt => opt.trim()) 
                              })}
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                              rows={3}
                            />
                          </div>
                        )}

                        {newField.type === 'file' && (
                          <div className="mt-4">
                            <Label>File Types</Label>
                            <Input
                              value={newField.fileTypes || ''}
                              onChange={(e) => setNewField({ ...newField, fileTypes: e.target.value })}
                              placeholder="e.g., .pdf, .doc, .jpg (optional)"
                            />
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button 
                            type="button" 
                            onClick={() => {
                              if (newField.label) {
                                setRegistrationFields([...registrationFields, { 
                                  ...newField, 
                                  id: Date.now().toString(),
                                  conditionalLogic: newField.conditionalLogic || {
                                    showWhen: null,
                                    operator: null,
                                    value: null,
                                    action: 'show'
                                  }
                                }])
                                setNewField({ 
                                  label: '', 
                                  type: 'text', 
                                  required: false, 
                                  options: [], 
                                  placeholder: '', 
                                  fileTypes: '',
                                  conditionalLogic: {
                                    showWhen: null,
                                    operator: null,
                                    value: null,
                                    action: 'show'
                                  }
                                })
                                setShowAddField(false)
                              }
                            }}
                          >
                            Add Field
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowAddField(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Existing fields */}
                    {registrationFields.map((field, index) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            {field.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                            <Badge variant="outline" className="text-xs">{field.type}</Badge>
                            {field.conditionalLogic && field.conditionalLogic.showWhen && (
                              <Badge variant="destructive" className="text-xs">Conditional</Badge>
                            )}
                          </div>
                          {field.placeholder && (
                            <p className="text-sm text-muted-foreground">{field.placeholder}</p>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const updatedFields = [...registrationFields]
                            updatedFields.splice(index, 1)
                            setRegistrationFields(updatedFields)
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Preview</CardTitle>
              <CardDescription>Review your event before publishing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                {flyerPreview ? (
                  <img
                    src={flyerPreview}
                    alt="Event flyer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">{title || "Event Title"}</h2>
                <p className="text-muted-foreground mb-4">{description || "Event description"}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{startDate || "Date"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{startTime || "Time"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>{location || "Location"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span>{capacity ? `${capacity} spots` : "Unlimited"}</span>
                  </div>
                </div>
              </div>

              {fullDescription && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{fullDescription}</p>
                </div>
              )}

              {speakers.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Speakers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {speakers.map((speaker) => (
                      <div key={speaker.id} className="flex items-center gap-3">
                        <img
                          src={speaker.avatar || "/placeholder.svg?height=40&width=40&text=Speaker"}
                          alt={speaker.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium">{speaker.name}</p>
                          <p className="text-sm text-muted-foreground">{speaker.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {agenda.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Agenda</h3>
                  <div className="space-y-2">
                    {agenda
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((item) => (
                        <div key={item.id} className="flex items-center gap-4 text-sm">
                          <span className="font-mono">{item.startTime}</span>
                          <span>{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isBasicValid || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Event"}
        </Button>
      </div>
    </form>
  )
}
