import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  Star,
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
} from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: {
    id: string
  }
}

export default function EventDetailsPage({ params }: PageProps) {
  const eventId = params.id

  // Mock event data - in real app this would come from database
  const event = {
    id: eventId,
    title: "Drone Photography Workshop - Kigali",
    description:
      "Join us for an intensive drone photography workshop where you'll learn advanced techniques for capturing stunning aerial photographs and videos. This hands-on workshop is perfect for both beginners and experienced pilots looking to improve their photography skills.",
    fullDescription: `# About This Workshop

This comprehensive drone photography workshop is designed to take your aerial photography skills to the next level. Whether you're a beginner looking to get started or an experienced pilot wanting to refine your techniques, this workshop offers something for everyone.

## What You'll Learn

### Technical Skills
- Camera settings and exposure control
- Composition techniques for aerial photography
- Understanding lighting conditions
- Post-processing workflows
- Equipment selection and maintenance

### Creative Techniques
- Storytelling through aerial imagery
- Capturing unique perspectives
- Working with different weather conditions
- Planning and executing complex shots
- Building a professional portfolio

### Legal and Safety
- RCAA regulations for photography
- Flight planning and risk assessment
- Insurance considerations
- Client communication and contracts

## Workshop Format

The workshop combines theoretical sessions with hands-on flying practice. You'll work in small groups with experienced instructors, ensuring personalized attention and feedback.

### Day 1: Fundamentals
- Morning: Theory and equipment overview
- Afternoon: Basic flying and camera operation
- Evening: Image review and feedback

### Day 2: Advanced Techniques
- Morning: Advanced composition and lighting
- Afternoon: Complex flight maneuvers
- Evening: Post-processing workshop

## Equipment Provided

We provide all necessary equipment for the workshop, including:
- DJI Air 2S drones
- Extra batteries and memory cards
- Tablets for flight control
- ND filters and accessories

You're welcome to bring your own drone if you prefer to practice with your equipment.`,
    date: "March 15, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Kigali Convention Centre",
    address: "KG 2 Roundabout, Kigali, Rwanda",
    price: "75,000 RWF",
    capacity: 20,
    registered: 15,
    category: "Workshop",
    level: "All Levels",
    duration: "2 days",
    organizer: {
      name: "Rwanda Drone Academy",
      avatar: "/placeholder-logo.png",
      website: "https://rwandadroneacademy.com",
      email: "info@rwandadroneacademy.com",
      phone: "+250 788 123 456",
      description: "Leading drone training institution in Rwanda, certified by RCAA",
    },
    instructors: [
      {
        name: "Jean Claude Uwimana",
        role: "Lead Instructor",
        avatar: "/placeholder-user.jpg",
        experience: "5+ years",
        specialization: "Commercial Photography",
      },
      {
        name: "Sarah Mukamana",
        role: "Photography Expert",
        avatar: "/placeholder-user.jpg",
        experience: "8+ years",
        specialization: "Landscape & Tourism",
      },
    ],
    agenda: [
      {
        time: "9:00 AM",
        title: "Registration & Welcome",
        description: "Check-in, equipment distribution, and introductions",
      },
      {
        time: "9:30 AM",
        title: "Drone Photography Fundamentals",
        description: "Camera settings, composition basics, and safety protocols",
      },
      {
        time: "11:00 AM",
        title: "Hands-on Flying Session 1",
        description: "Basic maneuvers and camera operation practice",
      },
      {
        time: "12:30 PM",
        title: "Lunch Break",
        description: "Networking lunch with fellow participants",
      },
      {
        time: "1:30 PM",
        title: "Advanced Techniques",
        description: "Complex shots, lighting, and creative composition",
      },
      {
        time: "3:00 PM",
        title: "Hands-on Flying Session 2",
        description: "Practice advanced techniques with instructor guidance",
      },
      {
        time: "4:30 PM",
        title: "Image Review & Feedback",
        description: "Review captured images and receive professional feedback",
      },
      {
        time: "5:00 PM",
        title: "Wrap-up & Certificates",
        description: "Q&A session and certificate presentation",
      },
    ],
    requirements: [
      "Valid RCAA drone registration (if bringing own drone)",
      "Basic understanding of photography concepts",
      "Laptop for post-processing session",
      "Comfortable outdoor clothing",
      "Notebook and pen for taking notes",
    ],
    included: [
      "Professional drone equipment",
      "All batteries and accessories",
      "Lunch and refreshments",
      "Course materials and handouts",
      "Certificate of completion",
      "Follow-up support via WhatsApp group",
    ],
    reviews: [
      {
        author: "PhotoDrone_RW",
        avatar: "/placeholder-user.jpg",
        rating: 5,
        comment:
          "Excellent workshop! The instructors were knowledgeable and the hands-on practice was invaluable. Highly recommended for anyone serious about drone photography.",
        date: "2 weeks ago",
      },
      {
        author: "AerialArtist",
        avatar: "/placeholder-user.jpg",
        rating: 5,
        comment:
          "Great balance of theory and practice. Learned techniques I never would have discovered on my own. The small group size allowed for personalized attention.",
        date: "1 month ago",
      },
      {
        author: "BusinessPilot",
        avatar: "/placeholder-user.jpg",
        rating: 4,
        comment:
          "Very professional setup and great content. Would have liked more time on post-processing, but overall excellent value for money.",
        date: "2 months ago",
      },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{event.category}</Badge>
                    <Badge variant="secondary">{event.level}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                  <p className="text-lg text-muted-foreground mb-4">{event.description}</p>

                  {/* Event Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>
                        {event.registered}/{event.capacity} registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Heart className="h-4 w-4" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Bookmark className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Event Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{event.fullDescription}</div>
              </div>
            </CardContent>
          </Card>

          {/* Agenda */}
          <Card>
            <CardHeader>
              <CardTitle>Event Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.agenda.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-20 text-sm font-medium text-blue-600">{item.time}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requirements & What's Included */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructors */}
          <Card>
            <CardHeader>
              <CardTitle>Meet Your Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {event.instructors.map((instructor, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
                      <AvatarFallback>
                        {instructor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{instructor.name}</h4>
                      <p className="text-sm text-blue-600 mb-1">{instructor.role}</p>
                      <p className="text-sm text-muted-foreground mb-1">{instructor.experience} experience</p>
                      <p className="text-sm">{instructor.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Reviews from Previous Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {event.reviews.map((review, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.author} />
                        <AvatarFallback>{review.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.author}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                    {index < event.reviews.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Register Now</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{event.price}</div>
                <div className="text-sm text-muted-foreground">per person</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available spots:</span>
                  <span className="font-semibold">{event.capacity - event.registered}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration:</span>
                  <span>{event.duration}</span>
                </div>
              </div>

              <Button className="w-full" size="lg">
                Register Now
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment • Full refund if cancelled 48h before event
              </p>
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Organizer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={event.organizer.avatar || "/placeholder.svg"} alt={event.organizer.name} />
                  <AvatarFallback>
                    {event.organizer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{event.organizer.name}</h4>
                  <p className="text-sm text-muted-foreground">{event.organizer.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4" />
                  <a href={event.organizer.website} className="text-blue-600 hover:underline">
                    {event.organizer.website}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${event.organizer.email}`} className="text-blue-600 hover:underline">
                    {event.organizer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${event.organizer.phone}`} className="text-blue-600 hover:underline">
                    {event.organizer.phone}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">{event.location}</h4>
                  <p className="text-sm text-muted-foreground">{event.address}</p>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
