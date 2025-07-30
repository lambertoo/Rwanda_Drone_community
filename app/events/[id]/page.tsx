import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowLeft, Globe, Phone, Mail, Star } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default function EventDetailsPage({ params }: PageProps) {
  const eventId = params.id

  // Mock event data - in real app, this would come from a database
  const eventDetails = {
    "1": {
      title: "Drone Safety Training Workshop",
      date: "March 15, 2024",
      time: "9:00 AM - 5:00 PM",
      location: "Kigali Convention Centre",
      address: "KG 2 Roundabout, Kigali, Rwanda",
      type: "Training",
      organizer: "Rwanda Drone Academy",
      attendees: 45,
      maxAttendees: 60,
      price: "Free",
      description:
        "Comprehensive drone safety training covering RCAA regulations, flight planning, and emergency procedures. This full-day workshop is designed for both beginners and experienced pilots who want to enhance their safety knowledge and compliance with Rwanda's drone regulations.",
      image: "/placeholder.svg?height=400&width=800&text=Drone+Safety+Training",
      featured: true,
      agenda: [
        { time: "9:00 AM - 9:30 AM", activity: "Registration and Welcome Coffee" },
        { time: "9:30 AM - 11:00 AM", activity: "RCAA Regulations Overview" },
        { time: "11:00 AM - 11:15 AM", activity: "Coffee Break" },
        { time: "11:15 AM - 12:30 PM", activity: "Flight Planning and Risk Assessment" },
        { time: "12:30 PM - 1:30 PM", activity: "Lunch Break" },
        { time: "1:30 PM - 3:00 PM", activity: "Emergency Procedures and Safety Protocols" },
        { time: "3:00 PM - 3:15 PM", activity: "Coffee Break" },
        { time: "3:15 PM - 4:30 PM", activity: "Practical Safety Demonstrations" },
        { time: "4:30 PM - 5:00 PM", activity: "Q&A and Certification" },
      ],
      requirements: [
        "Basic understanding of drone operations",
        "Bring your own drone (if available)",
        "Valid ID for registration",
        "Notebook and pen for taking notes",
      ],
      organizer_info: {
        name: "Rwanda Drone Academy",
        description: "Leading drone training institution in Rwanda, certified by RCAA",
        website: "www.rwandadroneacademy.rw",
        email: "info@rwandadroneacademy.rw",
        phone: "+250 788 123 456",
      },
      reviews: [
        { name: "John Mugisha", rating: 5, comment: "Excellent training! Very comprehensive and practical." },
        { name: "Sarah Uwimana", rating: 5, comment: "Great instructors and well-organized event." },
        { name: "David Nkurunziza", rating: 4, comment: "Learned a lot about safety regulations. Highly recommended." },
      ],
    },
    "2": {
      title: "Rwanda Drone Racing Championship",
      date: "March 25, 2024",
      time: "2:00 PM - 6:00 PM",
      location: "Nyamirambo Stadium",
      address: "Nyamirambo, Kigali, Rwanda",
      type: "Competition",
      organizer: "Rwanda FPV Racing Club",
      attendees: 120,
      maxAttendees: 200,
      price: "10,000 RWF",
      description:
        "Annual drone racing competition featuring the best FPV pilots from across Rwanda. Watch thrilling high-speed races through challenging obstacle courses and cheer for your favorite pilots!",
      image: "/placeholder.svg?height=400&width=800&text=Drone+Racing+Championship",
      featured: true,
      agenda: [
        { time: "2:00 PM - 2:30 PM", activity: "Registration and Practice Rounds" },
        { time: "2:30 PM - 3:00 PM", activity: "Opening Ceremony" },
        { time: "3:00 PM - 4:00 PM", activity: "Qualifying Rounds" },
        { time: "4:00 PM - 4:15 PM", activity: "Break" },
        { time: "4:15 PM - 5:30 PM", activity: "Championship Finals" },
        { time: "5:30 PM - 6:00 PM", activity: "Awards Ceremony" },
      ],
      requirements: [
        "Entry fee: 10,000 RWF",
        "Own FPV racing drone required for participants",
        "Spectators welcome",
        "Age limit: 16+ for participants",
      ],
      organizer_info: {
        name: "Rwanda FPV Racing Club",
        description: "Premier FPV racing community in Rwanda",
        website: "www.rwandafpv.com",
        email: "racing@rwandafpv.com",
        phone: "+250 788 987 654",
      },
      reviews: [
        { name: "Alex Kamanzi", rating: 5, comment: "Amazing event! The racing was incredible to watch." },
        { name: "Grace Mukamana", rating: 5, comment: "Well organized competition with great prizes." },
      ],
    },
  }

  const event = eventDetails[eventId as keyof typeof eventDetails]

  if (!event) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">The event you're looking for doesn't exist.</p>
        </Card>
      </div>
    )
  }

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
      <div className="flex items-center gap-4">
        <Link href="/events">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        </div>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                {event.featured && <Badge variant="secondary">Featured</Badge>}
              </div>
              <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
              <CardDescription className="text-lg">Organized by {event.organizer}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{event.price}</div>
              <div className="text-sm text-muted-foreground">
                {event.attendees}/{event.maxAttendees} registered
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{event.date}</div>
                    <div className="text-sm text-muted-foreground">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-sm text-muted-foreground">{event.address}</div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle>Event Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex gap-4 p-3 rounded-lg bg-gray-50">
                    <div className="font-mono text-sm text-blue-600 min-w-fit">{item.time}</div>
                    <div className="font-medium">{item.activity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements & What to Bring</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {event.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Reviews */}
          {event.reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews from Previous Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.reviews.map((review, index) => (
                  <div key={index} className="border-l-4 border-blue-200 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.name}</span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle>Register for Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{event.price}</div>
                <div className="text-sm text-muted-foreground mb-4">
                  {event.maxAttendees - event.attendees} spots remaining
                </div>
              </div>
              <Button className="w-full" size="lg">
                Register Now
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {event.attendees} people registered
              </div>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{event.organizer_info.name}</h4>
                <p className="text-sm text-muted-foreground">{event.organizer_info.description}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a href={`https://${event.organizer_info.website}`} className="text-blue-600 hover:underline">
                    {event.organizer_info.website}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${event.organizer_info.email}`} className="text-blue-600 hover:underline">
                    {event.organizer_info.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${event.organizer_info.phone}`} className="text-blue-600 hover:underline">
                    {event.organizer_info.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Event */}
          <Card>
            <CardHeader>
              <CardTitle>Share Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                Share on Social Media
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Copy Event Link
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
