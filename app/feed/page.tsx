"use client"

import { useState, useEffect, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MessageSquare,
  FolderOpen,
  Wrench,
  BookOpen,
  Calendar,
  PlaneTakeoff,
  Users,
  Loader2,
  Rss,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

// ─── Types ─────────────────────────────────────────────────────────────────

type ActivityType =
  | "posted_forum"
  | "created_project"
  | "new_service"
  | "logged_flight"
  | "enrolled_course"
  | "attended_event"

interface FeedActor {
  id: string
  username: string
  fullName: string
  avatar?: string
}

interface FeedItem {
  id: string
  activityType: ActivityType
  actor: FeedActor
  entityId?: string
  data?: { title?: string; [key: string]: unknown }
  createdAt: string
}

interface FeedResponse {
  items: FeedItem[]
  nextCursor: string | null
  followingCount: number
}

interface PilotUser {
  id: string
  username: string
  fullName: string
  avatar?: string
  role: string
  isFollowing?: boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

const activityConfig: Record<
  ActivityType,
  { label: string; icon: React.ElementType; href: (id?: string) => string }
> = {
  posted_forum: {
    label: "posted in the forum",
    icon: MessageSquare,
    href: () => "/forum",
  },
  created_project: {
    label: "shared a project",
    icon: FolderOpen,
    href: (id) => `/projects/${id}`,
  },
  new_service: {
    label: "listed a new service",
    icon: Wrench,
    href: (id) => `/services/${id}`,
  },
  logged_flight: {
    label: "logged a flight",
    icon: PlaneTakeoff,
    href: () => "/logbook",
  },
  enrolled_course: {
    label: "enrolled in a course",
    icon: BookOpen,
    href: (id) => `/learn/${id}`,
  },
  attended_event: {
    label: "is attending an event",
    icon: Calendar,
    href: (id) => `/events/${id}`,
  },
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ─── Feed Item Component ─────────────────────────────────────────────────────

function FeedItemCard({ item }: { item: FeedItem }) {
  const config = activityConfig[item.activityType]
  const Icon = config?.icon ?? MessageSquare
  const href = config?.href(item.entityId) ?? "#"
  const label = config?.label ?? item.activityType

  return (
    <div className="flex gap-3 py-4">
      <Link href={`/profile/${item.actor.username}`} className="shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={item.actor.avatar} alt={item.actor.fullName} />
          <AvatarFallback className="text-sm font-semibold bg-muted text-muted-foreground">
            {initials(item.actor.fullName)}
          </AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <Link
            href={`/profile/${item.actor.username}`}
            className="font-semibold text-foreground hover:underline"
          >
            {item.actor.fullName}
          </Link>
          <span className="text-muted-foreground">@{item.actor.username}</span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Link href={href} className="text-muted-foreground hover:text-foreground hover:underline">
            {label}
          </Link>
          <span className="text-muted-foreground ml-auto text-xs whitespace-nowrap">
            {relativeTime(item.createdAt)}
          </span>
        </div>

        {item.data?.title && (
          <Link href={href}>
            <p className="mt-1 text-sm text-foreground font-medium hover:underline line-clamp-2">
              {item.data.title}
            </p>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Sidebar: People You May Follow ─────────────────────────────────────────

function PeopleToFollow() {
  const [pilots, setPilots] = useState<PilotUser[]>([])
  const [following, setFollowing] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch("/api/pilots", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const all: PilotUser[] = d.pilots || []
        const unfollowed = all.filter((p) => !p.isFollowing).slice(0, 5)
        setPilots(unfollowed)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleFollow = async (username: string) => {
    setLoadingIds((prev) => new Set(prev).add(username))
    try {
      const res = await fetch(`/api/users/${username}/follow`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        setFollowing((prev) => {
          const next = new Set(prev)
          if (next.has(username)) next.delete(username)
          else next.add(username)
          return next
        })
      }
    } catch {
      // ignore
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(username)
        return next
      })
    }
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-4 space-y-3">
          <p className="font-semibold text-sm text-foreground">People You May Follow</p>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (pilots.length === 0) return null

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="font-semibold text-sm text-foreground mb-3">People You May Follow</p>
        <div className="space-y-3">
          {pilots.map((pilot) => {
            const isNowFollowing = following.has(pilot.username)
            const busy = loadingIds.has(pilot.username)
            return (
              <div key={pilot.id} className="flex items-center gap-3">
                <Link href={`/profile/${pilot.username}`} className="shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={pilot.avatar} alt={pilot.fullName} />
                    <AvatarFallback className="text-xs font-semibold bg-muted text-muted-foreground">
                      {initials(pilot.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${pilot.username}`}
                    className="text-sm font-medium text-foreground hover:underline truncate block"
                  >
                    {pilot.fullName}
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">@{pilot.username}</p>
                </div>
                <Button
                  size="sm"
                  variant={isNowFollowing ? "secondary" : "outline"}
                  className="shrink-0 text-xs h-7 px-2.5"
                  onClick={() => handleFollow(pilot.username)}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : isNowFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </Button>
              </div>
            )
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <Link href="/pilots" className="text-xs text-muted-foreground hover:text-foreground">
            Browse all members →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Feed Page ──────────────────────────────────────────────────────────

function FeedContent() {
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [followingCount, setFollowingCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async (cursor?: string) => {
    const url = cursor ? `/api/feed?cursor=${cursor}` : "/api/feed"
    const res = await fetch(url, { credentials: "include" })
    if (!res.ok) throw new Error("Failed to fetch feed")
    return res.json() as Promise<FeedResponse>
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchFeed()
      .then((data) => {
        setItems(data.items)
        setNextCursor(data.nextCursor)
        setFollowingCount(data.followingCount)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, fetchFeed])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await fetchFeed(nextCursor)
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.nextCursor)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <Rss className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Sign in to see your feed</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Keep up with the drone community. See what pilots, builders, and enthusiasts are sharing.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 py-4">
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty — not following anyone
  if (followingCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <Users className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Your feed is empty</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Follow people to see their activity here. Discover pilots and community members.
        </p>
        <Button asChild>
          <Link href="/pilots">Browse Members</Link>
        </Button>
      </div>
    )
  }

  // Empty feed (following someone but nothing posted)
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <Rss className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Nothing new yet</h2>
        <p className="text-muted-foreground max-w-sm">
          The people you follow haven&apos;t posted anything recently. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <FeedItemCard key={item.id} item={item} />
        ))}
      </div>

      {nextCursor && (
        <div className="pt-6 pb-2 flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="min-w-32"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main feed column */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Rss className="h-6 w-6" />
                Your Feed
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Activity from people you follow
              </p>
            </div>
            <Separator className="mb-2" />
            <FeedContent />
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-4">
            <PeopleToFollow />
          </aside>
        </div>
      </div>
    </div>
  )
}
