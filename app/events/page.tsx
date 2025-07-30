import { Card, CardContent, Badge, Button } from "ui-components"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

const events = [
  {
    category: "Conference",
    level: "Beginner",
    title: "Tech Conference 2023",
    description: "Join us for the latest in technology and innovation.",
    date: "2023-10-01",
    time: "10:00 AM - 5:00 PM",
    location: "Convention Center",
    registered: 150,
    capacity: 200,
    price: "$50",
  },
  // Add more events here
]

const EventsPage = () => {
  const filteredEvents = events.filter((event) => event.capacity > event.registered)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredEvents.map((event, index) => (
        <Link key={index} href={`/events/${index + 1}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {event.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {event.level}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 hover:text-blue-600">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>

                  <div className="space-y-2">
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

                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 mb-1">{event.price}</div>
                  <div className="text-xs text-muted-foreground mb-3">per person</div>
                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default EventsPage
