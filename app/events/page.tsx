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
  const [activeCatFilter, setActiveCatFilter] = useState("all")
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
    if (activeCatFilter !== "all") out = out.filter(e => e.category && e.category.name === activeCatFilter)
    if (selCats.length) out = out.filter(e => e.category && selCats.includes(e.category.name))
    if (selLocs.length) out = out.filter(e => selLocs.includes(e.location))
    if (search.trim()) {
      const q = search.toLowerCase()
      out = out.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
    }
    return out
  }, [events, activeCatFilter, selCats, selLocs, search])

  const activeFilters = selCats.length + selLocs.length

  function applyFilters()  { setSelCats(pendingCats); setSelLocs(pendingLocs) }
  function clearFilters()  { setPendingCats([]); setPendingLocs([]); setSelCats([]); setSelLocs([]); setSearch("") }
  function toggleCat(c: string) { setPendingCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]) }
  function toggleLoc(l: string) { setPendingLocs(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]) }

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-RW", { day: "numeric", month: "short", year: "numeric" })
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Hero */}
      <div className="relative bg-brand-gradient rounded-2xl overflow-hidden px-8 py-12 md:py-16">
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-8 right-40 h-20 w-20 rounded-full bg-white/10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-[#0096FC]">
              Rwanda UAS Ecosystem
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              Events & Programmes
            </h1>
            <p className="text-white/75 text-base md:text-lg max-w-xl">
              Discover upcoming workshops, competitions, seminars, and meetups across Rwanda&apos;s drone ecosystem.
            </p>
          </div>
          {user && (
            <Link href="/events/new">
              <Button className="bg-white text-[#002674] font-semibold hover:bg-white/90 rounded-xl px-6 shadow-lg flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        className="w-full px-4 py-2 border rounded-lg bg-background text-sm"
        type="search"
        placeholder="Search events..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Category pill tabs */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCatFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeCatFilter === "all"
                ? "bg-[#002674] text-white border-[#002674] shadow-sm"
                : "bg-background text-muted-foreground border-border/50 hover:border-[#0096FC]/50 hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCatFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeCatFilter === cat
                  ? "bg-[#002674] text-white border-[#002674] shadow-sm"
                  : "bg-background text-muted-foreground border-border/50 hover:border-[#0096FC]/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Location filter */}
      {locations.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => { clearFilters() }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              selLocs.length === 0
                ? "bg-[#002674] text-white border-[#002674] shadow-sm"
                : "bg-background text-muted-foreground border-border/50 hover:border-[#0096FC]/50 hover:text-foreground"
            }`}
          >
            All Locations
          </button>
          {locations.map(loc => (
            <button
              key={loc}
              onClick={() => { setPendingLocs([loc]); setSelLocs([loc]) }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                selLocs.includes(loc)
                  ? "bg-[#002674] text-white border-[#002674] shadow-sm"
                  : "bg-background text-muted-foreground border-border/50 hover:border-[#0096FC]/50 hover:text-foreground"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      )}

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
              style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid", cursor: "pointer", background: viewMode === "list" ? "linear-gradient(135deg,#002674,#0058dd)" : "#fff", color: viewMode === "list" ? "#fff" : "#64748b", borderColor: viewMode === "list" ? "#002674" : "#e2e8f0" }}
            ><LayoutList size={15} /></button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid view"
              style={{ padding: "5px 8px", borderRadius: 7, border: "1px solid", cursor: "pointer", background: viewMode === "grid" ? "linear-gradient(135deg,#002674,#0058dd)" : "#fff", color: viewMode === "grid" ? "#fff" : "#64748b", borderColor: viewMode === "grid" ? "#002674" : "#e2e8f0" }}
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
                    : <span className="evt-grid-card__badge" style={{ background: "linear-gradient(135deg,#002674,#0058dd)" }}>{event.price.toLocaleString()} {event.currency}</span>
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
