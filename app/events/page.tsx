"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Grid,
  List,
  Plus,
  CheckCircle,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

interface Event {
  id: string
  title: string
  description: string
  fullDescription?: string
  category?: {
    id: string
    name: string
    description: string
    slug: string
    icon: string
    color: string
  }
  startDate: string
  endDate: string
  location: string
  venue: string
  price: number
  currency: string
  viewsCount: number
  likesCount: number
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  organizerId: string
  organizer: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
  }
  allowRegistration?: boolean
  flyer?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [rsvpStatuses, setRsvpStatuses] = useState<
    Record<string, "none" | "registered" | "loading">
  >({})
  const { user } = useAuth()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
          if (user) {
            checkAllRsvpStatuses(data.events || [])
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [user])

  const checkAllRsvpStatuses = async (eventsList: Event[]) => {
    const statuses: Record<string, "none" | "registered" | "loading"> = {}

    for (const event of eventsList) {
      try {
        const response = await fetch(`/api/events/${event.id}/rsvp`)
        statuses[event.id] = response.ok ? "registered" : "none"
      } catch (err) {
        statuses[event.id] = "none"
      }
    }

    setRsvpStatuses(statuses)
  }

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      window.location.href = "/login"
      return
    }

    setRsvpStatuses((prev) => ({ ...prev, [eventId]: "loading" }))

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setRsvpStatuses((prev) => ({ ...prev, [eventId]: "registered" }))
        const eventsResponse = await fetch("/api/events")
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          setEvents(data.events || [])
        }
      }
    } catch (err) {
      setRsvpStatuses((prev) => ({ ...prev, [eventId]: "none" }))
    }
  }

  const handleCancelRSVP = async (eventId: string) => {
    setRsvpStatuses((prev) => ({ ...prev, [eventId]: "loading" }))

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setRsvpStatuses((prev) => ({ ...prev, [eventId]: "none" }))
        const eventsResponse = await fetch("/api/events")
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          setEvents(data.events || [])
        }
      }
    } catch (err) {
      setRsvpStatuses((prev) => ({ ...prev, [eventId]: "registered" }))
    }
  }

  const categories = [
    "all",
    ...Array.from(
      new Set(events.map((event) => event.category?.name).filter(Boolean))
    ),
  ]
  const locations = [
    "all",
    ...Array.from(new Set(events.map((event) => event.location))),
  ]

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || event.category?.name === selectedCategory
    const matchesLocation =
      selectedLocation === "all" || event.location === selectedLocation

    return matchesSearch && matchesCategory && matchesLocation
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderRSVPButton = (event: Event) => {
    if (!event.allowRegistration) {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled
          className="text-xs rounded-full"
        >
          Closed
        </Button>
      )
    }

    if (!user) {
      return (
        <Button
          size="sm"
          variant="outline"
          asChild
          className="text-xs rounded-full"
        >
          <Link href="/login">Login to RSVP</Link>
        </Button>
      )
    }

    const status = rsvpStatuses[event.id] || "none"

    if (status === "registered") {
      return (
        <Button
          size="sm"
          className="text-xs rounded-full bg-green-500 hover:bg-green-600 text-white border-0"
          onClick={() => handleCancelRSVP(event.id)}
          disabled={status === "loading"}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          {status === "loading" ? "Canceling…" : "Registered"}
        </Button>
      )
    }

    return (
      <Button
        size="sm"
        variant="outline"
        className="text-xs rounded-full border-[#0096FC] text-[#0096FC] hover:bg-[#0096FC]/10"
        onClick={() => handleRSVP(event.id)}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Registering…" : "RSVP"}
      </Button>
    )
  }

  // ─── Card component ───────────────────────────────────────────────────────
  const EventCard = ({ event }: { event: Event }) => (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-[#0096FC]/30 hover:shadow-xl hover:shadow-[#002674]/5 transition-all duration-300 flex flex-col">
      {/* Cover image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={event.flyer || "/placeholder.svg"}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#002674]/80 text-white backdrop-blur-sm">
            {event.category?.name || "Event"}
          </span>
          {event.isFeatured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#0096FC] text-white">
              Featured
            </span>
          )}
        </div>
        {/* Price badge */}
        <div className="absolute bottom-3 right-3">
          {event.price === 0 ? (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500 text-white">
              Free
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/90 text-[#002674]">
              {event.price.toLocaleString()} {event.currency}
            </span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-base text-foreground line-clamp-2 mb-2 group-hover:text-[#0096FC] transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {event.description}
        </p>

        {/* Metadata */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[#0096FC]" />
            <span>
              {formatDate(event.startDate)} · {formatTime(event.startDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0096FC]" />
            <span className="truncate">
              {event.venue}, {event.location}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 shrink-0 text-[#0096FC]" />
            <span className="truncate">
              {event.organizer.organization || event.organizer.fullName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border/40 mt-auto">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full group/btn bg-[#002674] hover:bg-[#002674]/90 text-white rounded-full text-xs"
            >
              <span>View Details</span>
              <span className="relative ml-1.5 inline-flex items-center">
                <ChevronRight className="h-3.5 w-3.5 opacity-100 group-hover/btn:opacity-0 transition-opacity absolute" />
                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </span>
            </Button>
          </Link>
          {renderRSVPButton(event)}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-brand-gradient py-14 px-6 mb-8 rounded-2xl">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-[#0096FC]/20 pointer-events-none" />

        <div className="relative max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-px h-5 bg-[#0096FC]" />
            <span className="text-[#0096FC] text-sm font-semibold uppercase tracking-widest">
              Events &amp; Programs
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 leading-tight">
            Discover Events Across
            <br />
            Rwanda&apos;s Drone Ecosystem
          </h1>
          <p className="text-white/75 text-base mb-6 max-w-xl">
            Join workshops, competitions, seminars, and meetups designed to
            grow your skills and expand your network.
          </p>
          {user && (
            <Link href="/events/new">
              <Button
                size="lg"
                className="bg-white text-[#002674] hover:bg-white/90 rounded-full font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full bg-muted/60 border-border/50"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#002674] text-white shadow-sm"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {cat === "all" ? "All Events" : cat}
            </button>
          ))}
        </div>

        {/* Location filter */}
        {locations.length > 1 && (
          <div className="flex gap-2 flex-wrap items-center">
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLocation === loc
                    ? "bg-[#0096FC] text-white shadow-sm"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {loc === "all" ? "All Locations" : loc}
              </button>
            ))}
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 ml-auto bg-muted rounded-lg p-1 self-start">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-background shadow-sm"
                : "hover:bg-background/50"
            }`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────────────────── */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {filteredEvents.length}
        </span>{" "}
        {filteredEvents.length === 1 ? "event" : "events"}
      </p>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-muted animate-pulse aspect-[4/3]"
            />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group flex gap-4 bg-card rounded-xl border border-border/40 hover:border-[#0096FC]/30 p-4 transition-all hover:shadow-md"
            >
              <img
                src={event.flyer || "/placeholder.svg"}
                alt={event.title}
                className="w-24 h-20 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#002674]/10 text-[#002674] dark:bg-[#0096FC]/10 dark:text-[#0096FC]">
                    {event.category?.name || "Event"}
                  </span>
                  {event.price === 0 && (
                    <span className="text-xs font-semibold text-green-600">
                      Free
                    </span>
                  )}
                  {event.isFeatured && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#0096FC] text-white">
                      Featured
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-[#0096FC] transition-colors">
                  {event.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {event.description}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#0096FC]" />
                    {formatDate(event.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#0096FC]" />
                    {formatTime(event.startDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#0096FC]" />
                    {event.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0 justify-center">
                <Link href={`/events/${event.id}`}>
                  <Button
                    size="sm"
                    className="rounded-full bg-[#002674] hover:bg-[#002674]/90 text-white text-xs"
                  >
                    Details
                  </Button>
                </Link>
                {renderRSVPButton(event)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {filteredEvents.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[#002674]/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-[#002674] dark:text-[#0096FC]" />
          </div>
          <h3 className="text-lg font-bold mb-2">No events found</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Try adjusting your filters or check back for new events.
          </p>
          {user && (
            <Link href="/events/new">
              <Button className="rounded-full bg-[#002674] hover:bg-[#002674]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create the First Event
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <div className="mt-12 rounded-2xl bg-brand-gradient p-8 text-center relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl font-extrabold text-white mb-2">
            Hosting a Drone Event?
          </h2>
          <p className="text-white/75 mb-6 text-sm max-w-md mx-auto">
            Share your event with Rwanda&apos;s drone community — workshops,
            races, demonstrations, and more.
          </p>
          {user ? (
            <Link href="/events/new">
              <Button
                size="lg"
                className="bg-white text-[#002674] hover:bg-white/90 rounded-full font-semibold"
              >
                Create Your Event
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-[#002674] hover:bg-white/90 rounded-full font-semibold"
              >
                Join &amp; Create Events
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
