"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"

export default function NewClubPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    type: '',
    location: '',
    website: '',
    email: '',
    phone: '',
  })

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-4">You need to be logged in to create a club.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.description || !form.type) {
      setError('Name, description, and type are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/clubs/${data.club.id}`)
      } else {
        setError(data.error || 'Failed to create club')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/clubs" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to Clubs
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden bg-brand-gradient py-10 px-8 mb-8 rounded-2xl">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative">
          <h1 className="text-2xl font-extrabold text-white mb-1">Create a Drone Club</h1>
          <p className="text-white/70 text-sm">Build a community around your passion for drones</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Club Name <span className="text-destructive">*</span></Label>
          <Input id="name" value={form.name} onChange={set('name')} placeholder="e.g. Kigali Drone Racers" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type">Club Type <span className="text-destructive">*</span></Label>
          <Select value={form.type} onValueChange={v => setForm(prev => ({ ...prev, type: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select club type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="racing">Racing</SelectItem>
              <SelectItem value="aerial_photography">Aerial Photography</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="education">Education & Training</SelectItem>
              <SelectItem value="technology">Technology & Innovation</SelectItem>
              <SelectItem value="general">General / Community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input id="shortDescription" value={form.shortDescription} onChange={set('shortDescription')} placeholder="One-line summary (shown on listing cards)" maxLength={120} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Full Description <span className="text-destructive">*</span></Label>
          <Textarea id="description" value={form.description} onChange={set('description')} placeholder="Tell people what your club is about, what you do, who can join..." rows={5} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={set('location')} placeholder="e.g. Kigali, Musanze" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" type="email" value={form.email} onChange={set('email')} placeholder="club@example.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={set('phone')} placeholder="+250 7XX XXX XXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" value={form.website} onChange={set('website')} placeholder="https://..." />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="submit" disabled={loading} size="lg" className="flex-1">
            {loading ? 'Creating...' : 'Create Club'}
          </Button>
          <Link href="/clubs">
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center">Your club will be reviewed by an admin before it appears publicly.</p>
      </form>
    </div>
  )
}
