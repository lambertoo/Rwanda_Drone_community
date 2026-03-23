"use client"

import { useState, useEffect, useMemo } from "react"
export const dynamic = "force-dynamic"
import Link from "next/link"
import { MapPin, Plus, Calendar, Users, ArrowUpRight, LayoutList, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface Event {
  id: string
  title: string
  description: string
  category?: { id: string; name: string; slug: string; color: string }
  startDate: string
  endDate: string
  location: string
  venue: string
  price: number
  currency: string
  isFeatured: boolean
  allowRegistration?: boolean
  flyer?: string
  organizer: { id: string; fullName: string; organization?: string }
  registeredCount?: number
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function DateBlock({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr)
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      width: 52, height: 56, borderRadius: 10, flexShrink: 0,
      background: "linear-gradient(180deg,#002674 0%,#0058dd 100%)",
      color: "#fff",
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", opacity: 0.85 }}>{MONTHS[d.getMonth()]}</span>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents]             = useState<Event[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState("")
  const [pendingCats, setPendingCats]   = useState<string[]>([])
  const [pendingLocs, setPendingLocs]   = useState<string[]>([])
  const [selCats, setSelCats]           = useState<string[]>([])
  const [selLocs, setSelLocs]           = useState<string[]>([])
  const [viewMode, setViewMode]         = useState<"list" | "grid">("list")
  const { user } = useAuth()

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(d => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => Array.from(new Set(events.map(e => e.category?.name).filter(Boolean) as string[])), [events])
  const locations  = useMemo(() => Array.from(new Set(events.map(e => e.location).filter(Boolean))), [events])

  const displayed = useMemo(() => {
    let out = events
    if (selCats.length) out = out.filter(e => e.category && selCats.includes(e.category.name))
    if (selLocs.length) out = out.filter(e => selLocs.includes(e.location))
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
    }
    return out
  }, [events, selCats, selLocs, search])

  const activeFilters = selCats.length + selLocs.length

  function applyFilters()  { setSelCats(pendingCats); setSelLocs(pendingLocs) }
  function clearFilters()  { setPendingCats([]); setPendingLocs([]); setSelCats([]); setSelLocs([]); setSearch("") }
  function toggleCat(c: string) { setPendingCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]) }
  function toggleLoc(l: string) { setPendingLocs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]) }

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="dir-layout">
      {/* ── Hero ───────────────────────────────────────── */}
      <div className="dir-hero-span">
        <div className="dir-hero-wrap">
          <div className="dir-hero" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1>Events &amp; Programmes</h1>
              <p>Discover upcoming workshops, competitions, seminars, and meetups across Rwanda&apos;s drone ecosystem.</p>
              <input
                className="dir-search-input"
                type="search"
                placeholder="Search events…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {user && (
              <Link href="/events/new" style={{ marginTop: 4 }}>
                <Button style={{ background: "#002674", color: "#fff", borderRadius: 999 }} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter sidebar ─────────────────────────────── */}
      <aside className="dir-filters" aria-label="Filters">
        <div className="dir-filters__head">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            Filters{activeFilters > 0 && <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 800, background: "#0058dd", color: "#fff", borderRadius: 999, padding: "1px 7px" }}>{activeFilters}</span>}
          </span>
        </div>
        <div className="dir-filters__body">
          {categories.length > 0 && (
            <fieldset className="dir-fieldset">
              <legend>Category</legend>
              {categories.map(cat => (
                <label key={cat} className="dir-check">
                  <input type="checkbox" checked={pendingCats.includes(cat)} onChange={() => toggleCat(cat)} />
                  <span className="dir-check__box" aria-hidden="true" />
                  {cat}
                </label>
              ))}
            </fieldset>
          )}
          {locations.length > 0 && (
            <fieldset className="dir-fieldset">
              <legend>Location</legend>
              {locations.map(loc => (
                <label key={loc} className="dir-check">
                  <input type="checkbox" checked={pendingLocs.includes(loc)} onChange={() => toggleLoc(loc)} />
                  <span className="dir-check__box" aria-hidden="true" />
                  {loc}
                </label>
              ))}
            </fieldset>
          )}
          <div className="dir-filters__actions">
            <button className="dir-apply-btn" onClick={applyFilters}>
              Apply Filters{(pendingCats.length + pendingLocs.length) > 0 && ` (${pendingCats.length + pendingLocs.length})`}
            </button>
            {activeFilters > 0 && <button className="dir-clear-btn" onClick={clearFilters}>Clear all</button>}
          </div>
        </div>
      </aside>

      {/* ── Event feed ─────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p className="dir-count" style={{ margin: 0 }}>
            Showing <strong>{displayed.length}</strong> {displayed.length === 1 ? "event" : "events"}
          </p>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setViewMode("list")}
              title="List view"
              style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid", cursor: "pointer", background: viewMode === "list" ? "#002674" : "#fff", color: viewMode === "list" ? "#fff" : "#64748b", borderColor: viewMode === "list" ? "#002674" : "#e2e8f0" }}
            ><LayoutList size={15} /></button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid", cursor: "pointer", background: viewMode === "grid" ? "#002674" : "#fff", color: viewMode === "grid" ? "#fff" : "#64748b", borderColor: viewMode === "grid" ? "#002674" : "#e2e8f0" }}
            ><LayoutGrid size={15} /></button>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill,minmax(260px,1fr))" : "1fr", gap: 16 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl bg-muted animate-pulse" style={{ height: viewMode === "grid" ? 220 : 90 }} />)}
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 16px", color: "#64748b" }}>
            <Calendar size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a", marginBottom: 6 }}>No events found</p>
            <p style={{ fontSize: 14, marginBottom: 16 }}>Try adjusting your filters or search.</p>
            {activeFilters > 0 && <button className="dir-clear-btn" onClick={clearFilters}>Clear filters</button>}
          </div>
        ) : viewMode === "list" ? (
          <div className="evt-list">
            {displayed.map(event => (
              <Link key={event.id} href={`/events/${event.id}`} className="evt-row">
                <DateBlock dateStr={event.startDate} />
                {event.flyer && (
                  <div style={{ width: 80, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                    <img src={event.flyer} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div className="evt-row__body">
                  <div className="evt-row__head">
                    <div style={{ minWidth: 0 }}>
                      {event.category && <span className="evt-row__cat">{event.category.name}</span>}
                      <h2 className="evt-row__title">{event.title}</h2>
                    </div>
                    <span className="dir-row__link" aria-hidden="true"><ArrowUpRight size={16} /></span>
                  </div>
                  <div className="evt-row__meta">
                    <span className="dir-row__meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {fmtDate(event.startDate)} · {fmtTime(event.startDate)}
                    </span>
                    <span className="dir-row__meta-item"><MapPin size={13} style={{ color: "#94a3b8" }} />{event.venue ? `${event.venue}, ` : ""}{event.location}</span>
                    <span className="dir-row__meta-item"><Users size={13} style={{ color: "#94a3b8" }} />{event.organizer.organization || event.organizer.fullName}</span>
                    {event.price === 0
                      ? <span style={{ fontSize: 11, fontWeight: 800, color: "#16a34a", background: "#dcfce7", borderRadius: 999, padding: "1px 8px" }}>Free</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, color: "#0058dd" }}>{event.price.toLocaleString()} {event.currency}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
            {displayed.map(event => (
              <Link key={event.id} href={`/events/${event.id}`} className="evt-grid-card">
                {/* Card image / date header */}
                <div className="evt-grid-card__top">
                  {event.flyer
                    ? <img src={event.flyer} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#002674,#0058dd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Calendar size={32} style={{ color: "rgba(255,255,255,0.4)" }} />
                      </div>
                  }
                  <div className="evt-grid-card__date">
                    <DateBlock dateStr={event.startDate} />
                  </div>
                  {event.price === 0
                    ? <span className="evt-grid-card__badge" style={{ background: "#16a34a" }}>Free</span>
                    : <span className="evt-grid-card__badge" style={{ background: "#0058dd" }}>{event.price.toLocaleString()} {event.currency}</span>
                  }
                </div>
                <div className="evt-grid-card__body">
                  {event.category && <span className="evt-row__cat">{event.category.name}</span>}
                  <h2 className="evt-grid-card__title">{event.title}</h2>
                  <div className="evt-row__meta" style={{ marginTop: 8 }}>
                    <span className="dir-row__meta-item"><MapPin size={12} style={{ color: "#94a3b8" }} />{event.location}</span>
                    <span className="dir-row__meta-item">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {fmtDate(event.startDate)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
