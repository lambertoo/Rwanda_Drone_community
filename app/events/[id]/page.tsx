'use client'

import { useState, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdvancedRegistrationForm from "@/components/events/advanced-registration-form"

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
  allowRegistration: boolean
  registrationFormId?: string
  isPublished: boolean
  isFeatured: boolean
  organizerId: string
  organizer: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
    eventsCount?: number
  }
  requirements: string[]
  tags: string[]
  speakers: string[]
  agenda: string[]
  gallery: string[]
  flyer?: string
  registrationFields?: {
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
  }[];
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventId, setEventId] = useState<string>("")
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'registered' | 'loading'>('none')
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    
    const getEventId = async () => {
      try {
        const { id } = await params
        if (mounted) {
          setEventId(id)
          console.log('EventDetailPage - Event ID set:', id)
          await fetchEvent(id)
        }
      } catch (err) {
        if (mounted) {
          console.error('Error getting event ID:', err)
          setError('Failed to get event ID')
          setLoading(false)
        }
      }
    }
    
    getEventId()
    
    return () => {
      mounted = false
    }
  }, [params])

  useEffect(() => {
    if (user && eventId && event) {
      checkRsvpStatus(eventId)
    }
  }, [user, eventId, event])

  const fetchEvent = async (id: string) => {
    try {
      console.log('EventDetailPage - Fetching event:', id)
      setLoading(true)
      
      const response = await fetch(`/api/events/${id}`)
      console.log('EventDetailPage - API response:', { status: response.status, ok: response.ok })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('EventDetailPage - Event data received:', data.event)
      
      if (data.event) {
        setEvent(data.event)
        console.log('EventDetailPage - Event state updated')
      } else {
        throw new Error('No event data received')
      }
    } catch (err) {
      console.error('EventDetailPage - Error fetching event:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      console.log('EventDetailPage - Setting loading to false')
      setLoading(false)
    }
  }

  const checkRsvpStatus = async (id: string) => {
    if (!user || !event) return
    
    // Only check RSVP status if the event doesn't have a registration form
    if (event.registrationFormId) {
      setRsvpStatus('none')
      return
    }
    
    try {
      const response = await fetch(`/api/events/${id}/rsvp`, {
        credentials: 'include'
      })
      setRsvpStatus(response.ok ? 'registered' : 'none')
    } catch (err) {
      setRsvpStatus('none')
    }
  }

  const handleRSVP = async () => {
    if (!user) {
      window.location.href = '/login'
      return
    }

    setRsvpStatus('loading')
    
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setRsvpStatus('registered')
        // Refresh event data to update counts
        await fetchEvent(eventId)
      }
    } catch (err) {
      setRsvpStatus('none')
    }
  }

  const handleCancelRSVP = async () => {
    setRsvpStatus('loading')
    
    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        setRsvpStatus('none')
        // Refresh event data to update counts
        await fetchEvent(eventId)
      }
    } catch (err) {
      setRsvpStatus('registered')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderRSVPButton = () => {
    if (!event.allowRegistration) {
      return (<Button disabled className="w-full">Registration Closed</Button>)
    }
    if (!user) {
      return (<Button asChild className="w-full"><Link href="/login">Log In to Register</Link></Button>)
    }
    
    // If event has a registration form, redirect to the form
    if (event.registrationFormId) {
      return (
        <Button asChild className="w-full">
          <Link href={`/forms/public/${event.registrationFormId}`}>
            Register
          </Link>
        </Button>
      )
    }
    
    // Fallback to the old RSVP system if no registration form
    if (rsvpStatus === 'registered') {
      return (
        <Button
          variant="outline"
          className="w-full text-green-600 border-green-600 hover:bg-green-50"
          onClick={handleCancelRSVP}
          disabled={rsvpStatus === 'loading'}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {rsvpStatus === 'loading' ? 'Canceling...' : 'Registered'}
        </Button>
      )
    }
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="w-full"
            onClick={handleRSVP}
            disabled={rsvpStatus === 'loading'}
          >
            {rsvpStatus === 'loading' ? 'Registering...' : 'Register Now'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register for {event.title}</DialogTitle>
          </DialogHeader>
          <AdvancedRegistrationForm
            eventId={eventId}
            fields={event.registrationFields || []}
            onComplete={(data) => {
              console.log('Registration completed:', data)
              setRsvpStatus('registered')
            }}
          />
        </DialogContent>
      </Dialog>
    )
  }

  if (loading) {
    console.log('EventDetailPage - Loading state:', { loading, event, user })
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading event...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The event you are looking for does not exist.'}
            </p>
            <Button asChild>
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/events" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>

        {/* Event Header */}
        <div className="mb-8">
          {event.category && (
          <Badge variant="secondary" className="mb-4">
              {event.category.name}
          </Badge>
          )}
          
          {/* Event Flyer/Thumbnail */}
          {event.flyer ? (
            <div className="mb-6">
              <img 
                src={event.flyer} 
                alt={`${event.title} flyer`}
                className="w-full max-w-2xl h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="mb-6 w-full max-w-2xl h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No flyer uploaded</p>
              </div>
            </div>
          )}
          
          <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {event.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Content */}
          <div className="lg:col-span-2">
            {/* Event Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
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
                <p className="text-muted-foreground mb-4">
                      {event.fullDescription || event.description}
                    </p>
                    
                    {event.requirements && event.requirements.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Requirements</h4>
                        <ul className="space-y-2">
                          {event.requirements.map((req: any, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{req.label || req}</span>
                  </li>
                          ))}
                </ul>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                <div className="mt-6">
                        <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="outline">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="agenda" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Agenda</CardTitle>
                    <CardDescription>Detailed schedule and timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.agenda && event.agenda.length > 0 ? (
                      <div className="space-y-4">
                        {event.agenda.map((item: any, index: number) => (
                          <div key={index} className="flex gap-4 p-4 border rounded-lg">
                            <div className="flex-shrink-0">
                              <div className="w-16 text-center">
                                <div className="text-lg font-bold text-primary">{item.time}</div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{item.title}</h4>
                              <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No agenda available for this event.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="speakers" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Speakers</CardTitle>
                    <CardDescription>Meet the experts and presenters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.speakers && event.speakers.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {event.speakers.map((speaker: string, index: number) => (
                          <div key={index} className="p-4 border rounded-lg text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-white font-bold text-lg">
                                {speaker.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-semibold">{speaker}</h4>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No speakers announced for this event.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Gallery</CardTitle>
                    <CardDescription>Photos and media from the event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.gallery && event.gallery.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {event.gallery.map((image: string, index: number) => (
                          <div key={index} className="aspect-video">
                            <img 
                              src={image} 
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No gallery images available yet.</p>
                    )}
              </CardContent>
            </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Event Info & Actions */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{event.venue}, {event.location}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>
                    {event.registeredCount || 0}/{event.capacity || '∞'} attendees
                    {event.capacity && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({Math.max(0, event.capacity - (event.registeredCount || 0))} spots remaining)
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-2xl font-bold">
                    {event.price === 0 ? 'Free' : `${event.price.toLocaleString()} ${event.currency}`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RSVP Card */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {renderRSVPButton()}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Save</Button>
                  <Button variant="outline" className="flex-1">Share</Button>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {event.organizer.fullName?.charAt(0) || 'O'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.fullName}</p>
                    {event.organizer.organization && (
                      <p className="text-sm text-muted-foreground">{event.organizer.organization}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-muted-foreground">({event.organizer.eventsCount || 0} events)</span>
                </div>
                
                <Button variant="outline" className="w-full">
                  Contact Organizer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Participants Table - Only visible to event organizer and admin */}
        {event.organizerId === user?.id || user?.role === 'admin' ? (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Event Participants</CardTitle>
              <CardDescription>
                {event.registeredCount || 0} registered participants
              </CardDescription>
            </CardHeader>
            <CardContent>
              {event.registeredCount > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Role</th>
                        <th className="text-left py-2 font-medium">Registration Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* This will be populated with actual participant data from RSVPs */}
                      <tr className="border-b">
                        <td className="py-2">Sample Participant</td>
                        <td className="py-2">participant@example.com</td>
                        <td className="py-2">Student</td>
                        <td className="py-2 text-muted-foreground">
                          {new Date().toLocaleDateString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No participants registered yet</p>
        </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
} 