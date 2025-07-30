import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Phone, Mail, Globe, Search, CheckCircle } from "lucide-react"

export default function ServicesPage() {
  const serviceProviders = [
    {
      name: "Rwanda Aerial Solutions",
      category: "Mapping & Surveying",
      location: "Kigali",
      rating: 4.8,
      reviews: 24,
      description:
        "Professional drone mapping and surveying services for construction, agriculture, and land management.",
      services: ["3D Mapping", "Land Surveying", "Construction Monitoring", "Agricultural Analysis"],
      contact: {
        phone: "+250 788 123 456",
        email: "info@rwandaaerial.com",
        website: "www.rwandaaerial.com",
      },
      verified: true,
      image: "/placeholder.svg?height=200&width=300&text=Aerial+Mapping",
    },
    {
      name: "SkyView Photography",
      category: "Photography & Videography",
      location: "Kigali",
      rating: 4.9,
      reviews: 18,
      description: "Creative aerial photography and videography for events, real estate, and commercial projects.",
      services: ["Event Photography", "Real Estate", "Commercial Videos", "Wedding Photography"],
      contact: {
        phone: "+250 788 234 567",
        email: "hello@skyviewrw.com",
        website: "www.skyviewrw.com",
      },
      verified: true,
      image: "/placeholder.svg?height=200&width=300&text=Aerial+Photography",
    },
    {
      name: "AgriDrone Rwanda",
      category: "Agriculture",
      location: "Musanze",
      rating: 4.7,
      reviews: 31,
      description:
        "Specialized agricultural drone services including crop monitoring, precision spraying, and yield analysis.",
      services: ["Crop Monitoring", "Precision Spraying", "Yield Analysis", "Soil Mapping"],
      contact: {
        phone: "+250 788 345 678",
        email: "contact@agridrone.rw",
        website: "www.agridrone.rw",
      },
      verified: true,
      image: "/placeholder.svg?height=200&width=300&text=Agricultural+Drones",
    },
    {
      name: "DroneRepair Pro",
      category: "Repair & Maintenance",
      location: "Kigali",
      rating: 4.6,
      reviews: 42,
      description: "Expert drone repair and maintenance services for all major drone brands and models.",
      services: ["Hardware Repair", "Software Updates", "Preventive Maintenance", "Parts Replacement"],
      contact: {
        phone: "+250 788 456 789",
        email: "support@dronerepairpro.rw",
        website: "www.dronerepairpro.rw",
      },
      verified: false,
      image: "/placeholder.svg?height=200&width=300&text=Drone+Repair",
    },
    {
      name: "Rwanda Drone Academy",
      category: "Training & Education",
      location: "Kigali",
      rating: 4.9,
      reviews: 67,
      description: "Comprehensive drone training programs from beginner to professional pilot certification.",
      services: ["Pilot Training", "Safety Courses", "Commercial Certification", "Workshops"],
      contact: {
        phone: "+250 788 567 890",
        email: "info@rwandadroneacademy.com",
        website: "www.rwandadroneacademy.com",
      },
      verified: true,
      image: "/placeholder.svg?height=200&width=300&text=Drone+Training",
    },
    {
      name: "InspectAir Rwanda",
      category: "Inspection Services",
      location: "Huye",
      rating: 4.5,
      reviews: 19,
      description: "Professional drone inspection services for infrastructure, buildings, and industrial facilities.",
      services: ["Building Inspection", "Infrastructure Assessment", "Solar Panel Inspection", "Tower Inspection"],
      contact: {
        phone: "+250 788 678 901",
        email: "inspections@inspectair.rw",
        website: "www.inspectair.rw",
      },
      verified: true,
      image: "/placeholder.svg?height=200&width=300&text=Drone+Inspection",
    },
  ]

  const categories = [
    "All Categories",
    "Mapping & Surveying",
    "Photography & Videography",
    "Agriculture",
    "Repair & Maintenance",
    "Training & Education",
    "Inspection Services",
  ]

  const locations = ["All Locations", "Kigali", "Musanze", "Huye", "Rubavu", "Nyagatare"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drone Services Directory</h1>
          <p className="text-muted-foreground">Find trusted drone service providers across Rwanda</p>
        </div>
        <Button>List Your Service</Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search services..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((location) => (
              <SelectItem key={location} value={location.toLowerCase()}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Providers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceProviders.map((provider, index) => (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-r from-blue-100 to-green-100">
              <img
                src={provider.image || "/placeholder.svg"}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {provider.name}
                    {provider.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{provider.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{provider.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({provider.reviews} reviews)</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{provider.description}</p>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Services:</h4>
                <div className="flex flex-wrap gap-1">
                  {provider.services.map((service, serviceIndex) => (
                    <Badge key={serviceIndex} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{provider.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{provider.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{provider.contact.website}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View Details
                </Button>
                <Button size="sm" className="flex-1">
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Don't see your service listed?</h3>
          <p className="text-muted-foreground mb-4">
            Join our directory and connect with drone enthusiasts across Rwanda
          </p>
          <Button>Add Your Service</Button>
        </CardContent>
      </Card>
    </div>
  )
}
