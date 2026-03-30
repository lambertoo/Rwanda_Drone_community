"use client"

import { useState, useEffect } from "react"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { MapPin, Users, Globe, Mail, Phone, Plus, Search, ChevronRight, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"

interface Club {
  id: string
  name: string
  description: string
  shortDescription?: string
  coverImage?: string
  logo?: string
  location?: string
  province?: string
  type: string
  website?: string
  email?: string
  memberCount: number
  isFeatured: boolean
  isApproved: boolean
  createdBy: { id: string; fullName: string; avatar?: string; username: string }
  _count?: { memberships: number }
}

const CLUB_TYPES = [
  { value: 'all', label: 'All Clubs' },
  { value: 'racing', label: 'Racing' },
  { value: 'aerial_photography', label: 'Aerial Photography' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'general', label: 'General' },
]

const TYPE_COLORS: Record<string, string> = {
  racing: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  aerial_photography: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  agriculture: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  technology: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function ClubsPage() {
  const { user } = useAuth()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState('all')

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedType !== 'all') params.set('type', selectedType)
    fetch(`/api/clubs?${params}`)
      .then(r => r.json())
      .then(d => setClubs(d.clubs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedType])

  const filtered = clubs.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-gradient py-14 px-6 mb-8 rounded-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[#009FDA]/20" />
        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-px h-5 bg-[#009FDA]" />
            <span className="text-[#009FDA] text-sm font-semibold uppercase tracking-widest">Community Hubs</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Connect with Drone Clubs,<br />Fuel Your Growth
          </h1>
          <p className="text-white/75 text-base mb-6 max-w-xl">
            Build relationships with clubs that share your passion, align with your goals, and can provide the community and expertise to drive your journey forward.
          </p>
          {user && (
            <Link href="/clubs/new">
              <Button size="lg" className="bg-white text-[#003366] hover:bg-white/90 rounded-full font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Create a Club
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active Clubs', value: filtered.length },
          { label: 'Total Members', value: clubs.reduce((s, c) => s + (c._count?.memberships || c.memberCount || 0), 0) },
          { label: 'Club Types', value: CLUB_TYPES.length - 1 },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border/40 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-gradient">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-muted/60 border-border/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CLUB_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setSelectedType(t.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedType === t.value
                  ? 'bg-[#003366] text-white dark:bg-[#009FDA]'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> clubs
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl bg-muted animate-pulse h-64" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(club => (
            <div key={club.id} className="group bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-[#009FDA]/30 hover:shadow-xl hover:shadow-[#003366]/5 transition-all duration-300 flex flex-col">
              {/* Cover */}
              <div className="relative h-32 overflow-hidden">
                {club.coverImage ? (
                  <img src={club.coverImage} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-brand-gradient opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {club.isFeatured && (
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 text-xs font-bold rounded-full bg-[#009FDA] text-white">Featured</span>
                )}
                {/* Logo */}
                <div className="absolute -bottom-6 left-4">
                  <div className="w-12 h-12 rounded-xl border-2 border-background bg-background shadow-md overflow-hidden flex items-center justify-center">
                    {club.logo ? (
                      <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-gradient flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{club.name[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 pt-8 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base line-clamp-1 group-hover:text-[#009FDA] transition-colors flex-1 mr-2">
                    {club.name}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full shrink-0 ${TYPE_COLORS[club.type] || TYPE_COLORS.general}`}>
                    {formatType(club.type)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                  {club.shortDescription || club.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  {club.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#009FDA]" />
                      {club.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-[#009FDA]" />
                    {club._count?.memberships || club.memberCount || 0} members
                  </span>
                </div>

                <Link href={`/clubs/${club.id}`} className="mt-auto">
                  <Button size="sm" className="w-full group/btn">
                    <span>View Club</span>
                    <span className="relative ml-1.5">
                      <ChevronRight className="h-3.5 w-3.5 opacity-100 group-hover/btn:opacity-0 transition-opacity" />
                      <ArrowRight className="h-3.5 w-3.5 absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#003366]/10 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-[#003366] dark:text-[#009FDA]" />
          </div>
          <h3 className="text-lg font-bold mb-2">No clubs found</h3>
          <p className="text-muted-foreground text-sm mb-4">Be the first to create a club in this category!</p>
          {user && (
            <Link href="/clubs/new">
              <Button>Create a Club</Button>
            </Link>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-brand-gradient p-8 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white mb-2">Start Your Own Drone Club</h2>
          <p className="text-white/75 mb-6 text-sm max-w-md mx-auto">Create a club, build your community, and host events for drone enthusiasts across Rwanda.</p>
          {user ? (
            <Link href="/clubs/new"><Button size="lg" className="bg-white text-[#003366] hover:bg-white/90 rounded-full font-semibold">Create a Club</Button></Link>
          ) : (
            <Link href="/register"><Button size="lg" className="bg-white text-[#003366] hover:bg-white/90 rounded-full font-semibold">Join the Community</Button></Link>
          )}
        </div>
      </div>
    </div>
  )
}
