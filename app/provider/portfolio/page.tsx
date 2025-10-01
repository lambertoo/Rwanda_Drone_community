"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ImageGallery from "@/components/ui/image-gallery"
import Link from "next/link"
import {
  Camera,
  Plus,
  Star,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  ExternalLink,
  Edit,
} from "lucide-react"

interface Service {
  id: string
  title: string
  description: string
  category: {
    name: string
  }
  region: string
  portfolio?: any
  rating: number
  reviewCount: number
  isFeatured: boolean
  isApproved: boolean
}

export default function ProviderPortfolioPage() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [allPortfolioImages, setAllPortfolioImages] = useState<any[]>([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show current user's services
          const myServices = data.services.filter((s: any) => s.provider.id === user?.id)
          setServices(myServices)

          // Collect all portfolio images from all services
          const allImages: any[] = []
          myServices.forEach((service: Service, serviceIndex: number) => {
            if (service.portfolio && Array.isArray(service.portfolio)) {
              service.portfolio.forEach((item: any, imgIndex: number) => {
                allImages.push({
                  id: `${service.id}-${imgIndex}`,
                  url: item.url,
                  alt: item.title || item.caption || `${service.title} - Image ${imgIndex + 1}`,
                  caption: `${service.title}${item.caption ? ' - ' + item.caption : ''}`,
                  serviceId: service.id,
                  serviceTitle: service.title,
                })
              })
            }
          })
          setAllPortfolioImages(allImages)
        }
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchServices()
    }
  }, [user])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      return (
        <Star
          key={i}
          className={`h-4 w-4 ${
            starValue <= Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      )
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Portfolio</h1>
              <p className="text-lg text-muted-foreground">
                Showcase your best work and manage your service listings
              </p>
            </div>
            <Link href="/services/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Service
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{services.length}</div>
                  <div className="text-sm text-muted-foreground">Total Services</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{allPortfolioImages.length}</div>
                  <div className="text-sm text-muted-foreground">Portfolio Images</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">
                    {(services.reduce((sum, s) => sum + s.rating, 0) / services.length || 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Camera className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {services.filter(s => s.isFeatured).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Featured Services</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* All Portfolio Images Gallery */}
        {allPortfolioImages.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Complete Portfolio Gallery
              </CardTitle>
              <CardDescription>
                All images from your service listings combined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={allPortfolioImages}
                columns={4}
                gap="md"
                showCaptions={true}
              />
            </CardContent>
          </Card>
        )}

        {/* Service Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Service Listings</h2>
            {services.length === 0 && (
              <Link href="/services/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Service
                </Button>
              </Link>
            )}
          </div>

          {services.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start showcasing your drone services to the community
                </p>
                <Link href="/services/new">
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Service
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service) => {
                const portfolioCount = service.portfolio && Array.isArray(service.portfolio) 
                  ? service.portfolio.length 
                  : 0

                return (
                  <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                            {service.isFeatured && (
                              <Badge variant="default">Featured</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{service.category.name}</Badge>
                            {service.isApproved ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Approved
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          {renderStars(service.rating)}
                          <span className="ml-1 font-medium">{service.rating}</span>
                          <span className="text-muted-foreground">({service.reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{service.region.replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                        <span>{portfolioCount} portfolio {portfolioCount === 1 ? 'image' : 'images'}</span>
                      </div>

                      {/* Portfolio Preview */}
                      {service.portfolio && Array.isArray(service.portfolio) && service.portfolio.length > 0 && (
                        <div className="grid grid-cols-4 gap-2">
                          {service.portfolio.slice(0, 4).map((item: any, index: number) => (
                            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <img
                                src={item.url}
                                alt={item.title || `Image ${index + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Link href={`/services/${service.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/services/${service.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Help Section */}
        {services.length > 0 && (
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                Portfolio Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Upload high-quality images that showcase your best work</li>
                <li>• Add descriptive captions to help clients understand your services</li>
                <li>• Keep your portfolio updated with recent projects</li>
                <li>• Feature a variety of work to demonstrate your capabilities</li>
                <li>• Organize images by service type for better presentation</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

