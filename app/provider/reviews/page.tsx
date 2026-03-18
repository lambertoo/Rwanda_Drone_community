'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  Star,
  MessageSquare,
  Send,
  TrendingUp,
  BarChart3,
  Briefcase,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

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

interface Service {
  id: string
  title: string
  rating: number
  reviewCount: number
  reviews?: Review[]
}

export default function ProviderReviewsPage() {
  const { user, loading: authLoading } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [replyOpen, setReplyOpen] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) fetchServicesWithReviews()
  }, [user])

  const fetchServicesWithReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/services', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      const myServices: Service[] = data.services.filter((s: any) => s.provider.id === user?.id)

      // Fetch reviews for each service
      const withReviews = await Promise.all(
        myServices.map(async (svc) => {
          const r = await fetch(`/api/services/${svc.id}/reviews`, { credentials: 'include' })
          if (r.ok) {
            const d = await r.json()
            return { ...svc, reviews: d.reviews }
          }
          return { ...svc, reviews: [] }
        })
      )
      setServices(withReviews)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (serviceId: string, reviewId: string) => {
    const response = replyDrafts[reviewId]?.trim()
    if (!response) {
      toast.error('Please write a response')
      return
    }
    try {
      setSubmitting((p) => ({ ...p, [reviewId]: true }))
      const res = await fetch(`/api/services/${serviceId}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ response }),
      })
      if (res.ok) {
        toast.success('Response posted successfully')
        setReplyOpen((p) => ({ ...p, [reviewId]: false }))
        setReplyDrafts((p) => ({ ...p, [reviewId]: '' }))
        fetchServicesWithReviews()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to post response')
      }
    } catch (error) {
      toast.error('Failed to post response')
    } finally {
      setSubmitting((p) => ({ ...p, [reviewId]: false }))
    }
  }

  const renderStars = (rating: number, size = 'h-4 w-4') =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i + 1 <= Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-muted-foreground/50 dark:text-muted-foreground'
        }`}
      />
    ))

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <Card>
          <CardContent className="py-10">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">You need to be logged in to view your reviews.</p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalReviews = services.reduce((sum, s) => sum + (s.reviews?.length ?? 0), 0)
  const avgRating =
    services.length > 0
      ? services.reduce((sum, s) => sum + s.rating, 0) / services.filter((s) => s.rating > 0).length || 0
      : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">My Service Reviews</h1>
          <p className="text-muted-foreground">Manage and respond to customer reviews across all your services.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <BarChart3 className="h-7 w-7 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{services.length}</div>
              <div className="text-sm text-muted-foreground">Services Listed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-7 w-7 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-7 w-7 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold flex items-center justify-center gap-1">
                {avgRating > 0 ? (
                  <>
                    {avgRating.toFixed(1)}
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </>
                ) : (
                  '—'
                )}
              </div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Per-Service Tabs */}
        {services.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center">
              <Briefcase className="h-14 w-14 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
              <p className="text-muted-foreground mb-4">Create a service listing to start receiving reviews.</p>
              <Link href="/services/new">
                <Button>Create Service</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={services[0]?.id} className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1 bg-muted p-1">
              {services.map((svc) => (
                <TabsTrigger key={svc.id} value={svc.id} className="flex items-center gap-2">
                  <span className="truncate max-w-[140px]">{svc.title}</span>
                  {(svc.reviews?.length ?? 0) > 0 && (
                    <Badge variant="secondary" className="text-xs px-1.5">
                      {svc.reviews?.length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {services.map((svc) => (
              <TabsContent key={svc.id} value={svc.id}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <CardTitle className="text-lg">{svc.title}</CardTitle>
                        <CardDescription className="mt-0.5">
                          {svc.reviews?.length ?? 0} review{(svc.reviews?.length ?? 0) !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      {svc.rating > 0 && (
                        <div className="flex items-center gap-1">
                          {renderStars(svc.rating)}
                          <span className="font-semibold ml-1">{svc.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!svc.reviews || svc.reviews.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No reviews for this service yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {svc.reviews.map((review) => (
                          <div
                            key={review.id}
                            className="border border-border dark:border-gray-700 rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={review.reviewer.avatar || '/placeholder-user.jpg'} />
                                  <AvatarFallback className="text-xs">
                                    {review.reviewer.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
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
                                  {new Date(review.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                            {review.title && <p className="font-semibold text-sm">{review.title}</p>}
                            <p className="text-sm leading-relaxed">{review.body}</p>

                            {review.response ? (
                              <div className="ml-2 pl-4 border-l-2 border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30 rounded-r p-3">
                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                                  Your Response
                                </p>
                                <p className="text-sm">{review.response}</p>
                                {review.responseAt && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(review.responseAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                {replyOpen[review.id] ? (
                                  <div className="space-y-2 mt-2">
                                    <Textarea
                                      placeholder="Write your response to this review..."
                                      rows={3}
                                      value={replyDrafts[review.id] || ''}
                                      onChange={(e) =>
                                        setReplyDrafts((p) => ({ ...p, [review.id]: e.target.value }))
                                      }
                                      className="dark:bg-gray-800 text-sm"
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setReplyOpen((p) => ({ ...p, [review.id]: false }))
                                        }
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleReply(svc.id, review.id)}
                                        disabled={submitting[review.id]}
                                      >
                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                        {submitting[review.id] ? 'Posting...' : 'Post Response'}
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="mt-1"
                                    onClick={() => setReplyOpen((p) => ({ ...p, [review.id]: true }))}
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                                    Reply to Review
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
