'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Search,
  Plus,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Calendar,
  Eye,
  Tag,
  Package,
  Cpu,
  Camera,
  Joystick,
  BatteryFull,
  Wrench,
  Loader2,
  ShoppingBag,
  Pencil,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

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
  seller: {
    id: string
    username: string
    fullName: string
    avatar: string | null
    location: string | null
  }
}

const CATEGORIES = [
  { value: 'all', label: 'All', icon: ShoppingBag },
  { value: 'drone', label: 'Drones', icon: Package },
  { value: 'parts', label: 'Parts', icon: Wrench },
  { value: 'accessories', label: 'Accessories', icon: Tag },
  { value: 'camera', label: 'Cameras', icon: Camera },
  { value: 'controller', label: 'Controllers', icon: Joystick },
  { value: 'battery', label: 'Batteries', icon: BatteryFull },
  { value: 'other', label: 'Other', icon: Cpu },
]

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
  if (currency === 'RWF') {
    return `${price.toLocaleString()} RWF`
  }
  return `$${price.toLocaleString()} USD`
}

function formatRegion(region: string | null): string {
  if (!region) return 'Rwanda'
  return region.replace(/_/g, ' ').replace(/^(KIGALI|SOUTH|NORTH|EAST|WEST)_/, '')
}

function timeAgo(date: string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'general' | 'mine'>('general')
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [condition, setCondition] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  const fetchListings = async (tab: string, mode?: string) => {
    setLoading(true)
    const currentMode = mode ?? viewMode
    try {
      const params = new URLSearchParams()
      if (currentMode === 'mine') params.set('my', 'true')
      if (tab !== 'all') params.set('category', tab)
      if (search) params.set('search', search)
      if (condition && condition !== 'all') params.set('condition', condition)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)

      const res = await fetch(`/api/marketplace?${params}`)
      if (res.ok) {
        const data = await res.json()
        setListings(data.listings || [])
      }
    } catch (err) {
      console.error('Error fetching listings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings(activeTab, viewMode)
  }, [activeTab, viewMode])

  const handleSearch = () => {
    fetchListings(activeTab, viewMode)
  }

  const switchView = (mode: 'general' | 'mine') => {
    setViewMode(mode)
    setActiveTab('all')
  }

  const handleSave = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please log in to save listings')
      return
    }
    setSavingId(listingId)
    try {
      const res = await fetch(`/api/marketplace/${listingId}/save`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSavedIds((prev) => {
          const next = new Set(prev)
          if (data.saved) next.add(listingId)
          else next.delete(listingId)
          return next
        })
        toast.success(data.saved ? 'Listing saved' : 'Listing unsaved')
      }
    } catch {
      toast.error('Failed to save listing')
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteListing = async (listingId: string, title: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/marketplace/${listingId}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        toast.success('Listing deleted')
        setListings((prev) => prev.filter((l) => l.id !== listingId))
      } else {
        toast.error('Failed to delete listing')
      }
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  const CategoryIcon = ({ category }: { category: string }) => {
    const cat = CATEGORIES.find((c) => c.value === category)
    if (!cat) return <Package className="h-12 w-12 text-muted-foreground/30" />
    const Icon = cat.icon
    return <Icon className="h-12 w-12 text-muted-foreground/30" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drone Marketplace</h1>
          <p className="text-muted-foreground mt-1">Buy and sell drones, parts, and accessories in Rwanda</p>
        </div>
        <Button
          onClick={() => {
            if (!isAuthenticated) {
              toast.error('Please log in to sell items')
              router.push('/login')
              return
            }
            router.push('/marketplace/new')
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Sell Something
        </Button>
      </div>

      {/* View toggle: General / My Listings */}
      {isAuthenticated && (
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          <button
            onClick={() => switchView('general')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === 'general'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 inline mr-1.5" />
            All Listings
          </button>
          <button
            onClick={() => switchView('mine')}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              viewMode === 'mine'
                ? 'bg-background shadow-sm font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="h-3.5 w-3.5 inline mr-1.5" />
            My Listings
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search listings..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="like_new">Like New</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="for_parts">For Parts</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Min price"
          className="w-full sm:w-32"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          type="number"
        />
        <Input
          placeholder="Max price"
          className="w-full sm:w-32"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
        />
        <Button onClick={handleSearch} variant="secondary">
          Filter
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs sm:text-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((c) => c.value).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto" />
                <h3 className="text-xl font-semibold">No listings found</h3>
                <p className="text-muted-foreground">
                  {viewMode === 'mine' ? 'You have no listings yet.' : 'Be the first to list something!'}
                </p>
                <Button onClick={() => router.push('/marketplace/new')} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                  <Card
                    key={listing.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-200 border-border"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-muted flex items-center justify-center overflow-hidden">
                      {Array.isArray(listing.images) && listing.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <CategoryIcon category={listing.category} />
                      )}
                      <button
                        onClick={(e) => handleSave(listing.id, e)}
                        disabled={savingId === listing.id}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      >
                        {savedIds.has(listing.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="absolute top-2 left-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            CONDITION_STYLES[listing.condition] || ''
                          }`}
                        >
                          {CONDITION_LABELS[listing.condition] || listing.condition}
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2 leading-snug">{listing.title}</h3>
                        <p className="text-xl font-bold mt-1 text-primary">
                          {formatPrice(listing.price, listing.currency)}
                          {listing.negotiable && (
                            <span className="text-xs font-normal text-muted-foreground ml-1">(Negotiable)</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={listing.seller.avatar || undefined} />
                          <AvatarFallback className="text-xs">
                            {listing.seller.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">
                          {listing.seller.fullName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatRegion(listing.seller.location)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {timeAgo(listing.createdAt)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {listing.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          {user && listing.seller.id === user.id && (
                            <>
                              <Link href={`/marketplace/${listing.id}`}>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => handleDeleteListing(listing.id, listing.title, e)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          <Link href={`/marketplace/${listing.id}`}>
                            <Button size="sm" variant="default" className="h-7 text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
