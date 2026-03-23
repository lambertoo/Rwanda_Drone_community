"use client"

import { useState, useEffect, useMemo } from "react"
export const dynamic = "force-dynamic"
import Link from "next/link"
import { MapPin, Phone, Mail, Globe, BadgeCheck, Star, Plus, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Service {
  id: string
  title: string
  description: string
  category: string
  region: string
  phone?: string
  email?: string
  website?: string
  rating: number
  reviewCount: number
  isFeatured: boolean
  provider: {
    id: string
    fullName: string
    avatar?: string
    organization?: string
    isVerified: boolean
  }
}

const SERVICE_CATEGORIES = [
  "Mapping & Surveying",
  "Photography & Videography",
  "Agriculture",
  "Repair & Maintenance",
  "Training & Education",
  "Inspection Services",
]

const REGIONS = [
  { value: "KIGALI_NYARUGENGE", label: "Kigali – Nyarugenge" },
  { value: "KIGALI_KICUKIRO",   label: "Kigali – Kicukiro" },
  { value: "KIGALI_GASABO",     label: "Kigali – Gasabo" },
  { value: "NORTH_MUSANZE",     label: "Musanze" },
  { value: "SOUTH_HUYE",        label: "Huye" },
]

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatRegion(r: string) {
  return r.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
}

export default function ServicesPage() {
  const [services, setServices]         = useState<Service[]>([])
  const [loading, setLoading]           = useState(true)
  const [mounted, setMounted]           = useState(false)
  const [search, setSearch]             = useState("")
  const [selCategories, setSelCategories] = useState<string[]>([])
  const [selRegions, setSelRegions]     = useState<string[]>([])
  // pending = what's in the sidebar checkboxes before Apply
  const [pendingCats, setPendingCats]   = useState<string[]>([])
  const [pendingRegs, setPendingRegs]   = useState<string[]>([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchServices = async () => {
      try {
        const params = new URLSearchParams()
        if (selCategories.length === 1) params.append("category", selCategories[0])
        if (selRegions.length === 1)    params.append("region", selRegions[0])
        const res = await fetch(`/api/services?${params}`)
        const data = await res.json()
        setServices(data.services || [])
      } catch {
        setServices([])
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [mounted, selCategories, selRegions])

  const displayed = useMemo(() => {
    let out = services
    if (selCategories.length > 0) out = out.filter(s => selCategories.includes(s.category))
    if (selRegions.length > 0)    out = out.filter(s => selRegions.includes(s.region))
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(s =>
        (s.provider.organization || s.provider.fullName).toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      )
    }
    return out
  }, [services, selCategories, selRegions, search])

  function applyFilters() {
    setSelCategories(pendingCats)
    setSelRegions(pendingRegs)
  }

  function clearFilters() {
    setPendingCats([])
    setPendingRegs([])
    setSelCategories([])
    setSelRegions([])
    setSearch("")
  }

  function toggleCat(c: string) {
    setPendingCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function toggleReg(r: string) {
    setPendingRegs(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  const activeFilters = selCategories.length + selRegions.length

  if (!mounted) {
    return (
      <div className="dir-layout">
        <div className="dir-hero-span"><div className="rounded-xl bg-muted animate-pulse h-36" /></div>
        <div className="rounded-xl bg-muted animate-pulse h-64" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="rounded-xl bg-muted animate-pulse h-24" />)}</div>
      </div>
    )
  }

  return (
    <div className="dir-layout">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="dir-hero-span">
        <div className="dir-hero-wrap">
          <div className="dir-hero">
            <h1>Drone Service Providers</h1>
            <p>Connect with trusted drone professionals, operators, and specialists across Rwanda.</p>
            <input
              className="dir-search-input"
              type="search"
              placeholder="Search providers, categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Filters sidebar ──────────────────────────── */}
      <aside className="dir-filters" aria-label="Filters">
        <div className="dir-filters__head">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
            Filters{activeFilters > 0 && <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 800, background: "#0058dd", color: "#fff", borderRadius: 999, padding: "1px 7px" }}>{activeFilters}</span>}
          </span>
        </div>
        <div className="dir-filters__body">
          <fieldset className="dir-fieldset">
            <legend>Category</legend>
            {SERVICE_CATEGORIES.map(cat => (
              <label key={cat} className="dir-check">
                <input type="checkbox" checked={pendingCats.includes(cat)} onChange={() => toggleCat(cat)} />
                <span className="dir-check__box" aria-hidden="true" />
                {cat}
              </label>
            ))}
          </fieldset>
          <fieldset className="dir-fieldset">
            <legend>Location</legend>
            {REGIONS.map(r => (
              <label key={r.value} className="dir-check">
                <input type="checkbox" checked={pendingRegs.includes(r.value)} onChange={() => toggleReg(r.value)} />
                <span className="dir-check__box" aria-hidden="true" />
                {r.label}
              </label>
            ))}
          </fieldset>
          <div className="dir-filters__actions">
            <button className="dir-apply-btn" onClick={applyFilters}>
              Apply Filters{(pendingCats.length + pendingRegs.length) > 0 && ` (${pendingCats.length + pendingRegs.length})`}
            </button>
            {activeFilters > 0 && (
              <button className="dir-clear-btn" onClick={clearFilters}>Clear all</button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Feed ─────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <p className="dir-count">
            Showing <strong>{displayed.length}</strong> {displayed.length === 1 ? "provider" : "providers"}
          </p>
          <Link href="/services/new">
            <Button size="sm" style={{ background: "#002674", color: "#fff", borderRadius: 999 }} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> List your service
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="dir-list">
            {[...Array(5)].map((_, i) => <div key={i} className="rounded-xl bg-muted animate-pulse h-24" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#64748b" }}>
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: 6 }}>No providers found</p>
            <p style={{ fontSize: 14, marginBottom: 20 }}>Try adjusting your filters or search term.</p>
            <button className="dir-clear-btn" style={{ fontSize: 14 }} onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <div className="dir-list">
            {displayed.map(service => {
              const name = service.provider.organization || service.provider.fullName
              return (
                <Link key={service.id} href={`/services/${service.id}`} className="dir-row">
                  <div className="dir-row__avatar">{getInitials(name)}</div>
                  <div className="dir-row__body">
                    <div className="dir-row__head">
                      <div style={{ minWidth: 0 }}>
                        <h2 className="dir-row__name">
                          {name}
                          {service.provider.isVerified && (
                            <BadgeCheck style={{ display: "inline", marginLeft: 6, verticalAlign: "middle", color: "#0058dd", width: 15, height: 15 }} />
                          )}
                        </h2>
                        <p className="dir-row__cat">{service.category}</p>
                      </div>
                      <span className="dir-row__link" aria-hidden="true">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div className="dir-row__meta">
                      <span className="dir-row__meta-item">
                        <MapPin size={13} style={{ color: "#94a3b8" }} />
                        {formatRegion(service.region)}
                      </span>
                      {service.reviewCount > 0 && (
                        <span className="dir-row__meta-item">
                          <Star size={13} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                          {service.rating.toFixed(1)} · {service.reviewCount} review{service.reviewCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {service.phone && (
                        <span className="dir-row__meta-item">
                          <Phone size={13} style={{ color: "#94a3b8" }} />
                          {service.phone}
                        </span>
                      )}
                      {service.email && (
                        <span className="dir-row__meta-item">
                          <Mail size={13} style={{ color: "#94a3b8" }} />
                          {service.email}
                        </span>
                      )}
                      {service.website && (
                        <span className="dir-row__meta-item">
                          <Globe size={13} style={{ color: "#94a3b8" }} />
                          Website
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p style={{ marginTop: 8, fontSize: 13, color: "#64748b", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {service.description}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* View more / CTA */}
        {!loading && displayed.length > 0 && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link href="/services/new">
              <Button variant="outline" className="rounded-full">Don&apos;t see your service? Add it →</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
