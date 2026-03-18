'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, ImagePlus, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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

export default function NewListingPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    price: '',
    currency: 'RWF',
    negotiable: false,
    location: '',
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please log in to create a listing')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.category || !form.condition || !form.price) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          location: form.location || undefined,
          images: [],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Listing created successfully!')
        router.push(`/marketplace/${data.listing.id}`)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create listing')
      }
    } catch {
      toast.error('Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/marketplace">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">List for Sale</h1>
          <p className="text-muted-foreground text-sm">Create a new marketplace listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g. DJI Mavic 3 Pro - Excellent Condition"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail: condition, included accessories, reason for selling, etc."
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={form.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
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
                <Label>
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select value={form.condition} onValueChange={(v) => handleChange('condition', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="price">
                  Price <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => handleChange('currency', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <Label htmlFor="negotiable" className="cursor-pointer">
                Price is negotiable
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>District / Region</Label>
              <Select value={form.location} onValueChange={(v) => handleChange('location', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your location" />
                </SelectTrigger>
                <SelectContent>
                  {RWANDA_REGIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-muted">
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Images</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Image upload can be done from your profile settings. You can update your listing after creation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/marketplace">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </div>
      </form>
    </div>
  )
}
