"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ImageGallery from "@/components/ui/image-gallery"
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  Images,
  Info,
  User,
} from "lucide-react"
import { deleteServiceAction } from "@/lib/actions"

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
  portfolio?: any
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

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ServiceDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { id } = await params
        const response = await fetch(`/api/services/${id}`)
        if (!response.ok) {
          router.push('/404')
          return
        }
        const data = await response.json()
        setService(data.service)
      } catch (error) {
        console.error('Error fetching service:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params, router])

  if (!mounted || loading) {
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

  if (!service) {
    return <div>Service not found</div>
  }

  const serviceList = service.services ? JSON.parse(service.services) : []

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      let className = 'h-4 w-4'
      
      if (starValue <= Math.floor(rating)) {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return
    }

    try {
      await deleteServiceAction(service.id)
      router.push('/services')
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/services">
          <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-foreground">
            Services
          </Link>
          <span>/</span>
          <span>Service Details</span>
        </div>
      </div>

      {/* Service Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">{service.category}</Badge>
                {service.isFeatured && (
                  <Badge variant="default">Featured</Badge>
                )}
                {service.isApproved ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Approved</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{service.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{service.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(service.rating)}
                  <span className="font-semibold ml-1">{service.rating}</span>
                  <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Service Details and Portfolio */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Information
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Images className="h-4 w-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="provider" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Provider
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Services Offered:</h4>
                <div className="flex flex-wrap gap-2">
                  {serviceList.map((serviceItem: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {serviceItem}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{service.region.replace(/_/g, ' ')}</span>
                </div>
                {service.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{service.phone}</span>
                  </div>
                )}
                {service.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{service.email}</span>
                  </div>
                )}
                {service.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={service.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {service.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio & Gallery</CardTitle>
              <p className="text-sm text-muted-foreground">
                View our previous work and project showcase
              </p>
            </CardHeader>
            <CardContent>
              {service.portfolio && Array.isArray(service.portfolio) && service.portfolio.length > 0 ? (
                <ImageGallery
                  images={service.portfolio.map((item: any, index: number) => ({
                    id: item.id || `portfolio-${index}`,
                    url: item.url,
                    alt: item.title || item.caption || `Portfolio image ${index + 1}`,
                    caption: item.caption || item.title
                  }))}
                  columns={3}
                  gap="md"
                  showCaptions={true}
                  showViewAllButton={service.portfolio.length > 6}
                  maxImages={6}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Images className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No portfolio images available yet</p>
                  <p className="text-sm mt-2">Check back later for updates</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={service.provider.avatar || "/placeholder.svg"} alt={service.provider.fullName} />
                  <AvatarFallback className="text-2xl">
                    {service.provider.fullName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold mb-1">{service.provider.fullName}</h4>
                  <p className="text-sm text-blue-600 mb-2">Service Provider</p>
                  {service.provider.organization && (
                    <p className="text-sm text-muted-foreground mb-3">
                      <strong>Organization:</strong> {service.provider.organization}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    {service.provider.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified Provider
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      {renderStars(service.rating)}
                      <span className="text-sm font-medium ml-1">{service.rating}</span>
                      <span className="text-sm text-muted-foreground">({service.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <Button variant="outline" className="mt-2">
                    View Full Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Actions */}
      <div className="flex justify-end gap-2">
        <Link href={`/services/${service.id}/edit`}>
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
    </div>
  )
} 