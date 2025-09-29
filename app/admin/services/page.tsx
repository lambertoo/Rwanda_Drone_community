"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Wrench, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Building,
  Loader
} from "lucide-react"
import { AdminOnly } from "@/components/auth-guard"

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
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
  provider: {
    id: string
    fullName: string
    username: string
    organization?: string
  }
}

function ServiceApprovalPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showServiceModal, setShowServiceModal] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services?admin=true', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        console.error('Failed to fetch services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (serviceId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'service',
          id: serviceId,
          action: 'approve'
        })
      })

      if (response.ok) {
        await fetchServices()
      } else {
        console.error('Failed to approve service')
      }
    } catch (error) {
      console.error('Error approving service:', error)
    }
  }

  const handleReject = async (serviceId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'service',
          id: serviceId,
          action: 'reject'
        })
      })

      if (response.ok) {
        await fetchServices()
      } else {
        console.error('Failed to reject service')
      }
    } catch (error) {
      console.error('Error rejecting service:', error)
    }
  }

  const handleUnapprove = async (serviceId: string) => {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type: 'service',
          id: serviceId,
          action: 'unapprove'
        })
      })

      if (response.ok) {
        await fetchServices()
      } else {
        console.error('Failed to unapprove service')
      }
    } catch (error) {
      console.error('Error unapproving service:', error)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        await fetchServices()
      } else {
        console.error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.contact.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'approved' && service.isApproved) ||
                         (statusFilter === 'pending' && !service.isApproved)
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (service: Service) => {
    if (service.isApproved) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
    }
    return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      'Aerial Photography': 'bg-blue-100 text-blue-800',
      'Mapping & Surveying': 'bg-green-100 text-green-800',
      'Inspections': 'bg-purple-100 text-purple-800',
      'Delivery': 'bg-orange-100 text-orange-800',
      'Training': 'bg-pink-100 text-pink-800',
      'Maintenance': 'bg-red-100 text-red-800',
      'Consulting': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminOnly>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Service Approval</h1>
            <p className="text-muted-foreground">Review and approve service listings</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Aerial Photography">Aerial Photography</SelectItem>
                  <SelectItem value="Mapping & Surveying">Mapping & Surveying</SelectItem>
                  <SelectItem value="Inspections">Inspections</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Consulting">Consulting</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="space-y-4">
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No services found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                      ? 'Try adjusting your filters to see more services.'
                      : 'No services have been submitted yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        {getStatusBadge(service)}
                        <Badge className={`text-xs ${getCategoryBadge(service.category)}`}>
                          {service.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">{service.provider.organization || service.provider.fullName}</span>
                      </div>
                      
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.region.replace('_', ' ')}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Contact:</span>
                          {service.contact}
                        </div>
                        {service.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <div className="flex">
                              {renderStars(service.rating)}
                            </div>
                            <span>({service.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Listed by <span className="font-medium">{service.provider.fullName}</span> (@{service.provider.username}) on{' '}
                        {new Date(service.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Dialog open={showServiceModal && selectedService?.id === service.id} onOpenChange={(open) => {
                        setShowServiceModal(open)
                        if (!open) setSelectedService(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedService(service)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{selectedService?.title}</DialogTitle>
                          </DialogHeader>
                          {selectedService && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(selectedService)}
                                <Badge className={`text-xs ${getCategoryBadge(selectedService.category)}`}>
                                  {selectedService.category}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm">
                                <Building className="h-4 w-4" />
                                <span className="font-medium">{selectedService.provider.organization || selectedService.provider.fullName}</span>
                              </div>
                              
                              <p className="text-muted-foreground">{selectedService.description}</p>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Region:</span>
                                  <p>{selectedService.region.replace('_', ' ')}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Contact Person:</span>
                                  <p>{selectedService.contact}</p>
                                </div>
                                {selectedService.phone && (
                                  <div>
                                    <span className="font-medium">Phone:</span>
                                    <p className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {selectedService.phone}
                                    </p>
                                  </div>
                                )}
                                {selectedService.email && (
                                  <div>
                                    <span className="font-medium">Email:</span>
                                    <p className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {selectedService.email}
                                    </p>
                                  </div>
                                )}
                                {selectedService.website && (
                                  <div>
                                    <span className="font-medium">Website:</span>
                                    <p className="flex items-center gap-1">
                                      <Globe className="h-3 w-3" />
                                      <a href={selectedService.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {selectedService.website}
                                      </a>
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {selectedService.services && (
                                <div>
                                  <span className="font-medium">Services Offered:</span>
                                  <p className="text-sm text-muted-foreground mt-1">{selectedService.services}</p>
                                </div>
                              )}
                              
                              {selectedService.rating > 0 && (
                                <div>
                                  <span className="font-medium">Rating:</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex">
                                      {renderStars(selectedService.rating)}
                                    </div>
                                    <span className="text-sm text-muted-foreground">({selectedService.reviewCount} reviews)</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="text-sm text-muted-foreground">
                                <p><span className="font-medium">Listed by:</span> {selectedService.provider.fullName} (@{selectedService.provider.username})</p>
                                <p><span className="font-medium">Listed on:</span> {new Date(selectedService.createdAt).toLocaleDateString()}</p>
                                {selectedService.approvedAt && (
                                  <p><span className="font-medium">Approved on:</span> {new Date(selectedService.approvedAt).toLocaleDateString()}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {!service.isApproved ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleApprove(service.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleUnapprove(service.id)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Un-Approve
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminOnly>
  )
}

export default ServiceApprovalPage






