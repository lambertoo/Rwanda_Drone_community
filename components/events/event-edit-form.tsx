"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, MapPin, Users, DollarSign, Upload, X, Plus, Trash2 } from "lucide-react"
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
  avatar?: string
}

interface AgendaItem {
  id: string
  startTime: string
  endTime: string
  title: string
  description: string
  speaker?: string
  type: string
}

interface EventEditFormProps {
  event: Event
}

export default function EventEditForm({ event }: EventEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

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
    setRequirements([...requirements, ""])
  }

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements]
    newRequirements[index] = value
    setRequirements(newRequirements)
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  // Tags
  const addTag = () => {
    setTags([...tags, ""])
  }

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // Speakers
  const addSpeaker = () => {
    const newSpeaker: Speaker = {
      id: Date.now().toString(),
      name: "",
      title: "",
      bio: "",
    }
    setSpeakers([...speakers, newSpeaker])
  }

  const updateSpeaker = (index: number, field: keyof Speaker, value: string) => {
    const newSpeakers = [...speakers]
    newSpeakers[index] = { ...newSpeakers[index], [field]: value }
    setSpeakers(newSpeakers)
  }

  const removeSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index))
  }

  // Agenda
  const addAgendaItem = () => {
    const newItem: AgendaItem = {
      id: Date.now().toString(),
      startTime: "09:00",
      endTime: "10:00",
      title: "",
      description: "",
      type: "session"
    }
    setAgenda([...agenda, newItem])
  }

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string) => {
    const newAgenda = [...agenda]
    newAgenda[index] = { ...newAgenda[index], [field]: value }
    setAgenda(newAgenda)
  }

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index))
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
      formData.append('price', price || '0')
      formData.append('currency', currency)
      formData.append('registrationDeadline', registrationDeadline ? `${registrationDeadline}T23:59:59` : '')
      formData.append('allowRegistration', allowRegistration.toString())
      formData.append('isPublished', isPublished.toString())
      formData.append('isFeatured', isFeatured.toString())
      formData.append('requirements', JSON.stringify(requirements.filter(Boolean)))
      formData.append('tags', JSON.stringify(tags.filter(Boolean)))
      formData.append('speakers', JSON.stringify(speakers))
      formData.append('agenda', JSON.stringify(agenda))
      formData.append('gallery', JSON.stringify(gallery))
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
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
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter event location"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Enter venue name"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Enter capacity"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price"
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

                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
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

              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowRegistration"
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                  <Label htmlFor="allowRegistration">Allow Registration</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="isPublished">Published</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the event"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Detailed description of the event"
                  rows={6}
                />
              </div>

              {/* Requirements */}
              <div>
                <Label>Requirements</Label>
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder="Enter requirement"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addRequirement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        placeholder="Enter tag"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTag(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Speakers */}
          <Card>
            <CardHeader>
              <CardTitle>Speakers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {speakers.map((speaker, index) => (
                <div key={speaker.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Speaker {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpeaker(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={speaker.name}
                        onChange={(e) => updateSpeaker(index, 'name', e.target.value)}
                        placeholder="Speaker name"
                      />
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={speaker.title}
                        onChange={(e) => updateSpeaker(index, 'title', e.target.value)}
                        placeholder="Speaker title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={speaker.bio}
                        onChange={(e) => updateSpeaker(index, 'bio', e.target.value)}
                        placeholder="Speaker bio"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSpeaker}>
                <Plus className="h-4 w-4 mr-2" />
                Add Speaker
              </Button>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle>Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agenda.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Agenda Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAgendaItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={item.startTime}
                        onChange={(e) => updateAgendaItem(index, 'startTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={item.endTime}
                        onChange={(e) => updateAgendaItem(index, 'endTime', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                        placeholder="Agenda item title"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                        placeholder="Agenda item description"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Speaker</Label>
                      <Input
                        value={item.speaker || ""}
                        onChange={(e) => updateAgendaItem(index, 'speaker', e.target.value)}
                        placeholder="Speaker name"
                      />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Select value={item.type} onValueChange={(value) => updateAgendaItem(index, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session">Session</SelectItem>
                          <SelectItem value="break">Break</SelectItem>
                          <SelectItem value="keynote">Keynote</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAgendaItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Agenda Item
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {categories.find(c => c.id === categoryId)?.name || 'Uncategorized'}
                  </Badge>
                  {isFeatured && <Badge variant="default">Featured</Badge>}
                </div>
                <h2 className="text-3xl font-bold">{title}</h2>
                <p className="text-lg text-muted-foreground">{description}</p>
              </div>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(`${startDate}T${startTime}`).toLocaleDateString()} at {startTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{location}</p>
                      {venue && <p className="text-sm text-muted-foreground">{venue}</p>}
                    </div>
                  </div>

                  {capacity && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">{capacity} people</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Price</p>
                      <p className="text-sm text-muted-foreground">
                        {price === '0' ? 'Free' : `${price} ${currency}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flyer Preview */}
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
              </div>

              {/* Full Description */}
              {fullDescription && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">About This Event</h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{fullDescription}</div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {requirements.filter(Boolean).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Requirements</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {requirements.filter(Boolean).map((req, index) => (
                      <li key={index} className="text-sm">{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {tags.filter(Boolean).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.filter(Boolean).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers */}
              {speakers.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Speakers</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {speakers.map((speaker, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                          {speaker.name ? speaker.name.split(" ").map((n: string) => n[0]).join("") : "SP"}
                        </div>
                        <div>
                          <h4 className="font-semibold">{speaker.name || "Speaker Name"}</h4>
                          <p className="text-sm text-blue-600 mb-1">{speaker.title || "Speaker"}</p>
                          {speaker.bio && (
                            <p className="text-sm text-muted-foreground">{speaker.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agenda */}
              {agenda.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Agenda</h3>
                  <div className="space-y-4">
                    {agenda.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg">
                        <div className="text-sm font-medium text-blue-600 min-w-[80px]">
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.title || "Agenda Item"}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                          {item.speaker && (
                            <p className="text-sm text-blue-600 mt-1">
                              Speaker: {item.speaker}
                            </p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {item.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Updating Event..." : "Update Event"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/events/${event.id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
} 