"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Clock, MapPin, Users, Search, Grid, List, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface Event {
  id: string
  title: string
  description: string
  fullDescription?: string
  category?: {
    id: string
    name: string
    description: string
    slug: string
    icon: string
    color: string
  }
  startDate: string
  endDate: string
  location: string
  venue: string
  price: number
  currency: string
  viewsCount: number
  likesCount: number
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  organizerId: string
  organizer: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
  }
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const categories = ["all", ...Array.from(new Set(events.map(event => event.category?.name).filter(Boolean)))]
  const locations = ["all", ...Array.from(new Set(events.map(event => event.location)))]

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || event.category?.name === selectedCategory
    const matchesLocation = selectedLocation === "all" || event.location === selectedLocation

    return matchesSearch && matchesCategory && matchesLocation
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative">
        <img src="/placeholder.svg" alt={event.title} className="w-full h-full object-cover" />
        <Badge className="absolute top-2 right-2" variant="secondary">
          {event.category?.name || 'Uncategorized'}
        </Badge>
        {event.isFeatured && (
          <Badge className="absolute top-2 left-2" variant="default">
            Featured
          </Badge>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          <div className="text-right">
            {event.price === 0 ? (
              <Badge variant="outline" className="text-green-600">
                Free
              </Badge>
            ) : (
              <span className="font-semibold">
                {event.price.toLocaleString()} {event.currency}
              </span>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <span>{formatTime(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-600" />
            <span>
              {event.venue}, {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span>Organized by {event.organizer.fullName}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/events/${event.id}`}>View Details</Link>
          </Button>
          <Button variant="outline">Register</Button>
        </div>
      </CardContent>
    </Card>
  )

  const EventListItem = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src="/placeholder.svg"
            alt={event.title}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <div className="flex gap-2">
                <Badge variant="secondary">{event.category?.name || 'Uncategorized'}</Badge>
                {event.isFeatured && (
                  <Badge variant="default">Featured</Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{event.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-green-600" />
                <span>{formatTime(event.startDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-red-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3 text-purple-600" />
                <span>{event.organizer.fullName}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {event.price === 0 ? (
              <Badge variant="outline" className="text-green-600">
                Free
              </Badge>
            ) : (
              <span className="font-semibold text-sm">
                {event.price.toLocaleString()} {event.currency}
              </span>
            )}
            <Button asChild size="sm">
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-2">
            Discover and join drone community events, workshops, and competitions
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location === "all" ? "All Locations" : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="mb-6">
        <TabsList>
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or check back later for new events.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
