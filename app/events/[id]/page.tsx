'use client'

import { useState, useEffect } from "react"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import AdvancedRegistrationForm from "@/components/events/advanced-registration-form"

interface Event {
  id: string; title: string; description: string; fullDescription?: string
  category?: { id: string; name: string; slug: string; color: string }
  startDate: string; endDate: string; location: string; venue: string
  price: number; currency: string; capacity?: number; registeredCount: number
  allowRegistration: boolean; registrationFormId?: string
  isPublished: boolean; isFeatured: boolean; organizerId: string
  organizer: { id: string; fullName: string; avatar?: string; organization?: string }
  requirements: string[]; tags: string[]; speakers: string[]
  agenda: string[]; gallery: string[]; flyer?: string
  registrationFields?: { id: string; label: string; type: string; options?: string[]; required: boolean }[]
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent]   = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [eventId, setEventId] = useState("")
  const [rsvpStatus, setRsvpStatus] = useState<'none' | 'registered' | 'loading'>('none')
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true
    params.then(({ id }) => {
      if (!mounted) return
      setEventId(id)
      fetch(`/api/events/${id}`)
        .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
        .then(d => { if (mounted && d.event) setEvent(d.event) })
        .catch(e => { if (mounted) setError(e.message) })
        .finally(() => { if (mounted) setLoading(false) })
    })
    return () => { mounted = false }
  }, [params])

  useEffect(() => {
    if (!user || !event || event.registrationFormId) return
    fetch(`/api/events/${eventId}/rsvp`, { credentials: 'include' })
      .then(r => setRsvpStatus(r.ok ? 'registered' : 'none'))
      .catch(() => {})
  }, [user, eventId, event])

  const handleRSVP = async () => {
    if (!user) { window.location.href = '/login'; return }
    setRsvpStatus('loading')
    const r = await fetch(`/api/events/${eventId}/rsvp`, { method: 'POST', credentials: 'include' }).catch(() => null)
    if (r?.ok) { setRsvpStatus('registered'); fetch(`/api/events/${eventId}`).then(r=>r.json()).then(d=>d.event&&setEvent(d.event)).catch(()=>{}) }
    else setRsvpStatus('none')
  }

  const handleCancelRSVP = async () => {
    setRsvpStatus('loading')
    const r = await fetch(`/api/events/${eventId}/rsvp`, { method: 'DELETE', credentials: 'include' }).catch(() => null)
    if (r?.ok) { setRsvpStatus('none') } else setRsvpStatus('registered')
  }

  const fmtDate = (s: string) => { const d = new Date(s); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` }
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const RSVPButton = () => {
    if (!event) return null
    if (!event.allowRegistration) return <Button disabled className="w-full rounded-full">Registration Closed</Button>
    if (!user) return <Button asChild className="w-full rounded-full" style={{ background: "linear-gradient(135deg,#003366,#0066B3)" }}><Link href="/login">Log In to Register</Link></Button>
    if (event.registrationFormId) return (
      <Button asChild className="w-full rounded-full" style={{ background: "linear-gradient(135deg,#003366,#0066B3)" }}>
        <Link href={`/forms/public/${event.registrationFormId}?eventId=${eventId}`}>Register Now</Link>
      </Button>
    )
    if (rsvpStatus === 'registered') return (
      <Button variant="outline" className="w-full rounded-full border-green-500 text-green-600 hover:bg-green-50" onClick={handleCancelRSVP}>
        <CheckCircle className="h-4 w-4 mr-2" /> Registered — Cancel?
      </Button>
    )
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full rounded-full" style={{ background: "linear-gradient(135deg,#003366,#0066B3)" }} onClick={handleRSVP} disabled={rsvpStatus === 'loading'}>
            {rsvpStatus === 'loading' ? 'Registering…' : 'Register Now'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Register for {event.title}</DialogTitle></DialogHeader>
          <AdvancedRegistrationForm eventId={eventId} fields={event.registrationFields || []} onComplete={() => setRsvpStatus('registered')} />
        </DialogContent>
      </Dialog>
    )
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
      <div style={{ textAlign: "center" }}>
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-[#0066B3]" />
        <p style={{ color: "#64748b" }}>Loading event…</p>
      </div>
    </div>
  )

  if (error || !event) return (
    <div style={{ textAlign: "center", padding: "64px 16px" }}>
      <h1 style={{ fontWeight: 800, marginBottom: 8 }}>Event Not Found</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>{error || 'This event does not exist.'}</p>
      <Link href="/events"><Button variant="outline" className="rounded-full">Back to Events</Button></Link>
    </div>
  )

  const startD = new Date(event.startDate)
  const spotsLeft = event.capacity ? Math.max(0, event.capacity - event.registeredCount) : null

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <div className="evt-detail-hero">
        {event.flyer && <img src={event.flyer} alt="" className="evt-detail-hero__bg" />}
        <div className="evt-detail-hero__overlay" />
        <div className="evt-detail-hero__inner">
          <Link href="/events" className="evt-back-link">
            <ArrowLeft size={15} /> Back to Events
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            {event.category && (
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(255,255,255,0.15)", color: "#fff", borderRadius: 999, padding: "3px 12px", backdropFilter: "blur(4px)" }}>
                {event.category.name}
              </span>
            )}
            {event.isFeatured && (
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(0,150,252,0.8)", color: "#fff", borderRadius: 999, padding: "3px 12px" }}>
                Featured
              </span>
            )}
          </div>
          <h1 className="evt-detail-hero__title">{event.title}</h1>
          <p className="evt-detail-hero__sub">{event.description}</p>
          <div className="evt-detail-hero__meta">
            <span><Calendar size={14} /> {fmtDate(event.startDate)} · {fmtTime(event.startDate)}</span>
            <span><MapPin size={14} /> {event.venue ? `${event.venue}, ` : ""}{event.location}</span>
            <span><Users size={14} /> {event.organizer.organization || event.organizer.fullName}</span>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className="evt-detail-body">
        {/* ── Left: content ─────────────────────────────── */}
        <div className="evt-detail-content">

          {/* About */}
          <section className="evt-section">
            <h2 className="evt-section__title">About this event</h2>
            <p style={{ color: "#374151", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {event.fullDescription || event.description}
            </p>

            {event.requirements?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 className="evt-section__subtitle">Requirements</h3>
                <ul style={{ margin: 0, paddingLeft: 20, color: "#374151", lineHeight: 1.8 }}>
                  {event.requirements.map((r: any, i: number) => (
                    <li key={i}>{typeof r === "string" ? r : r.label}</li>
                  ))}
                </ul>
              </div>
            )}

            {event.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
                {event.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" style={{ borderRadius: 999 }}>#{tag}</Badge>
                ))}
              </div>
            )}
          </section>

          {/* Agenda */}
          {event.agenda?.length > 0 && (
            <section className="evt-section">
              <h2 className="evt-section__title">Agenda</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {event.agenda.map((item: any, i: number) => (
                  <div key={i} className="evt-agenda-item">
                    <span className="evt-agenda-item__time">{item.time || `Item ${i+1}`}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", margin: "0 0 4px" }}>{item.title || item}</p>
                      {item.description && <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Speakers */}
          {event.speakers?.length > 0 && (
            <section className="evt-section">
              <h2 className="evt-section__title">Speakers</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 16 }}>
                {event.speakers.map((spk: any, i: number) => {
                  const name = typeof spk === "string" ? spk : spk.name || spk
                  return (
                    <div key={i} style={{ textAlign: "center", padding: "16px 8px", background: "#f8fafc", borderRadius: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#003366,#0066B3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", color: "#fff", fontWeight: 800, fontSize: 18 }}>
                        {name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{name}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Gallery */}
          {event.gallery?.length > 0 && (
            <section className="evt-section">
              <h2 className="evt-section__title">Gallery</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {event.gallery.map((img, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}>
                    <img src={img} alt={`Gallery ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right: sticky info card ────────────────────── */}
        <aside className="evt-detail-aside">
          <div className="evt-info-card">
            {/* Date block */}
            <div className="evt-info-card__date">
              <span className="evt-info-card__day">{startD.getDate()}</span>
              <span className="evt-info-card__month">{MONTHS[startD.getMonth()]} {startD.getFullYear()}</span>
            </div>

            <dl className="evt-info-card__dl">
              <div className="evt-info-card__row">
                <Clock size={15} style={{ color: "#0066B3", flexShrink: 0 }} />
                <div>
                  <dt>Time</dt>
                  <dd>{fmtTime(event.startDate)} – {fmtTime(event.endDate)}</dd>
                </div>
              </div>
              <div className="evt-info-card__row">
                <MapPin size={15} style={{ color: "#0066B3", flexShrink: 0 }} />
                <div>
                  <dt>Venue</dt>
                  <dd>{event.venue || event.location}</dd>
                  {event.venue && <dd style={{ fontSize: 12 }}>{event.location}</dd>}
                </div>
              </div>
              <div className="evt-info-card__row">
                <Users size={15} style={{ color: "#0066B3", flexShrink: 0 }} />
                <div>
                  <dt>Organizer</dt>
                  <dd>{event.organizer.organization || event.organizer.fullName}</dd>
                </div>
              </div>
              {spotsLeft !== null && (
                <div className="evt-info-card__row">
                  <Calendar size={15} style={{ color: "#0066B3", flexShrink: 0 }} />
                  <div>
                    <dt>Capacity</dt>
                    <dd>{event.registeredCount} registered · {spotsLeft} spots left</dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="evt-info-card__price">
              {event.price === 0 ? (
                <span style={{ color: "#16a34a", fontWeight: 800, fontSize: 22 }}>Free</span>
              ) : (
                <span style={{ color: "#0f172a", fontWeight: 800, fontSize: 22 }}>{event.price.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 600 }}>{event.currency}</span></span>
              )}
            </div>

            <RSVPButton />
          </div>
        </aside>
      </div>
    </div>
  )
}
