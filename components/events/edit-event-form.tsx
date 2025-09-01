"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface EventCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
}

interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  categoryId: string
  startDate: string
  endDate: string
  location: string
  venue: string
  capacity: number | null
  price: number
  currency: string
  requirements: string[]
  tags: string[]
  speakers: string[]
  agenda: any[]
  isPublished: boolean
  isFeatured: boolean
}

interface EditEventFormProps {
  eventId: string
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RWF")

  // Fetch event data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEvent(eventData.event)
          populateFormData(eventData.event)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/event-categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, toast])

  // Populate form with event data
  const populateFormData = (eventData: Event) => {
    setTitle(eventData.title)
    setDescription(eventData.description)
    setFullDescription(eventData.fullDescription || "")
    setCategoryId(eventData.categoryId || "")
    
    if (eventData.startDate) {
      const startDate = new Date(eventData.startDate)
      setStartDate(startDate.toISOString().split('T')[0])
    }
    
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate)
      setEndDate(endDate.toISOString().split('T')[0])
    }
    
    setLocation(eventData.location)
    setVenue(eventData.venue || "")
    setPrice(eventData.price.toString())
    setCurrency(eventData.currency)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData = {
        title,
        description,
        fullDescription: fullDescription || description,
        categoryId: categoryId || '',
        startDate: startDate,
        endDate: endDate || startDate,
        location,
        venue: venue || location,
        price: price || '0',
        currency,
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Event updated successfully",
          variant: "default",
        })
        router.push("/events")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Event not found or you don't have permission to edit it.
        </p>
        <Button onClick={() => router.push("/events")}>
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your event"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea
            id="fullDescription"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed description of your event"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Specific venue or address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  )
} 

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface EventCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
}

interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  categoryId: string
  startDate: string
  endDate: string
  location: string
  venue: string
  capacity: number | null
  price: number
  currency: string
  requirements: string[]
  tags: string[]
  speakers: string[]
  agenda: any[]
  isPublished: boolean
  isFeatured: boolean
}

interface EditEventFormProps {
  eventId: string
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RWF")

  // Fetch event data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEvent(eventData.event)
          populateFormData(eventData.event)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/event-categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, toast])

  // Populate form with event data
  const populateFormData = (eventData: Event) => {
    setTitle(eventData.title)
    setDescription(eventData.description)
    setFullDescription(eventData.fullDescription || "")
    setCategoryId(eventData.categoryId || "")
    
    if (eventData.startDate) {
      const startDate = new Date(eventData.startDate)
      setStartDate(startDate.toISOString().split('T')[0])
    }
    
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate)
      setEndDate(endDate.toISOString().split('T')[0])
    }
    
    setLocation(eventData.location)
    setVenue(eventData.venue || "")
    setPrice(eventData.price.toString())
    setCurrency(eventData.currency)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData = {
        title,
        description,
        fullDescription: fullDescription || description,
        categoryId: categoryId || '',
        startDate: startDate,
        endDate: endDate || startDate,
        location,
        venue: venue || location,
        price: price || '0',
        currency,
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Event updated successfully",
          variant: "default",
        })
        router.push("/events")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Event not found or you don't have permission to edit it.
        </p>
        <Button onClick={() => router.push("/events")}>
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your event"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea
            id="fullDescription"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed description of your event"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Specific venue or address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  )
} 
 
 
 

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface EventCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
}

interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  categoryId: string
  startDate: string
  endDate: string
  location: string
  venue: string
  capacity: number | null
  price: number
  currency: string
  requirements: string[]
  tags: string[]
  speakers: string[]
  agenda: any[]
  isPublished: boolean
  isFeatured: boolean
}

interface EditEventFormProps {
  eventId: string
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RWF")

  // Fetch event data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEvent(eventData.event)
          populateFormData(eventData.event)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/event-categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, toast])

  // Populate form with event data
  const populateFormData = (eventData: Event) => {
    setTitle(eventData.title)
    setDescription(eventData.description)
    setFullDescription(eventData.fullDescription || "")
    setCategoryId(eventData.categoryId || "")
    
    if (eventData.startDate) {
      const startDate = new Date(eventData.startDate)
      setStartDate(startDate.toISOString().split('T')[0])
    }
    
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate)
      setEndDate(endDate.toISOString().split('T')[0])
    }
    
    setLocation(eventData.location)
    setVenue(eventData.venue || "")
    setPrice(eventData.price.toString())
    setCurrency(eventData.currency)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData = {
        title,
        description,
        fullDescription: fullDescription || description,
        categoryId: categoryId || '',
        startDate: startDate,
        endDate: endDate || startDate,
        location,
        venue: venue || location,
        price: price || '0',
        currency,
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Event updated successfully",
          variant: "default",
        })
        router.push("/events")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Event not found or you don't have permission to edit it.
        </p>
        <Button onClick={() => router.push("/events")}>
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your event"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea
            id="fullDescription"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed description of your event"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Specific venue or address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  )
} 

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface EventCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
}

interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  categoryId: string
  startDate: string
  endDate: string
  location: string
  venue: string
  capacity: number | null
  price: number
  currency: string
  requirements: string[]
  tags: string[]
  speakers: string[]
  agenda: any[]
  isPublished: boolean
  isFeatured: boolean
}

interface EditEventFormProps {
  eventId: string
}

export default function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<EventCategory[]>([])

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [venue, setVenue] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("RWF")

  // Fetch event data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event data
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (eventResponse.ok) {
          const eventData = await eventResponse.json()
          setEvent(eventData.event)
          populateFormData(eventData.event)
        }

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/event-categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to load event data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, toast])

  // Populate form with event data
  const populateFormData = (eventData: Event) => {
    setTitle(eventData.title)
    setDescription(eventData.description)
    setFullDescription(eventData.fullDescription || "")
    setCategoryId(eventData.categoryId || "")
    
    if (eventData.startDate) {
      const startDate = new Date(eventData.startDate)
      setStartDate(startDate.toISOString().split('T')[0])
    }
    
    if (eventData.endDate) {
      const endDate = new Date(eventData.endDate)
      setEndDate(endDate.toISOString().split('T')[0])
    }
    
    setLocation(eventData.location)
    setVenue(eventData.venue || "")
    setPrice(eventData.price.toString())
    setCurrency(eventData.currency)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const eventData = {
        title,
        description,
        fullDescription: fullDescription || description,
        categoryId: categoryId || '',
        startDate: startDate,
        endDate: endDate || startDate,
        location,
        venue: venue || location,
        price: price || '0',
        currency,
      }

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Event updated successfully",
          variant: "default",
        })
        router.push("/events")
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update event",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event data...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          Event not found or you don't have permission to edit it.
        </p>
        <Button onClick={() => router.push("/events")}>
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your event"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullDescription">Full Description</Label>
          <Textarea
            id="fullDescription"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            placeholder="Detailed description of your event"
            rows={6}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input
              id="venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Specific venue or address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/events")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Event"}
        </Button>
      </div>
    </form>
  )
} 
 
 
 