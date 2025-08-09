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
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/events" className="hover:text-foreground">
            Events
          </Link>
          <span>/</span>
          <span>Event Details</span>
        </div>
      </div>

      {/* Event Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{event.category?.name || 'Uncategorized'}</Badge>
          {event.isFeatured && (
            <Badge variant="default">Featured</Badge>
          )}
        </div>
        <h1 className="text-4xl font-bold">{event.title}</h1>
        <p className="text-lg text-muted-foreground">{event.description}</p>
      </div>

      {/* Event Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* About This Event */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{event.fullDescription || event.description}</div>
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
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {reqs.map((requirement: string, index: number) => (
                          <li key={index} className="text-sm">{requirement}</li>
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
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
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

          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Event Information */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{formatDate(event.startDate)}</div>
                    <div className="text-sm text-muted-foreground">{formatTime(event.startDate)} - {formatTime(event.endDate)}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.venue}</div>
                    <div className="text-sm text-muted-foreground">{event.location}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.registeredCount}/{event.capacity || '∞'} attendees</div>
                    <div className="text-sm text-muted-foreground">
                      {event.capacity ? `${event.capacity - event.registeredCount} spots remaining` : 'Open for registration'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Price and Actions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Price</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {event.price === 0 ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Register Now
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} alt={event.organizer.fullName} />
                  <AvatarFallback>
                    {event.organizer.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{event.organizer.fullName}</h4>
                  <p className="text-sm text-blue-600 mb-1">{event.organizer.organization || 'Event Organizer'}</p>
                  <p className="text-sm text-muted-foreground mb-2">4.8 (24 events)</p>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <ExternalLink className="h-3 w-3" />
                    Contact Organizer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card>
            <CardContent className="p-6">
              {agenda.length > 0 ? (
                <div className="space-y-4">
                  {agenda.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="text-sm font-medium text-blue-600 min-w-[80px]">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.title}</h4>
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
              ) : (
                <p className="text-muted-foreground">No agenda items available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speakers">
          <Card>
            <CardContent className="p-6">
              {/* Debug info */}
              <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2">Debug Info:</h4>
                <p>Speakers type: {typeof speakers}</p>
                <p>Speakers length: {speakers.length}</p>
                <p>Speakers data: {JSON.stringify(speakers)}</p>
              </div>
              
              {speakers.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {speakers.map((speaker: any, index: number) => {
                    // Handle both string names and speaker objects
                    const speakerName = typeof speaker === 'string' ? speaker : speaker.name || 'Unknown Speaker'
                    const speakerTitle = typeof speaker === 'string' ? 'Speaker' : speaker.title || 'Speaker'
                    const speakerBio = typeof speaker === 'string' ? '' : speaker.bio || ''
                    const speakerAvatar = typeof speaker === 'string' ? '/placeholder.svg' : speaker.avatar || '/placeholder.svg'
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={speakerAvatar} alt={speakerName} />
                          <AvatarFallback>
                            {speakerName
                              ? speakerName.split(" ").map((n: string) => n[0]).join("")
                              : "SP"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{speakerName}</h4>
                          <p className="text-sm text-blue-600 mb-1">{speakerTitle}</p>
                          {speakerBio && (
                            <p className="text-sm text-muted-foreground">{speakerBio}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No speakers available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardContent className="p-6">
              {gallery.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4">
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
                <p className="text-muted-foreground">No gallery images available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Actions */}
      {user && (user.id === event.organizerId || user.role === "admin") && (
        <div className="flex justify-end gap-2">
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button 
            onClick={handleDelete}
            variant="outline" 
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}
