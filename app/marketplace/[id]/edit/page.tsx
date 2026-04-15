'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, ImagePlus, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

const RWANDA_REGIONS = [
  { value: 'KIGALI_NYARUGENGE', label: 'Kigali - Nyarugenge' },
  { value: 'KIGALI_KICUKIRO', label: 'Kigali - Kicukiro' },
  { value: 'KIGALI_GASABO', label: 'Kigali - Gasabo' },
  { value: 'SOUTH_HUYE', label: 'South - Huye' },
  { value: 'SOUTH_NYAMAGABE', label: 'South - Nyamagabe' },
  { value: 'SOUTH_NYARUGURU', label: 'South - Nyaruguru' },
  { value: 'SOUTH_MUHANGA', label: 'South - Muhanga' },
  { value: 'SOUTH_KAMONYI', label: 'South - Kamonyi' },
  { value: 'SOUTH_GISAGARA', label: 'South - Gisagara' },
  { value: 'SOUTH_NYANZA', label: 'South - Nyanza' },
  { value: 'SOUTH_RUHANGO', label: 'South - Ruhango' },
  { value: 'NORTH_MUSANZE', label: 'North - Musanze' },
  { value: 'NORTH_GICUMBI', label: 'North - Gicumbi' },
  { value: 'NORTH_RULINDO', label: 'North - Rulindo' },
  { value: 'NORTH_BURERA', label: 'North - Burera' },
  { value: 'NORTH_GAKENKE', label: 'North - Gakenke' },
  { value: 'EAST_KAYONZA', label: 'East - Kayonza' },
  { value: 'EAST_NGOMA', label: 'East - Ngoma' },
  { value: 'EAST_KIREHE', label: 'East - Kirehe' },
  { value: 'EAST_NYAGATARE', label: 'East - Nyagatare' },
  { value: 'EAST_BUGESERA', label: 'East - Bugesera' },
  { value: 'EAST_RWAMAGANA', label: 'East - Rwamagana' },
  { value: 'EAST_GATSIBO', label: 'East - Gatsibo' },
  { value: 'WEST_RUBAVU', label: 'West - Rubavu' },
  { value: 'WEST_RUSIZI', label: 'West - Rusizi' },
  { value: 'WEST_NYAMASHEKE', label: 'West - Nyamasheke' },
  { value: 'WEST_RUTSIRO', label: 'West - Rutsiro' },
  { value: 'WEST_KARONGI', label: 'West - Karongi' },
  { value: 'WEST_NGORORERO', label: 'West - Ngororero' },
  { value: 'WEST_NYABIHU', label: 'West - Nyabihu' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'inactive', label: 'Inactive' },
]

interface FormState {
  title: string
  description: string
  category: string
  condition: string
  price: string
  currency: string
  negotiable: boolean
  location: string
  status: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  category: '',
  condition: '',
  price: '',
  currency: 'RWF',
  negotiable: false,
  location: '',
  status: 'active',
}

export default function EditListingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loadingListing, setLoadingListing] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notOwner, setNotOwner] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      toast.error('Please log in to edit a listing')
      router.push('/login')
      return
    }
    ;(async () => {
      try {
        const res = await fetch(`/api/marketplace/${id}`)
        if (!res.ok) {
          toast.error('Listing not found')
          router.push('/marketplace')
          return
        }
        const data = await res.json()
        const l = data.listing
        if (l.seller.id !== user?.id && user?.role !== 'admin') {
          setNotOwner(true)
          return
        }
        setForm({
          title: l.title || '',
          description: l.description || '',
          category: l.category || '',
          condition: l.condition || '',
          price: l.price?.toString() || '',
          currency: l.currency || 'RWF',
          negotiable: !!l.negotiable,
          location: l.location || '',
          status: l.status || 'active',
        })
        setImages(Array.isArray(l.images) ? l.images.filter((u: any) => typeof u === 'string') : [])
      } catch {
        toast.error('Failed to load listing')
        router.push('/marketplace')
      } finally {
        setLoadingListing(false)
      }
    })()
  }, [id, user, isAuthenticated, authLoading, router])

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    setUploading(true)
    const newUrls: string[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'marketplace')
      fd.append('entityId', id)
      fd.append('subfolder', 'images')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (res.ok) {
          const data = await res.json()
          newUrls.push(data.fileUrl)
        } else {
          const err = await res.json()
          toast.error(err.error || 'Failed to upload image')
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (newUrls.length > 0) setImages((prev) => [...prev, ...newUrls])
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.category || !form.condition || !form.price) {
      toast.error('Please fill in all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/marketplace/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          condition: form.condition,
          price: form.price,
          currency: form.currency,
          negotiable: form.negotiable,
          location: form.location || null,
          status: form.status,
          images,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update listing')
      }
      toast.success('Listing updated')
      router.push(`/marketplace/${id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update listing')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loadingListing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notOwner) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <h2 className="text-lg font-semibold">You can't edit this listing</h2>
            <p className="text-sm text-muted-foreground">Only the seller (or an admin) can edit a marketplace listing.</p>
            <Link href={`/marketplace/${id}`}>
              <Button variant="outline">Back to listing</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/marketplace/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground text-sm">Update details, photos, or status of your item</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="drone">Drone</SelectItem>
                    <SelectItem value="parts">Parts</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="camera">Camera</SelectItem>
                    <SelectItem value="controller">Controller</SelectItem>
                    <SelectItem value="battery">Battery</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Condition <span className="text-destructive">*</span></Label>
                <Select value={form.condition} onValueChange={(v) => handleChange('condition', v)}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="for_parts">For Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Mark as Sold or Reserved to keep the listing visible without active inquiries.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWF">RWF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="negotiable"
                checked={form.negotiable}
                onChange={(e) => handleChange('negotiable', e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <Label htmlFor="negotiable" className="cursor-pointer">Price is negotiable</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>District / Region</Label>
              <Select value={form.location} onValueChange={(v) => handleChange('location', v)}>
                <SelectTrigger><SelectValue placeholder="Select your location" /></SelectTrigger>
                <SelectContent>
                  {RWANDA_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
            <CardDescription>Up to 5 photos. The first image is the cover. Drag the arrows to reorder.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {images.map((url, i) => (
                  <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="px-1.5 py-0.5 text-[10px] bg-black/60 text-white rounded disabled:opacity-30"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === images.length - 1}
                        className="px-1.5 py-0.5 text-[10px] bg-black/60 text-white rounded disabled:opacity-30"
                      >
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-colors">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploading ? 'Uploading...' : 'Click to add more photos'}
                </span>
                <span className="text-xs text-muted-foreground">JPEG, PNG, WebP — max 5MB each · {images.length}/5 used</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href={`/marketplace/${id}`}>
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={submitting || uploading}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
