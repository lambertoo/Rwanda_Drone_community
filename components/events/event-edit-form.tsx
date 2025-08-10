"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, Plus, X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  fullDescription?: string
  category?: {
    id: string
    name: string
    slug: string
    icon?: string
  }
  categoryId?: string
  startDate: string | Date
  endDate: string | Date
  location: string
  venue?: string
  capacity?: number
  price: number
  currency: string
  registrationDeadline?: string | Date
  allowRegistration: boolean
  isPublished: boolean
  isFeatured: boolean
  requirements?: any
  tags?: any
  speakers?: any
  agenda?: any
  gallery?: any
  flyer?: string
  organizer: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
  }
}

interface EventCategory {
  id: string
  name: string
  slug: string
  icon: string
  color: string
}

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

interface EventEditFormProps {
  event: Event
}

export default function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState("basic")
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Helper function to format date for input
  const formatDateForInput = (date: string | Date) => {
    if (typeof date === 'string') {
      return date.split('T')[0]
    }
    return date.toISOString().split('T')[0]
  }

  const formatTimeForInput = (date: string | Date) => {
    if (typeof date === 'string') {
      return date.split('T')[1]?.substring(0, 5) || "09:00"
    }
    return date.toISOString().split('T')[1]?.substring(0, 5) || "09:00"
  }

  // Form state
  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description)
  const [fullDescription, setFullDescription] = useState(event.fullDescription || "")
  const [categoryId, setCategoryId] = useState(event.categoryId || "")
  const [startDate, setStartDate] = useState(formatDateForInput(event.startDate))
  const [startTime, setStartTime] = useState(formatTimeForInput(event.startDate))
  const [endDate, setEndDate] = useState(formatDateForInput(event.endDate))
  const [endTime, setEndTime] = useState(formatTimeForInput(event.endDate))
  const [location, setLocation] = useState(event.location)
  const [venue, setVenue] = useState(event.venue || "")
  const [capacity, setCapacity] = useState(event.capacity?.toString() || "")
  const [price, setPrice] = useState(event.price.toString())
  const [currency, setCurrency] = useState(event.currency)
  const [registrationDeadline, setRegistrationDeadline] = useState(
    event.registrationDeadline ? formatDateForInput(event.registrationDeadline) : ""
  )
  const [isFree, setIsFree] = useState(event.price === 0)
  const [allowRegistration, setAllowRegistration] = useState(event.allowRegistration)
  const [isPublished, setIsPublished] = useState(event.isPublished)
  const [isFeatured, setIsFeatured] = useState(event.isFeatured)

  // Parse JSON fields
  const parseJsonField = (field: any) => {
    if (!field) return []
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch (e) {
        return []
      }
    }
    return Array.isArray(field) ? field : []
  }

  const [requirements, setRequirements] = useState<string[]>(parseJsonField(event.requirements))
  const [tags, setTags] = useState<string[]>(parseJsonField(event.tags))
  const [speakers, setSpeakers] = useState<Speaker[]>(parseJsonField(event.speakers))
  const [agenda, setAgenda] = useState<AgendaItem[]>(parseJsonField(event.agenda))
  const [gallery, setGallery] = useState<any[]>(parseJsonField(event.gallery))

  // New item states
  const [newRequirement, setNewRequirement] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    title: "",
    bio: "",
    company: "",
    avatar: "",
  })
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
  const [flyerPreview, setFlyerPreview] = useState<string | null>(event.flyer || null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/event-categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data || [])
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

  // Requirements
  const addRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  // Tags
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // Speakers
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

  // Agenda
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem("user")
      if (!storedUser) {
        toast({
          title: "Authentication Error",
          description: "Please log in to edit this event",
          variant: "destructive",
        })
        return
      }

      const user = JSON.parse(storedUser)

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
      formData.append('gallery', JSON.stringify(gallery))
      formData.append('isPublished', isPublished.toString())
      formData.append('isFeatured', isFeatured.toString())
      formData.append('allowRegistration', allowRegistration.toString())
      formData.append('userId', user.id)

      // Add flyer file if uploaded
      if (flyerFile) {
        formData.append('flyer', flyerFile)
      }

      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()

        toast({
          title: "Success!",
          description: "Event updated successfully. Redirecting to event page...",
          variant: "default",
        })

        // Redirect to event page after a short delay
        setTimeout(() => {
          router.push(`/events/${event.id}`)
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }
    } catch (error) {
      console.error("Error updating event:", error)

      let errorMessage = "Failed to update event"
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
      case "preview":
        return isBasicValid
      default:
        return true
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-gray-100 p-1 rounded-xl">
          <TabsTrigger 
            value="basic" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all"
          >
            Basic Info
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            disabled={!canProceed("details")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all disabled:opacity-50"
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="speakers" 
            disabled={!canProceed("speakers")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all disabled:opacity-50"
          >
            Speakers
          </TabsTrigger>
          <TabsTrigger 
            value="agenda" 
            disabled={!canProceed("agenda")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all disabled:opacity-50"
          >
            Agenda
          </TabsTrigger>
          <TabsTrigger 
            value="preview" 
            disabled={!canProceed("preview")}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-lg transition-all disabled:opacity-50"
          >
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              <p className="text-gray-600 mt-1">Essential details about your event</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    className="h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Short Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your event"
                    rows={3}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">{description.length}/200 characters</p>
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Category *
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required disabled={loadingCategories}>
                    <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Loading categories...
                        </div>
                      ) : categories && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.icon}</span>
                              <span>{category.name}</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          No categories available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 mb-2 block">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Start Time *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700 mb-2 block">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Location *
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or region"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="venue" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Venue
                  </Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Specific venue name"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Maximum attendees"
                    min="1"
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline" className="text-sm font-semibold text-gray-700 mb-2 block">
                    Registration Deadline
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    max={startDate}
                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Flyer Upload */}
              <div className="md:col-span-2 pt-6 border-t border-gray-200">
                <Label htmlFor="flyer" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Event Flyer
                </Label>
                <div className="mt-2">
                  {flyerPreview ? (
                    <div className="relative">
                      <img
                        src={flyerPreview}
                        alt="Flyer preview"
                        className="w-full max-w-md h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-3 right-3 shadow-lg"
                        onClick={removeFlyer}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="flyer-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-lg">
                          Upload flyer image
                        </Label>
                        <p className="text-sm text-gray-500">
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Pricing</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-3">
                <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
                <Label htmlFor="isFree" className="text-base font-medium text-gray-700">
                  This is a free event
                </Label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Price
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Event Settings</h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="allowRegistration"
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                  <Label htmlFor="allowRegistration" className="text-base font-medium text-gray-700">
                    Allow online registration
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished" className="text-base font-medium text-gray-700">
                    Make this event public
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <Label htmlFor="isFeatured" className="text-base font-medium text-gray-700">
                    Featured event
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <p className="text-gray-600 mt-1">Additional information about your event</p>
            </div>
            <div className="p-8 space-y-8">
              <div>
                <Label htmlFor="fullDescription" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Full Description
                </Label>
                <Textarea
                  id="fullDescription"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed description of your event"
                  rows={6}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Requirements</Label>
                <div className="flex gap-3 mb-4">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={addRequirement} size="sm" className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {requirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {req}
                      <X className="h-4 w-4 cursor-pointer hover:text-blue-600" onClick={() => removeRequirement(index)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Tags</Label>
                <div className="flex gap-3 mb-4">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Button type="button" onClick={addTag} size="sm" className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="flex items-center gap-2 px-3 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50">
                      #{tag}
                      <X className="h-4 w-4 cursor-pointer hover:text-gray-600" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="speakers" className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Speakers</h2>
              <p className="text-gray-600 mt-1">Add speakers for your event</p>
            </div>
            <div className="p-8 space-y-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Speaker</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="speakerName" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Name
                    </Label>
                    <Input
                      id="speakerName"
                      value={newSpeaker.name}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, name: e.target.value })}
                      placeholder="Speaker name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Title
                    </Label>
                    <Input
                      id="speakerTitle"
                      value={newSpeaker.title}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, title: e.target.value })}
                      placeholder="Job title"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerCompany" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Company
                    </Label>
                    <Input
                      id="speakerCompany"
                      value={newSpeaker.company}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, company: e.target.value })}
                      placeholder="Company name"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="speakerAvatar" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Avatar URL
                    </Label>
                    <Input
                      id="speakerAvatar"
                      value={newSpeaker.avatar}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, avatar: e.target.value })}
                      placeholder="Profile image URL"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="speakerBio" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Bio
                    </Label>
                    <Textarea
                      id="speakerBio"
                      value={newSpeaker.bio}
                      onChange={(e) => setNewSpeaker({ ...newSpeaker, bio: e.target.value })}
                      placeholder="Speaker biography"
                      rows={3}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={addSpeaker} className="w-full h-12 text-base font-medium">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Speaker
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Speakers</h3>
                {speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-start gap-4 p-6 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors">
                    <img
                      src={speaker.avatar || "/placeholder.svg?height=60&width=60&text=Speaker"}
                      alt={speaker.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900">{speaker.name}</h4>
                      <p className="text-gray-600 font-medium">{speaker.title}</p>
                      {speaker.company && <p className="text-gray-500">{speaker.company}</p>}
                      {speaker.bio && <p className="text-gray-600 mt-2">{speaker.bio}</p>}
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => removeSpeaker(speaker.id)} className="text-red-600 border-red-300 hover:bg-red-50">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Event Agenda</h2>
              <p className="text-gray-600 mt-1">Create a schedule for your event</p>
            </div>
            <div className="p-8 space-y-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Agenda Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="agendaTitle" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Session Title
                    </Label>
                    <Input
                      id="agendaTitle"
                      value={newAgendaItem.title}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, title: e.target.value })}
                      placeholder="Session title"
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agendaStartTime" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Start Time
                    </Label>
                    <Input
                      id="agendaStartTime"
                      type="time"
                      value={newAgendaItem.startTime}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, startTime: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agendaEndTime" className="text-sm font-semibold text-gray-700 mb-2 block">
                      End Time
                    </Label>
                    <Input
                      id="agendaEndTime"
                      type="time"
                      value={newAgendaItem.endTime}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, endTime: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="agendaType" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Type
                    </Label>
                    <Select
                      value={newAgendaItem.type}
                      onValueChange={(value) => setNewAgendaItem({ ...newAgendaItem, type: value as any })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <Label htmlFor="agendaSpeaker" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Speaker
                    </Label>
                    <Select
                      value={newAgendaItem.speaker}
                      onValueChange={(value) => setNewAgendaItem({ ...newAgendaItem, speaker: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
                    <Label htmlFor="agendaDescription" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Description
                    </Label>
                    <Textarea
                      id="agendaDescription"
                      value={newAgendaItem.description}
                      onChange={(e) => setNewAgendaItem({ ...newAgendaItem, description: e.target.value })}
                      placeholder="Session description"
                      rows={2}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="button" onClick={addAgendaItem} className="w-full h-12 text-base font-medium">
                      <Plus className="h-5 w-5 mr-2" />
                      Add Agenda Item
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Schedule</h3>
                <div className="space-y-3">
                  {agenda
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                        <span className="font-mono text-sm text-blue-600 font-semibold min-w-[80px]">{item.startTime}</span>
                        <span className="font-medium text-gray-900">{item.title}</span>
                        <Badge variant="outline" className="ml-auto border-gray-300 text-gray-700">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Event Preview</h2>
              <p className="text-gray-600 mt-1">Review your event before publishing</p>
            </div>
            <div className="p-8 space-y-8">
              <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {flyerPreview ? (
                  <img
                    src={flyerPreview}
                    alt="Event flyer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No flyer uploaded</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{title || "Event Title"}</h2>
                  <p className="text-lg text-gray-600 mb-6">{description || "Event description"}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Date</p>
                        <p className="text-gray-600">{startDate || "TBD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Time</p>
                        <p className="text-gray-600">{startTime || "TBD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-gray-600">{location || "TBD"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Capacity</p>
                        <p className="text-gray-600">{capacity ? `${capacity} spots` : "Unlimited"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {fullDescription && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">About This Event</h3>
                    <p className="text-gray-600 leading-relaxed">{fullDescription}</p>
                  </div>
                )}

                {speakers.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Speakers</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {speakers.map((speaker) => (
                        <div key={speaker.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                          <img
                            src={speaker.avatar || "/placeholder.svg?height=40&width=40&text=Speaker"}
                            alt={speaker.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white"
                          />
                          <div>
                            <p className="font-semibold text-gray-900">{speaker.name}</p>
                            <p className="text-sm text-gray-600">{speaker.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {agenda.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Agenda</h3>
                    <div className="space-y-3">
                      {agenda
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-white">
                            <span className="font-mono text-sm text-blue-600 font-semibold min-w-[80px]">{item.startTime}</span>
                            <span className="font-medium text-gray-900">{item.title}</span>
                            <Badge variant="outline" className="ml-auto border-gray-300 text-gray-700">
                              {item.type}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-8 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={() => router.push(`/events/${event.id}`)} className="h-12 px-8">
          Cancel
        </Button>
        <Button type="submit" disabled={!isBasicValid || isSubmitting} className="h-12 px-8 text-base font-medium">
          {isSubmitting ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  )
} 