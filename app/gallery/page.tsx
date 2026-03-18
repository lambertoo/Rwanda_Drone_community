"use client"

import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, ImageIcon, ZoomIn } from "lucide-react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

type GalleryCategory = "All" | "Photography" | "Survey & Mapping" | "Events" | "Projects"

interface GalleryItem {
  id: string
  title: string
  thumbnail: string
  authorUsername: string
  category: GalleryCategory
  sourceHref: string
  sourceType: "project" | "event"
}

// ─── Category badge colours (semantic-safe) ──────────────────────────────────

const categoryBadgeVariant: Record<GalleryCategory, "default" | "secondary" | "outline"> = {
  All: "secondary",
  Photography: "default",
  "Survey & Mapping": "secondary",
  Events: "outline",
  Projects: "secondary",
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function guessProjectCategory(project: { category?: string; title?: string }): GalleryCategory {
  const cat = (project.category || "").toLowerCase()
  const title = (project.title || "").toLowerCase()
  if (cat.includes("survey") || cat.includes("mapping") || title.includes("survey") || title.includes("map")) {
    return "Survey & Mapping"
  }
  if (cat.includes("photo") || cat.includes("aerial") || title.includes("photo") || title.includes("aerial")) {
    return "Photography"
  }
  return "Projects"
}

// ─── Image Modal ─────────────────────────────────────────────────────────────

function ImageModal({
  item,
  onClose,
}: {
  item: GalleryItem
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>

        {/* Image */}
        <div className="flex-1 overflow-hidden bg-muted flex items-center justify-center min-h-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnail}
            alt={item.title}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              by{" "}
              <Link
                href={`/profile/${item.authorUsername}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{item.authorUsername}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={categoryBadgeVariant[item.category]}>{item.category}</Badge>
            <Button size="sm" variant="outline" asChild>
              <Link
                href={item.sourceHref}
                onClick={(e) => e.stopPropagation()}
              >
                View {item.sourceType === "event" ? "Event" : "Project"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Gallery Card ─────────────────────────────────────────────────────────────

function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem
  onClick: () => void
}) {
  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border bg-muted break-inside-avoid mb-4"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`View ${item.title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/60 transition-colors duration-200 flex items-center justify-center">
        <ZoomIn className="h-8 w-8 text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* Footer overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
        <p className="text-foreground font-semibold text-sm truncate">{item.title}</p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-muted-foreground text-xs">@{item.authorUsername}</p>
          <Badge variant={categoryBadgeVariant[item.category]} className="text-xs">
            {item.category}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// ─── Main Gallery Page ────────────────────────────────────────────────────────

const TABS: GalleryCategory[] = ["All", "Photography", "Survey & Mapping", "Events", "Projects"]

export default function GalleryPage() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<GalleryCategory>("All")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

  const fetchGallery = useCallback(async () => {
    try {
      const [projectsRes, eventsRes] = await Promise.all([
        fetch("/api/projects", { credentials: "include" }),
        fetch("/api/events", { credentials: "include" }),
      ])

      const galleryItems: GalleryItem[] = []

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        const projects = projectsData.projects || projectsData || []
        for (const p of projects) {
          if (p.thumbnail) {
            galleryItems.push({
              id: `project-${p.id}`,
              title: p.title || "Untitled Project",
              thumbnail: p.thumbnail,
              authorUsername: p.author?.username || p.username || "unknown",
              category: guessProjectCategory(p),
              sourceHref: `/projects/${p.id}`,
              sourceType: "project",
            })
          }
        }
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        const events = eventsData.events || eventsData || []
        for (const ev of events) {
          const thumb = ev.thumbnail || ev.flyer || ev.image
          if (thumb) {
            galleryItems.push({
              id: `event-${ev.id}`,
              title: ev.title || "Untitled Event",
              thumbnail: thumb,
              authorUsername: ev.organizer?.username || ev.username || "unknown",
              category: "Events",
              sourceHref: `/events/${ev.id}`,
              sourceType: "event",
            })
          }
        }
      }

      setAllItems(galleryItems)
    } catch {
      // fail silently — empty state handles it
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const filtered =
    activeTab === "All" ? allItems : allItems.filter((i) => i.category === activeTab)

  return (
    <div className="min-h-screen bg-background">
      {/* Modal */}
      {selectedItem && (
        <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Aerial Gallery</h1>
          <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
            Stunning drone photography and videography from Rwanda&apos;s community
          </p>
        </div>

        {/* Filter tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as GalleryCategory)}
          className="mb-8"
        >
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="text-sm"
              >
                {tab}
                {tab !== "All" && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({allItems.filter((i) => i.category === tab).length})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Loading skeleton */}
        {loading && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 break-inside-avoid rounded-lg bg-muted animate-pulse"
                style={{ height: `${160 + (i % 3) * 60}px` }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ImageIcon className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No images yet</h2>
            <p className="text-muted-foreground max-w-sm">
              {activeTab === "All"
                ? "No images have been shared yet. Projects and events with thumbnails will appear here."
                : `No images in the "${activeTab}" category yet.`}
            </p>
            {activeTab !== "All" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setActiveTab("All")}
              >
                View all images
              </Button>
            )}
          </div>
        )}

        {/* Masonry grid */}
        {!loading && filtered.length > 0 && (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
              {filtered.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-8">
              {filtered.length} image{filtered.length !== 1 ? "s" : ""} shown
            </p>
          </>
        )}
      </div>
    </div>
  )
}
