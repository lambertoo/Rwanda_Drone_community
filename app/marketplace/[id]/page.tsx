'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  MapPin,
  Calendar,
  Eye,
  MessageCircle,
  Pencil,
  Trash2,
  Loader2,
  User,
  ShoppingBag,
  Package,
  AlertTriangle,
  Award,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface Listing {
  id: string
  title: string
  description: string
  category: string
  condition: string
  price: number
  currency: string
  negotiable: boolean
  location: string | null
  images: string[]
  status: string
  views: number
  saves: number
  createdAt: string
  updatedAt: string
  expiresAt: string | null
  seller: {
    id: string
    username: string
    fullName: string
    avatar: string | null
    location: string | null
    joinedAt: string
    reputation: number
    _count: { marketplaceListings: number }
  }
  savedBy: { userId: string }[]
}

const CONDITION_STYLES: Record<string, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  like_new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  good: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  fair: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  for_parts: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  for_parts: 'For Parts',
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'RWF') return `${price.toLocaleString()} RWF`
  return `$${price.toLocaleString()} USD`
}

function formatRegion(region: string | null): string {
  if (!region) return 'Rwanda'
  return region.replace(/_/g, ' ').replace(/^(KIGALI|SOUTH|NORTH|EAST|WEST)_/, '')
}

function timeAgo(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toLocaleDateString()
}

export default function ListingDetailPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [similarListings, setSimilarListings] = useState<Listing[]>([])

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/marketplace/${id}`)
        if (res.ok) {
          const data = await res.json()
          setListing(data.listing)
          // Check if saved
          if (user) {
            setSaved(data.listing.savedBy.some((s: { userId: string }) => s.userId === user.id))
          }
          // Fetch similar listings
          const simRes = await fetch(`/api/marketplace?category=${data.listing.category}`)
          if (simRes.ok) {
            const simData = await simRes.json()
            setSimilarListings(simData.listings.filter((l: Listing) => l.id !== id).slice(0, 4))
          }
        } else {
          toast.error('Listing not found')
          router.push('/marketplace')
        }
      } catch {
        toast.error('Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id, user])

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save listings')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/marketplace/${id}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
        toast.success(data.saved ? 'Listing saved' : 'Listing unsaved')
      }
    } catch {
      toast.error('Failed to save listing')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/marketplace/${id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const [contacting, setContacting] = useState(false)

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to contact sellers')
      return
    }
    if (!listing) return
    setContacting(true)
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: listing.seller.id }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/messages?conversation=${data.conversationId}`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to start conversation')
      }
    } catch {
      toast.error('Failed to contact seller')
    } finally {
      setContacting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/marketplace/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted')
        router.push('/marketplace')
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing) return null

  const isOwner = user?.id === listing.seller.id
  const isAdmin = user?.role === 'admin'
  const images = Array.isArray(listing.images) ? listing.images : []

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-2">
        <Link href="/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <span className="text-muted-foreground text-sm">Back to Marketplace</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card className="overflow-hidden">
            <div className="relative h-72 sm:h-96 bg-muted flex items-center justify-center">
              {images.length > 0 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[selectedImage]}
                  alt={listing.title}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Package className="h-20 w-20 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No images available</p>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 h-16 w-16 rounded border-2 overflow-hidden transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Title & Details */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{listing.title}</h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        CONDITION_STYLES[listing.condition] || ''
                      }`}
                    >
                      {CONDITION_LABELS[listing.condition] || listing.condition}
                    </span>
                    <Badge variant="outline" className="capitalize text-xs">
                      {listing.category}
                    </Badge>
                    {listing.status !== 'active' && (
                      <Badge variant="destructive" className="text-xs">
                        {listing.status}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(listing.price, listing.currency)}
                  </p>
                  {listing.negotiable && (
                    <p className="text-xs text-muted-foreground mt-0.5">Price negotiable</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Posted {timeAgo(listing.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {listing.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5" />
                  {listing.saves} saves
                </span>
              </div>

              <div className="pt-2 border-t border-border">
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : saved ? (
                    <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  {saved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                {!isOwner && (
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Report
                  </Button>
                )}
              </div>

              {(isOwner || isAdmin) && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground mr-auto self-center">Owner actions:</span>
                  <Link href={`/marketplace/${id}/edit`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5"
                  >
                    {deleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Seller Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {listing.seller.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.seller.avatar}
                      alt={listing.seller.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${listing.seller.username}`}
                    className="font-semibold hover:underline text-sm"
                  >
                    {listing.seller.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground">@{listing.seller.username}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {listing.seller.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    {formatRegion(listing.seller.location)}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  Member since {new Date(listing.seller.joinedAt).getFullYear()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-3.5 w-3.5 flex-shrink-0" />
                  {listing.seller._count.marketplaceListings} listings
                </div>
                {listing.seller.reputation > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-3.5 w-3.5 flex-shrink-0" />
                    {listing.seller.reputation} reputation
                  </div>
                )}
              </div>

              <Button onClick={handleContact} className="w-full" size="sm" disabled={contacting || isOwner}>
                {contacting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-2" />}
                {isOwner ? 'Your Listing' : contacting ? 'Opening...' : 'Contact Seller'}
              </Button>

              <Link href={`/profile/${listing.seller.username}`} className="block">
                <Button variant="outline" size="sm" className="w-full">
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Safety tip: Meet in a public place and verify the item before paying.
                </p>
                {listing.expiresAt && (
                  <p>Listing expires: {new Date(listing.expiresAt).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Listings */}
      {similarListings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Similar Listings</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarListings.map((sl) => (
              <Link key={sl.id} href={`/marketplace/${sl.id}`}>
                <Card className="hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                  <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                    {Array.isArray(sl.images) && sl.images.length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sl.images[0]} alt={sl.title} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-10 w-10 text-muted-foreground/30" />
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium line-clamp-1">{sl.title}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {formatPrice(sl.price, sl.currency)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
