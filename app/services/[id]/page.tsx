"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImageGallery from "@/components/ui/image-gallery"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  Trash2,
  Image as Images,
  Info,
  User,
  MessageSquare,
  ThumbsUp,
  Send,
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

interface Review {
  id: string
  rating: number
  title?: string
  body: string
  response?: string
  responseAt?: string
  createdAt: string
  reviewer: {
    id: string
    username: string
    fullName: string
    avatar?: string
  }
}

interface ReviewStats {
  average: number | null
  count: number
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function ServiceDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStats>({ average: null, count: 0 })
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, title: '', body: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [serviceId, setServiceId] = useState<string>('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchService = async () => {
      try {
        const { id } = await params
        setServiceId(id)
        const response = await fetch(`/api/services/${id}`)
        if (!response.ok) {
          router.push('/404')
          return
        }
        const data = await response.json()
        setService(data.service)
        // Fetch reviews
        fetchReviews(id)
      } catch (error) {
        console.error('Error fetching service:', error)
        router.push('/404')
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params, router])

  const fetchReviews = async (id: string) => {
    try {
      setReviewsLoading(true)
      const res = await fetch(`/api/services/${id}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setReviewStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast.error('Please select a star rating')
      return
    }
    if (!newReview.body.trim()) {
      toast.error('Please write a review')
      return
    }
    try {
      setSubmittingReview(true)
      const res = await fetch(`/api/services/${serviceId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating: newReview.rating, title: newReview.title, body: newReview.body })
      })
      if (res.ok) {
        toast.success('Review submitted successfully')
        setReviewDialogOpen(false)
        setNewReview({ rating: 0, title: '', body: '' })
        fetchReviews(serviceId)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (!mounted || loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!service) {
    return <div>Service not found</div>
  }

  const serviceList = service.services ? JSON.parse(service.services) : []

  const renderStars = (rating: number, size: string = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      let className = size
      if (starValue <= Math.floor(rating)) {
        className += ' fill-yellow-400 text-yellow-400'
      } else {
        className += ' text-muted-foreground/50 dark:text-muted-foreground'
      }
      return <Star key={i} className={className} />
    })
  }

  const renderClickableStars = (selected: number, onSelect: (v: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1
      return (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(starValue)}
          className="focus:outline-none"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              starValue <= selected
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/50 dark:text-muted-foreground hover:text-yellow-300'
            }`}
          />
        </button>
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

      {/* Reviews Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Reviews & Ratings
              </CardTitle>
              <CardDescription className="mt-1">
                {reviewStats.count > 0
                  ? `${reviewStats.count} review${reviewStats.count !== 1 ? 's' : ''} · Average: ${(reviewStats.average ?? 0).toFixed(1)} / 5`
                  : 'No reviews yet. Be the first to review this service.'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {reviewStats.count > 0 && (
                <div className="flex items-center gap-1">
                  {renderStars(reviewStats.average ?? 0, 'h-5 w-5')}
                  <span className="font-semibold ml-1 text-lg">
                    {(reviewStats.average ?? 0).toFixed(1)}
                  </span>
                </div>
              )}
              {user && service && user.id !== service.provider.id && (
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Your Rating *</Label>
                        <div className="flex gap-1">
                          {renderClickableStars(newReview.rating, (v) => setNewReview(p => ({ ...p, rating: v })))}
                        </div>
                        {newReview.rating > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newReview.rating]}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="review-title" className="text-sm font-medium mb-1 block">Title (optional)</Label>
                        <Input
                          id="review-title"
                          placeholder="Summarise your experience"
                          value={newReview.title}
                          onChange={(e) => setNewReview(p => ({ ...p, title: e.target.value }))}
                          className="dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <Label htmlFor="review-body" className="text-sm font-medium mb-1 block">Review *</Label>
                        <Textarea
                          id="review-body"
                          placeholder="Share your experience with this service provider..."
                          rows={4}
                          value={newReview.body}
                          onChange={(e) => setNewReview(p => ({ ...p, body: e.target.value }))}
                          className="dark:bg-gray-800"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitReview} disabled={submittingReview}>
                          <Send className="h-4 w-4 mr-2" />
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ThumbsUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm mt-1">Reviews will appear here once customers submit them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-border rounded-lg p-4 dark:border-gray-700 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={review.reviewer.avatar || '/placeholder-user.jpg'} />
                        <AvatarFallback className="text-xs">
                          {review.reviewer.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.reviewer.fullName}</p>
                        <p className="text-xs text-muted-foreground">@{review.reviewer.username}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {review.title && (
                    <p className="font-semibold text-sm">{review.title}</p>
                  )}
                  <p className="text-sm text-foreground leading-relaxed">{review.body}</p>
                  {review.response && (
                    <div className="ml-4 pl-4 border-l-2 border-blue-400 dark:border-blue-600 mt-3 bg-blue-50 dark:bg-blue-950/30 rounded-r p-3">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Provider Response</p>
                      <p className="text-sm text-foreground">{review.response}</p>
                      {review.responseAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.responseAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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