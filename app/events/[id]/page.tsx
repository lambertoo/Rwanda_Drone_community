"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Calendar, MapPin, Users, Share2, Heart, MessageCircle, Star, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

// Mock data for event details
const eventDetails = {
  1: {
    id: 1,
    title: "Drone Racing Championship 2024",
    description:
      "Join us for the most exciting drone racing event of the year! This championship brings together the best drone pilots from across Rwanda and the region for an action-packed day of high-speed racing, technical challenges, and community celebration.",
    fullDescription: `
      The Rwanda Drone Racing Championship 2024 is the premier drone racing event in East Africa. This year's championship features multiple racing categories, from beginner-friendly courses to professional-level challenges that will test even the most skilled pilots.

      What to expect:
      • Multiple racing categories (Beginner, Intermediate, Professional)
      • Technical challenges and obstacle courses
      • Live streaming and commentary
      • Vendor booths showcasing the latest drone technology
      • Networking opportunities with industry professionals
      • Prizes worth over 500,000 RWF

      Whether you're a seasoned pilot or just getting started with drones, this event offers something for everyone. Come witness the future of drone racing and be part of Rwanda's growing drone community!
    `,
    date: "2024-03-15",
    time: "09:00",
    endTime: "17:00",
    location: "Kigali Convention Centre",
    address: "KG 2 Roundabout, Kigali, Rwanda",
    category: "Competition",
    attendees: 150,
    maxAttendees: 200,
    price: "Free",
    organizer: "Rwanda Drone Racing Association",
    organizerAvatar: "/placeholder.svg?height=40&width=40&text=RDRA",
    image: "/placeholder.svg?height=400&width=800&text=Drone+Racing+Championship",
    gallery: [
      "/placeholder.svg?height=300&width=400&text=Racing+Track",
      "/placeholder.svg?height=300&width=400&text=Pilots+Preparing",
      "/placeholder.svg?height=300&width=400&text=Award+Ceremony",
      "/placeholder.svg?height=300&width=400&text=Spectators",
    ],
    agenda: [
      { time: "09:00", activity: "Registration and Check-in" },
      { time: "10:00", activity: "Opening Ceremony" },
      { time: "10:30", activity: "Beginner Category Races" },
      { time: "12:00", activity: "Lunch Break" },
      { time: "13:00", activity: "Intermediate Category Races" },
      { time: "14:30", activity: "Professional Category Races" },
      { time: "16:00", activity: "Awards Ceremony" },
      { time: "17:00", activity: "Networking and Closing" },
    ],
    speakers: [
      {
        name: "Jean Baptiste Uwimana",
        role: "Professional Drone Pilot",
        avatar: "/placeholder.svg?height=60&width=60&text=JBU",
        bio: "3-time national champion and international competitor",
      },
      {
        name: "Marie Claire Mukamana",
        role: "Drone Technology Expert",
        avatar: "/placeholder.svg?height=60&width=60&text=MCM",
        bio: "Leading researcher in autonomous flight systems",
      },
    ],
    requirements: [
      "Own drone (rentals available on-site)",
      "Valid pilot license or beginner certification",
      "Safety gear (provided if needed)",
      "Registration 24 hours in advance",
    ],
    tags: ["racing", "competition", "drones", "technology", "sports"],
  },
}

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = Number.parseInt(params.id as string)
  const event = eventDetails[eventId as keyof typeof eventDetails]
  const [isRegistered, setIsRegistered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!event) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/events">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
        </Button>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Workshop: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Competition: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      Training: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Demo: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Conference: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/events">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="relative">
        <div className="aspect-[2/1] rounded-lg overflow-hidden">
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/40 rounded-lg" />
        <div className="absolute bottom-6 left-6 right-6 text-white">
          <Badge className={`mb-2 ${getCategoryColor(event.category)}`}>{event.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-lg opacity-90">{event.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="speakers">Speakers</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {event.fullDescription.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {event.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agenda" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Event Schedule</CardTitle>
                  <CardDescription>Detailed timeline for {new Date(event.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda.map((item, index) => (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                        <div className="w-16 text-sm font-medium text-primary">{item.time}</div>
                        <div className="flex-1">
                          <p className="font-medium">{item.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="speakers" className="space-y-4">
              <div className="grid gap-4">
                {event.speakers.map((speaker, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={speaker.avatar || "/placeholder.svg"} alt={speaker.name} />
                          <AvatarFallback>
                            {speaker.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{speaker.name}</h3>
                          <p className="text-primary font-medium">{speaker.role}</p>
                          <p className="text-muted-foreground mt-2">{speaker.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.gallery.map((image, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.time} - {event.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {event.attendees}/{event.maxAttendees} attendees
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.maxAttendees - event.attendees} spots remaining
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Price</span>
                  <span className="text-lg font-bold text-primary">{event.price}</span>
                </div>

                <Button className="w-full" size="lg" onClick={() => setIsRegistered(!isRegistered)}>
                  {isRegistered ? "Cancel Registration" : "Register Now"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => setIsFavorited(!isFavorited)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                    {isFavorited ? "Saved" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizer Card */}
          <Card>
            <CardHeader>
              <CardTitle>Organizer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={event.organizerAvatar || "/placeholder.svg"} alt={event.organizer} />
                  <AvatarFallback>
                    {event.organizer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{event.organizer}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-current text-yellow-400" />
                    <span className="text-sm text-muted-foreground">4.8 (24 events)</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Organizer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
