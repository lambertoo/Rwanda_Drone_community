"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Heart,
  Share2,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  MessageSquare,
  Star,
} from "lucide-react"
import { deleteEventAction } from "@/lib/actions"

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
  capacity?: number
  registeredCount: number
  registrationDeadline?: string
  allowRegistration: boolean
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
  speakers: any
  agenda: any
  requirements: any
  gallery: any
  tags?: any
  rsvps?: Array<{
    id: string
    status: string
    user: {
      id: string
      fullName: string
      avatar?: string
    }
  }>
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    const fetchEvent = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/events/${id}`)
        if (!response.ok) {
          router.push('/404')
          return
        }
        const data = await response.json()
        setEvent(data.event)
      } catch (error) {
        console.error('Error fetching event:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [params, router])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return <div>Event not found</div>
  }

  // Use parsed data from API (now returns arrays/objects instead of strings)
  const requirements = Array.isArray(event.requirements) ? event.requirements : []
  const speakers = Array.isArray(event.speakers) ? event.speakers : []
  const agenda = Array.isArray(event.agenda) ? event.agenda : []
  const gallery = Array.isArray(event.gallery) ? event.gallery : []
  
  // Debug logging
  console.log('Event data:', event)
  console.log('Speakers:', speakers)
  console.log('Agenda:', agenda)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      await deleteEventAction(event.id)
      router.push('/events')
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/events"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Back to Events</span>
        <span className="sm:hidden">Back</span>
      </Link>

      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-[2/1] rounded-lg overflow-hidden">
          <img 
            src={event.gallery && event.gallery.length > 0 ? event.gallery[0].url : "/placeholder.svg?height=400&width=800&text=" + encodeURIComponent(event.title)} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 mb-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            {event.category?.name || 'Event'}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-base sm:text-lg opacity-90 line-clamp-2">{event.description}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Event Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="h-auto sm:h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Overview</TabsTrigger>
              <TabsTrigger value="agenda" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Agenda</TabsTrigger>
              <TabsTrigger value="speakers" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Speakers</TabsTrigger>
              <TabsTrigger value="gallery" className="text-xs sm:text-sm px-2 sm:px-3 py-2">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4 sm:space-y-6">
              {/* About This Event */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">About This Event</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="whitespace-pre-wrap text-sm sm:text-base">{event.fullDescription || event.description}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {(() => {
                try {
                  const reqs = Array.isArray(requirements) ? requirements : []
                  if (reqs.length > 0) {
                    return (
                      <Card>
                        <CardHeader className="p-4 sm:p-6">
                          <CardTitle className="text-lg sm:text-xl">Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <ul className="space-y-2">
                            {reqs.map((requirement: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <span className="text-sm sm:text-base">{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )
                  }
                  return null
                } catch (error) {
                  console.error('Error rendering requirements:', error)
                  return null
                }
              })()}

              {/* Tags */}
              {event.tags && (
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        try {
                          if (!event.tags) return []
                          let tags = event.tags
                          if (typeof tags === 'string') {
                            tags = JSON.parse(tags)
                            if (typeof tags === 'string') {
                              tags = JSON.parse(tags)
                            }
                          }
                          return Array.isArray(tags) ? tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          )) : []
                        } catch {
                          return []
                        }
                      })()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="agenda" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {agenda.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {agenda.map((item: any, index: number) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                          <div className="text-sm font-medium text-blue-600 min-w-[80px]">
                            {item.startTime} - {item.endTime}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm sm:text-base">{item.title}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                            {item.speaker && (
                              <p className="text-xs sm:text-sm text-blue-600 mt-1">
                                Speaker: {item.speaker}
                              </p>
                            )}
                            <Badge variant="outline" className="mt-2 text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">No agenda items available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="speakers" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {speakers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      {speakers.map((speaker: any, index: number) => {
                        // Handle both string names and speaker objects
                        const speakerName = typeof speaker === 'string' ? speaker : speaker.name || 'Unknown Speaker'
                        const speakerTitle = typeof speaker === 'string' ? 'Speaker' : speaker.title || 'Speaker'
                        const speakerBio = typeof speaker === 'string' ? '' : speaker.bio || ''
                        const speakerAvatar = typeof speaker === 'string' ? '/placeholder.svg' : speaker.avatar || '/placeholder.svg'
                        
                        return (
                          <div key={index} className="flex items-start gap-3 p-3 sm:p-4 border rounded-lg">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                              <AvatarImage src={speakerAvatar} alt={speakerName} />
                              <AvatarFallback>
                                {speakerName
                                  ? speakerName.split(" ").map((n: string) => n[0]).join("")
                                  : "SP"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base">{speakerName}</h4>
                              <p className="text-xs sm:text-sm text-blue-600 mb-1">{speakerTitle}</p>
                              {speakerBio && (
                                <p className="text-xs sm:text-sm text-muted-foreground">{speakerBio}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">No speakers available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 space-y-4">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {gallery.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {gallery.map((item: any, index: number) => (
                        <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img 
                            src={item.url || "/placeholder.jpg"} 
                            alt={item.caption || "Gallery image"} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm sm:text-base">No gallery images available.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Event Details & Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{formatDate(event.startDate)}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{event.venue}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">{event.registeredCount}/{event.capacity || '∞'} attendees</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {event.capacity ? `${event.capacity - event.registeredCount} spots remaining` : 'Open for registration'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-border h-[1px] w-full"></div>

              {/* Price and Actions */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Price</span>
                  <span className="text-base sm:text-lg font-bold text-primary">
                    {event.price === 0 ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`}
                  </span>
                </div>
                
                <Button className="w-full h-11 rounded-md px-8 text-sm sm:text-base">
                  Register Now
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-9 rounded-md px-3 bg-transparent text-xs sm:text-sm">
                    <Heart className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex-1 h-9 rounded-md px-3 bg-transparent text-xs sm:text-sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Organizer</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} alt={event.organizer.fullName} />
                  <AvatarFallback>
                    {event.organizer.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{event.organizer.fullName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-xs sm:text-sm text-muted-foreground">4.8 (24 events)</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 h-10 px-4 py-2 bg-transparent text-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Organizer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Admin Actions */}
      {user && (user.id === event.organizerId || user.role === "admin") && (
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <Link href={`/events/${event.id}/edit`} className="w-full sm:w-auto">
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            onClick={handleDelete}
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
