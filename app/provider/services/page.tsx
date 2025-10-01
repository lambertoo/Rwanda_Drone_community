"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Plus,
  Star,
  MapPin,
  Briefcase,
  Edit,
  ExternalLink,
  Trash2,
  Eye,
  TrendingUp,
} from "lucide-react"
import { deleteServiceAction } from "@/lib/actions"
import { useRouter } from "next/navigation"

interface Service {
  id: string
  title: string
  description: string
  category: {
    name: string
  }
  region: string
  services: any
  portfolio?: any
  rating: number
  reviewCount: number
  isFeatured: boolean
  isApproved: boolean
  createdAt: string
}

export default function MyServicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show current user's services
          const myServices = data.services.filter((s: any) => s.provider.id === user?.id)
          setServices(myServices)
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

  const handleDelete = async (serviceId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    try {
      await deleteServiceAction(serviceId)
      setServices(services.filter(s => s.id !== serviceId))
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
    }
  }

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
          <p className="mt-4 text-muted-foreground">Loading your services...</p>
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
              <h1 className="text-4xl font-bold text-foreground mb-2">My Services</h1>
              <p className="text-lg text-muted-foreground">
                Manage your service listings and track performance
              </p>
            </div>
            <Link href="/services/new">
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add New Service
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
                  <div className="text-sm text-muted-foreground">Active Services</div>
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
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">
                    {services.reduce((sum, s) => sum + s.reviewCount, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Reviews</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">
                    {services.filter(s => s.isApproved).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Services List */}
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first service listing to start offering your drone services
              </p>
              <Link href="/services/new">
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Service Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {services.map((service) => {
              let serviceList: string[] = []
              try {
                serviceList = service.services ? JSON.parse(service.services) : []
              } catch {
                serviceList = []
              }

              const portfolioCount = service.portfolio && Array.isArray(service.portfolio) 
                ? service.portfolio.length 
                : 0

              return (
                <Card key={service.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl">{service.title}</CardTitle>
                          {service.isFeatured && (
                            <Badge variant="default">Featured</Badge>
                          )}
                          {service.isApproved ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Pending Approval
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{service.category.name}</Badge>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {service.region.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link href={`/services/${service.id}`}>
                          <Button variant="default" size="sm" className="w-full">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/services/${service.id}/edit`}>
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 w-full"
                          onClick={() => handleDelete(service.id, service.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Services Offered:</h4>
                      <div className="flex flex-wrap gap-2">
                        {serviceList.slice(0, 5).map((item: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {serviceList.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{serviceList.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1">
                        {renderStars(service.rating)}
                        <span className="ml-1 text-sm font-medium">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviewCount} reviews)</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {portfolioCount} portfolio images
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

