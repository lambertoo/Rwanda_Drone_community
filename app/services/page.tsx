"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Phone, Mail, Globe, Plus } from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  category: string
  region: string
  contact: string
  phone?: string
  email?: string
  website?: string
  services?: string
  rating: number
  reviewCount: number
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  provider: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
    isVerified: boolean
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("all")
  const [region, setRegion] = useState("all")

  // Prevent hydration mismatch by ensuring client-side rendering
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams()
      if (category && category !== 'all') params.append('category', category)
      if (region && region !== 'all') params.append('region', region)
      
      const response = await fetch(`/api/services?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setServices(data.services || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchServices()
    }
  }, [category, region, mounted])

  if (!mounted) {
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

  const formatRegion = (region: string) => {
    return region.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      let className = 'h-4 w-4'
      
      if (starValue <= rating) {
        className += ' fill-yellow-400 text-yellow-400'
      } else if (starValue - 0.5 <= rating) {
        className += ' fill-yellow-400 text-yellow-400'
      } else {
        className += ' text-gray-300'
      }
      
      return (
        <Star
          key={i}
          className={className}
        />
      )
    })
  }

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Drone Services Directory</h1>
        <p className="text-lg text-muted-foreground">
          Find trusted drone service providers across Rwanda
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Mapping & Surveying">Mapping & Surveying</SelectItem>
              <SelectItem value="Photography & Videography">Photography & Videography</SelectItem>
              <SelectItem value="Agriculture">Agriculture</SelectItem>
              <SelectItem value="Repair & Maintenance">Repair & Maintenance</SelectItem>
              <SelectItem value="Training & Education">Training & Education</SelectItem>
              <SelectItem value="Inspection Services">Inspection Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="KIGALI_NYARUGENGE">Kigali - Nyarugenge</SelectItem>
              <SelectItem value="KIGALI_KICUKIRO">Kigali - Kicukiro</SelectItem>
              <SelectItem value="KIGALI_GASABO">Kigali - Gasabo</SelectItem>
              <SelectItem value="NORTH_MUSANZE">Musanze</SelectItem>
              <SelectItem value="SOUTH_HUYE">Huye</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link href="/services/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            List Your Service
          </Button>
        </Link>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          let serviceList: string[] = []
          try {
            serviceList = service.services ? JSON.parse(service.services) : []
          } catch (error) {
            console.error('Error parsing services for service:', service.id, error)
            serviceList = []
          }
          
          return (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        {service.provider.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {formatRegion(service.region)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(service.rating)}
                          <span className="text-sm font-medium ml-1">{service.rating}</span>
                        </div>
                        {service.isFeatured && (
                          <Badge variant="default" className="text-xs">Featured</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="text-xs">{service.category}</Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    ({service.reviewCount} reviews)
                  </p>

                  {/* Description */}
                  <p className="text-sm">{service.description}</p>

                  {/* Services Offered */}
                  {serviceList.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Services:</h4>
                      <div className="flex flex-wrap gap-1">
                        {serviceList.slice(0, 3).map((serviceItem: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {serviceItem}
                          </Badge>
                        ))}
                        {serviceList.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{serviceList.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="space-y-2">
                    {service.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{service.phone}</span>
                      </div>
                    )}
                    {service.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{service.email}</span>
                      </div>
                    )}
                    {service.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span>{service.website}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Link href={`/services/${service.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No services found matching your criteria.</p>
            <Link href="/services/new">
              <Button>Add Your Service</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Don't see your service listed?</h2>
          <p className="text-muted-foreground mb-6">
            Join our directory and connect with drone enthusiasts across Rwanda
          </p>
          <Link href="/services/new">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Add Your Service
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
