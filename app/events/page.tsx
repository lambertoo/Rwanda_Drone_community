import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, Plus } from "lucide-react"

export default function EventsPage() {
  const upcomingEvents = [
    {
      title: "Drone Safety Training Workshop",
      date: "March 15, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Kigali Convention Centre",
      type: "Training",
      organizer: "Rwanda Drone Academy",
      attendees: 45,
      maxAttendees: 60,
      price: "Free",
      description:
        "Comprehensive drone safety training covering RCAA regulations, flight planning, and emergency procedures.",
      image: "/placeholder.svg?height=200&width=400",
      featured: true,
    },
    {
      title: "Agricultural Drone Technology Demo",
      date: "March 20, 2024",
      time: "10:00 AM - 3:00 PM",
      location: "Musanze Agricultural Center",
      type: "Demo",
      organizer: "AgriDrone Rwanda",
      attendees: 28,
      maxAttendees: 40,
      price: "5,000 RWF",
      description:
        "Live demonstration of agricultural drone applications including crop monitoring and precision spraying.",
      image: "/placeholder.svg?height=200&width=400",
      featured: false,
    },
    {
      title: "Rwanda Drone Racing Championship",
      date: "March 25, 2024",
      time: "2:00 PM - 6:00 PM",
      location: "Nyamirambo Stadium",
      type: "Competition",
      organizer: "Rwanda FPV Racing Club",
      attendees: 120,
      maxAttendees: 200,
      price: "10,000 RWF",
      description: "Annual drone racing competition featuring the best FPV pilots from across Rwanda.",
      image: "/placeholder.svg?height=200&width=400",
      featured: true,
    },
    {
      title: "Drone Photography Masterclass",
      date: "April 2, 2024",
      time: "1:00 PM - 5:00 PM",
      location: "Kigali Heights",
      type: "Workshop",
      organizer: "SkyView Photography",
      attendees: 15,
      maxAttendees: 25,
      price: "15,000 RWF",
      description: "Advanced techniques for aerial photography and videography with professional equipment.",
      image: "/placeholder.svg?height=200&width=400",
      featured: false,
    },
    {
      title: "Drone Mapping for Construction",
      date: "April 8, 2024",
      time: "9:00 AM - 4:00 PM",
      location: "Rwanda Institute of Architects",
      type: "Training",
      organizer: "Rwanda Aerial Solutions",
      attendees: 22,
      maxAttendees: 30,
      price: "25,000 RWF",
      description: "Professional training on using drones for construction site mapping and progress monitoring.",
      image: "/placeholder.svg?height=200&width=400",
      featured: false,
    },
    {
      title: "Youth Drone Building Workshop",
      date: "April 12, 2024",
      time: "10:00 AM - 4:00 PM",
      location: "Kigali Public Library",
      type: "Workshop",
      organizer: "Rwanda STEM Foundation",
      attendees: 35,
      maxAttendees: 50,
      price: "Free",
      description:
        "Hands-on workshop for young people to learn about drone technology and build their own mini drones.",
      image: "/placeholder.svg?height=200&width=400",
      featured: false,
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Training":
        return "bg-blue-100 text-blue-800"
      case "Demo":
        return "bg-green-100 text-green-800"
      case "Competition":
        return "bg-red-100 text-red-800"
      case "Workshop":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events & Meetups</h1>
          <p className="text-muted-foreground">Discover and join drone community events across Rwanda</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Submit Event
        </Button>
      </div>

      {/* Featured Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Featured Events</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {upcomingEvents
            .filter((event) => event.featured)
            .map((event, index) => (
              <Card key={index} className="overflow-hidden border-2 border-blue-200">
                <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100 flex items-center justify-center">
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">by {event.organizer}</CardDescription>
                    </div>
                    <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.attendees}/{event.maxAttendees}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{event.description}</p>

                  <div className="flex items-center justify-between pt-2">
                    <div className="font-semibold text-lg">{event.price}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                      <Button size="sm">Register</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* All Events */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Upcoming Events</h2>
        <div className="grid gap-4">
          {upcomingEvents.map((event, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <img
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">by {event.organizer}</p>
                      </div>
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees}/{event.maxAttendees} attendees
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="font-semibold text-lg">{event.price}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                      <Button size="sm">Register</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
