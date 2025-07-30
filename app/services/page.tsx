import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Star, Search } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      name: "Rwanda Aerial Solutions",
      category: "Mapping & Surveying",
      location: "Kigali",
      rating: 4.8,
      reviews: 24,
      description:
        "Professional drone mapping and surveying services for construction, agriculture, and land development projects.",
      services: ["Topographic Mapping", "3D Modeling", "Land Surveying", "Progress Monitoring"],
      contact: {
        phone: "+250 788 123 456",
        email: "info@rwandaaerial.com",
      },
      verified: true,
    },
    {
      name: "AgriDrone Rwanda",
      category: "Agriculture",
      location: "Musanze",
      rating: 4.9,
      reviews: 18,
      description:
        "Specialized in agricultural drone services including crop monitoring, pest detection, and precision spraying.",
      services: ["Crop Monitoring", "Pest Detection", "Precision Spraying", "Yield Analysis"],
      contact: {
        phone: "+250 788 234 567",
        email: "contact@agridrone.rw",
      },
      verified: true,
    },
    {
      name: "SkyView Photography",
      category: "Photography & Videography",
      location: "Kigali",
      rating: 4.7,
      reviews: 32,
      description: "Creative aerial photography and videography for events, real estate, and commercial projects.",
      services: ["Event Photography", "Real Estate", "Commercial Videos", "Wedding Photography"],
      contact: {
        phone: "+250 788 345 678",
        email: "hello@skyviewrw.com",
      },
      verified: false,
    },
    {
      name: "DroneRepair Pro",
      category: "Repairs & Maintenance",
      location: "Huye",
      rating: 4.6,
      reviews: 15,
      description: "Expert drone repair and maintenance services for all major drone brands and models.",
      services: ["Hardware Repair", "Software Updates", "Maintenance", "Parts Replacement"],
      contact: {
        phone: "+250 788 456 789",
        email: "repair@droneproRW.com",
      },
      verified: true,
    },
    {
      name: "Rwanda Drone Academy",
      category: "Training & Certification",
      location: "Kigali",
      rating: 4.9,
      reviews: 45,
      description: "Comprehensive drone pilot training and certification programs approved by RCAA.",
      services: ["Pilot Training", "RCAA Certification", "Safety Courses", "Advanced Techniques"],
      contact: {
        phone: "+250 788 567 890",
        email: "training@droneacademy.rw",
      },
      verified: true,
    },
    {
      name: "InspectDrone Services",
      category: "Inspection",
      location: "Rubavu",
      rating: 4.5,
      reviews: 12,
      description: "Professional drone inspection services for infrastructure, buildings, and industrial facilities.",
      services: ["Building Inspection", "Infrastructure", "Solar Panels", "Power Lines"],
      contact: {
        phone: "+250 788 678 901",
        email: "inspect@droneinspect.rw",
      },
      verified: false,
    },
  ]

  const categories = [
    "All Categories",
    "Mapping & Surveying",
    "Agriculture",
    "Photography & Videography",
    "Repairs & Maintenance",
    "Training & Certification",
    "Inspection",
  ]

  const locations = ["All Locations", "Kigali", "Musanze", "Huye", "Rubavu", "Nyagatare", "Muhanga"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services Directory</h1>
          <p className="text-muted-foreground">Find trusted drone service providers across Rwanda</p>
        </div>
        <Button>List Your Service</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." className="pl-10" />
        </div>
        <Select defaultValue="All Categories">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="All Locations">
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {service.name}
                    {service.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {service.location}
                  </CardDescription>
                </div>
                <Badge variant="outline">{service.category}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{service.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({service.reviews} reviews)</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{service.description}</p>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Services Offered:</h4>
                <div className="flex flex-wrap gap-1">
                  {service.services.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  {service.contact.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {service.contact.email}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm">
                  Contact
                </Button>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
